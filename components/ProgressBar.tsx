"use client"

import React from "react"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ProgressBarProps {
  progress: number // 0-100
  status?: "idle" | "processing" | "success" | "error"
  message?: string
  className?: string
}

export function ProgressBar({ 
  progress, 
  status = "idle", 
  message,
  className 
}: ProgressBarProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "processing":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "processing":
        return "bg-blue-500"
      case "success":
        return "bg-green-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-primary"
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm font-medium">
            {status === "processing" && "Processing..."}
            {status === "success" && "Complete!"}
            {status === "error" && "Error"}
            {status === "idle" && "Ready"}
          </span>
        </div>
        <span className="text-sm text-muted-foreground">
          {Math.round(progress)}%
        </span>
      </div>
      
      <Progress 
        value={progress} 
        className="h-2"
        style={status !== "idle" ? {
          // @ts-expect-error CSS custom property
          "--progress-foreground": getStatusColor()
        } : undefined}
      />
      
      {message && (
        <p className={cn(
          "text-xs",
          status === "error" ? "text-red-600" : "text-muted-foreground"
        )}>
          {message}
        </p>
      )}
    </div>
  )
}