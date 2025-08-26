import { PDFDocument } from 'pdf-lib'
import { BaseProcessor, ProcessorContext, JobData, ProcessorResult } from './base'

/**
 * PDF Merge Processor - Real implementation using pdf-lib
 * Downloads PDFs from storage, merges them, and uploads result back to storage
 */
class PdfMergeProcessor extends BaseProcessor {
  async process(data: JobData, context: ProcessorContext): Promise<ProcessorResult> {
    try {
      context.log('Starting PDF merge processing with pdf-lib')
      
      // Validate input files
      if (!data.files || data.files.length < 2) {
        throw new Error('At least 2 PDF files are required for merging')
      }

      // Validate all files are PDFs
      const expectedMimeTypes = ['application/pdf']
      this.validateFiles(data.files, expectedMimeTypes)

      context.updateProgress(10)
      context.log(`Merging ${data.files.length} PDF files`)

      // Create new PDF document for merging
      const mergedPdf = await PDFDocument.create()
      
      // Process each file in order
      for (let i = 0; i < data.files.length; i++) {
        const file = data.files[i]
        const progressStart = 10 + (i / data.files.length) * 70
        const progressEnd = 10 + ((i + 1) / data.files.length) * 70
        
        context.updateProgress(Math.round(progressStart))
        context.log(`Processing file ${i + 1}/${data.files.length}: ${file.name}`)

        try {
          // Download file from storage (using file.path as URL or file path)
          let pdfBytes: Uint8Array
          
          if (file.path.startsWith('http')) {
            // Download from URL (e.g., Supabase Storage)
            context.log(`Downloading ${file.name} from storage`)
            const response = await fetch(file.path)
            if (!response.ok) {
              throw new Error(`Failed to download ${file.name}: ${response.statusText}`)
            }
            pdfBytes = new Uint8Array(await response.arrayBuffer())
          } else {
            // Handle local file path (for development/testing)
            const fs = await import('fs')
            const fileBuffer = fs.readFileSync(file.path)
            pdfBytes = new Uint8Array(fileBuffer)
          }

          context.log(`Downloaded ${file.name} (${pdfBytes.length} bytes)`)
          
          // Load the PDF document
          const pdfDoc = await PDFDocument.load(pdfBytes)
          
          // Get all pages from the document
          const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices())
          
          // Add pages to merged document
          pages.forEach(page => mergedPdf.addPage(page))
          
          context.log(`✓ Added ${pages.length} pages from ${file.name}`)
          context.updateProgress(Math.round(progressEnd))
          
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          context.log(`✗ Error processing ${file.name}: ${errorMsg}`)
          throw new Error(`Failed to process "${file.name}": ${errorMsg}`)
        }
      }

      context.updateProgress(80)
      context.log('Generating merged PDF document')

      // Generate the merged PDF
      const mergedPdfBytes = await mergedPdf.save()
      
      context.updateProgress(90)
      context.log(`PDF merge complete (${mergedPdfBytes.length} bytes)`)

      // Generate output filename
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      const outputFileName = `merged-${data.files.length}-files-${timestamp}.pdf`

      // Save to storage
      const savedFile = await this.saveProcessedFile(
        outputFileName,
        Buffer.from(mergedPdfBytes),
        context
      )

      context.updateProgress(100)
      context.log(`✓ PDF merge completed successfully: ${savedFile.name}`)

      return {
        success: true,
        outputFiles: [{
          name: savedFile.name,
          path: savedFile.url, // Use URL as path for storage access
          size: savedFile.size,
          mimeType: 'application/pdf',
          url: savedFile.url
        }],
        metadata: {
          originalFiles: data.files.length,
          totalPages: mergedPdf.getPageCount(),
          processingTime: Date.now() - new Date(data.createdAt).getTime(),
          outputSize: savedFile.size,
          compressionRatio: savedFile.size / data.files.reduce((sum, f) => sum + f.size, 0)
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      context.log(`✗ PDF merge failed: ${errorMessage}`)
      
      return {
        success: false,
        outputFiles: [],
        error: errorMessage
      }
    }
  }
}

// Create processor instance and export process function
const processor = new PdfMergeProcessor()
export const process = processor.process.bind(processor)