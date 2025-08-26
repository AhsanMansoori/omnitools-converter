# 🚀 Deployment Guide: Vercel + Supabase

This guide will walk you through deploying your OmniTools project to Vercel with Supabase integration.

## 📋 Prerequisites

- [x] Project code is ready with all dependencies
- [x] Next.js configuration optimized for production
- [x] Supabase project set up
- [ ] GitHub repository created
- [ ] Vercel account ready

## 🛠️ Step 1: Set Up Supabase

### 1.1 Create Supabase Project
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready (takes ~2 minutes)

### 1.2 Configure Storage
1. In your Supabase dashboard, go to **Storage**
2. Create a new bucket called `files`
3. Set the bucket to **Public** (for file downloads)
4. Go to **Settings** > **API** and copy:
   - **Project URL** (starts with `https://`)
   - **Anon/Public Key** (starts with `eyJ`)

## 📁 Step 2: Set Up GitHub Repository

### 2.1 Initialize Git (if not already done)
```bash
cd "d:\\converter website\\omnitools"
git init
git add .
git commit -m "Initial commit: OmniTools file converter"
```

### 2.2 Create GitHub Repository
1. Go to [GitHub](https://github.com)
2. Click **New Repository**
3. Name it `omnitools-converter` (or your preferred name)
4. **Don't** initialize with README (we already have code)
5. Click **Create Repository**

### 2.3 Push to GitHub
```bash
git remote add origin https://github.com/yourusername/omnitools-converter.git
git branch -M main
git push -u origin main
```

## 🌐 Step 3: Deploy to Vercel

### 3.1 Import Project
1. Go to [Vercel](https://vercel.com)
2. Click **New Project**
3. Import your GitHub repository
4. Select **Next.js** as the framework (should auto-detect)

### 3.2 Configure Build Settings
- **Framework Preset**: Next.js
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

### 3.3 Add Environment Variables
In Vercel project settings, add these environment variables:

**Required:**
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-key
NODE_ENV=production
```

**Optional (for job queue):**
```
REDIS_URL=redis://username:password@host:port
```

> **Note**: For Redis, you can use:
> - [Upstash Redis](https://upstash.com) (recommended, has free tier)
> - [Railway Redis](https://railway.app)
> - [Redis Cloud](https://redis.com/redis-enterprise-cloud/)

### 3.4 Deploy
1. Click **Deploy**
2. Wait for the build to complete (~2-5 minutes)
3. Get your deployment URL (e.g., `https://omnitools-converter.vercel.app`)

## 🧪 Step 4: Test Your Deployment

### 4.1 Basic Functionality Test
1. Visit your Vercel URL
2. Test homepage loads correctly
3. Navigate to different tool pages
4. Check that all UI components render properly

### 4.2 File Processing Tests

**PDF Tools:**
- [ ] PDF Merge (upload 2+ PDFs, verify merge works)
- [ ] PDF to Word conversion
- [ ] PDF split functionality

**Image Tools:**
- [ ] Image resize (test different dimensions)
- [ ] Background removal
- [ ] Format conversion

**Video Tools:**
- [ ] WebP to MP4 conversion
- [ ] Video format conversion

### 4.3 Storage Integration Test
1. Process a file successfully
2. Check Supabase Storage dashboard
3. Verify files are being uploaded to the `files` bucket
4. Test file downloads work correctly

## 🔍 Step 5: Monitor & Debug

### 5.1 Vercel Monitoring
- Check **Functions** tab for API route performance
- Monitor **Analytics** for usage patterns
- Review **Logs** for any errors

### 5.2 Supabase Monitoring
- Monitor **Storage** usage
- Check **API** logs for any issues
- Review **Database** if using auth/history features

## 🚨 Common Issues & Solutions

### Build Errors
```
Error: Module not found: Can't resolve 'sharp'
```
**Solution**: Sharp is included in dependencies and configured in `next.config.mjs`

### Environment Variables
```
Error: Missing Supabase configuration
```
**Solution**: Verify `SUPABASE_URL` and `SUPABASE_KEY` are set in Vercel

### File Upload Issues
```
Error: Storage error
```
**Solution**: Check Supabase storage bucket is public and properly configured

### FFmpeg Not Available
```
Error: FFmpeg not available
```
**Solution**: Vercel includes FFmpeg by default. Check if file size exceeds limits.

## 📊 Performance Optimization

### 5.1 Vercel Function Limits
- **Hobby Plan**: 10s execution time, 1GB memory
- **Pro Plan**: 60s execution time, 3GB memory
- Consider file size limits for processing

### 5.2 Storage Optimization
- Implement cleanup for old files
- Use Supabase storage policies for security
- Monitor storage quotas

## 🔄 Continuous Deployment

Once set up, any push to your `main` branch will automatically trigger a new deployment on Vercel.

## 📞 Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)

---

✅ **Ready to deploy!** Follow the steps above and your OmniTools project will be live on Vercel with full Supabase integration.