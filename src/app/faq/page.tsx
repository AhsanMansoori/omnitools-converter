import type { Metadata } from "next"
import { HelpCircle, Search } from "lucide-react"

import { SiteContainer } from "@/components/SiteContainer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export const metadata: Metadata = {
  title: "Frequently Asked Questions - OmniTools",
  description: "Find answers to common questions about OmniTools file processing services, pricing, features, and technical support.",
  keywords: ["FAQ", "help", "support", "questions", "answers", "file processing", "troubleshooting"],
  openGraph: {
    title: "FAQ - OmniTools",
    description: "Find answers to common questions about OmniTools.",
    type: "website",
  },
  twitter: {
    title: "FAQ - OmniTools", 
    description: "Find answers to common questions about OmniTools.",
  },
}

const faqCategories = [
  {
    title: "General Questions",
    faqs: [
      {
        question: "What is OmniTools?",
        answer: "OmniTools is an all-in-one web toolbox for processing PDF, image, and video files. We provide professional-grade tools for converting, editing, and optimizing your files online."
      },
      {
        question: "Is OmniTools free to use?",
        answer: "Yes! We offer a free plan that includes basic file processing tools with some limitations. For advanced features and unlimited usage, we offer affordable Pro and Business plans."
      },
      {
        question: "Do I need to create an account?",
        answer: "No account is required for basic usage. However, creating an account gives you access to additional features, file history, and premium tools."
      },
      {
        question: "How secure are my files?",
        answer: "We take security seriously. All files are encrypted during transfer and processing. Files are automatically deleted from our servers after 24 hours."
      }
    ]
  },
  {
    title: "File Processing",
    faqs: [
      {
        question: "What file formats do you support?",
        answer: "We support a wide range of formats including PDF, JPEG, PNG, WebP, GIF, MP4, AVI, MOV, and many more. Each tool displays its supported formats clearly."
      },
      {
        question: "What's the maximum file size?",
        answer: "Free users can upload files up to 10MB. Pro users can upload files up to 100MB, and Business users have unlimited file size."
      },
      {
        question: "How long does processing take?",
        answer: "Processing time depends on file size and complexity. Most operations complete within seconds to a few minutes. Pro and Business users get priority processing."
      },
      {
        question: "Can I process multiple files at once?",
        answer: "Yes! Batch processing is available for Pro and Business users. You can upload and process multiple files simultaneously."
      }
    ]
  },
  {
    title: "Technical Support",
    faqs: [
      {
        question: "I'm having trouble uploading files. What should I do?",
        answer: "Check your internet connection and ensure your file meets size requirements. Try refreshing the page or using a different browser. Contact support if issues persist."
      },
      {
        question: "Why is my processed file different from the original?",
        answer: "Some compression and format conversion may result in slight quality changes. We use industry-standard algorithms to maintain the best possible quality while achieving your desired output."
      },
      {
        question: "Can I recover a deleted file?",
        answer: "Files are automatically deleted after 24 hours for security. We recommend downloading your processed files immediately. We cannot recover deleted files."
      },
      {
        question: "Do you have an API?",
        answer: "Yes! Pro and Business users get access to our REST API for integrating OmniTools into their applications and workflows."
      }
    ]
  },
  {
    title: "Billing & Plans",
    faqs: [
      {
        question: "How does billing work?",
        answer: "Plans are billed monthly or annually. You can upgrade, downgrade, or cancel at any time. Changes take effect immediately with prorated billing."
      },
      {
        question: "Is there a free trial?",
        answer: "Yes! Pro plans include a 7-day free trial. No credit card required to start. You can cancel anytime during the trial period."
      },
      {
        question: "Can I get a refund?",
        answer: "We offer a 30-day money-back guarantee for all paid plans. Contact support to request a refund within 30 days of purchase."
      },
      {
        question: "Do you offer discounts for students or nonprofits?",
        answer: "Yes! We offer special discounts for students, educators, and nonprofit organizations. Contact our sales team for more information."
      }
    ]
  }
]

export default function FAQPage() {
  return (
    <SiteContainer
      title="Frequently Asked Questions"
      description="Find answers to common questions about OmniTools"
      breadcrumbs={[
        { label: "FAQ" }
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Search FAQ</span>
            </CardTitle>
            <CardDescription>
              Type keywords to find specific answers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input 
              placeholder="Search frequently asked questions..."
              className="text-base"
            />
          </CardContent>
        </Card>

        {/* FAQ Categories */}
        {faqCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="space-y-4">
            <h2 className="text-2xl font-bold">{category.title}</h2>
            
            <div className="space-y-4">
              {category.faqs.map((faq, faqIndex) => (
                <Card key={faqIndex}>
                  <CardHeader>
                    <CardTitle className="flex items-start space-x-3 text-lg">
                      <HelpCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <span>{faq.question}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed pl-8">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {/* Contact Support */}
        <Card className="bg-muted/50">
          <CardHeader className="text-center">
            <CardTitle>Still Need Help?</CardTitle>
            <CardDescription>
              Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-2">Email Support</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Get detailed help via email
                  </p>
                  <p className="text-sm font-medium">support@omnitools.dev</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-2">Live Chat</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Chat with our team in real-time
                  </p>
                  <p className="text-sm font-medium">Available 9 AM - 6 PM EST</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </SiteContainer>
  )
}