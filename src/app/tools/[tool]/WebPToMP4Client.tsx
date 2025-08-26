"use client"

import { useState } from "react"
import { Upload, Video, Download, PlayCircle } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UploadBox } from "@/components/UploadBox"
import { ProgressBar } from "@/components/ProgressBar"
import { Tool } from "@/lib/tools"

interface WebPToMP4ClientProps {
  tool: Tool
}

export function WebPToMP4Client({ tool }: WebPToMP4ClientProps) {
  const [uploadState, setUploadState] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [progress, setProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [processedFileInfo, setProcessedFileInfo] = useState<{
    name: string
    size: number
    originalSize: number
  } | null>(null)

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]) // Only single file supported
      setUploadState("idle")
      setErrorMessage("")
      setProcessedFileInfo(null)
    }
  }

  const handleConvert = async () => {
    if (!selectedFile) return
    
    setUploadState("processing")
    setProgress(0)
    setErrorMessage("")
    
    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 15
          return newProgress >= 90 ? 90 : newProgress
        })
      }, 500)
      
      // Create form data
      const formData = new FormData()
      formData.append('file', selectedFile)

      console.log(`Converting WebP to MP4: ${selectedFile.name}`)
      
      // Call WebP to MP4 API
      const response = await fetch('/api/video/webp-to-mp4', {
        method: 'POST',
        body: formData,
      })
      
      clearInterval(progressInterval)
      setProgress(100)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to convert ${selectedFile.name}`)
      }
      
      // Get the blob and trigger download
      const blob = await response.blob()
      const contentDisposition = response.headers.get('Content-Disposition')
      const fileName = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : selectedFile.name.replace(/\.webp$/i, '.mp4')
      
      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      // Get file info from headers
      const originalSize = response.headers.get('X-Original-Size')
      const convertedSize = response.headers.get('X-Converted-Size')
      
      setProcessedFileInfo({
        name: fileName,
        size: convertedSize ? parseInt(convertedSize) : blob.size,
        originalSize: originalSize ? parseInt(originalSize) : selectedFile.size
      })
      
      console.log(`✓ ${selectedFile.name} converted to ${fileName}`)
      console.log(`  Size: ${originalSize} → ${convertedSize} bytes`)
      
      setUploadState("success")
      
    } catch (error) {
      console.error('WebP to MP4 conversion error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred during conversion')
      setUploadState("error")
      setProgress(0)
    }
  }

  const handleReset = () => {
    setUploadState("idle")
    setProgress(0)
    setSelectedFile(null)
    setErrorMessage("")
    setProcessedFileInfo(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const canProcess = selectedFile !== null && uploadState === "idle"

  return (
    <>
      {/* Upload Interface */}
      {(uploadState === "idle" || uploadState === "error") && (
        <div className="space-y-6">
          <UploadBox
            tool={tool}
            onSubmit={handleFileSelected}
            disabled={false}
          />
          
          {/* Convert Button */}
          {selectedFile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Video className="h-5 w-5" />
                  <span>Convert to MP4</span>
                </CardTitle>
                <CardDescription>
                  Convert your WebP image to MP4 video format
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg border bg-muted/50">
                  <div className="flex items-center space-x-3">
                    <PlayCircle className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(selectedFile.size)} • WebP Image
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <p><strong>Output:</strong> MP4 video with H.264 encoding</p>
                    <p><strong>Optimization:</strong> Web-optimized with faststart flag</p>
                    <p><strong>Compatibility:</strong> Works in all modern browsers</p>
                  </div>
                  
                  <Button
                    onClick={handleConvert}
                    disabled={!canProcess}
                    size="lg"
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Convert & Download MP4
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Processing State */}
      {uploadState === "processing" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Converting to MP4</span>
            </CardTitle>
            <CardDescription>
              Processing {selectedFile?.name} with FFmpeg...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressBar
              progress={progress}
              status={uploadState}
              message="Converting WebP to MP4 video format"
            />
            <div className="mt-3 text-sm text-muted-foreground">
              <p>• Optimizing for web playback</p>
              <p>• Applying H.264 encoding</p>
              <p>• Adding faststart flags</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success State */}
      {uploadState === "success" && processedFileInfo && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-700 dark:text-green-400">
              <Video className="h-6 w-6" />
              <span>Conversion Complete!</span>
            </CardTitle>
            <CardDescription className="text-green-600 dark:text-green-300">
              Your WebP has been successfully converted to MP4 and downloaded
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg border bg-background/50">
              <div className="flex items-center space-x-3">
                <PlayCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">{processedFileInfo.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(processedFileInfo.size)} MP4 Video
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <p>✓ Format: WebP → MP4</p>
              <p>✓ Encoding: H.264 with YUV420P</p>
              <p>✓ Optimization: Web-ready with faststart</p>
              <p>✓ Size: {formatFileSize(processedFileInfo.originalSize)} → {formatFileSize(processedFileInfo.size)}</p>
            </div>
            
            <div className="flex justify-center pt-4 border-t">
              <Button variant="outline" onClick={handleReset}>
                Convert Another WebP
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {uploadState === "error" && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-700 dark:text-red-400">
              <Upload className="h-5 w-5" />
              <span>Conversion Failed</span>
            </CardTitle>
            <CardDescription className="text-red-600 dark:text-red-300">
              {errorMessage}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-red-700 dark:text-red-300">
              <p><strong>Possible causes:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Invalid or corrupted WebP file</li>
                <li>Server processing error</li>
                <li>Network connection issues</li>
              </ul>
            </div>
            
            <Button onClick={handleReset} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  )
}