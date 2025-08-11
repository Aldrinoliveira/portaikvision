
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

    // Get Google Drive credentials from secrets
    const apiKey = Deno.env.get('GOOGLE_DRIVE_API_KEY')

    if (!apiKey) {
      console.error('Google Drive credentials not configured')
      return new Response('Google Drive credentials not configured', { status: 500, headers: corsHeaders })
    }

    // For simplicity, we'll use the API key for upload (limited functionality)
    // In production, you'd want proper OAuth2 flow
    console.log('Using API key for upload...')

    const fileArrayBuffer = await file.arrayBuffer()
    const fileBlob = new Blob([fileArrayBuffer], { type: file.type })

    // Create metadata
    const metadata = {
      name: fileName,
      parents: ['1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'] // Example folder ID - replace with your own
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

    // Upload to Google Drive using resumable upload
    console.log('Uploading to Google Drive...')
    const uploadResponse = await fetch(`https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&key=${apiKey}`, {
      method: 'POST',
      headers: {
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
    const permissionResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${uploadResult.id}/permissions?key=${apiKey}`, {
      method: 'POST',
      headers: {
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
