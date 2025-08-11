
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName, contentType } = await req.json();
    
    console.log('Generating presigned URL for upload:', { fileName, contentType });

    const endpoint = Deno.env.get('CONTABO_S3_ENDPOINT');
    const accessKeyId = Deno.env.get('CONTABO_S3_ACCESS_KEY_ID');
    const secretAccessKey = Deno.env.get('CONTABO_S3_SECRET_ACCESS_KEY');
    const bucketName = Deno.env.get('CONTABO_S3_BUCKET');
    const region = 'eu-central-1';

    if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName) {
      throw new Error('Missing required Contabo S3 configuration');
    }

    console.log('Using config:', { 
      endpoint, 
      bucketName, 
      region,
      accessKeyId: accessKeyId.substring(0, 8) + '...' 
    });

    // Generate unique file key
    const timestamp = Date.now();
    const fileKey = `uploads/${timestamp}-${fileName}`;

    // Create the presigned URL using AWS Signature Version 4
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const datetime = now.toISOString().slice(0, 19).replace(/[-:]/g, '') + 'Z';
    
    const credential = `${accessKeyId}/${date}/${region}/s3/aws4_request`;
    const algorithm = 'AWS4-HMAC-SHA256';
    const expires = new Date(now.getTime() + 3600000).toISOString();

    // Create policy for POST upload
    const policy = {
      expiration: expires,
      conditions: [
        { bucket: bucketName },
        { key: fileKey },
        { 'Content-Type': contentType },
        ['content-length-range', 0, 100 * 1024 * 1024], // Max 100MB
        { 'x-amz-algorithm': algorithm },
        { 'x-amz-credential': credential },
        { 'x-amz-date': datetime }
      ]
    };

    const policyBase64 = btoa(JSON.stringify(policy));
    console.log('Policy created:', { policy, policyBase64 });

    // Create signature
    async function sign(key: Uint8Array, message: string): Promise<Uint8Array> {
      const encoder = new TextEncoder();
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message));
      return new Uint8Array(signature);
    }

    const encoder = new TextEncoder();
    console.log('Creating signature with secret key length:', secretAccessKey.length);
    
    const kDate = await sign(encoder.encode(`AWS4${secretAccessKey}`), date);
    const kRegion = await sign(kDate, region);
    const kService = await sign(kRegion, 's3');
    const kSigning = await sign(kService, 'aws4_request');
    const signature = await sign(kSigning, policyBase64);

    const signatureHex = Array.from(signature)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    console.log('Signature created:', signatureHex.substring(0, 16) + '...');

    // Para Contabo, construir URL completa com bucket
    const uploadUrl = `${endpoint}/${bucketName}`;
    const formData = {
      key: fileKey,
      'Content-Type': contentType,
      'X-Amz-Algorithm': algorithm,
      'X-Amz-Credential': credential,
      'X-Amz-Date': datetime,
      Policy: policyBase64,
      'X-Amz-Signature': signatureHex
    };

    console.log('Generated presigned upload URL successfully:', { 
      uploadUrl, 
      fileKey,
      formDataKeys: Object.keys(formData),
      credentialUsed: credential
    });

    return new Response(JSON.stringify({ 
      uploadUrl,
      formData,
      fileKey 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating presigned upload URL:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
