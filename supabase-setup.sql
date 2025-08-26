-- OmniTools Supabase Setup Script
-- Run these commands in your Supabase SQL Editor

-- 1. Create storage bucket for files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'files',
  'files',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff', 
        'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
);

-- 2. Set up RLS (Row Level Security) policies for the files bucket
CREATE POLICY "Give users authenticated access to folder" ON storage.objects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Give anon users access to folder" ON storage.objects FOR ALL USING (auth.role() = 'anon');

-- 3. Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 4. Create a function to clean up old files (optional)
CREATE OR REPLACE FUNCTION cleanup_old_files()
RETURNS void AS $$
BEGIN
  DELETE FROM storage.objects 
  WHERE bucket_id = 'files' 
    AND created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- 5. Create a scheduled job to run cleanup daily (requires pg_cron extension)
-- Note: This might not be available on all Supabase plans
-- SELECT cron.schedule('cleanup-old-files', '0 2 * * *', 'SELECT cleanup_old_files();');