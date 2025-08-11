
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

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting Google Drive upload...')
    
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

    console.log('File received:', fileName, 'Size:', file.size)

    // Get OAuth2 credentials from secrets - with detailed logging
    console.log('Checking for environment variables...')
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')
    const refreshToken = Deno.env.get('GOOGLE_REFRESH_TOKEN')

    console.log('GOOGLE_CLIENT_ID exists:', !!clientId)
    console.log('GOOGLE_CLIENT_SECRET exists:', !!clientSecret)
    console.log('GOOGLE_REFRESH_TOKEN exists:', !!refreshToken)

    if (!clientId || !clientSecret || !refreshToken) {
      console.error('Missing credentials:', {
        clientId: !!clientId,
        clientSecret: !!clientSecret,
        refreshToken: !!refreshToken
      })
      return new Response('Google OAuth2 credentials not configured', { status: 500, headers: corsHeaders })
    }

    // Get access token using refresh token
    console.log('Getting access token...')
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token response error:', errorText)
      return new Response(`Failed to get access token: ${errorText}`, { status: 500, headers: corsHeaders })
    }

    const tokenData: GoogleTokenResponse = await tokenResponse.json()
    console.log('Access token obtained successfully')

    const fileArrayBuffer = await file.arrayBuffer()

    // Create metadata
    const metadata = {
      name: fileName,
    }

    // Create form data for multipart upload
    const boundary = '-------314159265358979323846'
    const delimiter = `\r\n--${boundary}\r\n`
    const close_delim = `\r\n--${boundary}--`

    let body = delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) + delimiter +
      'Content-Type: ' + file.type + '\r\n\r\n'

    const bodyArray = new Uint8Array(
      new TextEncoder().encode(body).length + fileArrayBuffer.byteLength + new TextEncoder().encode(close_delim).length
    )

    let offset = 0
    const bodyBytes = new TextEncoder().encode(body)
    bodyArray.set(bodyBytes, offset)
    offset += bodyBytes.length

    bodyArray.set(new Uint8Array(fileArrayBuffer), offset)
    offset += fileArrayBuffer.byteLength

    const closeDelimBytes = new TextEncoder().encode(close_delim)
    bodyArray.set(closeDelimBytes, offset)

    // Upload to Google Drive using OAuth2 access token
    console.log('Uploading to Google Drive...')
    const uploadResponse = await fetch(`https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': `multipart/related; boundary="${boundary}"`,
      },
      body: bodyArray
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error('Upload response error:', errorText)
      return new Response(`Failed to upload to Google Drive: ${errorText}`, { status: 500, headers: corsHeaders })
    }

    const uploadResult: GoogleDriveUploadResponse = await uploadResponse.json()
    console.log('Upload successful:', uploadResult.id)

    // Make the file publicly accessible
    console.log('Setting file permissions...')
    const permissionResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${uploadResult.id}/permissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone'
      })
    })

    if (!permissionResponse.ok) {
      console.error('Permission response error:', await permissionResponse.text())
      // Continue anyway, file might still be accessible
    }

    const downloadLink = `https://drive.google.com/uc?export=download&id=${uploadResult.id}`
    const viewLink = `https://drive.google.com/file/d/${uploadResult.id}/view`

    console.log('File uploaded successfully. Download link:', downloadLink)

    return new Response(JSON.stringify({
      success: true,
      fileId: uploadResult.id,
      fileName: uploadResult.name || fileName,
      downloadLink: downloadLink,
      viewLink: viewLink
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in Google Drive upload:', error)
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
