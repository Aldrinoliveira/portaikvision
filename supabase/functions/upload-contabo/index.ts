import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";
import { S3Client, PutObjectCommand } from "https://esm.sh/@aws-sdk/client-s3@3.657.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type UploadPayload = {
  fileName: string;
  fileType?: string;
  fileBase64: string; // raw base64 without data URL prefix
  folder?: string; // optional folder/prefix in the bucket
};

function base64ToUint8Array(base64: string) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });

    // Auth: require user and admin role
    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userRes?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userRes.user.id;
    const { data: isAdmin, error: roleErr } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (roleErr || !isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = (await req.json()) as UploadPayload;
    if (!payload?.fileName || !payload?.fileBase64) {
      return new Response(JSON.stringify({ error: "Missing file data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const endpoint = Deno.env.get("CONTABO_S3_ENDPOINT");
    const accessKeyId = Deno.env.get("CONTABO_S3_ACCESS_KEY_ID");
    const secretAccessKey = Deno.env.get("CONTABO_S3_SECRET_ACCESS_KEY");
    const bucket = Deno.env.get("CONTABO_S3_BUCKET");
    const region = Deno.env.get("CONTABO_S3_REGION") ?? "auto";

    if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
      return new Response(JSON.stringify({ error: "Storage not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const key = `${payload.folder ? payload.folder.replace(/^\/+|\/+$/g, "") + "/" : ""}${payload.fileName}`;
    const client = new S3Client({
      region,
      endpoint,
      forcePathStyle: true,
      credentials: { accessKeyId, secretAccessKey },
    });

    const body = base64ToUint8Array(payload.fileBase64);

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: payload.fileType ?? "application/octet-stream",
      ACL: "public-read",
    });

    await client.send(command);

    const endpointNorm = endpoint.replace(/\/$/, "");
    const publicUrl = `${endpointNorm}/${bucket}/${key}`;

    return new Response(JSON.stringify({ key, publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("upload-contabo error", e);
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
