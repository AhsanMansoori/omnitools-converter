"use client"

import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface Breadcrumb {
  label: string
  href?: string
}

interface SiteContainerProps {
  children: React.ReactNode
  title?: string
  description?: string
  breadcrumbs?: Breadcrumb[]
  className?: string
}

export function SiteContainer({
  children,
  title,
  description,
  breadcrumbs = [],
  className,
}: SiteContainerProps) {
  const showBreadcrumbs = breadcrumbs.length > 0

  return (
    <div className={cn("min-h-screen", className)}>
      {/* Breadcrumbs */}
      {showBreadcrumbs && (
        <div className="border-b bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Link
                href="/"
                className="flex items-center hover:text-foreground transition-colors"
              >
                <Home className="h-4 w-4" />
                <span className="sr-only">Home</span>
              </Link>
              
              {breadcrumbs.map((breadcrumb, index) => (
                <div key={index} className="flex items-center space-x-1">
                  <ChevronRight className="h-4 w-4" />
                  {breadcrumb.href ? (
                    <Link
                      href={breadcrumb.href}
                      className="hover:text-foreground transition-colors"
                    >
                      {breadcrumb.label}
                    </Link>
                  ) : (
                    <span className="font-medium text-foreground">
                      {breadcrumb.label}
                    </span>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Page Header */}
      {(title || description) && (
        <div className="border-b bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {title && (
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-xl text-muted-foreground max-w-3xl">
                {description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}