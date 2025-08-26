import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { SiteContainer } from "@/components/SiteContainer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toolCategories, getAllCategories, getToolsByCategory, getFileTypeNames } from "@/lib/tools"

export const metadata: Metadata = {
  title: "All Tools - OmniTools",
  description: "Browse our complete collection of PDF, image, and video processing tools. Professional-grade file conversion and editing tools for all your needs.",
  keywords: ["PDF tools", "image tools", "video tools", "file converter", "online tools", "file processing"],
  openGraph: {
    title: "All Tools - OmniTools",
    description: "Browse our complete collection of PDF, image, and video processing tools.",
    type: "website",
  },
  twitter: {
    title: "All Tools - OmniTools", 
    description: "Browse our complete collection of PDF, image, and video processing tools.",
  },
}

export default function ToolsPage() {
  const categories = getAllCategories()

  return (
    <SiteContainer
      title="All Tools"
      description="Choose from our comprehensive collection of professional file processing tools"
      breadcrumbs={[
        { label: "Tools" }
      ]}
    >
      <div className="space-y-12">
        {/* Tool Categories Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const Icon = category.icon
            const categoryTools = getToolsByCategory(category.slug as keyof typeof toolCategories)
            
            return (
              <Card key={category.slug} className="relative overflow-hidden">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-background border-2 flex items-center justify-center mb-4`}>
                    <Icon className={`h-6 w-6 ${category.color}`} />
                  </div>
                  <CardTitle className="text-xl">{category.name}</CardTitle>
                  <CardDescription>
                    {category.description} • {categoryTools.length} tools available
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {categoryTools.slice(0, 3).map((tool) => (
                      <div key={tool.id} className="text-sm text-muted-foreground">
                        • {tool.name}
                      </div>
                    ))}
                    {categoryTools.length > 3 && (
                      <div className="text-sm text-muted-foreground">
                        and {categoryTools.length - 3} more...
                      </div>
                    )}
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`#${category.slug.toLowerCase()}-tools`}>
                      View {category.name}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* All Tools by Category */}
        {categories.map((category) => {
          const categoryTools = getToolsByCategory(category.slug as keyof typeof toolCategories)
          const Icon = category.icon
          
          return (
            <section key={category.slug} id={`${category.slug.toLowerCase()}-tools`} className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg bg-background border flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${category.color}`} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{category.name}</h2>
                  <p className="text-muted-foreground">{category.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryTools.map((tool) => {
                  const fileTypes = getFileTypeNames(tool)
                  
                  return (
                    <Card key={tool.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg bg-background border flex items-center justify-center`}>
                            {tool.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{tool.name}</CardTitle>
                          </div>
                        </div>
                        <CardDescription className="mt-2">
                          {tool.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-1">
                            {fileTypes.slice(0, 3).map((format) => (
                              <span key={format} className="px-2 py-1 bg-muted rounded-md text-xs font-medium">
                                {format}
                              </span>
                            ))}
                            {fileTypes.length > 3 && (
                              <span className="px-2 py-1 bg-muted rounded-md text-xs">
                                +{fileTypes.length - 3}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            {tool.multiple && <div>• Multiple files supported</div>}
                            {tool.maxSizeMB && <div>• Max size: {tool.maxSizeMB}MB</div>}
                          </div>
                          <Button className="w-full" asChild>
                            <Link href={tool.route}>
                              Use {tool.name}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </SiteContainer>
  )
}