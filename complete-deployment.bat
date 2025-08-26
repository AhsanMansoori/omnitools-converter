@echo off
echo.
echo 🎯 OmniTools Complete Deployment Orchestrator
echo =============================================
echo.

echo This script will guide you through the complete deployment process.
echo Make sure you have accounts for GitHub, Supabase, and Vercel.
echo.

echo 📋 Deployment Checklist:
echo ✅ 1. GitHub Repository - COMPLETED
echo ⏳ 2. Supabase Project Setup
echo ⏳ 3. Vercel Deployment  
echo ⏳ 4. Live Testing
echo ⏳ 5. Final Validation
echo.

set /p continue="Ready to continue? (y/n): "
if /i "%continue%" neq "y" (
    echo Deployment cancelled.
    pause
    exit /b
)

echo.
echo 🗄️ STEP 1: Supabase Setup
echo =========================
echo.
echo Running Supabase setup automation...
call setup-supabase.bat

if %errorlevel% neq 0 (
    echo ❌ Supabase setup failed. Please check the errors above.
    pause
    exit /b 1
)

echo.
echo ✅ Supabase setup completed!
echo.

echo 🚀 STEP 2: Vercel Deployment
echo ============================
echo.
echo Running Vercel deployment automation...
call deploy-vercel.bat

if %errorlevel% neq 0 (
    echo ❌ Vercel deployment failed. Please check the errors above.
    pause
    exit /b 1
)

echo.
echo ✅ Vercel deployment completed!
echo.

echo 🧪 STEP 3: Live Testing
echo =======================
echo.
echo Running automated live tests...
node test-deployment.js

echo.
echo 🔍 STEP 4: Deployment Validation
echo ===============================
echo.
echo Running comprehensive validation...
node validate-deployment.js

echo.
echo 🎉 DEPLOYMENT COMPLETE!
echo ======================
echo.

echo 📊 Final Status:
echo ✅ GitHub Repository: https://github.com/AhsanMansoori/omnitools-converter
echo ✅ Supabase Project: Configured with storage bucket
echo ✅ Vercel Deployment: Live and tested
echo ✅ All Tests: Completed
echo.

echo 📱 Your OmniTools application is now live!
echo.

echo 📋 Manual Testing Checklist:
echo □ Test PDF merge functionality
echo □ Test image resize and conversion  
echo □ Test WebP to MP4 conversion
echo □ Test background removal tool
echo □ Verify file storage works
echo □ Check file cleanup after 24 hours
echo □ Test on mobile devices
echo.

echo 🔗 Important Links:
echo • Live App: [Your Vercel URL from above]
echo • GitHub: https://github.com/AhsanMansoori/omnitools-converter
echo • Vercel Dashboard: https://vercel.com/dashboard
echo • Supabase Dashboard: https://supabase.com/dashboard
echo.

echo 📞 Support:
echo • Documentation: README.md and DEPLOYMENT.md
echo • Troubleshooting: vercel-deploy.md
echo • Configuration: .env.example
echo.

echo ✨ Congratulations! Your deployment is complete!
echo.
pause