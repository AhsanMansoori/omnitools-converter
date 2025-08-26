"use client"

import { useState } from "react"
import { Upload } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UploadBox } from "@/components/UploadBox"
import { ProgressBar } from "@/components/ProgressBar"
import { SuccessPanel, ProcessedFile } from "@/components/SuccessPanel"
import { Tool } from "@/lib/tools"

interface ToolPageClientProps {
  tool: Tool
}

export function ToolPageClient({ tool }: ToolPageClientProps) {
  // Upload state management
  const [uploadState, setUploadState] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [progress, setProgress] = useState(0)
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([])
  const [processingTime, setProcessingTime] = useState<number>(0)

  // Mocked submit handler
  const handleSubmit = async (files: File[]) => {
    setUploadState("processing")
    setProgress(0)
    
    const startTime = Date.now()
    
    // Simulate processing with progress updates
    const totalSteps = 10
    for (let step = 0; step <= totalSteps; step++) {
      setProgress((step / totalSteps) * 100)
      await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300))
    }
    
    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000
    setProcessingTime(duration)
    
    // Mock processed files
    const mockProcessedFiles: ProcessedFile[] = files.map((file) => ({
      name: getProcessedFileName(file.name, tool.id),
      url: URL.createObjectURL(file), // In real app, this would be the processed file URL
      size: Math.floor(file.size * 0.8) // Simulate compression
    }))
    
    setProcessedFiles(mockProcessedFiles)
    setUploadState("success")
  }
  
  const getProcessedFileName = (originalName: string, toolId: string): string => {
    const nameWithoutExt = originalName.split('.').slice(0, -1).join('.')
    const ext = originalName.split('.').pop()
    
    switch (toolId) {
      case "pdf-to-word":
        return `${nameWithoutExt}.docx`
      case "pdf-compress":
        return `${nameWithoutExt}_compressed.pdf`
      case "image-resize":
        return `${nameWithoutExt}_resized.${ext}`
      case "image-convert":
        return `${nameWithoutExt}.png` // Default conversion to PNG
      case "image-bg-remove":
        return `${nameWithoutExt}_no_bg.png`
      case "webp-to-mp4":
        return `${nameWithoutExt}.mp4`
      case "ocr-pdf":
        return `${nameWithoutExt}_ocr.pdf`
      default:
        return `${nameWithoutExt}_processed.${ext}`
    }
  }
  
  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  const handleDownloadAll = () => {
    processedFiles.forEach(file => {
      handleDownload(file.url, file.name)
    })
  }
  
  const handleReset = () => {
    setUploadState("idle")
    setProgress(0)
    setProcessedFiles([])
    setProcessingTime(0)
  }

  return (
    <>
      {/* Upload Interface */}
      {uploadState === "idle" && (
        <UploadBox
          tool={tool}
          onSubmit={handleSubmit}
          disabled={false}
        />
      )}

      {/* Progress Bar */}
      {uploadState === "processing" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Processing {tool.multiple ? 'Files' : 'File'}</span>
            </CardTitle>
            <CardDescription>
              Please wait while we process your {tool.multiple ? 'files' : 'file'}...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressBar
              progress={progress}
              status={uploadState}
              message={`Processing with ${tool.name}...`}
            />
          </CardContent>
        </Card>
      )}

      {/* Success Panel */}
      {uploadState === "success" && (
        <SuccessPanel
          files={processedFiles}
          onDownload={handleDownload}
          onDownloadAll={processedFiles.length > 1 ? handleDownloadAll : undefined}
          onReset={handleReset}
          processingTime={processingTime}
        />
      )}

      {/* Error State */}
      {uploadState === "error" && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-700 dark:text-red-400">
              <Upload className="h-5 w-5" />
              <span>Processing Failed</span>
            </CardTitle>
            <CardDescription className="text-red-600 dark:text-red-300">
              There was an error processing your {tool.multiple ? 'files' : 'file'}. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleReset} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  )
}