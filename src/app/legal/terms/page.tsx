import type { Metadata } from "next"
import { FileText, AlertTriangle, Users, CreditCard } from "lucide-react"

import { SiteContainer } from "@/components/SiteContainer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Terms of Service - OmniTools",
  description: "Read our terms of service and user agreement for OmniTools file processing services. Understand your rights and responsibilities when using our platform.",
  keywords: ["terms of service", "user agreement", "terms and conditions", "legal", "usage terms"],
  openGraph: {
    title: "Terms of Service - OmniTools",
    description: "Read our terms of service and user agreement for OmniTools.",
    type: "website",
  },
  twitter: {
    title: "Terms of Service - OmniTools",
    description: "Read our terms of service and user agreement for OmniTools.",
  },
}

export default function TermsPage() {
  return (
    <SiteContainer
      title="Terms of Service"
      description="User agreement and terms of service for OmniTools"
      breadcrumbs={[
        { label: "Legal", href: "/legal" },
        { label: "Terms of Service" }
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-sm text-muted-foreground">
          Last updated: August 26, 2025
        </div>

        {/* Terms Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <FileText className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-medium mb-2">Fair Use</h3>
              <p className="text-sm text-muted-foreground">Reasonable usage limits apply</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-medium mb-2">User Responsibility</h3>
              <p className="text-sm text-muted-foreground">Users own their content</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto mb-3" />
              <h3 className="font-medium mb-2">Prohibited Content</h3>
              <p className="text-sm text-muted-foreground">No illegal or harmful content</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <CreditCard className="h-8 w-8 text-purple-500 mx-auto mb-3" />
              <h3 className="font-medium mb-2">Fair Billing</h3>
              <p className="text-sm text-muted-foreground">Transparent pricing and refunds</p>
            </CardContent>
          </Card>
        </div>

        {/* Terms Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                By accessing and using OmniTools, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
              
              <p className="text-muted-foreground">
                These terms apply to all visitors, users, and others who access or use the service. We reserve the right to update 
                these terms at any time, and continued use of the service constitutes acceptance of any changes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Description of Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">File Processing Tools</h4>
                <p className="text-muted-foreground">
                  OmniTools provides online file processing services including but not limited to PDF manipulation, 
                  image conversion, video processing, and format conversion tools.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Service Availability</h4>
                <p className="text-muted-foreground">
                  We strive to maintain high availability but do not guarantee uninterrupted service. Scheduled maintenance 
                  and unexpected downtime may occur. We are not liable for any losses resulting from service interruptions.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Feature Updates</h4>
                <p className="text-muted-foreground">
                  We regularly add new features and improvements. Features may be added, modified, or removed at our discretion 
                  to improve the service or comply with legal requirements.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. User Accounts and Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Account Security</h4>
                <p className="text-muted-foreground">
                  You are responsible for safeguarding your account credentials and all activities under your account. 
                  Notify us immediately of any unauthorized use of your account.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Accurate Information</h4>
                <p className="text-muted-foreground">
                  You must provide accurate and complete information when creating an account. Keep your information updated 
                  to ensure proper service delivery and billing.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Appropriate Use</h4>
                <p className="text-muted-foreground">
                  Use the service only for lawful purposes and in accordance with these terms. Do not attempt to circumvent 
                  usage limits, access restrictions, or security measures.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Content and File Ownership</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Your Content</h4>
                <p className="text-muted-foreground">
                  You retain all rights to files you upload and process. By using our service, you grant us a limited license 
                  to process your files solely for the purpose of providing the requested service.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Content Responsibility</h4>
                <p className="text-muted-foreground">
                  You are solely responsible for the content of files you upload. Ensure you have the right to process and 
                  modify any files you submit to our service.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Prohibited Content</h4>
                <p className="text-muted-foreground">
                  Do not upload files containing illegal content, malware, personal information of others without consent, 
                  copyrighted material without permission, or content that violates any laws or regulations.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Usage Limits and Fair Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Plan Limits</h4>
                <p className="text-muted-foreground">
                  Each subscription plan has specific usage limits including file size, number of files, and features available. 
                  Exceeding these limits may result in service restrictions or upgrade requirements.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Fair Use Policy</h4>
                <p className="text-muted-foreground">
                  Even with unlimited plans, usage must be reasonable and not interfere with service quality for other users. 
                  Excessive usage may be subject to additional review and potential restrictions.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">API Usage</h4>
                <p className="text-muted-foreground">
                  API access is subject to rate limits and fair use policies. Commercial API usage requires appropriate 
                  business plans and may have additional terms.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Payment and Billing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Subscription Fees</h4>
                <p className="text-muted-foreground">
                  Paid plans are billed in advance on a monthly or annual basis. Fees are non-refundable except as required 
                  by law or our refund policy.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Auto-Renewal</h4>
                <p className="text-muted-foreground">
                  Subscriptions automatically renew unless cancelled before the next billing cycle. You can cancel your 
                  subscription at any time through your account settings.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Refund Policy</h4>
                <p className="text-muted-foreground">
                  We offer a 30-day money-back guarantee for new subscriptions. Refunds are processed to the original 
                  payment method within 5-10 business days.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Service Limitations and Disclaimers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Service Availability</h4>
                <p className="text-muted-foreground">
                  We provide the service "as is" without warranties of any kind. We do not guarantee uninterrupted operation, 
                  error-free performance, or that the service will meet your specific requirements.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Processing Quality</h4>
                <p className="text-muted-foreground">
                  While we strive for high-quality file processing, results may vary depending on input file quality, 
                  format, and processing parameters. Review processed files before use in critical applications.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Limitation of Liability</h4>
                <p className="text-muted-foreground">
                  Our total liability for any claims related to the service is limited to the amount paid by you in the 
                  12 months preceding the claim. We are not liable for indirect, incidental, or consequential damages.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Account Termination</h4>
                <p className="text-muted-foreground">
                  You may terminate your account at any time. We may terminate or suspend accounts that violate these terms, 
                  engage in abusive behavior, or for other legitimate business reasons.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Effect of Termination</h4>
                <p className="text-muted-foreground">
                  Upon termination, access to the service will cease immediately. Account data may be retained for a short 
                  period to allow for account recovery, then permanently deleted.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                For questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2">
                <p><strong>Email:</strong> legal@omnitools.dev</p>
                <p><strong>Address:</strong> OmniTools Legal Team<br />
                123 Terms Street<br />
                Legal City, LC 12345<br />
                United States</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SiteContainer>
  )
}