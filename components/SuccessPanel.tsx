"use client"

import React from "react"
import { Download, CheckCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface ProcessedFile {
  name: string
  url: string
  size?: number
}

export interface SuccessPanelProps {
  files: ProcessedFile[]
  onDownload: (url: string, fileName: string) => void
  onDownloadAll?: () => void
  onReset: () => void
  processingTime?: number
  className?: string
}

export function SuccessPanel({
  files,
  onDownload,
  onDownloadAll,
  onReset,
  processingTime,
  className
}: SuccessPanelProps) {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ""
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const totalFiles = files.length
  const hasMultipleFiles = totalFiles > 1

  return (
    <Card className={cn("border-green-200 bg-green-50 dark:bg-green-950/20", className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-green-700 dark:text-green-400">
          <CheckCircle className="h-6 w-6" />
          <span>Processing Complete!</span>
        </CardTitle>
        {processingTime && (
          <p className="text-sm text-green-600 dark:text-green-300">
            Completed in {processingTime.toFixed(1)} seconds
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Download All Button (if multiple files) */}
        {hasMultipleFiles && onDownloadAll && (
          <div className="flex justify-center">
            <Button onClick={onDownloadAll} size="lg" className="min-w-[200px]">
              <Download className="mr-2 h-4 w-4" />
              Download All ({totalFiles} files)
            </Button>
          </div>
        )}

        {/* Individual File Downloads */}
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border bg-background/50"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{file.name}</p>
                {file.size && (
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(file.url, file.name)}
                className="ml-3"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Reset Button */}
        <div className="flex justify-center pt-4 border-t">
          <Button variant="outline" onClick={onReset} className="min-w-[150px]">
            <RefreshCw className="mr-2 h-4 w-4" />
            Process More Files
          </Button>
        </div>

        {/* Auto-deletion Notice */}
        <div className="text-center pt-2">
          <p className="text-xs text-muted-foreground">
            Files will be automatically deleted after 24 hours for your privacy
          </p>
        </div>
      </CardContent>
    </Card>
  )
}