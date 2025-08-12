import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { decodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { AwsClient } from "https://esm.sh/aws4fetch@1.0.17";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function textResponse(body: string, status = 200) {
  return new Response(body, { status, headers: { ...corsHeaders, "Content-Type": "text/plain" } });
}

function jsonResponse(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

function parseDataUrl(dataUrl: string): { mime: string; bytes: Uint8Array } | null {
  try {
    const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
    if (!match) return null;
    const mime = match[1] || "application/octet-stream";
    const base64 = match[2] || "";
    const bytes = decodeBase64(base64);
    return { mime, bytes };
  } catch (_e) {
    return null;
  }
}

async function extractPayload(req: Request) {
  const contentType = req.headers.get("content-type") || "";
  let bytes: Uint8Array | null = null;
  let fileName = "";
  let mime = "application/octet-stream";
  let folder = "arquivos";
  let key = "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    fileName = (form.get("fileName") as string) || (form.get("filename") as string) || "";
    mime = (form.get("fileType") as string) || (form.get("type") as string) || mime;
    folder = (form.get("folder") as string) || folder;
    key = (form.get("key") as string) || "";

    if (file && file.size > 0) {
      const ab = await file.arrayBuffer();
      bytes = new Uint8Array(ab);
      mime = file.type || mime;
      fileName = fileName || file.name || `upload-${Date.now()}`;
    } else {
      // Try base64 fields inside multipart
      const dataUrl = (form.get("dataUrl") as string) || "";
      const base64 = (form.get("fileBase64") as string) || (form.get("base64") as string) || (form.get("file") as string) || "";
      if (dataUrl) {
        const parsed = parseDataUrl(dataUrl);
        if (parsed) {
          bytes = parsed.bytes;
          mime = parsed.mime;
        }
      } else if (base64) {
        bytes = decodeBase64(base64.replace(/^data:.*;base64,/, ""));
      }
      if (!fileName) fileName = `upload-${Date.now()}`;
    }
  } else if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    const action = body?.action as string | undefined;
    if (action === "presign") {
      // We no longer support presign in this function; expect file data directly
      // Keep behavior consistent: return 400 if no file data
    }
    fileName = body?.fileName || body?.filename || `upload-${Date.now()}`;
    mime = body?.fileType || body?.mimeType || body?.type || mime;
    folder = body?.folder || folder;
    key = body?.key || "";

    const dataUrl = body?.dataUrl as string | undefined;
    const base64 = (body?.fileBase64 || body?.base64 || body?.file) as string | undefined;

    if (dataUrl) {
      const parsed = parseDataUrl(dataUrl);
      if (parsed) {
        bytes = parsed.bytes;
        mime = parsed.mime;
      }
    } else if (base64) {
      bytes = decodeBase64(String(base64).replace(/^data:.*;base64,/, ""));
    }
  } else {
    // Fallback: attempt to read raw body as bytes (rare)
    const ab = await req.arrayBuffer();
    if (ab && ab.byteLength > 0) {
      bytes = new Uint8Array(ab);
      fileName = `upload-${Date.now()}`;
    }
  }

  if (!key) {
    // compute key from folder + fileName
    const safeFolder = folder.replace(/^\/+|\/+$/g, "");
    const safeName = (fileName || `upload-${Date.now()}`).replace(/[^a-zA-Z0-9._-]/g, "-");
    key = safeFolder ? `${safeFolder}/${safeName}` : safeName;
  }

  return { bytes, fileName, mime, folder, key };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const endpoint = Deno.env.get("CONTABO_S3_ENDPOINT");
    const accessKeyId = Deno.env.get("CONTABO_S3_ACCESS_KEY_ID");
    const secretAccessKey = Deno.env.get("CONTABO_S3_SECRET_ACCESS_KEY");
    const bucket = Deno.env.get("CONTABO_S3_BUCKET");
    const region = Deno.env.get("CONTABO_S3_REGION") || "eu-central-1";

    if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
      console.error("Missing Contabo S3 secrets", { hasEndpoint: !!endpoint, hasAK: !!accessKeyId, hasSK: !!secretAccessKey, hasBucket: !!bucket });
      return jsonResponse({ error: "Missing Contabo S3 configuration" }, 500);
    }

    if (req.method !== "POST") {
      return textResponse("Method Not Allowed", 405);
    }

    const { bytes, fileName, mime, key } = await extractPayload(req);

    if (!bytes || bytes.byteLength === 0) {
      console.warn("Missing file data in request body");
      return jsonResponse({ error: "Missing file data" }, 400);
    }

    const aws = new AwsClient({ accessKeyId, secretAccessKey, region, service: "s3" });

    const baseEndpoint = endpoint.replace(/\/$/, "");
    const uploadUrl = `${baseEndpoint}/${bucket}/${key}`;

    console.log("Uploading to Contabo S3", { uploadUrl, size: bytes.byteLength, mime, fileName });

    const putRes = await aws.fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": mime,
        "x-amz-acl": "public-read",
      },
      body: bytes,
    });

    if (!putRes.ok) {
      const errText = await putRes.text().catch(() => "");
      console.error("S3 upload failed", putRes.status, errText);
      return jsonResponse({ error: "Upload failed", status: putRes.status, details: errText }, 500);
    }

    const publicUrl = `${baseEndpoint}/${bucket}/${encodeURI(key)}`;

    return jsonResponse({
      ok: true,
      fileName,
      key,
      bucket,
      mime,
      url: publicUrl,
      Location: publicUrl,
      publicUrl,
    });
  } catch (err) {
    console.error("upload-contabo error", err);
    return jsonResponse({ error: String(err?.message || err) }, 500);
  }
});
