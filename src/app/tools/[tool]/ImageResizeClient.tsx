"use client"

import { useState } from "react"
import { Upload, Settings, Download } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { UploadBox } from "@/components/UploadBox"
import { ProgressBar } from "@/components/ProgressBar"
import { Tool } from "@/lib/tools"

interface ImageResizeClientProps {
  tool: Tool
}

interface ResizeSettings {
  width: number | undefined
  height: number | undefined
  maintainAspectRatio: boolean
}

export function ImageResizeClient({ tool }: ImageResizeClientProps) {
  const [uploadState, setUploadState] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [progress, setProgress] = useState(0)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [processedCount, setProcessedCount] = useState(0)
  
  // Resize settings
  const [settings, setSettings] = useState<ResizeSettings>({
    width: 1920,
    height: 1080,
    maintainAspectRatio: true
  })

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files)
    setUploadState("idle")
    setErrorMessage("")
  }

  const handleResize = async () => {
    if (selectedFiles.length === 0) return
    
    setUploadState("processing")
    setProgress(0)
    setProcessedCount(0)
    setErrorMessage("")
    
    const totalFiles = selectedFiles.length
    
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const fileProgress = (i / totalFiles) * 100
        
        setProgress(fileProgress)
        
        // Create form data
        const formData = new FormData()
        formData.append('file', file)
        
        if (settings.width) {
          formData.append('width', settings.width.toString())
        }
        if (settings.height) {
          formData.append('height', settings.height.toString())
        }
        formData.append('maintainAspectRatio', settings.maintainAspectRatio.toString())

        console.log(`Processing file ${i + 1}/${totalFiles}: ${file.name}`)
        
        // Call image resize API
        const response = await fetch('/api/image/resize', {
          method: 'POST',
          body: formData,
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Failed to resize ${file.name}`)
        }
        
        // Get the blob and trigger download
        const blob = await response.blob()
        const contentDisposition = response.headers.get('Content-Disposition')
        const fileName = contentDisposition
          ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
          : `resized-${file.name}`
          
        // Create download link
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        setProcessedCount(i + 1)
        
        // Log resize info from headers
        const originalWidth = response.headers.get('X-Original-Width')
        const originalHeight = response.headers.get('X-Original-Height')
        const resizedWidth = response.headers.get('X-Resized-Width')
        const resizedHeight = response.headers.get('X-Resized-Height')
        const originalSize = response.headers.get('X-Original-Size')
        const resizedSize = response.headers.get('X-Resized-Size')
        
        console.log(`✓ ${file.name} resized: ${originalWidth}x${originalHeight} → ${resizedWidth}x${resizedHeight}`)
        console.log(`  Size: ${originalSize} → ${resizedSize} bytes`)
      }
      
      setProgress(100)
      setUploadState("success")
      
    } catch (error) {
      console.error('Resize error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred during processing')
      setUploadState("error")
    }
  }

  const handleReset = () => {
    setUploadState("idle")
    setProgress(0)
    setSelectedFiles([])
    setErrorMessage("")
    setProcessedCount(0)
  }

  const isValidSettings = (settings.width && settings.width > 0) || (settings.height && settings.height > 0)
  const canProcess = selectedFiles.length > 0 && isValidSettings && uploadState === "idle"

  return (
    <>
      {/* Upload Interface */}
      {(uploadState === "idle" || uploadState === "error") && (
        <div className="space-y-6">
          <UploadBox
            tool={tool}
            onSubmit={handleFilesSelected}
            disabled={false}
          />
          
          {/* Resize Settings */}
          {selectedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Resize Settings</span>
                </CardTitle>
                <CardDescription>
                  Configure the target dimensions for your images
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="width">Width (pixels)</Label>
                    <Input
                      id="width"
                      type="number"
                      min="1"
                      max="10000"
                      value={settings.width || ""}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        width: e.target.value ? parseInt(e.target.value) : undefined
                      }))}
                      placeholder="e.g. 1920"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (pixels)</Label>
                    <Input
                      id="height"
                      type="number"
                      min="1"
                      max="10000"
                      value={settings.height || ""}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        height: e.target.value ? parseInt(e.target.value) : undefined
                      }))}
                      placeholder="e.g. 1080"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="maintainAspectRatio"
                    checked={settings.maintainAspectRatio}
                    onCheckedChange={(checked: boolean) => setSettings(prev => ({
                      ...prev,
                      maintainAspectRatio: checked === true
                    }))}
                  />
                  <Label htmlFor="maintainAspectRatio" className="text-sm">
                    Maintain aspect ratio (fit inside dimensions)
                  </Label>
                </div>
                
                <div className="pt-4">
                  <Button
                    onClick={handleResize}
                    disabled={!canProcess}
                    size="lg"
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Resize & Download {selectedFiles.length > 1 ? `${selectedFiles.length} Images` : 'Image'}
                  </Button>
                  
                  {!isValidSettings && (
                    <p className="text-sm text-red-600 mt-2">
                      Please specify at least width or height
                    </p>
                  )}
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
              <span>Resizing Images</span>
            </CardTitle>
            <CardDescription>
              Processing {selectedFiles.length} image{selectedFiles.length > 1 ? 's' : ''} with Sharp...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressBar
              progress={progress}
              status={uploadState}
              message={`Processed ${processedCount} of ${selectedFiles.length} images`}
            />
          </CardContent>
        </Card>
      )}

      {/* Success State */}
      {uploadState === "success" && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-700 dark:text-green-400">
              <Download className="h-6 w-6" />
              <span>Images Resized Successfully!</span>
            </CardTitle>
            <CardDescription className="text-green-600 dark:text-green-300">
              {processedCount} image{processedCount > 1 ? 's have' : ' has'} been resized and downloaded automatically
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-green-700 dark:text-green-300">
              <p>✓ Target dimensions: {settings.width}×{settings.height} pixels</p>
              <p>✓ Aspect ratio: {settings.maintainAspectRatio ? 'Maintained' : 'Stretched to fit'}</p>
              <p>✓ Format: Original format preserved</p>
            </div>
            
            <div className="flex justify-center pt-4 border-t">
              <Button variant="outline" onClick={handleReset}>
                Resize More Images
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
              <span>Resize Failed</span>
            </CardTitle>
            <CardDescription className="text-red-600 dark:text-red-300">
              {errorMessage}
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