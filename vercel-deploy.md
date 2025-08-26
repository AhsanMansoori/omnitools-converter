# 🚀 Vercel Deployment Guide for OmniTools

## Step 1: Import GitHub Repository

1. Go to **[Vercel Dashboard](https://vercel.com/dashboard)**
2. Click **"Add New..."** → **"Project"**
3. **Import Git Repository**: Search for `omnitools-converter`
4. Click **"Import"** on your repository

## Step 2: Configure Project Settings

### Framework Preset
- **Framework Preset**: Next.js
- **Root Directory**: `./` (default)
- **Build and Output Settings**:
  - **Build Command**: `npm run build`
  - **Output Directory**: `.next`
  - **Install Command**: `npm install`

### Environment Variables

Add these environment variables in the **"Environment Variables"** section:

```bash
# Required - Supabase Configuration
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_KEY=your_supabase_anon_key

# Required - Node Environment
NODE_ENV=production

# Optional - Redis (for job queue, if you have Redis)
REDIS_URL=redis://your-redis-url

# Optional - Redis Mode (set to 'mock' if no Redis)
REDIS_MODE=mock
```

**⚠️ Important**: Replace `YOUR_PROJECT_ID` and `your_supabase_anon_key` with actual values from your Supabase project.

### Get Supabase Credentials

1. Go to **[Supabase Dashboard](https://supabase.com/dashboard)**
2. Select your project: **omnitools-converter**
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Use as `SUPABASE_URL`
   - **anon public** key → Use as `SUPABASE_KEY`

## Step 3: Deploy

1. Click **"Deploy"**
2. Wait for deployment (usually 2-3 minutes)
3. Once deployed, you'll get a URL like: `https://omnitools-converter-username.vercel.app`

## Step 4: Test Deployment

Visit your deployed URL and test:

### ✅ Basic Tests
- [ ] Homepage loads correctly
- [ ] Tool pages are accessible
- [ ] Upload interface works
- [ ] Theme switching works

### ✅ File Processing Tests
- [ ] **PDF Merge**: Upload 2+ PDFs and merge them
- [ ] **Image Resize**: Upload an image and resize it
- [ ] **WebP to MP4**: Upload a WebP file for conversion
- [ ] **Background Removal**: Test image background removal
- [ ] **PDF to Word**: Test PDF to DOCX conversion

### ✅ Storage Tests
- [ ] Files upload to Supabase Storage
- [ ] Processed files are accessible via download URLs
- [ ] Files are automatically cleaned up after 24 hours

## Step 5: Monitor and Debug

### Check Vercel Function Logs
1. Go to your Vercel project dashboard
2. Click on **"Functions"** tab
3. Monitor for any errors or timeouts

### Check Supabase Logs
1. Go to Supabase Dashboard → Your Project
2. **Logs** → **API Logs**
3. Monitor storage operations and API calls

### Common Issues & Solutions

#### Build Errors
```bash
# If build fails, check:
npm run build
npm run lint
```

#### Environment Variable Issues
- Ensure all required variables are set
- Check variable names match exactly
- Verify Supabase credentials are correct

#### File Upload Issues
- Check Supabase bucket permissions
- Verify CORS settings in Supabase
- Ensure file size limits are appropriate

#### Function Timeouts
- Vercel functions have 10s timeout on free plan
- Large file processing might need optimization
- Consider using job queue for heavy processing

## Step 6: Production Optimizations

### Performance
- [ ] Enable Vercel Edge Functions (if needed)
- [ ] Set up CDN for static assets
- [ ] Configure caching headers

### Security
- [ ] Review Supabase RLS policies
- [ ] Set up rate limiting
- [ ] Configure CORS properly

### Monitoring
- [ ] Set up Vercel Analytics
- [ ] Monitor Supabase usage
- [ ] Set up error tracking (Sentry, etc.)

## 🎉 Deployment Complete!

Your OmniTools application is now live at:
**https://omnitools-converter-[username].vercel.app**

### Quick Links
- **Live App**: [Your Vercel URL]
- **GitHub**: https://github.com/AhsanMansoori/omnitools-converter
- **Vercel Dashboard**: [Your Project Dashboard]
- **Supabase Dashboard**: [Your Project Dashboard]

---

## Troubleshooting

If you encounter issues, check:
1. **Vercel Build Logs**: For compilation errors
2. **Vercel Function Logs**: For runtime errors
3. **Supabase Logs**: For storage/API issues
4. **Browser Console**: For client-side errors

For additional help, refer to:
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)