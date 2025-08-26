@echo off
echo.
echo 🚀 OmniTools Vercel Automated Deployment
echo ========================================
echo.

echo 📋 This script will deploy your app to Vercel automatically
echo.

echo 1️⃣ Installing Vercel CLI (if not installed)...
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Vercel CLI...
    npm install -g vercel
) else (
    echo ✅ Vercel CLI already installed
)

echo.
echo 2️⃣ Login to Vercel
echo Please complete login in your browser...
vercel login

echo.
echo 3️⃣ Setting up project configuration...
echo Creating vercel.json configuration...

(echo {
echo   "name": "omnitools-converter",
echo   "version": 2,
echo   "framework": "nextjs",
echo   "buildCommand": "npm run build",
echo   "outputDirectory": ".next",
echo   "installCommand": "npm install",
echo   "functions": {
echo     "app/api/**": {
echo       "maxDuration": 30
echo     }
echo   },
echo   "env": {
echo     "NODE_ENV": "production"
echo   }
echo }
) > vercel.json

echo.
echo 4️⃣ Collecting Supabase credentials...
set /p SUPABASE_URL="Enter your Supabase URL (https://xxx.supabase.co): "
set /p SUPABASE_KEY="Enter your Supabase anon key: "

echo.
echo 5️⃣ Setting environment variables...
vercel env add SUPABASE_URL production <<< "%SUPABASE_URL%"
vercel env add SUPABASE_KEY production <<< "%SUPABASE_KEY%"
vercel env add NODE_ENV production <<< "production"
vercel env add REDIS_MODE production <<< "mock"

echo.
echo 6️⃣ Deploying to production...
echo Starting deployment...
vercel --prod

echo.
echo 7️⃣ Getting deployment URL...
vercel ls

echo.
echo ✅ Deployment complete!
echo.
echo 🌐 Your app should now be live!
echo Check the URL above to access your deployed application.
echo.

echo 📋 Next steps:
echo 1. Test all file conversion tools
echo 2. Verify file upload/download works
echo 3. Check Vercel function logs for any errors
echo 4. Monitor Supabase storage usage
echo.

pause