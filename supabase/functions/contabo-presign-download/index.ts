
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
    const { fileKey } = await req.json();
    
    console.log('Generating presigned URL for download:', { fileKey });

    const endpoint = Deno.env.get('CONTABO_S3_ENDPOINT');
    const accessKeyId = Deno.env.get('CONTABO_S3_ACCESS_KEY_ID');
    const secretAccessKey = Deno.env.get('CONTABO_S3_SECRET_ACCESS_KEY');
    const bucketName = Deno.env.get('CONTABO_S3_BUCKET');
    const region = Deno.env.get('CONTABO_S3_REGION') || 'eu-central-1';

    if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName) {
      throw new Error('Missing required Contabo S3 configuration');
    }

    // Create the presigned URL for download
    const host = new URL(endpoint).host;
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const datetime = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '') + 'Z';
    const expires = '3600'; // 1 hour
    
    const credential = `${accessKeyId}/${date}/${region}/s3/aws4_request`;
    const algorithm = 'AWS4-HMAC-SHA256';

    // Create canonical request
    const method = 'GET';
    const uri = `/${bucketName}/${fileKey}`;
    const query = new URLSearchParams({
      'X-Amz-Algorithm': algorithm,
      'X-Amz-Credential': credential,
      'X-Amz-Date': datetime,
      'X-Amz-Expires': expires,
      'X-Amz-SignedHeaders': 'host'
    }).toString();

    const canonicalRequest = [
      method,
      uri,
      query,
      `host:${host}`,
      '',
      'host',
      'UNSIGNED-PAYLOAD'
    ].join('\n');

    // Create string to sign
    const hashedCanonicalRequest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalRequest));
    const hashedCanonicalRequestHex = Array.from(new Uint8Array(hashedCanonicalRequest))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const stringToSign = [
      algorithm,
      datetime,
      `${date}/${region}/s3/aws4_request`,
      hashedCanonicalRequestHex
    ].join('\n');

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
    const kService = await sign(kRegion, 's3');
    const kSigning = await sign(kService, 'aws4_request');
    const signature = await sign(kSigning, stringToSign);

    const signatureHex = Array.from(signature)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const downloadUrl = `${endpoint}/${bucketName}/${fileKey}?${query}&X-Amz-Signature=${signatureHex}`;

    console.log('Generated presigned download URL successfully');

    return new Response(JSON.stringify({ 
      downloadUrl 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating presigned download URL:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
