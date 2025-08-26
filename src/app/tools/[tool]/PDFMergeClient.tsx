"use client"

import { useState } from "react"
import { Upload, FilePlus, Download, Clock, CheckCircle2, AlertCircle } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UploadBox } from "@/components/UploadBox"
import { ProgressBar } from "@/components/ProgressBar"
import { Tool } from "@/lib/tools"

interface PDFMergeClientProps {
  tool: Tool
}

interface JobStatus {
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'unknown'
  progress: number
  resultUrl?: string
  error?: string
  metadata?: Record<string, unknown>
}

export function PDFMergeClient({ tool }: PDFMergeClientProps) {
  const [uploadState, setUploadState] = useState<"idle" | "processing" | "polling" | "success" | "error">("idle")
  const [progress, setProgress] = useState(0)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [jobId, setJobId] = useState<string | null>(null)
  const [processedFileInfo, setProcessedFileInfo] = useState<{
    name: string
    size: number
    originalCount: number
    originalSize: number
  } | null>(null)

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files)
    setUploadState("idle")
    setErrorMessage("")
    setProcessedFileInfo(null)
    setJobId(null)
  }

  const handleMerge = async () => {
    if (selectedFiles.length < 2) {
      setErrorMessage("Please select at least 2 PDF files to merge")
      return
    }
    
    setUploadState("processing")
    setProgress(0)
    setErrorMessage("")
    
    try {
      // Create form data with all files
      const formData = new FormData()
      selectedFiles.forEach(file => {
        formData.append('files', file)
      })

      console.log(`Merging ${selectedFiles.length} PDF files`)
      
      // Call PDF merge API
      const response = await fetch('/api/pdf/merge', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to merge PDFs')
      }

      const responseData = await response.json()
      
      // Check if we got a job ID (large files) or direct response
      if (responseData.data?.jobId) {
        console.log(`Large files detected, job queued: ${responseData.data.jobId}`)
        setJobId(responseData.data.jobId)
        setUploadState("polling")
        setProgress(0)
        startJobPolling(responseData.data.jobId)
      } else {
        // Direct response - download the merged PDF
        const blob = await response.blob()
        const contentDisposition = response.headers.get('Content-Disposition')
        const fileName = contentDisposition
          ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
          : 'merged.pdf'
        
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
        const mergedFiles = response.headers.get('X-Merged-Files')
        const originalSize = response.headers.get('X-Total-Original-Size')
        const mergedSize = response.headers.get('X-Merged-Size')
        
        setProcessedFileInfo({
          name: fileName,
          size: mergedSize ? parseInt(mergedSize) : blob.size,
          originalCount: mergedFiles ? parseInt(mergedFiles) : selectedFiles.length,
          originalSize: originalSize ? parseInt(originalSize) : selectedFiles.reduce((sum, f) => sum + f.size, 0)
        })
        
        console.log(`✓ PDF merge complete: ${fileName}`)
        setProgress(100)
        setUploadState("success")
      }
      
    } catch (error) {
      console.error('PDF merge error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred during PDF merge')
      setUploadState("error")
      setProgress(0)
    }
  }

  const startJobPolling = (jobId: string) => {
    const pollJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`)
        if (response.ok) {
          const jobStatus: JobStatus = await response.json()
          
          setProgress(jobStatus.progress)
          
          if (jobStatus.status === 'completed' && jobStatus.resultUrl) {
            console.log(`✓ Job ${jobId} completed, downloading result`)
            
            // Download the result
            const downloadResponse = await fetch(jobStatus.resultUrl)
            if (downloadResponse.ok) {
              const blob = await downloadResponse.blob()
              const fileName = `merged-${selectedFiles.length}-files.pdf`
              
              const url = URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.href = url
              link.download = fileName
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              URL.revokeObjectURL(url)
              
              setProcessedFileInfo({
                name: fileName,
                size: blob.size,
                originalCount: selectedFiles.length,
                originalSize: selectedFiles.reduce((sum, f) => sum + f.size, 0)
              })
              
              setUploadState("success")
            } else {
              throw new Error('Failed to download merged PDF')
            }
          } else if (jobStatus.status === 'failed') {
            throw new Error(jobStatus.error || 'Job processing failed')
          } else if (jobStatus.status === 'waiting' || jobStatus.status === 'active') {
            // Continue polling
            setTimeout(pollJob, 1000)
          }
        } else {
          throw new Error('Failed to check job status')
        }
      } catch (error) {
        console.error('Job polling error:', error)
        setErrorMessage(error instanceof Error ? error.message : 'Failed to process PDFs')
        setUploadState("error")
      }
    }

    // Start polling
    pollJob()
  }

  const handleReset = () => {
    setUploadState("idle")
    setProgress(0)
    setSelectedFiles([])
    setErrorMessage("")
    setProcessedFileInfo(null)
    setJobId(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0)
  const sizeThreshold = 25 * 1024 * 1024 // 25MB
  const willUseJobQueue = totalSize > sizeThreshold

  const canProcess = selectedFiles.length >= 2 && uploadState === "idle"

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
          
          {/* File List and Merge Button */}
          {selectedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FilePlus className="h-5 w-5" />
                  <span>PDF Merge Settings</span>
                </CardTitle>
                <CardDescription>
                  Files will be merged in the order they appear below
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File List */}
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border bg-muted/50">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)} • PDF
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Processing Info */}
                <div className="p-3 rounded-lg border bg-blue-50 dark:bg-blue-950/20">
                  <div className="flex items-start space-x-2">
                    {willUseJobQueue ? (
                      <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5" />
                    )}
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        {willUseJobQueue ? 'Queue Processing' : 'Direct Processing'}
                      </p>
                      <p className="text-blue-700 dark:text-blue-200">
                        {willUseJobQueue 
                          ? `Large files detected (${formatFileSize(totalSize)}). Processing will be queued and you'll be notified when complete.`
                          : `Files will be merged instantly and downloaded immediately.`
                        }
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {selectedFiles.length < 2 && (
                    <p className="text-sm text-red-600">
                      Please select at least 2 PDF files to merge
                    </p>
                  )}
                  
                  <Button
                    onClick={handleMerge}
                    disabled={!canProcess}
                    size="lg"
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Merge {selectedFiles.length} PDFs
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
              <span>Merging PDFs</span>
            </CardTitle>
            <CardDescription>
              Processing {selectedFiles.length} PDF files with pdf-lib...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressBar
              progress={progress}
              status={uploadState}
              message="Merging PDF documents"
            />
            <div className="mt-3 text-sm text-muted-foreground">
              <p>• Combining all pages in order</p>
              <p>• Preserving document structure</p>
              <p>• Preparing download...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job Polling State */}
      {uploadState === "polling" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Processing Large Files</span>
            </CardTitle>
            <CardDescription>
              Your PDFs are being processed in the background...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressBar
              progress={progress}
              status="processing"
              message={`Job ID: ${jobId}`}
            />
            <div className="mt-3 text-sm text-muted-foreground">
              <p>• Large files detected - using background processing</p>
              <p>• You&apos;ll be notified when complete</p>
              <p>• Download will start automatically</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success State */}
      {uploadState === "success" && processedFileInfo && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-700 dark:text-green-400">
              <FilePlus className="h-6 w-6" />
              <span>PDFs Merged Successfully!</span>
            </CardTitle>
            <CardDescription className="text-green-600 dark:text-green-300">
              {processedFileInfo.originalCount} PDF files have been merged and downloaded
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg border bg-background/50">
              <div className="flex items-center space-x-3">
                <FilePlus className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">{processedFileInfo.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(processedFileInfo.size)} • Merged PDF
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <p>✓ Files merged: {processedFileInfo.originalCount} PDFs</p>
              <p>✓ Processing: {willUseJobQueue ? 'Background queue' : 'Direct merge'}</p>
              <p>✓ Size: {formatFileSize(processedFileInfo.originalSize)} → {formatFileSize(processedFileInfo.size)}</p>
              <p>✓ Pages: Combined from all source documents</p>
            </div>
            
            <div className="flex justify-center pt-4 border-t">
              <Button variant="outline" onClick={handleReset}>
                Merge More PDFs
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
              <AlertCircle className="h-5 w-5" />
              <span>Merge Failed</span>
            </CardTitle>
            <CardDescription className="text-red-600 dark:text-red-300">
              {errorMessage}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-red-700 dark:text-red-300">
              <p><strong>Possible causes:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Invalid or corrupted PDF files</li>
                <li>Password-protected PDFs</li>
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