import { Queue } from 'bullmq'
import { getRedisConnection } from './redis'

// Job payload types
export interface BaseJobPayload {
  files: Array<{
    name: string
    path: string
    size: number
    mimeType: string
  }>
  settings?: Record<string, unknown>
  userId?: string
  requestId?: string
}

export interface JobResult {
  jobId: string
}

// Mock job storage for development
const mockJobs = new Map<string, {
  id: string
  name: string
  data: unknown
  status: 'waiting' | 'active' | 'completed' | 'failed'
  progress: number
  result?: unknown
  error?: string
  createdAt: Date
  processedAt?: Date
}>()

// Queue instance
let fileProcessingQueue: Queue | null = null
let useMockQueue = false

function getQueue(): Queue | null {
  if (process.env.REDIS_MODE === 'mock' || process.env.NODE_ENV === 'development') {
    useMockQueue = true
    console.log('Using mock queue for development')
    return null // Return null to indicate we're using mock mode
  }

  if (!fileProcessingQueue) {
    const redis = getRedisConnection()
    
    fileProcessingQueue = new Queue('file-processing', {
      connection: redis,
      defaultJobOptions: {
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 50,      // Keep last 50 failed jobs
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    })

    fileProcessingQueue.on('error', (error) => {
      console.error('Queue error:', error)
    })
  }

  return fileProcessingQueue
}

/**
 * Enqueue a job for file processing
 * @param toolId - The ID of the tool to process files with
 * @param payload - The job payload containing files and settings
 * @returns Promise resolving to job information
 */
export async function enqueueJob(
  toolId: string, 
  payload: BaseJobPayload
): Promise<JobResult> {
  try {
    // Use mock queue in development
    if (process.env.REDIS_MODE === 'mock' || process.env.NODE_ENV === 'development') {
      const jobId = `${toolId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Store in mock job storage
      mockJobs.set(jobId, {
        id: jobId,
        name: `process-${toolId}`,
        data: {
          toolId,
          ...payload,
          createdAt: new Date().toISOString(),
        },
        status: 'waiting',
        progress: 0,
        createdAt: new Date()
      })
      
      console.log(`Mock job enqueued: ${jobId} for tool: ${toolId}`)
      
      // Simulate processing after a short delay
      setTimeout(() => {
        const job = mockJobs.get(jobId)
        if (job) {
          job.status = 'completed'
          job.progress = 100
          job.processedAt = new Date()
          job.result = {
            success: true,
            outputFiles: [{
              name: `processed_${payload.files[0]?.name || 'file.pdf'}`,
              path: `/tmp/processed_${jobId}`,
              size: payload.files[0]?.size || 1024,
              mimeType: payload.files[0]?.mimeType || 'application/pdf',
              url: `/api/download/processed_${jobId}`
            }],
            metadata: {
              tool: toolId,
              processingTime: Date.now()
            }
          }
          mockJobs.set(jobId, job)
          console.log(`Mock job completed: ${jobId}`)
        }
      }, 2000) // Complete after 2 seconds
      
      return { jobId }
    }

    const queue = getQueue()
    
    if (!queue) {
      throw new Error('Queue not available')
    }
    
    // Add job to queue with tool-specific job name
    const job = await queue.add(
      `process-${toolId}`,
      {
        toolId,
        ...payload,
        createdAt: new Date().toISOString(),
      },
      {
        // Job-specific options
        priority: getJobPriority(toolId),
        delay: 0, // Process immediately
        // Add job ID prefix for easier tracking
        jobId: `${toolId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      }
    )

    console.log(`Job enqueued: ${job.id} for tool: ${toolId}`)
    
    return {
      jobId: job.id!
    }
  } catch (error) {
    console.error('Failed to enqueue job:', error)
    throw new Error(`Failed to enqueue job: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get job priority based on tool type
 * Higher priority = processed first (lower number)
 */
function getJobPriority(toolId: string): number {
  // PDF tools get higher priority (smaller files, faster processing)
  if (toolId.startsWith('pdf-')) return 1
  
  // Image tools get medium priority
  if (toolId.startsWith('image-')) return 2
  
  // Video tools get lower priority (larger files, slower processing)
  if (toolId.startsWith('video-') || toolId === 'webp-to-mp4') return 3
  
  // Other tools get default priority
  return 2
}

/**
 * Get queue instance for external use (e.g., in workers)
 */
export function getFileProcessingQueue(): Queue | null {
  return getQueue()
}

/**
 * Get mock job for development (used by job status API)
 */
export function getMockJob(jobId: string) {
  return mockJobs.get(jobId)
}

/**
 * Check if we're using mock queue
 */
export function isUsingMockQueue(): boolean {
  return useMockQueue || process.env.REDIS_MODE === 'mock' || process.env.NODE_ENV === 'development'
}

/**
 * Clean up queue resources
 */
export async function closeQueue(): Promise<void> {
  if (fileProcessingQueue) {
    await fileProcessingQueue.close()
    fileProcessingQueue = null
  }
}