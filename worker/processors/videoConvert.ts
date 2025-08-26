import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import { BaseProcessor, ProcessorContext, JobData, ProcessorResult } from './base'

// Promisify fs functions
const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)
const unlink = promisify(fs.unlink)
const mkdir = promisify(fs.mkdir)

/**
 * Video Convert Processor - Real implementation using FFmpeg
 * Downloads videos from storage, converts them, and uploads result back to storage
 */
class VideoConvertProcessor extends BaseProcessor {
  async process(data: JobData, context: ProcessorContext): Promise<ProcessorResult> {
    // Initialize temp directory
    const tempDir: string = path.join(__dirname, '..', '..', 'temp')
    const tempFiles: string[] = []
    
    try {
      context.log('Starting video conversion processing with FFmpeg')
      
      // Validate input files
      if (!data.files || data.files.length === 0) {
        throw new Error('At least 1 video file is required for conversion')
      }

      // Create temp directory
      try {
        await mkdir(tempDir, { recursive: true })
      } catch {
        // Directory might already exist
      }

      context.updateProgress(5)
      
      // Extract conversion settings from job data
      const settings = data.settings || {}
      const outputFormat = typeof settings.format === 'string' ? settings.format : 'mp4'
      const quality = typeof settings.quality === 'string' ? settings.quality : 'medium'
      const resolution = typeof settings.resolution === 'string' ? settings.resolution : 'original'
      
      context.log(`Conversion settings: format=${outputFormat}, quality=${quality}, resolution=${resolution}`)
      
      const outputFiles = []
      
      // Process each file
      for (let i = 0; i < data.files.length; i++) {
        const file = data.files[i]
        const progressStart = 5 + (i / data.files.length) * 85
        const progressEnd = 5 + ((i + 1) / data.files.length) * 85
        
        context.updateProgress(Math.round(progressStart))
        context.log(`Converting video ${i + 1}/${data.files.length}: ${file.name}`)

        try {
          // Generate unique temp filenames
          const timestamp = Date.now()
          const randomId = Math.random().toString(36).substr(2, 9)
          const originalExt = file.name.split('.').pop() || 'video'
          const inputTempPath = path.join(tempDir, `input_${timestamp}_${i}_${randomId}.${originalExt}`)
          const outputTempPath = path.join(tempDir, `output_${timestamp}_${i}_${randomId}.${outputFormat}`)
          
          tempFiles.push(inputTempPath, outputTempPath)
          
          // Download video from storage
          let videoBuffer: Buffer
          
          if (file.path.startsWith('http')) {
            // Download from URL (e.g., Supabase Storage)
            context.log(`Downloading ${file.name} from storage`)
            const response = await fetch(file.path)
            if (!response.ok) {
              throw new Error(`Failed to download ${file.name}: ${response.statusText}`)
            }
            videoBuffer = Buffer.from(await response.arrayBuffer())
          } else {
            // Handle local file path (for development/testing)
            videoBuffer = fs.readFileSync(file.path)
          }

          context.log(`Downloaded ${file.name} (${videoBuffer.length} bytes)`)
          
          // Save to temporary file
          await writeFile(inputTempPath, videoBuffer)
          
          // Convert video using FFmpeg
          const convertedBuffer = await this.convertVideo(
            inputTempPath, 
            outputTempPath, 
            { outputFormat, quality, resolution },
            context,
            progressStart,
            progressEnd
          )
          
          // Generate output filename
          const nameWithoutExt = file.name.split('.').slice(0, -1).join('.')
          const outputFileName = `${nameWithoutExt}_converted.${outputFormat}`

          // Save to storage
          const savedFile = await this.saveProcessedFile(
            outputFileName,
            convertedBuffer,
            context
          )

          outputFiles.push({
            name: savedFile.name,
            path: savedFile.url, // Use URL as path for storage access
            size: savedFile.size,
            mimeType: this.getMimeType(outputFormat),
            url: savedFile.url
          })

          context.log(`✓ Converted ${file.name} -> ${savedFile.name}`)
          context.updateProgress(Math.round(progressEnd))
          
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          context.log(`✗ Error processing ${file.name}: ${errorMsg}`)
          throw new Error(`Failed to process "${file.name}": ${errorMsg}`)
        }
      }

      context.updateProgress(100)
      context.log(`✓ Video conversion completed successfully. Processed ${outputFiles.length} videos`)

      return {
        success: true,
        outputFiles,
        metadata: {
          originalFiles: data.files.length,
          conversionSettings: { outputFormat, quality, resolution },
          processingTime: Date.now() - new Date(data.createdAt).getTime(),
          totalOutputSize: outputFiles.reduce((sum, f) => sum + f.size, 0),
          compressionRatio: outputFiles.reduce((sum, f) => sum + f.size, 0) / data.files.reduce((sum, f) => sum + f.size, 0)
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      context.log(`✗ Video conversion failed: ${errorMessage}`)
      
      return {
        success: false,
        outputFiles: [],
        error: errorMessage
      }
    } finally {
      // Clean up temporary files
      for (const tempFile of tempFiles) {
        try {
          await unlink(tempFile)
          context.log(`Cleaned up temp file: ${tempFile}`)
        } catch {
          context.log(`Warning: Failed to cleanup temp file: ${tempFile}`)
        }
      }
    }
  }

  /**
   * Convert video using FFmpeg with various quality and resolution settings
   */
  private async convertVideo(
    inputPath: string, 
    outputPath: string, 
    settings: { outputFormat: string, quality: string, resolution: string },
    context: ProcessorContext,
    progressStart: number,
    progressEnd: number
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const { outputFormat, quality, resolution } = settings
      
      // Build FFmpeg arguments based on settings
      const ffmpegArgs = ['-y', '-i', inputPath]
      
      // Video codec settings based on format and quality
      switch (outputFormat.toLowerCase()) {
        case 'mp4':
          ffmpegArgs.push('-c:v', 'libx264', '-preset', 'fast')
          break
        case 'webm':
          ffmpegArgs.push('-c:v', 'libvpx-vp9', '-c:a', 'libopus')
          break
        case 'avi':
          ffmpegArgs.push('-c:v', 'libxvid', '-c:a', 'mp3')
          break
        case 'mov':
          ffmpegArgs.push('-c:v', 'libx264', '-c:a', 'aac')
          break
      }
      
      // Quality settings
      switch (quality.toLowerCase()) {
        case 'high':
          ffmpegArgs.push('-crf', '18', '-b:a', '192k')
          break
        case 'medium':
          ffmpegArgs.push('-crf', '23', '-b:a', '128k')
          break
        case 'low':
          ffmpegArgs.push('-crf', '28', '-b:a', '96k')
          break
      }
      
      // Resolution settings
      switch (resolution.toLowerCase()) {
        case '720p':
          ffmpegArgs.push('-vf', 'scale=1280:720')
          break
        case '1080p':
          ffmpegArgs.push('-vf', 'scale=1920:1080')
          break
        case '480p':
          ffmpegArgs.push('-vf', 'scale=854:480')
          break
        case 'original':
          // Keep original resolution
          break
      }
      
      // Additional settings for web compatibility
      if (outputFormat.toLowerCase() === 'mp4') {
        ffmpegArgs.push('-movflags', 'faststart', '-pix_fmt', 'yuv420p')
      }
      
      // Add output path
      ffmpegArgs.push(outputPath)

      context.log(`Running FFmpeg: ffmpeg ${ffmpegArgs.join(' ')}`)

      const ffmpeg = spawn('ffmpeg', ffmpegArgs)
      
      let stderr = ''
      let duration: number | null = null
      let timeProgress: number | null = null
      
      // Parse FFmpeg output for progress tracking
      ffmpeg.stderr.on('data', (data) => {
        const output = data.toString()
        stderr += output
        
        // Extract duration from FFmpeg output
        if (duration === null) {
          const durationMatch = output.match(/Duration: (\d{2}):(\d{2}):(\d{2})\.(\d{2})/)
          if (durationMatch) {
            const hours = parseInt(durationMatch[1])
            const minutes = parseInt(durationMatch[2])
            const seconds = parseInt(durationMatch[3])
            duration = hours * 3600 + minutes * 60 + seconds
            context.log(`Video duration: ${duration} seconds`)
          }
        }
        
        // Extract current time progress
        const timeMatch = output.match(/time=(\d{2}):(\d{2}):(\d{2})\.(\d{2})/)
        if (timeMatch && duration) {
          const hours = parseInt(timeMatch[1])
          const minutes = parseInt(timeMatch[2])
          const seconds = parseInt(timeMatch[3])
          const currentTime = hours * 3600 + minutes * 60 + seconds
          timeProgress = Math.min(100, (currentTime / duration) * 100)
          
          // Update progress based on video processing progress
          const overallProgress = progressStart + ((progressEnd - progressStart) * timeProgress / 100)
          context.updateProgress(Math.round(overallProgress))
        }
      })

      ffmpeg.on('close', async (code) => {
        if (code !== 0) {
          context.log(`FFmpeg exited with code ${code}`)
          context.log(`FFmpeg stderr: ${stderr}`)
          reject(new Error(`FFmpeg conversion failed with exit code ${code}: ${stderr}`))
          return
        }

        try {
          // Read the converted file
          const outputBuffer = await readFile(outputPath)
          context.log(`FFmpeg conversion successful. Output size: ${outputBuffer.length} bytes`)
          resolve(outputBuffer)
        } catch (error) {
          context.log(`Failed to read converted file: ${error instanceof Error ? error.message : 'Unknown error'}`)
          reject(new Error(`Failed to read converted file: ${error instanceof Error ? error.message : 'Unknown error'}`))
        }
      })

      ffmpeg.on('error', (error) => {
        context.log(`FFmpeg spawn error: ${error.message}`)
        if (error.message.includes('ENOENT')) {
          reject(new Error('FFmpeg not found. Please ensure FFmpeg is installed and available in PATH.'))
        } else {
          reject(new Error(`FFmpeg error: ${error.message}`))
        }
      })
    })
  }
}

// Create processor instance and export process function
const processor = new VideoConvertProcessor()
export const process = processor.process.bind(processor)