import { BaseProcessor, ProcessorContext, JobData, ProcessorResult } from './base'

class PdfToWordProcessor extends BaseProcessor {
  async process(data: JobData, context: ProcessorContext): Promise<ProcessorResult> {
    try {
      context.log('Starting PDF to Word conversion')
      
      // Validate input files
      this.validateFiles(data.files, ['application/pdf'])
      
      if (data.files.length !== 1) {
        throw new Error('PDF to Word conversion requires exactly one PDF file')
      }

      const inputFile = data.files[0]
      context.log(`Converting: ${inputFile.name}`)
      
      // Simulate processing steps
      await this.simulateProcessing(context, 12, 150)
      
      // Check if we're in development mode (using mock processing)
      const isDevelopment = process.env.NODE_ENV === 'development' || process.env.REDIS_MODE === 'mock'
      
      if (isDevelopment) {
        // Use mock file for development
        const outputFile = this.createMockProcessedFile(
          inputFile.path,
          '_converted',
          'docx',
          0.9
        )
        
        context.log(`✓ Mock conversion completed: ${outputFile.name}`)
        
        return {
          success: true,
          outputFiles: [outputFile],
          metadata: {
            originalSize: inputFile.size,
            convertedSize: outputFile.size,
            processingTime: Date.now(),
            tool: 'pdf-to-word',
            mode: 'development'
          }
        }
      } else {
        // Production mode: actual file processing would go here
        // For now, we'll create a mock buffer and save it to storage
        context.log('Processing in production mode...')
        
        // Mock processed file content (in real implementation, this would be actual conversion)
        const mockProcessedContent = Buffer.from(`Mock DOCX content for ${inputFile.name}`, 'utf-8')
        const outputFileName = inputFile.name.replace('.pdf', '.docx')
        
        // Save to Supabase Storage
        const savedFile = await this.saveProcessedFile(
          outputFileName,
          mockProcessedContent,
          context
        )
        
        return {
          success: true,
          outputFiles: [{
            name: savedFile.name,
            path: `/storage/${savedFile.name}`,
            size: savedFile.size,
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            url: savedFile.url
          }],
          metadata: {
            originalSize: inputFile.size,
            convertedSize: savedFile.size,
            processingTime: Date.now(),
            tool: 'pdf-to-word',
            mode: 'production',
            storageUrl: savedFile.url
          }
        }
      }
    } catch (error) {
      context.log(`✗ Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return {
        success: false,
        outputFiles: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }
}

const processor = new PdfToWordProcessor()
export const processPdfToWord = processor.process.bind(processor)