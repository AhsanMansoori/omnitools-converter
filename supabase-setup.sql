-- Supabase Storage Setup for OmniTools
-- Run these commands in Supabase SQL Editor

-- 1. Create storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('files', 'files', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up storage policies for public access
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'files');

-- 3. Allow authenticated uploads (optional - for future auth)
CREATE POLICY "Allow uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'files');

-- 4. Allow file deletion (for cleanup)
CREATE POLICY "Allow deletion" ON storage.objects
FOR DELETE USING (bucket_id = 'files');

-- 5. View existing policies
SELECT * FROM pg_policies WHERE tablename = 'objects';

-- 6. Test bucket access
SELECT * FROM storage.buckets WHERE name = 'files';