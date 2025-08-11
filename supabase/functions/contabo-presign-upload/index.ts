
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

    if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName) {
      throw new Error('Missing required Contabo S3 configuration');
    }

    console.log('Using config:', { 
      endpoint, 
      bucketName, 
      accessKeyId: accessKeyId.substring(0, 8) + '...' 
    });

    // Generate unique file key
    const timestamp = Date.now();
    const fileKey = `uploads/${timestamp}-${fileName}`;

    // Para Contabo, vamos tentar usar GET presigned URL ao invés de POST
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const datetime = now.toISOString().slice(0, 19).replace(/[-:]/g, '') + 'Z';
    const region = 'eu-central-1';
    const service = 's3';
    const expires = '3600';

    const credential = `${accessKeyId}/${date}/${region}/${service}/aws4_request`;
    const algorithm = 'AWS4-HMAC-SHA256';

    // Create canonical request for PUT method
    const method = 'PUT';
    const uri = `/${bucketName}/${fileKey}`;
    const host = new URL(endpoint).host;
    
    const queryParams = new URLSearchParams({
      'X-Amz-Algorithm': algorithm,
      'X-Amz-Credential': credential,
      'X-Amz-Date': datetime,
      'X-Amz-Expires': expires,
      'X-Amz-SignedHeaders': 'host',
    });

    const canonicalRequest = [
      method,
      uri,
      queryParams.toString(),
      `host:${host}`,
      '',
      'host',
      'UNSIGNED-PAYLOAD'
    ].join('\n');

    console.log('Canonical request:', canonicalRequest);

    // Create string to sign
    const hashedCanonicalRequest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalRequest));
    const hashedCanonicalRequestHex = Array.from(new Uint8Array(hashedCanonicalRequest))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const stringToSign = [
      algorithm,
      datetime,
      `${date}/${region}/${service}/aws4_request`,
      hashedCanonicalRequestHex
    ].join('\n');

    console.log('String to sign:', stringToSign);

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
    const kDate = await sign(encoder.encode(`AWS4${secretAccessKey}`), date);
    const kRegion = await sign(kDate, region);
    const kService = await sign(kRegion, service);
    const kSigning = await sign(kService, 'aws4_request');
    const signature = await sign(kSigning, stringToSign);

    const signatureHex = Array.from(signature)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    console.log('Signature created:', signatureHex.substring(0, 16) + '...');

    // Create final URL
    const uploadUrl = `${endpoint}${uri}?${queryParams.toString()}&X-Amz-Signature=${signatureHex}`;

    console.log('Generated presigned upload URL successfully');

    return new Response(JSON.stringify({ 
      uploadUrl,
      fileKey,
      method: 'PUT'
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
