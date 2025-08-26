import type { Metadata } from "next"
import { Shield, Eye, Lock, Trash2 } from "lucide-react"

import { SiteContainer } from "@/components/SiteContainer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Privacy Policy - OmniTools",
  description: "Learn how OmniTools protects your privacy and handles your data. We prioritize security and transparency in all our file processing services.",
  keywords: ["privacy policy", "data protection", "security", "privacy", "GDPR", "data handling"],
  openGraph: {
    title: "Privacy Policy - OmniTools",
    description: "Learn how OmniTools protects your privacy and handles your data.",
    type: "website",
  },
  twitter: {
    title: "Privacy Policy - OmniTools",
    description: "Learn how OmniTools protects your privacy and handles your data.",
  },
}

export default function PrivacyPage() {
  return (
    <SiteContainer
      title="Privacy Policy"
      description="How we protect your privacy and handle your data"
      breadcrumbs={[
        { label: "Legal", href: "/legal" },
        { label: "Privacy Policy" }
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-sm text-muted-foreground">
          Last updated: August 26, 2025
        </div>

        {/* Privacy Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Shield className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-medium mb-2">Secure Processing</h3>
              <p className="text-sm text-muted-foreground">All files encrypted during processing</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Trash2 className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-medium mb-2">Auto-Delete</h3>
              <p className="text-sm text-muted-foreground">Files deleted after 24 hours</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Eye className="h-8 w-8 text-purple-500 mx-auto mb-3" />
              <h3 className="font-medium mb-2">No Sharing</h3>
              <p className="text-sm text-muted-foreground">We never share your files</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Lock className="h-8 w-8 text-orange-500 mx-auto mb-3" />
              <h3 className="font-medium mb-2">GDPR Compliant</h3>
              <p className="text-sm text-muted-foreground">Full compliance with privacy laws</p>
            </CardContent>
          </Card>
        </div>

        {/* Privacy Policy Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Files You Upload</h4>
                <p className="text-muted-foreground">
                  We temporarily store files you upload for processing purposes only. These files are automatically deleted from our servers after 24 hours.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Usage Information</h4>
                <p className="text-muted-foreground">
                  We collect basic usage analytics to improve our services, including tool usage, processing times, and error rates. This data is anonymized and aggregated.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Account Information</h4>
                <p className="text-muted-foreground">
                  If you create an account, we store your email address, username, and subscription information. Passwords are securely hashed and never stored in plain text.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">File Processing</h4>
                <p className="text-muted-foreground">
                  Your uploaded files are processed according to the tool you selected. We do not access, view, or analyze the content of your files beyond what's necessary for processing.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Service Improvement</h4>
                <p className="text-muted-foreground">
                  Anonymous usage data helps us understand how our tools are used and identify areas for improvement. This data cannot be linked back to individual users.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Communication</h4>
                <p className="text-muted-foreground">
                  We may send important service announcements, security updates, or billing notifications to registered users. Marketing emails are opt-in only.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Encryption</h4>
                <p className="text-muted-foreground">
                  All file transfers use SSL/TLS encryption. Files are encrypted at rest during processing and securely deleted after 24 hours.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Access Controls</h4>
                <p className="text-muted-foreground">
                  Only authorized personnel have access to our systems, and all access is logged and monitored. We use industry-standard security practices.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Regular Audits</h4>
                <p className="text-muted-foreground">
                  We conduct regular security audits and penetration testing to ensure our systems remain secure and up-to-date.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Data Access</h4>
                <p className="text-muted-foreground">
                  You can request a copy of any personal data we hold about you. Since files are automatically deleted, this mainly includes account information.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Data Deletion</h4>
                <p className="text-muted-foreground">
                  You can request deletion of your account and associated data at any time. Files are automatically deleted after 24 hours regardless.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Data Portability</h4>
                <p className="text-muted-foreground">
                  You can export your account data in a machine-readable format. Contact support for assistance with data export requests.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Analytics</h4>
                <p className="text-muted-foreground">
                  We use privacy-focused analytics tools to understand usage patterns. No personal information is shared with analytics providers.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Payment Processing</h4>
                <p className="text-muted-foreground">
                  Payment information is processed by secure third-party payment processors. We do not store credit card information on our servers.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Cloud Storage</h4>
                <p className="text-muted-foreground">
                  Temporary file storage uses encrypted cloud storage services with automatic deletion. Files are never stored permanently on third-party services.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                If you have any questions about this Privacy Policy or how we handle your data, please contact us:
              </p>
              <div className="space-y-2">
                <p><strong>Email:</strong> privacy@omnitools.dev</p>
                <p><strong>Address:</strong> OmniTools Privacy Team<br />
                123 Privacy Street<br />
                Data City, DC 12345<br />
                United States</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SiteContainer>
  )
}