import { NextRequest, NextResponse } from 'next/server'
import { cleanupOldFiles, listFiles } from '@/lib/storage'

interface CleanupRequest {
  daysOld?: number
  action?: 'cleanup' | 'list'
}

interface CleanupResponse {
  success: boolean
  action: string
  filesDeleted?: number
  files?: string[]
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<CleanupResponse>> {
  try {
    const body: CleanupRequest = await request.json()
    const { daysOld = 1, action = 'cleanup' } = body

    if (action === 'list') {
      // List files in storage
      const files = await listFiles(100)
      
      return NextResponse.json({
        success: true,
        action: 'list',
        files
      })
    } else if (action === 'cleanup') {
      // Clean up old files
      const deletedCount = await cleanupOldFiles(daysOld)
      
      return NextResponse.json({
        success: true,
        action: 'cleanup',
        filesDeleted: deletedCount
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          action,
          error: 'Invalid action. Use "list" or "cleanup"'
        },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Cleanup API error:', error)
    
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

export async function GET(): Promise<NextResponse<CleanupResponse>> {
  try {
    // Default GET request lists files
    const files = await listFiles(50)
    
    return NextResponse.json({
      success: true,
      action: 'list',
      files
    })

  } catch (error) {
    console.error('Cleanup API GET error:', error)
    
    return NextResponse.json(
      {
        success: false,
        action: 'list',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}
