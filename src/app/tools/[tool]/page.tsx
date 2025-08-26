import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Upload, Settings, Download } from "lucide-react"

import { SiteContainer } from "@/components/SiteContainer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getToolById, toolCategories, getFileTypeNames, getAcceptedExtensions } from "@/lib/tools"
import { ToolPageClient } from "./ToolPageClient"
import { ImageResizeClient } from "./ImageResizeClient"
import { WebPToMP4Client } from "./WebPToMP4Client"
import { PDFMergeClient } from "./PDFMergeClient"

interface ToolPageProps {
  params: {
    tool: string
  }
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const tool = getToolById(params.tool)
  
  if (!tool) {
    return {
      title: "Tool Not Found - OmniTools",
      description: "The requested tool could not be found.",
    }
  }

  const category = toolCategories[tool.category]
  const fileTypes = getFileTypeNames(tool)
  
  return {
    title: `${tool.name} - ${category.name} | OmniTools`,
    description: `${tool.description} Support for ${fileTypes.join(", ")} formats. ${tool.multiple ? 'Multiple files supported.' : 'Single file processing.'} Max file size: ${tool.maxSizeMB || 'unlimited'}MB.`,
    keywords: [
      tool.name.toLowerCase(),
      ...fileTypes.map(f => f.toLowerCase()),
      tool.category.toLowerCase(),
      "converter",
      "online tool"
    ],
    openGraph: {
      title: `${tool.name} - OmniTools`,
      description: tool.description,
      type: "website",
    },
    twitter: {
      title: `${tool.name} - OmniTools`,
      description: tool.description,
    },
  }
}

export default function ToolPage({ params }: ToolPageProps) {
  const tool = getToolById(params.tool)
  
  if (!tool) {
    notFound()
  }
  
  const category = toolCategories[tool.category]
  const CategoryIcon = category.icon
  const fileTypes = getFileTypeNames(tool)
  const acceptedExtensions = getAcceptedExtensions(tool)

  return (
    <SiteContainer
      title={tool.name}
      description={tool.description}
      breadcrumbs={[
        { label: "Tools", href: "/tools" },
        { label: category.name, href: `/tools#${tool.category.toLowerCase()}-tools` },
        { label: tool.name }
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Tool Header */}
        <div className="flex items-start space-x-4">
          <div className={`w-16 h-16 rounded-xl bg-background border-2 flex items-center justify-center`}>
            {tool.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <CategoryIcon className={`h-4 w-4 ${category.color}`} />
              <span className="text-sm font-medium text-muted-foreground">
                {category.name}
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-2">{tool.name}</h1>
            <p className="text-xl text-muted-foreground">{tool.description}</p>
          </div>
        </div>

        {/* Upload Interface - Client Component */}
        {tool.id === "image-resize" ? (
          <ImageResizeClient tool={tool} />
        ) : tool.id === "webp-to-mp4" ? (
          <WebPToMP4Client tool={tool} />
        ) : tool.id === "pdf-merge" ? (
          <PDFMergeClient tool={tool} />
        ) : (
          <ToolPageClient tool={tool} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tool Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Tool Specifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>{tool.multiple ? 'Multiple files supported' : 'Single file processing'}</span>
                </li>
                {tool.maxSizeMB && (
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Max file size: {tool.maxSizeMB}MB</span>
                  </li>
                )}
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Secure processing with auto-deletion</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>No registration required</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Fast online processing</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Format Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Supported Formats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Accepted File Types</h4>
                <div className="flex flex-wrap gap-2">
                  {fileTypes.map((format) => (
                    <span key={format} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                      {format}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">File Extensions</h4>
                <div className="flex flex-wrap gap-2">
                  {acceptedExtensions.map((ext) => (
                    <span key={ext} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                      .{ext}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How to Use */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use {tool.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-2">1. Upload</h3>
                <p className="text-sm text-muted-foreground">
                  Select or drag your files to the upload area
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-2">2. Configure</h3>
                <p className="text-sm text-muted-foreground">
                  Adjust settings and options as needed
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Download className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-2">3. Download</h3>
                <p className="text-sm text-muted-foreground">
                  Process and download your converted files
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Tools */}
        <div className="text-center">
          <Button variant="outline" asChild>
            <Link href="/tools">← Back to All Tools</Link>
          </Button>
        </div>
      </div>
    </SiteContainer>
  )
}