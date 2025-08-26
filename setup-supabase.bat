@echo off
echo.
echo 🗄️ OmniTools Supabase Automated Setup
echo =====================================
echo.

echo 📋 This script will help you set up Supabase automatically
echo.

echo 1️⃣ Installing Supabase CLI (if not installed)...
where supabase >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Supabase CLI...
    npm install -g supabase
) else (
    echo ✅ Supabase CLI already installed
)

echo.
echo 2️⃣ Login to Supabase
echo Please complete login in your browser...
supabase login

echo.
echo 3️⃣ Creating new Supabase project...
set /p PROJECT_NAME="Enter project name (default: omnitools-converter): "
if "%PROJECT_NAME%"=="" set PROJECT_NAME=omnitools-converter

set /p ORG_ID="Enter your organization ID (check Supabase dashboard): "
set /p DB_PASSWORD="Enter database password (min 8 chars): "

echo Creating project: %PROJECT_NAME%
supabase projects create %PROJECT_NAME% --org-id %ORG_ID% --db-password %DB_PASSWORD% --region us-east-1

echo.
echo 4️⃣ Getting project details...
supabase projects list

echo.
echo 5️⃣ Setting up local environment...
supabase init

echo.
echo 6️⃣ Linking to remote project...
supabase link --project-ref %PROJECT_NAME%

echo.
echo 7️⃣ Setting up storage bucket...
echo Running SQL setup commands...
supabase db reset --linked

echo.
echo 8️⃣ Creating storage bucket and policies...
echo Applying storage configuration...

(echo -- Create storage bucket for files
echo INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types^)
echo VALUES (
echo   'files',
echo   'files', 
echo   true,
echo   52428800,
echo   ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'video/mp4']
echo ^);
echo.
echo -- Set up RLS policies
echo CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id = 'files'^);
echo CREATE POLICY "Public insert access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'files'^);
echo CREATE POLICY "Public delete access" ON storage.objects FOR DELETE USING (bucket_id = 'files'^);
) | supabase db reset --linked --file -

echo.
echo 9️⃣ Getting project credentials...
echo.
echo 📋 Your Supabase Configuration:
echo ===============================
supabase status

echo.
echo ✅ Supabase setup complete!
echo.
echo 🔑 Copy these values for Vercel deployment:
echo.
echo SUPABASE_URL=
supabase status --output json | findstr "api_url"
echo.
echo SUPABASE_KEY= 
supabase status --output json | findstr "anon_key"
echo.

echo 📝 Save these credentials for the next step!
echo.
pause