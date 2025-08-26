"use client"

import React, { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, X, File, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Tool, getAcceptedExtensions, getFileTypeNames } from "@/lib/tools"

export interface UploadedFile extends File {
  id: string
  preview?: string
}

export interface UploadBoxProps {
  tool: Tool
  onSubmit: (files: File[]) => void
  disabled?: boolean
  className?: string
}

export function UploadBox({ tool, onSubmit, disabled = false, className }: UploadBoxProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [errors, setErrors] = useState<string[]>([])

  // Convert MIME types to file extensions for dropzone
  const acceptedExtensions = getAcceptedExtensions(tool)
  const acceptedTypes = tool.accepts.reduce((acc, mimeType) => {
    acc[mimeType] = acceptedExtensions
      .filter(ext => {
        // Map extensions back to MIME types
        if (mimeType === "application/pdf") return ext === "pdf"
        if (mimeType === "image/jpeg") return ["jpg", "jpeg"].includes(ext)
        if (mimeType === "image/png") return ext === "png"
        if (mimeType === "image/webp") return ext === "webp"
        if (mimeType === "image/gif") return ext === "gif"
        if (mimeType === "image/bmp") return ext === "bmp"
        if (mimeType === "image/tiff") return ["tiff", "tif"].includes(ext)
        return false
      })
      .map(ext => `.${ext}`)
    return acc
  }, {} as Record<string, string[]>)

  const validateFile = (file: File): string | null => {
    // Check file size
    if (tool.maxSizeMB && file.size > tool.maxSizeMB * 1024 * 1024) {
      return `File "${file.name}" exceeds maximum size of ${tool.maxSizeMB}MB`
    }

    // Check MIME type
    if (!tool.accepts.includes(file.type)) {
      const fileTypes = getFileTypeNames(tool)
      return `File "${file.name}" is not a supported format. Accepted: ${fileTypes.join(", ")}`
    }

    return null
  }

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: Array<{ file: File; errors: Array<{ code: string; message: string }> }>) => {
    const newErrors: string[] = []
    
    // Handle rejected files
    rejectedFiles.forEach(({ file, errors: dropErrors }) => {
      dropErrors.forEach((error: { code: string; message: string }) => {
        if (error.code === "file-too-large") {
          newErrors.push(`File "${file.name}" is too large`)
        } else if (error.code === "file-invalid-type") {
          newErrors.push(`File "${file.name}" is not a supported format`)
        } else {
          newErrors.push(`File "${file.name}": ${error.message}`)
        }
      })
    })

    // Validate accepted files
    const validFiles: UploadedFile[] = []
    acceptedFiles.forEach(file => {
      const error = validateFile(file)
      if (error) {
        newErrors.push(error)
      } else {
        const uploadedFile: UploadedFile = Object.assign(file, {
          id: Math.random().toString(36).substr(2, 9)
        })
        validFiles.push(uploadedFile)
      }
    })

    setErrors(newErrors)

    // Handle multiple vs single file upload
    if (tool.multiple) {
      setFiles(prev => [...prev, ...validFiles])
    } else {
      if (validFiles.length > 0) {
        setFiles([validFiles[0]]) // Only keep the first file for single file tools
      }
    }
  }, [tool, validateFile])

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
    onDrop,
    accept: acceptedTypes,
    maxSize: tool.maxSizeMB ? tool.maxSizeMB * 1024 * 1024 : undefined,
    multiple: tool.multiple
  })

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
    setErrors([]) // Clear errors when files change
  }

  const handleSubmit = () => {
    if (files.length > 0) {
      onSubmit(files)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const canSubmit = files.length > 0 && !disabled
  const fileTypes = getFileTypeNames(tool)

  return (
    <div className={cn("space-y-4", className)}>
      {/* Dropzone */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive && "border-primary bg-primary/5",
              isDragAccept && "border-green-500 bg-green-50 dark:bg-green-950/20",
              isDragReject && "border-red-500 bg-red-50 dark:bg-red-950/20",
              !isDragActive && "border-muted-foreground/25 hover:border-muted-foreground/50"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            
            {isDragActive ? (
              <p className="text-lg font-medium">
                {isDragAccept ? "Drop files here..." : "Some files will be rejected"}
              </p>
            ) : (
              <>
                <p className="text-lg font-medium mb-2">
                  Drop {tool.multiple ? "files" : "file"} here or click to browse
                </p>
                <p className="text-muted-foreground mb-2">
                  Supported formats: {fileTypes.join(", ")}
                </p>
                <p className="text-sm text-muted-foreground">
                  Extensions: {acceptedExtensions.map(ext => `.${ext}`).join(", ")}
                  {tool.maxSizeMB && ` • Max size: ${tool.maxSizeMB}MB per file`}
                  {!tool.multiple && " • Single file only"}
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Messages */}
      {errors.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-medium text-red-700 dark:text-red-400">
                  Upload Issues:
                </p>
                {errors.map((error, index) => (
                  <p key={index} className="text-sm text-red-600 dark:text-red-300">
                    • {error}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <p className="font-medium">
                {files.length} {files.length === 1 ? "file" : "files"} ready
              </p>
            </div>
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="ml-2 p-1 h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          size="lg"
          className="min-w-[200px]"
        >
          Process {files.length > 0 ? `${files.length} ${files.length === 1 ? "File" : "Files"}` : "Files"}
        </Button>
      </div>
    </div>
  )
}