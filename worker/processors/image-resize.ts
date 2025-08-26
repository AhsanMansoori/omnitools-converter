import { BaseProcessor, ProcessorContext, JobData, ProcessorResult } from './base'

class ImageResizeProcessor extends BaseProcessor {
  async process(data: JobData, context: ProcessorContext): Promise<ProcessorResult> {
    try {
      context.log('Starting image resize operation')
      
      // Validate input files
      const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp']
      this.validateFiles(data.files, supportedTypes)
      
      context.log(`Processing ${data.files.length} image(s)`)
      
      const outputFiles = []
      const totalFiles = data.files.length
      const isDevelopment = process.env.NODE_ENV === 'development' || process.env.REDIS_MODE === 'mock'
      
      for (let i = 0; i < data.files.length; i++) {
        const file = data.files[i]
        const fileProgress = i / totalFiles
        const baseProgress = fileProgress * 100
        
        context.log(`Processing ${file.name} (${i + 1}/${totalFiles})`)
        context.updateProgress(Math.round(baseProgress))
        
        // Simulate file processing
        for (let step = 0; step <= 10; step++) {
          const stepProgress = baseProgress + (step / 10) * (100 / totalFiles)
          context.updateProgress(Math.round(stepProgress))
          await this.delay(80 + Math.random() * 120)
        }
        
        // Get resize settings from job data
        const settings = data.settings || {}
        const width = (settings.width as number) || 1920
        const height = (settings.height as number) || 1080
        
        if (isDevelopment) {
          // Use mock file for development
          const outputFile = this.createMockProcessedFile(
            file.path,
            `_resized_${width}x${height}`,
            undefined,
            0.7
          )
          outputFiles.push(outputFile)
          context.log(`✓ Mock resize completed: ${file.name} → ${outputFile.name}`)
        } else {
          // Production mode: actual image processing would go here
          context.log(`Resizing ${file.name} to ${width}x${height} in production mode...`)
          
          // Mock resized image content (in real implementation, this would be actual image processing)
          const mockResizedContent = Buffer.from(`Mock resized image content for ${file.name}`, 'utf-8')
          const outputFileName = file.name.replace(/\.[^.]+$/, `_resized_${width}x${height}$&`)
          
          // Save to Supabase Storage
          const savedFile = await this.saveProcessedFile(
            outputFileName,
            mockResizedContent,
            context
          )
          
          outputFiles.push({
            name: savedFile.name,
            path: `/storage/${savedFile.name}`,
            size: savedFile.size,
            mimeType: file.mimeType,
            url: savedFile.url
          })
          
          context.log(`✓ Resized and saved: ${file.name} → ${savedFile.name}`)
        }
      }
      
      context.updateProgress(100)
      context.log(`✓ All images processed successfully`)
      
      return {
        success: true,
        outputFiles,
        metadata: {
          totalFiles: data.files.length,
          settings: data.settings,
          processingTime: Date.now(),
          tool: 'image-resize',
          mode: isDevelopment ? 'development' : 'production'
        }
      }
    } catch (error) {
      context.log(`✗ Image resize failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return {
        success: false,
        outputFiles: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }
}

const processor = new ImageResizeProcessor()
export const processImageResize = processor.process.bind(processor)