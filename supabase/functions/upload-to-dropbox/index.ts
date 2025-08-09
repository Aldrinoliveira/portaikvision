
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type UploadRequest = {
  filename: string;
  mimeType?: string;
  base64: string; // can be full data URL or raw base64
  folderPath?: string; // optional override
};

function toUint8ArrayFromBase64(base64: string): Uint8Array {
  // strip data url prefix if present
  const cleaned = base64.replace(/^data:.*;base64,/, "");
  const binaryString = atob(cleaned);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function ensureDropboxPath(path: string) {
  // Dropbox expects paths starting with "/"
  if (!path.startsWith("/")) return `/${path}`;
  return path;
}

function makeDownloadUrl(url: string, dl: "0" | "1"): string {
  try {
    const u = new URL(url);
    // Dropbox uses dl=0 for preview and dl=1 for direct download
    u.searchParams.set("dl", dl);
    return u.toString();
  } catch {
    // If somehow not a valid URL, fallback best-effort
    if (url.includes("?")) {
      return url.replace(/dl=\d/, `dl=${dl}`);
    }
    return `${url}?dl=${dl}`;
  }
}

export default async function handler(req: Request): Promise<Response> {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 405,
    });
  }

  try {
    const token = Deno.env.get("DROPBOX_ACCESS_TOKEN");
    if (!token) {
      console.error("Missing DROPBOX_ACCESS_TOKEN");
      return new Response(JSON.stringify({ error: "Server not configured with Dropbox token" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const defaultFolder = Deno.env.get("DROPBOX_FOLDER_PATH") || "/";
    const body = (await req.json()) as UploadRequest;

    console.log("[upload-to-dropbox] Incoming request", {
      filename: body?.filename,
      hasBase64: !!body?.base64,
      folderPath: body?.folderPath || defaultFolder,
      mimeType: body?.mimeType,
    });

    if (!body?.filename || !body?.base64) {
      return new Response(JSON.stringify({ error: "filename and base64 are required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const bytes = toUint8ArrayFromBase64(body.base64);
    const sizeBytes = bytes.byteLength;
    const MAX_BYTES = 15 * 1024 * 1024; // 15MB
    if (sizeBytes > MAX_BYTES) {
      console.warn("[upload-to-dropbox] File too large", { sizeBytes });
      return new Response(JSON.stringify({ error: "Arquivo muito grande. Limite de 15MB." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 413,
      });
    }

    const path = ensureDropboxPath(
      `${(body.folderPath || defaultFolder).replace(/\/+$/, "")}/${body.filename}`
    );

    // Upload to Dropbox
    console.log("[upload-to-dropbox] Uploading to path:", path, "size:", sizeBytes);
    const uploadResp = await fetch("https://content.dropboxapi.com/2/files/upload", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/octet-stream",
        "Dropbox-API-Arg": JSON.stringify({
          path,
          mode: "add",
          autorename: true,
          mute: false,
          strict_conflict: false,
        }),
      },
      body: bytes,
    });

    const uploadJson = await uploadResp.json().catch(() => ({}));
    if (!uploadResp.ok) {
      console.error("[upload-to-dropbox] Upload error", uploadResp.status, uploadJson);
      return new Response(JSON.stringify({ error: "Falha ao enviar para o Dropbox", details: uploadJson }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const finalPath = uploadJson?.path_display || path;
    console.log("[upload-to-dropbox] Uploaded successfully", { finalPath });

    // Create or fetch shared link
    let sharedLink: string | null = null;

    // Try to create a new shared link
    const createLinkResp = await fetch("https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: finalPath,
        settings: { requested_visibility: "public" },
      }),
    });

    if (createLinkResp.ok) {
      const createJson = await createLinkResp.json();
      sharedLink = createJson?.url || null;
      console.log("[upload-to-dropbox] Created shared link");
    } else {
      const errJson = await createLinkResp.json().catch(() => ({}));
      console.warn("[upload-to-dropbox] create_shared_link failed, trying list_shared_links", errJson);

      // If already exists, list existing links
      const listLinksResp = await fetch("https://api.dropboxapi.com/2/sharing/list_shared_links", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: finalPath,
          direct_only: true,
        }),
      });

      const listJson = await listLinksResp.json().catch(() => ({}));
      if (listLinksResp.ok && Array.isArray(listJson?.links) && listJson.links.length > 0) {
        sharedLink = listJson.links[0]?.url || null;
        console.log("[upload-to-dropbox] Reused existing shared link");
      } else {
        console.error("[upload-to-dropbox] Unable to get shared link", listJson);
      }
    }

    if (!sharedLink) {
      return new Response(JSON.stringify({
        error: "Não foi possível obter o link compartilhado.",
        path: finalPath,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const preview_url = makeDownloadUrl(sharedLink, "0");
    const download_url = makeDownloadUrl(sharedLink, "1");

    const result = {
      name: body.filename,
      path: finalPath,
      size: sizeBytes,
      preview_url,
      download_url,
    };

    console.log("[upload-to-dropbox] Success", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    console.error("[upload-to-dropbox] Unexpected error", e);
    return new Response(JSON.stringify({ error: "Erro inesperado no servidor", details: String(e) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
}
