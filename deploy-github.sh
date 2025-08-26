#!/bin/bash

echo ""
echo "🚀 OmniTools GitHub Deployment"
echo "==============================="
echo ""

echo "📋 STEP 1: Create GitHub Repository"
echo "-----------------------------------"
echo "Please follow these steps:"
echo "1. Go to: https://github.com/new"
echo "2. Repository name: omnitools-converter"
echo "3. Description: Professional file converter built with Next.js 14"
echo "4. Set to Public (recommended)"
echo "5. Do NOT initialize with README, .gitignore, or license"
echo "6. Click 'Create repository'"
echo ""

read -p "Enter your GitHub username: " USERNAME
echo ""

echo "📤 Setting up Git remote..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/$USERNAME/omnitools-converter.git

echo ""
echo "🔄 Checking git status..."
git status --short

echo ""
echo "📝 Adding any uncommitted files..."
git add .

echo ""
echo "💾 Creating commit if needed..."
git commit -m "Final deployment commit" 2>/dev/null || echo "No changes to commit"

echo ""
echo "🚀 Pushing to GitHub..."
git push -u origin master

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Push failed. Trying to rename branch to main..."
    git branch -m master main
    git push -u origin main
    
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ Still failed. Manual steps:"
        echo "1. Make sure you created the GitHub repository"
        echo "2. Check your GitHub username is correct: $USERNAME"
        echo "3. Ensure you have access to create the repository"
        echo "4. Try running: git push origin master --force"
        echo ""
        read -p "Press Enter to continue..."
        exit 1
    fi
fi

echo ""
echo "✅ Successfully pushed to GitHub!"
echo "📍 Repository URL: https://github.com/$USERNAME/omnitools-converter"
echo ""

echo "📋 STEP 2: Supabase Setup"
echo "-------------------------"
echo "Next, set up your Supabase project:"
echo "1. Go to: https://supabase.com/dashboard"
echo "2. Click 'New project'"
echo "3. Project name: omnitools-converter"
echo "4. Create a storage bucket named 'files' (public)"
echo "5. Copy your project URL and anon key"
echo ""

echo "📋 STEP 3: Vercel Deployment"
echo "---------------------------"
echo "Finally, deploy to Vercel:"
echo "1. Go to: https://vercel.com/dashboard"
echo "2. Import GitHub repository: omnitools-converter"
echo "3. Add environment variables:"
echo "   - SUPABASE_URL=https://your-project.supabase.co"
echo "   - SUPABASE_KEY=your-anon-key"
echo "   - NODE_ENV=production"
echo "4. Deploy!"
echo ""

echo "🎉 Deployment process started!"
echo "Repository: https://github.com/$USERNAME/omnitools-converter"
echo ""
read -p "Press Enter to continue..."