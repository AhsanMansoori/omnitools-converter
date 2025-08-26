# 🚀 Manual Deployment Guide - OmniTools

**When automated scripts fail, follow this manual approach.**

## Current Status ✅
- ✅ **Code Implementation:** 100% Complete
- ✅ **GitHub Repository:** https://github.com/AhsanMansoori/omnitools-converter
- ✅ **Production Build:** Tested and working
- ⏳ **Supabase Setup:** Manual steps required
- ⏳ **Vercel Deployment:** Manual steps required

---

## 1️⃣ Supabase Setup (5 minutes)

### Create Project
1. Go to **https://supabase.com/dashboard**
2. Sign up/login with GitHub
3. Click **"New project"**
4. Settings:
   - **Name:** `omnitools-converter`
   - **Database Password:** [Choose strong password]
   - **Region:** `us-east-1` (or closest to you)
5. Click **"Create new project"** 
6. **Wait 2-3 minutes** for setup

### Create Storage Bucket
1. **Storage** → **Create bucket**
2. Settings:
   - **Name:** `files`
   - **Public:** ✅ **Enabled**
   - **Size limit:** `50 MB`
3. **Create bucket**

### Set Storage Policies
1. **Storage** → **Policies** → **New Policy**
2. **Add 3 policies** (copy from `setup-supabase-manual.md`)

### Get Credentials
1. **Settings** → **API**
2. **Copy:**
   - **Project URL:** `https://xxx.supabase.co`
   - **anon public key:** `eyJhbGci...`

---

## 2️⃣ Vercel Deployment (3 minutes)

### Import Repository
1. Go to **https://vercel.com/dashboard**
2. Click **"Add New..."** → **"Project"**
3. **Import Git Repository:** Search `omnitools-converter`
4. Click **"Import"**

### Configure Project
- **Framework:** Next.js ✅ (auto-detected)
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### Add Environment Variables
**Click "Environment Variables" and add:**

```bash
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_KEY=your_supabase_anon_key
NODE_ENV=production
REDIS_MODE=mock
```

**Replace with your actual Supabase credentials!**

### Deploy
1. Click **"Deploy"**
2. **Wait 2-3 minutes** for deployment
3. **Get your live URL:** `https://omnitools-converter-xxx.vercel.app`

---

## 3️⃣ Live Testing (5 minutes)

### Test Basic Functionality
Visit your deployed URL and test:

- ✅ **Homepage loads**
- ✅ **Tools page accessible**
- ✅ **File upload interface works**
- ✅ **Theme switching works**

### Test File Processing
- ✅ **PDF Merge:** Upload 2+ PDFs
- ✅ **Image Resize:** Upload and resize image
- ✅ **WebP to MP4:** Convert WebP file
- ✅ **Background Removal:** Test image processing

### Verify Storage Integration
- ✅ **Files upload to Supabase**
- ✅ **Download links work**
- ✅ **Files are accessible via URLs**

---

## 4️⃣ Production Monitoring

### Check Vercel Logs
1. **Vercel Dashboard** → **Your Project**
2. **Functions** tab → Monitor for errors
3. **Analytics** → Check performance

### Check Supabase Usage
1. **Supabase Dashboard** → **Your Project**  
2. **Storage** → Monitor usage
3. **Logs** → Check API calls

---

## ✅ Deployment Complete!

### 🎉 Your OmniTools App is Live!

**Live App:** https://omnitools-converter-[your-username].vercel.app  
**GitHub:** https://github.com/AhsanMansoori/omnitools-converter  
**Supabase:** [Your project dashboard]  
**Vercel:** [Your project dashboard]  

### 📊 Final Checklist:
- [ ] All tools working on live site
- [ ] Files uploading to Supabase storage  
- [ ] Download links functional
- [ ] No errors in Vercel function logs
- [ ] Mobile responsive design working
- [ ] Theme switching operational

---

## 🆘 Troubleshooting

### Common Issues:

**Build Errors:**
- Check TypeScript compilation: `npm run build`
- Verify all dependencies installed
- Check Vercel build logs

**File Upload Issues:**
- Verify Supabase bucket is public
- Check environment variables in Vercel
- Confirm bucket policies are set

**API Errors:**
- Check Supabase credentials
- Verify CORS settings
- Monitor Vercel function logs

### Get Help:
- **Documentation:** `README.md`, `DEPLOYMENT.md`
- **Guides:** All `.md` files in project
- **Repository:** GitHub issues/discussions

---

**🌟 Congratulations! Your professional file converter is now live and ready for users!**