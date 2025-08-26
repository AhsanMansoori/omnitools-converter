import { BaseProcessor, ProcessorContext, JobData, ProcessorResult } from './base'

// PDF Merge Processor
class PdfMergeProcessor extends BaseProcessor {
  async process(data: JobData, context: ProcessorContext): Promise<ProcessorResult> {
    context.log('PDF merge processing (mock)')
    await this.simulateProcessing(context, 8, 200)
    return {
      success: true,
      outputFiles: [{
        name: 'merged.pdf',
        path: '/temp/merged.pdf',
        size: data.files.reduce((sum, f) => sum + f.size, 0),
        mimeType: 'application/pdf',
        url: '/api/download/merged.pdf'
      }]
    }
  }
}

// PDF Split Processor
class PdfSplitProcessor extends BaseProcessor {
  async process(data: JobData, context: ProcessorContext): Promise<ProcessorResult> {
    context.log('PDF split processing (mock)')
    await this.simulateProcessing(context, 10, 150)
    return {
      success: true,
      outputFiles: [
        {
          name: 'page_1.pdf',
          path: '/temp/page_1.pdf',
          size: Math.floor(data.files[0].size / 3),
          mimeType: 'application/pdf',
          url: '/api/download/page_1.pdf'
        },
        {
          name: 'page_2.pdf',
          path: '/temp/page_2.pdf',
          size: Math.floor(data.files[0].size / 3),
          mimeType: 'application/pdf',
          url: '/api/download/page_2.pdf'
        }
      ]
    }
  }
}

// PDF Compress Processor
class PdfCompressProcessor extends BaseProcessor {
  async process(data: JobData, context: ProcessorContext): Promise<ProcessorResult> {
    context.log('PDF compress processing (mock)')
    await this.simulateProcessing(context, 12, 180)
    const inputFile = data.files[0]
    return {
      success: true,
      outputFiles: [{
        name: inputFile.name.replace('.pdf', '_compressed.pdf'),
        path: this.generateOutputPath(inputFile.path, '_compressed'),
        size: Math.floor(inputFile.size * 0.6), // 40% compression
        mimeType: 'application/pdf',
        url: `/api/download/${inputFile.name.replace('.pdf', '_compressed.pdf')}`
      }]
    }
  }
}

// PDF Watermark Add Processor
class PdfWatermarkAddProcessor extends BaseProcessor {
  async process(data: JobData, context: ProcessorContext): Promise<ProcessorResult> {
    context.log('PDF watermark add processing (mock)')
    await this.simulateProcessing(context, 9, 160)
    const inputFile = data.files[0]
    return {
      success: true,
      outputFiles: [{
        name: inputFile.name.replace('.pdf', '_watermarked.pdf'),
        path: this.generateOutputPath(inputFile.path, '_watermarked'),
        size: Math.floor(inputFile.size * 1.1), // Slight size increase
        mimeType: 'application/pdf',
        url: `/api/download/${inputFile.name.replace('.pdf', '_watermarked.pdf')}`
      }]
    }
  }
}

// Image Background Remove Processor
class ImageBgRemoveProcessor extends BaseProcessor {
  async process(data: JobData, context: ProcessorContext): Promise<ProcessorResult> {
    context.log('Image background remove processing (mock)')
    await this.simulateProcessing(context, 15, 300) // Longer processing for AI
    const inputFile = data.files[0]
    return {
      success: true,
      outputFiles: [{
        name: inputFile.name.replace(/\.[^.]+$/, '_no_bg.png'),
        path: this.generateOutputPath(inputFile.path, '_no_bg', 'png'),
        size: Math.floor(inputFile.size * 0.8),
        mimeType: 'image/png',
        url: `/api/download/${inputFile.name.replace(/\.[^.]+$/, '_no_bg.png')}`
      }]
    }
  }
}

// Image Convert Processor
class ImageConvertProcessor extends BaseProcessor {
  async process(data: JobData, context: ProcessorContext): Promise<ProcessorResult> {
    context.log('Image convert processing (mock)')
    await this.simulateProcessing(context, 6, 100)
    const inputFile = data.files[0]
    const targetFormat = data.settings?.format || 'png'
    return {
      success: true,
      outputFiles: [{
        name: inputFile.name.replace(/\.[^.]+$/, `.${targetFormat}`),
        path: this.generateOutputPath(inputFile.path, '_converted', targetFormat),
        size: Math.floor(inputFile.size * 0.9),
        mimeType: `image/${targetFormat}`,
        url: `/api/download/${inputFile.name.replace(/\.[^.]+$/, `.${targetFormat}`)}`
      }]
    }
  }
}

// WebP to MP4 Processor
class WebpToMp4Processor extends BaseProcessor {
  async process(data: JobData, context: ProcessorContext): Promise<ProcessorResult> {
    context.log('WebP to MP4 processing (mock)')
    await this.simulateProcessing(context, 20, 400) // Longer for video conversion
    const inputFile = data.files[0]
    return {
      success: true,
      outputFiles: [{
        name: inputFile.name.replace('.webp', '.mp4'),
        path: this.generateOutputPath(inputFile.path, '_converted', 'mp4'),
        size: Math.floor(inputFile.size * 1.5), // Video files typically larger
        mimeType: 'video/mp4',
        url: `/api/download/${inputFile.name.replace('.webp', '.mp4')}`
      }]
    }
  }
}

// OCR PDF Processor
class OcrPdfProcessor extends BaseProcessor {
  async process(data: JobData, context: ProcessorContext): Promise<ProcessorResult> {
    context.log('OCR PDF processing (mock)')
    await this.simulateProcessing(context, 18, 350) // Longer for OCR processing
    const inputFile = data.files[0]
    return {
      success: true,
      outputFiles: [{
        name: inputFile.name.replace('.pdf', '_ocr.pdf'),
        path: this.generateOutputPath(inputFile.path, '_ocr'),
        size: Math.floor(inputFile.size * 1.2), // OCR may increase size
        mimeType: 'application/pdf',
        url: `/api/download/${inputFile.name.replace('.pdf', '_ocr.pdf')}`
      }]
    }
  }
}

// Export all processors
const processors = {
  pdfMerge: new PdfMergeProcessor(),
  pdfSplit: new PdfSplitProcessor(),
  pdfCompress: new PdfCompressProcessor(),
  pdfWatermarkAdd: new PdfWatermarkAddProcessor(),
  imageBgRemove: new ImageBgRemoveProcessor(),
  imageConvert: new ImageConvertProcessor(),
  webpToMp4: new WebpToMp4Processor(),
  ocrPdf: new OcrPdfProcessor(),
}

export const processPdfMerge = processors.pdfMerge.process.bind(processors.pdfMerge)
export const processPdfSplit = processors.pdfSplit.process.bind(processors.pdfSplit)
export const processPdfCompress = processors.pdfCompress.process.bind(processors.pdfCompress)
export const processPdfWatermarkAdd = processors.pdfWatermarkAdd.process.bind(processors.pdfWatermarkAdd)
export const processImageBgRemove = processors.imageBgRemove.process.bind(processors.imageBgRemove)
export const processImageConvert = processors.imageConvert.process.bind(processors.imageConvert)
export const processWebpToMp4 = processors.webpToMp4.process.bind(processors.webpToMp4)
export const processOcrPdf = processors.ocrPdf.process.bind(processors.ocrPdf)

// Re-export from individual files
export { processPdfToWord } from './pdf-to-word'
export { processImageResize } from './image-resize'