// Google Drive integration edge function
// Provides 'list' and 'upload' actions using a Service Account
// Requires secrets: GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, DRIVE_ROOT_FOLDER_ID

import { JWT } from "npm:google-auth-library@9.14.1";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Action = "list" | "upload";

interface DriveRequestBase {
  action: Action;
  productId: string; // used as folder name under root
}

interface ListRequest extends DriveRequestBase {
  action: "list";
  pageSize?: number;
}

interface UploadRequest extends DriveRequestBase {
  action: "upload";
  fileName: string;
  contentType: string;
  fileBase64: string; // base64-encoded file content
}

type DriveRequest = ListRequest | UploadRequest;

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
  webContentLink?: string;
  publicUrl: string; // computed as uc?id=...
}

const rootFolderId = Deno.env.get("DRIVE_ROOT_FOLDER_ID") || "";
const clientEmail = Deno.env.get("GOOGLE_CLIENT_EMAIL") || "";
const privateKey = (Deno.env.get("GOOGLE_PRIVATE_KEY") || "").replace(/\\n/g, "\n");

if (!rootFolderId || !clientEmail || !privateKey) {
  console.error("Missing Google Drive secrets. Please set DRIVE_ROOT_FOLDER_ID, GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY.");
}

const jwtClient = new JWT({
  email: clientEmail,
  key: privateKey,
  scopes: ["https://www.googleapis.com/auth/drive"],
});

async function authHeaders(): Promise<Record<string, string>> {
  const tokens = await jwtClient.authorize();
  const accessToken = tokens.access_token as string;
  return {
    Authorization: `Bearer ${accessToken}`,
  };
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
  if (data.files && data.files.length > 0) {
    return data.files[0].id as string;
  }

  // Create folder
  const createRes = await fetch("https://www.googleapis.com/drive/v3/files?fields=id,name", {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: productId,
      mimeType: "application/vnd.google-apps.folder",
      parents: [rootFolderId],
    }),
  });
  if (!createRes.ok) {
    const text = await createRes.text();
    throw new Error(`Drive create folder failed: ${createRes.status} ${text}`);
  }
  const created = await createRes.json();
  return created.id as string;
}

function base64ToUint8Array(base64: string): Uint8Array {
  const bin = atob(base64);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function setPublicPermission(fileId: string) {
  const headers = await authHeaders();
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role: "reader", type: "anyone" }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.warn(`Failed to set public permission: ${res.status} ${text}`);
  }
}

async function uploadFile(req: UploadRequest): Promise<DriveFile> {
  const folderId = await ensureProductFolder(req.productId);
  const headers = await authHeaders();

  const metadata = {
    name: req.fileName,
    parents: [folderId],
  };
  const boundary = `gd${crypto.randomUUID()}`;
  const delimiter = `--${boundary}`;
  const closeDelimiter = `--${boundary}--`;

  const metaPart =
    `${delimiter}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n`;

  const filePartHeader =
    `${delimiter}\r\n` +
    `Content-Type: ${req.contentType}\r\n\r\n`;

  const fileBytes = base64ToUint8Array(req.fileBase64);
  const bodyParts = [
    new TextEncoder().encode(metaPart),
    new TextEncoder().encode(filePartHeader),
    fileBytes,
    new TextEncoder().encode(`\r\n${closeDelimiter}\r\n`),
  ];

  // Concatenate Uint8Arrays efficiently
  const totalLength = bodyParts.reduce((sum, part) => sum + part.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of bodyParts) {
    combined.set(part, offset);
    offset += part.length;
  }

  const uploadRes = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,webContentLink",
    {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: combined,
    }
  );

  if (!uploadRes.ok) {
    const text = await uploadRes.text();
    throw new Error(`Drive upload failed: ${uploadRes.status} ${text}`);
  }

  const uploaded = await uploadRes.json();
  const fileId = uploaded.id as string;

  // Make file public (anyone with the link)
  await setPublicPermission(fileId);

  const publicUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;

  return {
    id: fileId,
    name: uploaded.name as string,
    mimeType: uploaded.mimeType as string,
    webViewLink: uploaded.webViewLink as string | undefined,
    webContentLink: uploaded.webContentLink as string | undefined,
    publicUrl,
  };
}

async function listFiles(req: ListRequest): Promise<DriveFile[]> {
  const folderId = await ensureProductFolder(req.productId);
  const headers = await authHeaders();
  const pageSize = Math.min(Math.max(req.pageSize ?? 50, 1), 1000);

  const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const fields = encodeURIComponent(
    "files(id,name,mimeType,createdTime,modifiedTime,size,webViewLink,webContentLink)"
  );
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&pageSize=${pageSize}&fields=${fields}`;
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
  // Handle CORS preflight
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

    const payload = (await req.json()) as DriveRequest;

    if (!payload?.action || !payload?.productId) {
      return new Response(JSON.stringify({ error: "Missing action or productId" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Basic validation of secrets present
    if (!rootFolderId || !clientEmail || !privateKey) {
      return new Response(JSON.stringify({ error: "Missing Google Drive configuration." }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (payload.action === "upload") {
      const uReq = payload as UploadRequest;
      if (!uReq.fileName || !uReq.contentType || !uReq.fileBase64) {
        return new Response(JSON.stringify({ error: "Missing fileName, contentType or fileBase64" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      const file = await uploadFile(uReq);
      return new Response(JSON.stringify({ file }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (payload.action === "list") {
      const files = await listFiles(payload as ListRequest);
      return new Response(JSON.stringify({ files }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error("gdrive function error", err?.message || err);
    return new Response(JSON.stringify({ error: err?.message || "Unexpected error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
