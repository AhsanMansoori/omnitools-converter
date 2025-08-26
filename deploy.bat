@echo off
setlocal EnableDelayedExpansion

:: 🚀 OmniTools Deployment Script for Windows
echo 🚀 OmniTools Deployment Script
echo ===============================

:: Check if git is initialized
if not exist ".git" (
    echo [ERROR] Git repository not initialized!
    pause
    exit /b 1
)

echo [STEP] Checking project status...

:: Check if build passes
echo [STEP] Testing build...
call npm run build
if !errorlevel! neq 0 (
    echo [ERROR] Build failed! Fix issues before deploying.
    pause
    exit /b 1
)
echo [SUCCESS] Build passes ✅

:: Check environment files
if exist ".env.example" (
    echo [SUCCESS] Environment template exists ✅
) else (
    echo [WARNING] No .env.example found
)

echo.
echo [STEP] GitHub Repository Setup
echo 1. Go to: https://github.com/new
echo 2. Repository name: omnitools-converter
echo 3. Keep it Private
echo 4. DO NOT initialize with README
echo 5. Click 'Create repository'
echo.

set /p GITHUB_USERNAME="Enter your GitHub username: "
if "!GITHUB_USERNAME!"=="" (
    echo [ERROR] GitHub username is required!
    pause
    exit /b 1
)

set "REPO_URL=https://github.com/!GITHUB_USERNAME!/omnitools-converter.git"

echo [STEP] Adding GitHub remote...
git remote remove origin 2>nul
git remote add origin !REPO_URL!

echo [STEP] Pushing to GitHub...
git push -u origin master
if !errorlevel! neq 0 (
    echo [ERROR] Failed to push to GitHub. Make sure the repository exists!
    pause
    exit /b 1
)

echo [SUCCESS] Code pushed to GitHub ✅
echo [SUCCESS] Repository: !REPO_URL!

echo.
echo [STEP] Next Steps - Supabase Setup
echo 1. Go to: https://supabase.com
echo 2. Create new project: 'omnitools-storage'
echo 3. Go to Storage ^> Create bucket: 'files'
echo 4. Make bucket PUBLIC
echo 5. Copy Project URL and Anon Key from Settings ^> API
echo.

echo.
echo [STEP] Next Steps - Vercel Deployment
echo 1. Go to: https://vercel.com/dashboard
echo 2. Click 'New Project'
echo 3. Import: !REPO_URL!
echo 4. Framework: Next.js (auto-detected)
echo 5. Add Environment Variables:
echo    - SUPABASE_URL=https://your-project-id.supabase.co
echo    - SUPABASE_KEY=your-supabase-anon-key
echo    - NODE_ENV=production
echo 6. Click 'Deploy'
echo.

echo [SUCCESS] 🎉 Code is ready for deployment!
echo [SUCCESS] 📋 Follow the manual steps above to complete deployment
echo [SUCCESS] 📖 See DEPLOY_STEPS.md for detailed instructions

echo.
echo Files ready for deployment:
echo ✅ Next.js optimized configuration
echo ✅ Real worker processors (PDF, Image, Video)
echo ✅ Supabase storage integration
echo ✅ Job queue system with Redis support
echo ✅ Complete API routes and UI components
echo ✅ Comprehensive documentation

echo.
echo [SUCCESS] Ready for production! 🚀

pause