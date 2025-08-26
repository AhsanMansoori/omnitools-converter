# 🗄️ Supabase Manual Setup Guide

Since the Supabase CLI installation failed, let's set up Supabase manually through the web dashboard.

## Step 1: Create Supabase Project

1. **Go to:** https://supabase.com/dashboard
2. **Sign up/Login** with your GitHub account
3. **Click "New project"**
4. **Fill project details:**
   - **Name:** `omnitools-converter`
   - **Database Password:** Choose a strong password (save it!)
   - **Region:** Choose closest to your users (e.g., `us-east-1`)
5. **Click "Create new project"**
6. **Wait 2-3 minutes** for project creation

## Step 2: Set Up Storage Bucket

1. **Go to Storage** (left sidebar)
2. **Click "Create bucket"**
3. **Bucket settings:**
   - **Name:** `files`
   - **Public bucket:** ✅ **Checked**
   - **File size limit:** `50 MB`
   - **MIME types:** Leave default or add specific types
4. **Click "Create bucket"**

## Step 3: Configure Bucket Policies

1. **Go to Storage > Policies**
2. **Click "New Policy"** for the `files` bucket
3. **Add these policies:**

### Policy 1: Public Read Access
```sql
-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT
USING (bucket_id = 'files');
```

### Policy 2: Public Insert Access  
```sql
-- Allow public insert access
CREATE POLICY "Public insert access" ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'files');
```

### Policy 3: Public Delete Access
```sql
-- Allow public delete access  
CREATE POLICY "Public delete access" ON storage.objects
FOR DELETE
USING (bucket_id = 'files');
```

## Step 4: Run Additional SQL Setup

1. **Go to SQL Editor** (left sidebar)
2. **Create new query**
3. **Copy and run this SQL:**

```sql
-- Create cleanup function for old files
CREATE OR REPLACE FUNCTION cleanup_old_files()
RETURNS void AS $$
BEGIN
  DELETE FROM storage.objects 
  WHERE bucket_id = 'files' 
    AND created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION cleanup_old_files() TO anon, authenticated;

-- Optional: Set up automatic cleanup (if pg_cron is available)
-- SELECT cron.schedule('cleanup-old-files', '0 2 * * *', 'SELECT cleanup_old_files();');
```

## Step 5: Get Your Credentials

1. **Go to Settings > API**
2. **Copy these values:**
   - **Project URL:** `https://xxx.supabase.co`
   - **anon public key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Step 6: Test Storage Access

1. **Go to Storage > files bucket**
2. **Try uploading a test file**
3. **Verify you can:**
   - ✅ Upload files
   - ✅ View uploaded files
   - ✅ Download files
   - ✅ Delete files

## ✅ Supabase Setup Complete!

**Your credentials for Vercel:**
```bash
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here
```

**Save these credentials** - you'll need them for Vercel deployment!

---

## 🚀 Next Step: Vercel Deployment

Now proceed with the Vercel deployment using these credentials.

### Quick Vercel Setup:
1. Go to https://vercel.com/dashboard
2. Import GitHub repository: `omnitools-converter`
3. Add environment variables (use credentials above)
4. Deploy!

### Environment Variables for Vercel:
```bash
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_KEY=your_supabase_anon_key
NODE_ENV=production
REDIS_MODE=mock
```

**🎉 You're almost done! Just Vercel deployment and testing left!**