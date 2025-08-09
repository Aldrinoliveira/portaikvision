// Supabase Edge Function: upload-to-drive
// Uploads a file (sent as base64) to Google Drive and returns public links
// Requires Supabase secrets:
// - GOOGLE_SERVICE_ACCOUNT_EMAIL
// - GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
// - GOOGLE_DRIVE_FOLDER_ID

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function base64UrlEncode(input: string | ArrayBuffer): string {
  let b64: string;
  if (typeof input === "string") {
    b64 = btoa(input);
  } else {
    const bytes = new Uint8Array(input);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    b64 = btoa(binary);
  }
  return b64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  // Support keys with literal "\n" characters (commonly stored in secrets)
  const normalized = pem.trim().replace(/\\n/g, "\n");
  let pemContents: string;
  if (normalized.includes("BEGIN PRIVATE KEY")) {
    pemContents = normalized
      .replace("-----BEGIN PRIVATE KEY-----", "")
      .replace("-----END PRIVATE KEY-----", "")
      .replace(/\r?\n|\s/g, "");
  } else {
    // Assume it's a raw base64-encoded PKCS8 key without headers
    pemContents = normalized.replace(/\r?\n|\s|\"/g, "");
  }
  const raw = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey(
    "pkcs8",
    raw,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

function extractCreds(emailEnv?: string | null, keyEnv?: string | null) {
  let email = emailEnv || undefined;
  let privateKey = keyEnv || undefined;
  if (privateKey) {
    const trimmed = privateKey.trim();
    if (trimmed.startsWith('{')) {
      try {
        const json = JSON.parse(trimmed);
        privateKey = json.private_key;
        if (!email && json.client_email) email = json.client_email;
      } catch (_) { /* ignore */ }
    } else {
      // Some setups store the JSON as base64
      try {
        const decoded = atob(trimmed);
        if (decoded.startsWith('{')) {
          const json = JSON.parse(decoded);
          privateKey = json.private_key;
          if (!email && json.client_email) email = json.client_email;
        }
      } catch (_) { /* ignore */ }
    }
  }
  if (!privateKey) throw new Error("Missing Google Drive configuration secrets (private key).");
  if (!email) throw new Error("Missing Google Drive configuration secrets (service account email).");
  return { email, privateKey } as { email: string; privateKey: string };
}

async function getAccessToken(email: string, privateKeyPem: string, scopes: string[]): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600; // 1 hour
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: email,
    scope: scopes.join(" "),
    aud: "https://oauth2.googleapis.com/token",
    iat,
    exp,
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const toSign = `${headerB64}.${payloadB64}`;

  const key = await importPrivateKey(privateKeyPem);
  const signature = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    key,
    new TextEncoder().encode(toSign),
  );
  const sigB64 = base64UrlEncode(signature);
  const assertion = `${toSign}.${sigB64}`;

  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to obtain access token: ${res.status} ${errorText}`);
  }
  const json = await res.json();
  return json.access_token as string;
}

async function uploadToDrive(params: { filename: string; mimeType: string; base64: string }) {
  const folderId = Deno.env.get("GOOGLE_DRIVE_FOLDER_ID");
  const { email: serviceEmail, privateKey } = extractCreds(
    Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
    Deno.env.get("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY"),
  );

  if (!folderId) {
    throw new Error("Missing Google Drive configuration secrets (folder id).");
  }

  const accessToken = await getAccessToken(
    serviceEmail,
    privateKey,
    [
      // Full Drive scope to allow creating public permissions reliably
      "https://www.googleapis.com/auth/drive",
    ],
  );

  // Validate size (limit ~15MB to avoid memory issues)
  const b64 = (params.base64 || "").trim();
  const estimatedBytes = Math.floor(b64.length * 3 / 4) - (b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0);
  const MAX_BYTES = 15 * 1024 * 1024;
  if (estimatedBytes > MAX_BYTES) {
    throw new Error("O arquivo excede o limite de 15MB para upload via Edge Function.");
  }

  // Decode base64 to bytes
  const fileBytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

  // Build multipart request using FormData (metadata + file)
  const metadata = {
    name: params.filename,
    parents: [folderId],
  };

  const fd = new FormData();
  fd.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  fd.append("file", new Blob([fileBytes], { type: params.mimeType || "application/octet-stream" }), params.filename);

  const uploadRes = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,webContentLink",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: fd,
    },
  );

  if (!uploadRes.ok) {
    const t = await uploadRes.text();
    throw new Error(`Upload failed: ${uploadRes.status} ${t}`);
  }

  const uploaded = await uploadRes.json();
  const fileId = uploaded.id as string;

  // Make the file accessible via link (public reader)
  const permRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role: "reader", type: "anyone" }),
  });
  if (!permRes.ok) {
    // Not fatal for returning upload info, but useful to log
    console.error("Failed to set public permission", await permRes.text());
  }

  // Retrieve final links (ensure fields)
  const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,webViewLink,webContentLink`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const finalMeta = metaRes.ok ? await metaRes.json() : uploaded;

  return {
    id: finalMeta.id,
    name: finalMeta.name,
    mimeType: finalMeta.mimeType,
    webViewLink: finalMeta.webViewLink,
    webContentLink: finalMeta.webContentLink,
  };
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { ...corsHeaders } });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Expect JSON: { filename, mimeType, base64 }
    const { filename, mimeType, base64 } = await req.json();
    if (!filename || !base64) {
      return new Response(JSON.stringify({ error: "filename and base64 are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const data = await uploadToDrive({ filename, mimeType: mimeType || "application/octet-stream", base64 });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error("upload-to-drive error:", err);
    return new Response(JSON.stringify({ error: err?.message || "Unexpected error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
