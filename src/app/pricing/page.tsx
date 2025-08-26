import type { Metadata } from "next"
import { Check, Star } from "lucide-react"

import { SiteContainer } from "@/components/SiteContainer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Pricing Plans - OmniTools",
  description: "Choose the perfect plan for your file processing needs. Free tools available with premium features for power users and businesses.",
  keywords: ["pricing", "plans", "subscription", "free tools", "premium features", "business plans"],
  openGraph: {
    title: "Pricing Plans - OmniTools",
    description: "Choose the perfect plan for your file processing needs.",
    type: "website",
  },
  twitter: {
    title: "Pricing Plans - OmniTools",
    description: "Choose the perfect plan for your file processing needs.",
  },
}

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for occasional use",
    features: [
      "Basic file processing",
      "5 files per day",
      "Standard quality",
      "Community support",
      "Basic file formats"
    ],
    limitations: [
      "Limited file size (10MB)",
      "Basic features only",
      "No priority processing"
    ],
    popular: false,
    cta: "Get Started Free"
  },
  {
    name: "Pro",
    price: "$9.99", 
    period: "per month",
    description: "Best for regular users",
    features: [
      "All file processing tools",
      "Unlimited files",
      "High quality processing",
      "Priority support",
      "All file formats",
      "Batch processing",
      "No watermarks",
      "API access"
    ],
    limitations: [
      "File size up to 100MB"
    ],
    popular: true,
    cta: "Start Pro Trial"
  },
  {
    name: "Business",
    price: "$29.99",
    period: "per month", 
    description: "For teams and businesses",
    features: [
      "Everything in Pro",
      "Unlimited file size",
      "Team collaboration",
      "Advanced API access",
      "Custom integrations",
      "Priority processing",
      "Dedicated support",
      "Usage analytics",
      "White-label options"
    ],
    limitations: [],
    popular: false,
    cta: "Contact Sales"
  }
]

export default function PricingPage() {
  return (
    <SiteContainer
      title="Choose Your Plan"
      description="Select the perfect pricing plan for your file processing needs"
      breadcrumbs={[
        { label: "Pricing" }
      ]}
    >
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                    <Star className="h-4 w-4" />
                    <span>Most Popular</span>
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="space-y-2">
                  <div className="text-4xl font-bold">
                    {plan.price}
                    <span className="text-lg font-normal text-muted-foreground">
                      /{plan.period}
                    </span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <Button 
                  className={`w-full ${plan.popular ? 'bg-primary' : ''}`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {plan.cta}
                </Button>
                
                <div className="space-y-3">
                  <h4 className="font-medium">What&apos;s included:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-3">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {plan.limitations.length > 0 && (
                    <div className="pt-3 border-t">
                      <h4 className="font-medium text-muted-foreground mb-2">Limitations:</h4>
                      <ul className="space-y-1">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="text-sm text-muted-foreground">
                            • {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="text-center space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Common questions about our pricing and plans
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change plans anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Pro plans include a 7-day free trial. No credit card required to start.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We accept all major credit cards, PayPal, and bank transfers for business plans.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you offer refunds?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes, we offer a 30-day money-back guarantee for all paid plans.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SiteContainer>
  )
}