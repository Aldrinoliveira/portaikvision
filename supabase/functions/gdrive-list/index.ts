// Google Drive LIST-ONLY edge function (public)
// Requires secrets: GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, DRIVE_ROOT_FOLDER_ID
// Returns files under root/<productId>

import { JWT } from "npm:google-auth-library@9.14.1";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ListRequest {
  productId: string;
  pageSize?: number;
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
  webContentLink?: string;
  publicUrl: string;
}

const rootFolderId = Deno.env.get("DRIVE_ROOT_FOLDER_ID") || "";
const clientEmail = Deno.env.get("GOOGLE_CLIENT_EMAIL") || "";
const privateKey = (Deno.env.get("GOOGLE_PRIVATE_KEY") || "").replace(/\\n/g, "\n");

const jwtClient = new JWT({
  email: clientEmail,
  key: privateKey,
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

async function authHeaders(): Promise<Record<string, string>> {
  const tokens = await jwtClient.authorize();
  return { Authorization: `Bearer ${tokens.access_token}` };
}

async function ensureProductFolder(productId: string): Promise<string> {
  const headers = await authHeaders();
  const q = encodeURIComponent(
    `name = '${productId.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.folder' and '${rootFolderId}' in parents and trashed = false`
  );
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Drive search folder failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  if (data.files && data.files.length > 0) return data.files[0].id as string;
  // If missing, no files yet; return a dummy id to query nothing by listing will just return empty
  return "";
}

async function listFiles(productId: string, pageSize: number): Promise<DriveFile[]> {
  const folderId = await ensureProductFolder(productId);
  if (!folderId) return [];
  const headers = await authHeaders();
  const safeSize = Math.min(Math.max(pageSize, 1), 1000);
  const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const fields = encodeURIComponent(
    "files(id,name,mimeType,createdTime,modifiedTime,size,webViewLink,webContentLink)"
  );
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&pageSize=${safeSize}&fields=${fields}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Drive list failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  const files = (data.files || []) as any[];
  return files.map((f) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    createdTime: f.createdTime,
    modifiedTime: f.modifiedTime,
    size: f.size,
    webViewLink: f.webViewLink,
    webContentLink: f.webContentLink,
    publicUrl: `https://drive.google.com/uc?id=${f.id}&export=download`,
  }));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Only POST allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!rootFolderId || !clientEmail || !privateKey) {
      return new Response(JSON.stringify({ error: "Missing Google Drive configuration." }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const payload = (await req.json()) as ListRequest;
    if (!payload?.productId) {
      return new Response(JSON.stringify({ error: "Missing productId" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const files = await listFiles(payload.productId, payload.pageSize ?? 50);
    return new Response(JSON.stringify({ files }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error("gdrive-list error", err?.message || err);
    return new Response(JSON.stringify({ error: err?.message || "Unexpected error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
