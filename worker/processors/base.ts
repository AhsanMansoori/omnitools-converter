import { saveFile, generateUniqueFileName } from '../../lib/storage'

export interface ProcessorContext {
  updateProgress: (progress: number) => void
  log: (message: string) => void
}

export interface JobData {
  toolId: string
  files: Array<{
    name: string
    path: string
    size: number
    mimeType: string
  }>
  settings?: Record<string, unknown>
  userId?: string
  requestId?: string
  createdAt: string
}

export interface ProcessorResult {
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

export type Processor = (data: JobData, context: ProcessorContext) => Promise<ProcessorResult>

/**
 * Base processor with common functionality
 */
export abstract class BaseProcessor {
  protected async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  protected validateFiles(files: JobData['files'], expectedMimeTypes: string[]): void {
    for (const file of files) {
      if (!expectedMimeTypes.includes(file.mimeType)) {
        throw new Error(`Invalid file type: ${file.mimeType}. Expected: ${expectedMimeTypes.join(', ')}`)
      }
    }
  }

  protected generateOutputPath(inputPath: string, suffix: string, extension?: string): string {
    const pathParts = inputPath.split('/')
    const fileName = pathParts[pathParts.length - 1]
    const nameWithoutExt = fileName.split('.').slice(0, -1).join('.')
    const ext = extension || fileName.split('.').pop()
    
    return `${pathParts.slice(0, -1).join('/')}/${nameWithoutExt}${suffix}.${ext}`
  }

  protected async simulateProcessing(
    context: ProcessorContext,
    stepCount: number = 10,
    baseDelay: number = 100
  ): Promise<void> {
    for (let step = 0; step <= stepCount; step++) {
      const progress = Math.round((step / stepCount) * 100)
      context.updateProgress(progress)
      context.log(`Processing step ${step}/${stepCount} (${progress}%)`)
      
      if (step < stepCount) {
        await this.delay(baseDelay + Math.random() * 200)
      }
    }
  }

  /**
   * Save processed file to Supabase Storage
   */
  protected async saveProcessedFile(
    fileName: string,
    buffer: Buffer,
    context: ProcessorContext
  ): Promise<{ name: string; url: string; size: number }> {
    try {
      const uniqueFileName = generateUniqueFileName(fileName, 'processed')
      context.log(`Saving processed file: ${uniqueFileName}`)
      
      const publicUrl = await saveFile(uniqueFileName, buffer)
      
      context.log(`✓ File saved to storage: ${publicUrl}`)
      
      return {
        name: uniqueFileName,
        url: publicUrl,
        size: buffer.length
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown storage error'
      context.log(`✗ Failed to save file: ${errorMessage}`)
      throw new Error(`Storage error: ${errorMessage}`)
    }
  }

  /**
   * Create mock processed file for development/testing
   */
  protected createMockProcessedFile(
    inputPath: string,
    suffix: string,
    extension?: string,
    sizeMultiplier: number = 0.8
  ): { name: string; path: string; size: number; mimeType: string; url: string } {
    const pathParts = inputPath.split('/')
    const fileName = pathParts[pathParts.length - 1]
    const nameWithoutExt = fileName.split('.').slice(0, -1).join('.')
    const ext = extension || fileName.split('.').pop()
    
    const processedName = `${nameWithoutExt}${suffix}.${ext}`
    const outputPath = this.generateOutputPath(inputPath, suffix, extension)
    
    return {
      name: processedName,
      path: outputPath,
      size: Math.floor(1024 * 1024 * sizeMultiplier), // Mock size
      mimeType: this.getMimeType(ext || 'pdf'),
      url: `/api/download/${processedName}`
    }
  }

  /**
   * Get MIME type for file extension
   */
  protected getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'doc': 'application/msword',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'bmp': 'image/bmp',
      'tiff': 'image/tiff',
      'mp4': 'video/mp4',
      'avi': 'video/x-msvideo',
      'mov': 'video/quicktime'
    }
    
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream'
  }
}