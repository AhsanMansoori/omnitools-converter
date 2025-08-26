import { NextRequest, NextResponse } from 'next/server'
import { saveFile, deleteFile, generateUniqueFileName } from '@/lib/storage'

interface StorageTestRequest {
  action: 'upload' | 'delete'
  fileName?: string
  content?: string
}

interface StorageTestResponse {
  success: boolean
  action: string
  fileName?: string
  url?: string
  message?: string
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<StorageTestResponse>> {
  try {
    const body: StorageTestRequest = await request.json()
    const { action, fileName = 'test.txt', content = 'Hello from OmniTools Storage Test!' } = body

    if (action === 'upload') {
      // Test file upload
      const uniqueFileName = generateUniqueFileName(fileName, 'test')
      const buffer = Buffer.from(content, 'utf-8')
      
      console.log(`Testing upload: ${uniqueFileName}`)
      
      const publicUrl = await saveFile(uniqueFileName, buffer)
      
      return NextResponse.json({
        success: true,
        action: 'upload',
        fileName: uniqueFileName,
        url: publicUrl,
        message: `File uploaded successfully to Supabase Storage`
      })

    } else if (action === 'delete') {
      // Test file deletion
      if (!fileName) {
        return NextResponse.json(
          {
            success: false,
            action: 'delete',
            error: 'fileName is required for delete action'
          },
          { status: 400 }
        )
      }

      console.log(`Testing delete: ${fileName}`)
      
      await deleteFile(fileName)
      
      return NextResponse.json({
        success: true,
        action: 'delete',
        fileName,
        message: `File deleted successfully from Supabase Storage`
      })

    } else {
      return NextResponse.json(
        {
          success: false,
          action,
          error: 'Invalid action. Use "upload" or "delete"'
        },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Storage test error:', error)
    
    return NextResponse.json(
      {
        success: false,
        action: 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

export async function GET(): Promise<NextResponse<StorageTestResponse>> {
  try {
    // Simple test to check if Supabase is configured
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        action: 'config-check',
        error: 'Supabase configuration missing. Please set SUPABASE_URL and SUPABASE_KEY in environment variables.'
      })
    }

    // Check if configuration looks valid
    const isValidConfig = supabaseUrl.includes('supabase') && supabaseKey.length > 20

    return NextResponse.json({
      success: isValidConfig,
      action: 'config-check',
      message: isValidConfig 
        ? 'Supabase configuration appears valid'
        : 'Supabase configuration may be invalid (check URL and key format)',
      fileName: 'N/A',
      url: supabaseUrl.replace(/\/+$/, '') // Remove trailing slashes
    })

  } catch (error) {
    console.error('Storage config check error:', error)
    
    return NextResponse.json(
      {
        success: false,
        action: 'config-check',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}