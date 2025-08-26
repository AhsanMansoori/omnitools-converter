import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'
import { enqueueJob } from '@/lib/queue'

interface MergeResponse {
  success: boolean
  data?: {
    downloadUrl?: string
    jobId?: string
  }
  error?: string
}

// Size threshold for direct processing vs job queue (25MB)
const SIZE_THRESHOLD = 25 * 1024 * 1024

export async function POST(request: NextRequest): Promise<NextResponse<MergeResponse>> {
  try {
    // Parse multipart form data
    const formData = await request.formData()
    
    // Get uploaded files
    const files: File[] = []
    const formFiles = formData.getAll('files')
    
    for (const formFile of formFiles) {
      if (formFile instanceof File) {
        files.push(formFile)
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No files provided' 
        },
        { status: 400 }
      )
    }

    if (files.length === 1) {
      return NextResponse.json(
        { 
          success: false,
          error: 'At least 2 PDF files are required for merging' 
        },
        { status: 400 }
      )
    }

    // Validate all files are PDFs
    for (const file of files) {
      if (file.type !== 'application/pdf') {
        return NextResponse.json(
          { 
            success: false,
            error: `File "${file.name}" is not a PDF. Only PDF files can be merged.` 
          },
          { status: 400 }
        )
      }
    }

    // Calculate total file size
    const totalSize = files.reduce((sum, file) => sum + file.size, 0)
    
    console.log(`PDF merge request: ${files.length} files, total size: ${totalSize} bytes`)
    console.log(`Files: ${files.map(f => f.name).join(', ')}`)

    // If total size exceeds threshold, use job queue
    if (totalSize > SIZE_THRESHOLD) {
      console.log(`Large files detected (${totalSize} > ${SIZE_THRESHOLD}), using job queue`)
      
      // Prepare files for job queue
      const jobFiles = files.map((file, index) => ({
        name: file.name,
        path: `/tmp/upload_${Date.now()}_${index}_${file.name}`,
        size: file.size,
        mimeType: file.type
      }))

      // Enqueue job for processing
      const jobResult = await enqueueJob('pdf-merge', {
        files: jobFiles,
        settings: {
          mergeOrder: files.map((file, index) => ({ index, name: file.name })),
          totalFiles: files.length,
          totalSize
        },
        requestId: `merge-${Date.now()}`
      })

      console.log(`PDF merge job enqueued: ${jobResult.jobId}`)

      return NextResponse.json({
        success: true,
        data: {
          jobId: jobResult.jobId
        }
      })
    }

    // Process directly for smaller files
    console.log('Processing PDFs directly with pdf-lib')
    
    const mergedPdf = await PDFDocument.create()
    
    // Process each file in order
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      console.log(`Processing file ${i + 1}/${files.length}: ${file.name}`)
      
      try {
        // Convert file to array buffer
        const pdfBytes = new Uint8Array(await file.arrayBuffer())
        
        // Load the PDF document
        const pdfDoc = await PDFDocument.load(pdfBytes)
        
        // Get all pages from the document
        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices())
        
        // Add pages to merged document
        pages.forEach(page => mergedPdf.addPage(page))
        
        console.log(`✓ Added ${pages.length} pages from ${file.name}`)
        
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error)
        return NextResponse.json(
          { 
            success: false,
            error: `Failed to process "${file.name}": ${error instanceof Error ? error.message : 'Invalid PDF format'}` 
          },
          { status: 400 }
        )
      }
    }

    // Generate the merged PDF
    const mergedPdfBytes = await mergedPdf.save()
    
    // Generate output filename
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const mergedFileName = `merged-${files.length}-files-${timestamp}.pdf`
    
    console.log(`PDF merge complete: ${mergedFileName} (${mergedPdfBytes.length} bytes)`)

    // Return binary response with appropriate headers
    return new NextResponse(mergedPdfBytes as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${mergedFileName}"`,
        'Content-Length': mergedPdfBytes.length.toString(),
        'X-Merged-Files': files.length.toString(),
        'X-Original-Names': files.map(f => f.name).join(','),
        'X-Total-Original-Size': totalSize.toString(),
        'X-Merged-Size': mergedPdfBytes.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('PDF merge error:', error)
    
    // Handle specific pdf-lib errors
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'One or more files are corrupted or invalid PDF documents' 
          },
          { status: 400 }
        )
      }
      
      if (error.message.includes('Failed to parse')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Unable to parse PDF files. Please ensure all files are valid PDF documents.' 
          },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'PDF merge failed',
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
      success: false,
      error: 'Method not allowed. Use POST with multipart/form-data.',
      usage: {
        method: 'POST',
        contentType: 'multipart/form-data',
        fields: {
          files: 'Array of PDF files to merge (minimum 2 files)'
        },
        limits: {
          maxTotalSize: '25MB for direct processing',
          jobQueue: 'Larger files will be processed via job queue'
        }
      }
    },
    { status: 405 }
  )
}