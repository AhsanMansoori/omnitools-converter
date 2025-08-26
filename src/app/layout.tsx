import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OmniTools - All-in-One Web Toolbox",
  description: "Your comprehensive web toolbox for PDF, image, and video processing. Fast, secure, and privacy-focused tools for all your conversion needs.",
  keywords: ["PDF tools", "image converter", "video processing", "file conversion", "web tools"],
  authors: [{ name: "OmniTools" }],
  creator: "OmniTools",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://omnitools.dev",
    title: "OmniTools - All-in-One Web Toolbox",
    description: "Your comprehensive web toolbox for PDF, image, and video processing.",
    siteName: "OmniTools",
  },
  twitter: {
    card: "summary_large_image",
    title: "OmniTools - All-in-One Web Toolbox",
    description: "Your comprehensive web toolbox for PDF, image, and video processing.",
    creator: "@omnitools",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
