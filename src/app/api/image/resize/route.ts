import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export async function POST(request: NextRequest): Promise<NextResponse> {
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

    // Validate file type
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!supportedTypes.includes(file.type)) {
      return NextResponse.json(
        { 
          error: 'Unsupported file type. Please upload JPEG, PNG, or WebP images.',
          supportedTypes
        },
        { status: 400 }
      )
    }

    // Get resize parameters
    const width = formData.get('width') ? parseInt(formData.get('width') as string) : undefined
    const height = formData.get('height') ? parseInt(formData.get('height') as string) : undefined
    // Note: maintainAspectRatio is used in Sharp's resize configuration below

    // Validate dimensions
    if (!width && !height) {
      return NextResponse.json(
        { error: 'At least one dimension (width or height) must be provided' },
        { status: 400 }
      )
    }

    if ((width && (width <= 0 || width > 10000)) || (height && (height <= 0 || height > 10000))) {
      return NextResponse.json(
        { error: 'Dimensions must be between 1 and 10,000 pixels' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Validate file size (max 50MB)
    if (buffer.length > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      )
    }

    console.log(`Resizing image: ${file.name} (${file.type}) to ${width}x${height}`)
    
    // Process image with Sharp
    let sharpInstance = sharp(buffer)
    
    // Get original image metadata
    const metadata = await sharpInstance.metadata()
    console.log(`Original dimensions: ${metadata.width}x${metadata.height}`)
    
    // Apply resize with 'inside' fit (maintains aspect ratio, fits within bounds)
    sharpInstance = sharpInstance.resize({
      width,
      height,
      fit: 'inside',
      withoutEnlargement: false, // Allow enlargement
      background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent background for images with alpha
    })

    // Maintain original format or optimize
    let outputBuffer: Buffer
    let outputFormat = 'jpeg' // Default fallback
    // Note: mimeType is used in the response headers below

    switch (file.type) {
      case 'image/png':
        outputBuffer = await sharpInstance.png({ 
          quality: 90,
          compressionLevel: 6 
        }).toBuffer()
        outputFormat = 'png'
        break
        
      case 'image/webp':
        outputBuffer = await sharpInstance.webp({ 
          quality: 90,
          effort: 4 
        }).toBuffer()
        outputFormat = 'webp'
        break
        
      case 'image/jpeg':
      case 'image/jpg':
      default:
        outputBuffer = await sharpInstance.jpeg({ 
          quality: 90,
          progressive: true 
        }).toBuffer()
        outputFormat = 'jpg'
        break
    }

    // Get processed image metadata
    const processedMetadata = await sharp(outputBuffer).metadata()
    console.log(`Resized dimensions: ${processedMetadata.width}x${processedMetadata.height}`)
    console.log(`Size reduction: ${buffer.length} → ${outputBuffer.length} bytes`)

    // Generate filename
    const originalName = file.name.replace(/\.[^.]+$/, '') // Remove extension
    const resizedFileName = `resized-${originalName}-${processedMetadata.width}x${processedMetadata.height}.${outputFormat}`

    // Return binary response with appropriate headers
    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${resizedFileName}"`,
        'Content-Length': outputBuffer.length.toString(),
        'X-Original-Width': metadata.width?.toString() || 'unknown',
        'X-Original-Height': metadata.height?.toString() || 'unknown',
        'X-Resized-Width': processedMetadata.width?.toString() || 'unknown',
        'X-Resized-Height': processedMetadata.height?.toString() || 'unknown',
        'X-Original-Size': buffer.length.toString(),
        'X-Resized-Size': outputBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Image resize error:', error)
    
    // Handle specific Sharp errors
    if (error instanceof Error) {
      if (error.message.includes('Input file contains unsupported image format')) {
        return NextResponse.json(
          { error: 'Unsupported or corrupted image format' },
          { status: 400 }
        )
      }
      
      if (error.message.includes('Input file is missing')) {
        return NextResponse.json(
          { error: 'Invalid or corrupted image file' },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Image processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
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
          file: 'Image file (JPEG, PNG, WebP)',
          width: 'Target width in pixels (optional)',
          height: 'Target height in pixels (optional)',
          maintainAspectRatio: 'true/false (default: true)'
        }
      }
    },
    { status: 405 }
  )
}