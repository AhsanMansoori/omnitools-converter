import sharp from 'sharp'
import { BaseProcessor, ProcessorContext, JobData, ProcessorResult } from './base'

/**
 * Image Resize Processor - Real implementation using Sharp
 * Downloads images from storage, resizes them, and uploads result back to storage
 */
class ImageResizeProcessor extends BaseProcessor {
  async process(data: JobData, context: ProcessorContext): Promise<ProcessorResult> {
    try {
      context.log('Starting image resize processing with Sharp')
      
      // Validate input files
      if (!data.files || data.files.length === 0) {
        throw new Error('At least 1 image file is required for resizing')
      }

      // Validate all files are images
      const expectedMimeTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 
        'image/gif', 'image/bmp', 'image/tiff'
      ]
      this.validateFiles(data.files, expectedMimeTypes)

      context.updateProgress(10)
      
      // Extract resize settings from job data
      const settings = data.settings || {}
      const width = typeof settings.width === 'number' ? settings.width : 800
      const height = typeof settings.height === 'number' ? settings.height : 600
      const quality = typeof settings.quality === 'number' ? settings.quality : 90
      const format = typeof settings.format === 'string' ? settings.format : 'jpeg'
      const maintainAspectRatio = settings.maintainAspectRatio !== false // Default true

      context.log(`Resize settings: ${width}x${height}, quality: ${quality}%, format: ${format}`)
      
      const outputFiles = []
      
      // Process each file
      for (let i = 0; i < data.files.length; i++) {
        const file = data.files[i]
        const progressStart = 10 + (i / data.files.length) * 80
        const progressEnd = 10 + ((i + 1) / data.files.length) * 80
        
        context.updateProgress(Math.round(progressStart))
        context.log(`Processing image ${i + 1}/${data.files.length}: ${file.name}`)

        try {
          // Download image from storage
          let imageBuffer: Buffer
          
          if (file.path.startsWith('http')) {
            // Download from URL (e.g., Supabase Storage)
            context.log(`Downloading ${file.name} from storage`)
            const response = await fetch(file.path)
            if (!response.ok) {
              throw new Error(`Failed to download ${file.name}: ${response.statusText}`)
            }
            imageBuffer = Buffer.from(await response.arrayBuffer())
          } else {
            // Handle local file path (for development/testing)
            const fs = await import('fs')
            imageBuffer = fs.readFileSync(file.path)
          }

          context.log(`Downloaded ${file.name} (${imageBuffer.length} bytes)`)
          
          // Get original image metadata
          const metadata = await sharp(imageBuffer).metadata()
          context.log(`Original dimensions: ${metadata.width}x${metadata.height}`)

          // Create Sharp instance for processing
          let sharpInstance = sharp(imageBuffer)

          // Apply resize operation
          if (maintainAspectRatio) {
            // Resize with aspect ratio maintained
            sharpInstance = sharpInstance.resize(width, height, {
              fit: 'inside', // Fit within bounds while maintaining aspect ratio
              withoutEnlargement: false // Allow enlargement
            })
          } else {
            // Force exact dimensions (may distort image)
            sharpInstance = sharpInstance.resize(width, height, {
              fit: 'fill' // Force exact dimensions
            })
          }

          // Apply format and quality settings
          switch (format.toLowerCase()) {
            case 'jpeg':
            case 'jpg':
              sharpInstance = sharpInstance.jpeg({ quality, progressive: true })
              break
            case 'png':
              sharpInstance = sharpInstance.png({ quality: Math.round(quality / 10) }) // PNG quality 0-9
              break
            case 'webp':
              sharpInstance = sharpInstance.webp({ quality })
              break
            case 'avif':
              sharpInstance = sharpInstance.avif({ quality })
              break
            default:
              // Default to JPEG
              sharpInstance = sharpInstance.jpeg({ quality, progressive: true })
          }

          // Process the image
          const resizedBuffer = await sharpInstance.toBuffer()
          
          // Get final metadata
          const finalMetadata = await sharp(resizedBuffer).metadata()
          context.log(`Resized to: ${finalMetadata.width}x${finalMetadata.height}, size: ${resizedBuffer.length} bytes`)

          // Generate output filename
          const nameWithoutExt = file.name.split('.').slice(0, -1).join('.')
          const outputFileName = `${nameWithoutExt}_${width}x${height}.${format}`

          // Save to storage
          const savedFile = await this.saveProcessedFile(
            outputFileName,
            resizedBuffer,
            context
          )

          outputFiles.push({
            name: savedFile.name,
            path: savedFile.url, // Use URL as path for storage access
            size: savedFile.size,
            mimeType: this.getMimeType(format),
            url: savedFile.url
          })

          context.log(`✓ Resized ${file.name} -> ${savedFile.name}`)
          context.updateProgress(Math.round(progressEnd))
          
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          context.log(`✗ Error processing ${file.name}: ${errorMsg}`)
          throw new Error(`Failed to process "${file.name}": ${errorMsg}`)
        }
      }

      context.updateProgress(100)
      context.log(`✓ Image resize completed successfully. Processed ${outputFiles.length} images`)

      return {
        success: true,
        outputFiles,
        metadata: {
          originalFiles: data.files.length,
          resizeSettings: { width, height, quality, format, maintainAspectRatio },
          processingTime: Date.now() - new Date(data.createdAt).getTime(),
          totalOutputSize: outputFiles.reduce((sum, f) => sum + f.size, 0),
          compressionRatio: outputFiles.reduce((sum, f) => sum + f.size, 0) / data.files.reduce((sum, f) => sum + f.size, 0)
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      context.log(`✗ Image resize failed: ${errorMessage}`)
      
      return {
        success: false,
        outputFiles: [],
        error: errorMessage
      }
    }
  }
}

// Create processor instance and export process function
const processor = new ImageResizeProcessor()
export const process = processor.process.bind(processor)