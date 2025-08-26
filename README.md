# 🛠️ OmniTools - Professional File Converter

A modern, full-featured file conversion platform built with Next.js 14, featuring PDF processing, image manipulation, and video conversion tools.

## ✨ Features

### 📄 PDF Tools
- **PDF Merge** - Combine multiple PDFs into one
- **PDF Split** - Split multi-page PDFs  
- **PDF to Word** - Convert PDFs to editable DOCX
- **PDF Compress** - Reduce PDF file sizes
- **PDF Watermark** - Add watermarks to PDFs

### 🖼️ Image Tools  
- **Image Resize** - Resize images with quality control
- **Background Remove** - AI-powered background removal
- **Format Convert** - Convert between image formats

### 🎥 Video Tools
- **WebP to MP4** - Convert animated WebP to MP4
- **Video Convert** - Convert between video formats

### 🔧 Advanced Features
- **Job Queue System** - BullMQ + Redis for large file processing
- **Storage Integration** - Supabase Storage with automatic cleanup
- **Dark/Light Theme** - Beautiful UI with theme switching
- **Progress Tracking** - Real-time processing updates
- **Mobile Responsive** - Works on all devices

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for storage)
- Redis instance (optional, for job queue)

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/omnitools-converter.git
cd omnitools-converter

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🌐 Deployment to Vercel + Supabase

### Step 1: Set Up Supabase

1. Create a new project at [Supabase](https://supabase.com)
2. Create a storage bucket named `files`
3. Set the bucket to public
4. Copy your project URL and anon key

### Step 2: Deploy to Vercel

1. Push your code to GitHub
2. Import the repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-key
NODE_ENV=production
```

4. Deploy and test!

### Step 3: Optional Redis Setup

For large file processing via job queue:

```env
REDIS_URL=redis://username:password@host:port
```

Recommended Redis providers:
- [Upstash](https://upstash.com) - Free tier available
- [Railway](https://railway.app) - Simple setup
- [Redis Cloud](https://redis.com) - Enterprise grade

## 📚 Detailed Guides

- **[Step-by-Step Deployment](./DEPLOY_STEPS.md)** - Complete deployment walkthrough
- **[Deployment Overview](./DEPLOYMENT.md)** - Architecture and configuration details

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Storage**: Supabase Storage
- **Processing**: Sharp (images), FFmpeg (video), pdf-lib (PDF)
- **Queue**: BullMQ + Redis (optional)
- **Deployment**: Vercel

## 🧪 Testing & Verification

```bash
# Check deployment readiness
node verify-deployment.js

# Run development server
npm run dev

# Build for production
npm run build
```

## 🔐 Security & Performance

- All files encrypted in transit and at rest
- Automatic cleanup after 24 hours
- Optimized for Vercel deployment
- Graceful fallbacks for all processing modes

---

**🔗 [Live Demo](https://your-deployment.vercel.app)** | **📖 [Full Documentation](./DEPLOYMENT.md)** | **🚀 [Deployment Guide](./DEPLOY_STEPS.md)**