# 🚀 Step-by-Step Deployment Guide

## Prerequisites Checklist
- [x] Project builds successfully (`npm run build`)
- [x] All dependencies installed
- [x] Next.js configuration optimized
- [ ] GitHub account ready
- [ ] Vercel account ready
- [ ] Supabase project created

---

## Step 1: Set Up Supabase (Required)

### 1.1 Create Supabase Project
```bash
# Go to https://supabase.com and create account
# Click "New Project"
# Choose organization and enter project details:
#   - Name: omnitools-storage
#   - Database Password: [generate secure password]
#   - Region: [choose closest to your users]
```

### 1.2 Configure Storage Bucket
```sql
-- In Supabase SQL Editor, run:
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('files', 'files', true);

-- Set up storage policies (public read access)
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'files');

-- Allow authenticated uploads (optional - for future auth)
CREATE POLICY "Allow uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'files');
```

### 1.3 Get Credentials
```bash
# From Supabase Dashboard > Settings > API
# Copy these values:
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-key-here
```

---

## Step 2: GitHub Setup

### 2.1 Initialize Repository
```bash
cd "d:\converter website\omnitools"

# Initialize git (if not done)
git init

# Add all files
git add .

# Initial commit
git commit -m "feat: complete OmniTools file converter with worker processors

- Implemented PDF merge, image resize, video conversion
- Added BullMQ job queue system with Redis integration  
- Configured Supabase storage integration
- Added comprehensive tool registry and routing
- Implemented direct processing APIs for smaller files
- Added production-ready Next.js configuration
- Complete UI with dark/light theme support"
```

### 2.2 Create GitHub Repository
```bash
# Go to https://github.com/new
# Repository name: omnitools-converter
# Description: Professional file converter with PDF, image, and video processing tools
# Keep it Private (or Public if you prefer)
# Do NOT initialize with README
# Click "Create repository"
```

### 2.3 Push to GitHub
```bash
# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/omnitools-converter.git

# Set main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### 3.1 Import Project
```bash
# Go to https://vercel.com/dashboard
# Click "New Project" 
# Click "Import" next to your GitHub repository
# Click "Import" on the omnitools-converter repo
```

### 3.2 Configure Project Settings
```bash
Framework Preset: Next.js (auto-detected)
Root Directory: ./ (default)
Build Command: npm run build (default)  
Output Directory: .next (default)
Install Command: npm install (default)
Node.js Version: 18.x (recommended)
```

### 3.3 Add Environment Variables
In Vercel dashboard > Settings > Environment Variables, add:

**Production Environment:**
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-key
NODE_ENV=production
```

**Optional (for job queue):**
```env
# For Redis (optional - enables job queue for large files)
# You can use Upstash (free tier) or Railway
REDIS_URL=redis://username:password@host:port
```

### 3.4 Deploy
```bash
# Click "Deploy" in Vercel dashboard
# Wait for build to complete (2-5 minutes)
# Get your production URL: https://your-project-name.vercel.app
```

---

## Step 4: Set Up Redis (Optional)

### Option A: Upstash Redis (Recommended - Free Tier)
```bash
# Go to https://upstash.com
# Create account and database
# Copy the Redis URL from dashboard
# Add to Vercel environment variables:
REDIS_URL=redis://your-upstash-url
```

### Option B: Railway Redis
```bash
# Go to https://railway.app
# Create new project > Add Redis
# Copy connection URL
# Add to Vercel environment variables
```

### Option C: Skip Redis (Files Processed Directly)
```bash
# Without Redis, all files are processed directly
# This works fine for most use cases
# Job queue features won't be available
```

---

## Step 5: Verify Deployment

### 5.1 Basic Tests
```bash
# Visit your Vercel URL
# Test homepage loads correctly
# Check all tool pages render properly
# Test theme toggle (light/dark mode)
```

### 5.2 File Processing Tests

**PDF Tools:**
- PDF Merge: Upload 2+ PDFs, verify merge works
- PDF Split: Upload multi-page PDF
- PDF to Word: Test conversion

**Image Tools:**
- Image Resize: Test different dimensions  
- Background Remove: Upload image with background
- Format Convert: Test JPEG to PNG conversion

**Video Tools:**
- WebP to MP4: Upload animated WebP
- Video Convert: Test MP4 to WebM

### 5.3 Storage Verification
```bash
# Process a file successfully
# Check Supabase Dashboard > Storage > files bucket  
# Verify files appear and can be downloaded
# Check automatic cleanup after 24 hours
```

---

## Step 6: Monitoring & Maintenance

### 6.1 Vercel Monitoring
```bash
# Check Functions tab for API performance
# Monitor Analytics for usage
# Review Logs for errors
```

### 6.2 Supabase Monitoring
```bash  
# Storage tab: monitor usage and quotas
# API tab: check request patterns
# Logs tab: review any errors
```

### 6.3 Performance Optimization
```bash
# Function timeout limits:
# - Hobby: 10s max, 1GB memory
# - Pro: 60s max, 3GB memory

# Storage limits:
# - Supabase free: 1GB storage
# - Implement cleanup policies for large usage
```

---

## Step 7: Domain & SSL (Optional)

### 7.1 Custom Domain
```bash
# In Vercel Dashboard > Settings > Domains
# Add your custom domain
# Follow DNS configuration instructions
# SSL automatically configured
```

### 7.2 Environment Specific URLs
```bash
Production: https://your-domain.com
Staging: https://your-project-git-staging.vercel.app  
Development: https://your-project-git-main.vercel.app
```

---

## Troubleshooting Common Issues

### Build Errors
```bash
# Error: Module not found
# Solution: Check dependencies in package.json

# Error: Environment variables missing  
# Solution: Add SUPABASE_URL and SUPABASE_KEY to Vercel

# Error: Sharp optimization failed
# Solution: Sharp is pre-installed on Vercel (should work automatically)
```

### Runtime Errors
```bash
# 500 Error on file upload
# Check: Supabase credentials and bucket permissions

# FFmpeg not available  
# Solution: FFmpeg is available on Vercel by default

# Redis connection failed
# Solution: Check REDIS_URL or remove to use direct processing
```

### Storage Issues
```bash
# Files not uploading to Supabase
# Check: Bucket exists and has public policy

# Files not downloading
# Check: Storage policies allow public read access

# Storage quota exceeded
# Solution: Implement cleanup job or upgrade Supabase plan
```

---

## 🎉 Success Checklist

- [ ] Project builds and deploys successfully
- [ ] All tool pages load correctly  
- [ ] File uploads work to Supabase
- [ ] File processing completes successfully
- [ ] Download links work for processed files
- [ ] Storage cleanup functions properly
- [ ] Error handling works gracefully
- [ ] Performance is acceptable for your use case

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs  
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Project Issues**: Check GitHub issues or create new one

---

**Your OmniTools project is now live! 🚀**

Production URL: `https://your-project.vercel.app`