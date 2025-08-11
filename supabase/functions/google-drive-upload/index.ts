
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GoogleDriveUploadResponse {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    const authHeader = req.headers.get('Authorization')!
    const { data: user } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (!user.user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const fileName = formData.get('fileName') as string || file.name

    if (!file) {
      return new Response('No file provided', { status: 400, headers: corsHeaders })
    }

    // Get Google Drive credentials from secrets
    const clientId = Deno.env.get('GOOGLE_DRIVE_CLIENT_ID')
    const clientSecret = Deno.env.get('GOOGLE_DRIVE_CLIENT_SECRET')
    const apiKey = Deno.env.get('GOOGLE_DRIVE_API_KEY')

    if (!clientId || !clientSecret || !apiKey) {
      return new Response('Google Drive credentials not configured', { status: 500, headers: corsHeaders })
    }

    // Get access token (this is a simplified approach - in production you'd want proper OAuth flow)
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://www.googleapis.com/auth/drive.file'
      })
    })

    if (!tokenResponse.ok) {
      console.error('Token response error:', await tokenResponse.text())
      return new Response('Failed to get access token', { status: 500, headers: corsHeaders })
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Upload file to Google Drive
    const uploadFormData = new FormData()
    uploadFormData.append('metadata', JSON.stringify({
      name: fileName,
      parents: [] // You can specify a folder ID here if needed
    }))
    uploadFormData.append('file', file)

    const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: uploadFormData
    })

    if (!uploadResponse.ok) {
      console.error('Upload response error:', await uploadResponse.text())
      return new Response('Failed to upload to Google Drive', { status: 500, headers: corsHeaders })
    }

    const uploadResult: GoogleDriveUploadResponse = await uploadResponse.json()

    // Make the file publicly accessible
    await fetch(`https://www.googleapis.com/drive/v3/files/${uploadResult.id}/permissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone'
      })
    })

    return new Response(JSON.stringify({
      success: true,
      fileId: uploadResult.id,
      fileName: uploadResult.name,
      downloadLink: `https://drive.google.com/uc?export=download&id=${uploadResult.id}`,
      viewLink: uploadResult.webViewLink
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
