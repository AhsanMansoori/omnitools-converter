import { NextRequest, NextResponse } from 'next/server'
import { enqueueJob } from '@/lib/queue'

export interface TestJobRequest {
  toolId: string
  fileCount?: number
}

export interface TestJobResponse {
  success: boolean
  jobId?: string
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<TestJobResponse>> {
  try {
    const body: TestJobRequest = await request.json()
    const { toolId, fileCount = 1 } = body

    if (!toolId) {
      return NextResponse.json(
        {
          success: false,
          error: 'toolId is required'
        },
        { status: 400 }
      )
    }

    // Create dummy files for testing
    const dummyFiles = Array.from({ length: fileCount }, (_, index) => ({
      name: `test-file-${index + 1}.pdf`,
      path: `/tmp/test-file-${index + 1}.pdf`,
      size: 1024 * 1024 * (index + 1), // 1MB, 2MB, etc.
      mimeType: toolId.startsWith('pdf-') ? 'application/pdf' : 
                toolId.startsWith('image-') ? 'image/jpeg' :
                toolId === 'webp-to-mp4' ? 'image/webp' : 'application/pdf'
    }))

    // Enqueue the job
    const result = await enqueueJob(toolId, {
      files: dummyFiles,
      settings: {
        testMode: true,
        requestedAt: new Date().toISOString()
      },
      requestId: `test-${Date.now()}`
    })

    console.log(`Test job enqueued: ${result.jobId} for tool: ${toolId}`)

    return NextResponse.json({
      success: true,
      jobId: result.jobId
    })

  } catch (error) {
    console.error('Error enqueueing test job:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}