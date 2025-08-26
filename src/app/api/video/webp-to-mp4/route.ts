import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

// Promisify fs functions
const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)
const unlink = promisify(fs.unlink)
const mkdir = promisify(fs.mkdir)

export async function POST(request: NextRequest): Promise<NextResponse> {
  let inputPath: string | null = null
  let outputPath: string | null = null
  
  try {
    // Parse multipart form data
    const formData = await request.formData()
    
    // Get uploaded file
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type - only WebP supported
    if (file.type !== 'image/webp') {
      return NextResponse.json(
        { 
          error: 'Unsupported file type. Please upload WebP images only.',
          supportedType: 'image/webp'
        },
        { status: 400 }
      )
    }

    // Validate file size (max 30MB as per tool registry)
    const maxSize = 30 * 1024 * 1024 // 30MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 30MB limit' },
        { status: 400 }
      )
    }

    console.log(`Converting WebP to MP4: ${file.name} (${file.size} bytes)`)
    
    // Create temporary directory if it doesn't exist
    const tempDir = path.join(process.cwd(), 'temp')
    try {
      await mkdir(tempDir, { recursive: true })
    } catch {
      // Directory might already exist, ignore error
    }

    // Generate unique filenames with timestamp
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substr(2, 9)
    const baseFilename = `webp_${timestamp}_${randomId}`
    
    inputPath = path.join(tempDir, `${baseFilename}.webp`)
    outputPath = path.join(tempDir, `${baseFilename}.mp4`)

    // Convert file to buffer and save to temporary file
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(inputPath, buffer)

    console.log(`Temporary files: ${inputPath} -> ${outputPath}`)

    // Run FFmpeg conversion
    const outputBuffer = await convertWebPToMP4(inputPath, outputPath)
    
    // Generate output filename
    const originalName = file.name.replace(/\.webp$/i, '')
    const mp4Filename = `${originalName}.mp4`

    console.log(`Conversion successful. Output file: ${mp4Filename} (${outputBuffer.length} bytes)`)

    // Return binary response with appropriate headers
    return new NextResponse(outputBuffer as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${mp4Filename}"`,
        'Content-Length': outputBuffer.length.toString(),
        'X-Original-Name': file.name,
        'X-Original-Size': file.size.toString(),
        'X-Converted-Size': outputBuffer.length.toString(),
        'X-Conversion-Format': 'webp-to-mp4',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('WebP to MP4 conversion error:', error)
    
    // Handle specific FFmpeg errors
    if (error instanceof Error) {
      if (error.message.includes('ffmpeg not found') || error.message.includes('ENOENT')) {
        return NextResponse.json(
          { 
            error: 'FFmpeg not available',
            details: 'FFmpeg is required for video conversion but is not installed on the server.'
          },
          { status: 500 }
        )
      }
      
      if (error.message.includes('Invalid data found')) {
        return NextResponse.json(
          { error: 'Invalid WebP file format' },
          { status: 400 }
        )
      }
      
      if (error.message.includes('No such file or directory')) {
        return NextResponse.json(
          { error: 'File processing failed' },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Video conversion failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    // Clean up temporary files
    if (inputPath) {
      try {
        await unlink(inputPath)
        console.log(`Cleaned up input file: ${inputPath}`)
      } catch (err) {
        console.warn(`Failed to cleanup input file: ${inputPath}`, err)
      }
    }
    
    if (outputPath) {
      try {
        await unlink(outputPath)
        console.log(`Cleaned up output file: ${outputPath}`)
      } catch (err) {
        console.warn(`Failed to cleanup output file: ${outputPath}`, err)
      }
    }
  }
}

/**
 * Convert WebP to MP4 using FFmpeg
 */
async function convertWebPToMP4(inputPath: string, outputPath: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // FFmpeg command for WebP to MP4 conversion
    // -y: overwrite output file
    // -i: input file
    // -movflags faststart: optimize for web streaming
    // -pix_fmt yuv420p: ensure compatibility with most players
    // -vf scale: ensure even dimensions for H.264 encoding
    const ffmpegArgs = [
      '-y',
      '-i', inputPath,
      '-movflags', 'faststart',
      '-pix_fmt', 'yuv420p',
      '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', // Ensure even dimensions
      outputPath
    ]

    console.log(`Running FFmpeg: ffmpeg ${ffmpegArgs.join(' ')}`)

    const ffmpeg = spawn('ffmpeg', ffmpegArgs)
    
    let stderr = ''
    
    // Capture stderr for error reporting
    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    ffmpeg.on('close', async (code) => {
      if (code !== 0) {
        console.error(`FFmpeg exited with code ${code}`)
        console.error('FFmpeg stderr:', stderr)
        reject(new Error(`FFmpeg conversion failed with exit code ${code}: ${stderr}`))
        return
      }

      try {
        // Read the converted file
        const outputBuffer = await readFile(outputPath)
        console.log(`FFmpeg conversion successful. Output size: ${outputBuffer.length} bytes`)
        resolve(outputBuffer)
      } catch (error) {
        console.error('Failed to read converted file:', error)
        reject(new Error(`Failed to read converted file: ${error instanceof Error ? error.message : 'Unknown error'}`))
      }
    })

    ffmpeg.on('error', (error) => {
      console.error('FFmpeg spawn error:', error)
      if (error.message.includes('ENOENT')) {
        reject(new Error('ffmpeg not found. Please ensure FFmpeg is installed and available in PATH.'))
      } else {
        reject(new Error(`FFmpeg error: ${error.message}`))
      }
    })
  })
}

// Handle unsupported methods
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      error: 'Method not allowed. Use POST with multipart/form-data.',
      usage: {
        method: 'POST',
        contentType: 'multipart/form-data',
        fields: {
          file: 'WebP file (animated or static)'
        },
        output: 'MP4 video file with H.264 encoding'
      }
    },
    { status: 405 }
  )
}