import { NextRequest, NextResponse } from 'next/server'
import { getFileProcessingQueue, getMockJob, isUsingMockQueue } from '@/lib/queue'

interface ProcessorResult {
  success: boolean
  outputFiles: Array<{
    name: string
    path: string
    size: number
    mimeType: string
    url: string
  }>
  metadata?: Record<string, unknown>
  error?: string
}

export interface JobStatusResponse {
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'unknown'
  progress: number
  resultUrl?: string
  resultUrls?: string[]
  error?: string
  metadata?: Record<string, unknown>
  createdAt?: string
  processedAt?: string
  failedAt?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<JobStatusResponse>> {
  try {
    const jobId = params.id

    if (!jobId) {
      return NextResponse.json(
        {
          status: 'unknown' as const,
          progress: 0,
          error: 'Job ID is required'
        },
        { status: 400 }
      )
    }

    // Handle mock jobs in development
    if (isUsingMockQueue()) {
      const mockJob = getMockJob(jobId)
      
      if (!mockJob) {
        return NextResponse.json(
          {
            status: 'unknown' as const,
            progress: 0,
            error: 'Job not found'
          },
          { status: 404 }
        )
      }
      
      const response: JobStatusResponse = {
        status: mockJob.status,
        progress: mockJob.progress,
        createdAt: mockJob.createdAt.toISOString()
      }
      
      if (mockJob.status === 'completed' && mockJob.result) {
        const result = mockJob.result as ProcessorResult
        if (result.success && result.outputFiles) {
          if (result.outputFiles.length === 1) {
            response.resultUrl = result.outputFiles[0].url
          } else {
            response.resultUrls = result.outputFiles.map(file => file.url)
          }
          response.metadata = result.metadata
        }
        response.processedAt = mockJob.processedAt?.toISOString()
      } else if (mockJob.status === 'failed') {
        response.error = mockJob.error || 'Job failed'
      }
      
      return NextResponse.json(response)
    }

    // Get the queue instance
    const queue = getFileProcessingQueue()
    
    if (!queue) {
      return NextResponse.json(
        {
          status: 'unknown' as const,
          progress: 0,
          error: 'Queue not available'
        },
        { status: 503 }
      )
    }
    
    // Fetch job details
    const job = await queue.getJob(jobId)
    
    if (!job) {
      return NextResponse.json(
        {
          status: 'unknown' as const,
          progress: 0,
          error: 'Job not found'
        },
        { status: 404 }
      )
    }

    // Get job state and progress
    const state = await job.getState()
    const progress = job.progress as number || 0

    // Base response
    const response: JobStatusResponse = {
      status: mapJobState(state),
      progress: Math.round(progress),
      createdAt: new Date(job.timestamp).toISOString()
    }

    // Add state-specific information
    switch (state) {
      case 'completed':
        if (job.returnvalue) {
          const result = job.returnvalue as ProcessorResult
          if (result.success && result.outputFiles) {
            if (result.outputFiles.length === 1) {
              response.resultUrl = result.outputFiles[0].url
            } else {
              response.resultUrls = result.outputFiles.map(file => file.url)
            }
            response.metadata = result.metadata
          } else {
            response.error = result.error || 'Processing completed but no result available'
          }
        }
        response.processedAt = job.processedOn ? new Date(job.processedOn).toISOString() : undefined
        break

      case 'failed':
        response.error = job.failedReason || 'Job failed for unknown reason'
        response.failedAt = job.failedOn ? new Date(job.failedOn).toISOString() : undefined
        break

      case 'active':
        // For active jobs, we might have partial progress
        break

      case 'waiting':
      case 'delayed':
        // These states don't need additional info
        break
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching job status:', error)
    
    return NextResponse.json(
      {
        status: 'unknown' as const,
        progress: 0,
        error: 'Internal server error while fetching job status'
      },
      { status: 500 }
    )
  }
}

/**
 * Map BullMQ job states to our API states
 */
function mapJobState(bullState: string): JobStatusResponse['status'] {
  switch (bullState) {
    case 'waiting':
      return 'waiting'
    case 'active':
      return 'active'
    case 'completed':
      return 'completed'
    case 'failed':
      return 'failed'
    case 'delayed':
      return 'delayed'
    default:
      return 'unknown'
  }
}