#!/bin/bash

# 🚀 OmniTools Deployment Script
# Run this after creating GitHub repository and Supabase project

echo "🚀 OmniTools Deployment Script"
echo "==============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_error "Git repository not initialized!"
    exit 1
fi

print_step "Checking project status..."

# Check if build passes
if npm run build; then
    print_success "Build passes ✅"
else
    print_error "Build failed! Fix issues before deploying."
    exit 1
fi

print_step "Checking environment files..."
if [ -f ".env.example" ]; then
    print_success "Environment template exists ✅"
else
    print_warning "No .env.example found"
fi

# Get GitHub repository URL from user
echo ""
print_step "GitHub Repository Setup"
echo "1. Go to: https://github.com/new"
echo "2. Repository name: omnitools-converter"
echo "3. Keep it Private"
echo "4. DO NOT initialize with README"
echo "5. Click 'Create repository'"
echo ""

read -p "Enter your GitHub username: " GITHUB_USERNAME
if [ -z "$GITHUB_USERNAME" ]; then
    print_error "GitHub username is required!"
    exit 1
fi

REPO_URL="https://github.com/$GITHUB_USERNAME/omnitools-converter.git"

print_step "Adding GitHub remote..."
git remote remove origin 2>/dev/null || true
git remote add origin $REPO_URL

print_step "Pushing to GitHub..."
if git push -u origin master; then
    print_success "Code pushed to GitHub ✅"
    print_success "Repository: $REPO_URL"
else
    print_error "Failed to push to GitHub. Make sure the repository exists!"
    exit 1
fi

echo ""
print_step "Next Steps - Supabase Setup"
echo "1. Go to: https://supabase.com"
echo "2. Create new project: 'omnitools-storage'"
echo "3. Go to Storage > Create bucket: 'files'"
echo "4. Make bucket PUBLIC"
echo "5. Copy Project URL and Anon Key from Settings > API"
echo ""

echo ""
print_step "Next Steps - Vercel Deployment"
echo "1. Go to: https://vercel.com/dashboard"
echo "2. Click 'New Project'"
echo "3. Import: $REPO_URL"
echo "4. Framework: Next.js (auto-detected)"
echo "5. Add Environment Variables:"
echo "   - SUPABASE_URL=https://your-project-id.supabase.co"
echo "   - SUPABASE_KEY=your-supabase-anon-key"
echo "   - NODE_ENV=production"
echo "6. Click 'Deploy'"
echo ""

print_success "🎉 Code is ready for deployment!"
print_success "📋 Follow the manual steps above to complete deployment"
print_success "📖 See DEPLOY_STEPS.md for detailed instructions"

echo ""
echo "Files ready for deployment:"
echo "✅ Next.js optimized configuration"
echo "✅ Real worker processors (PDF, Image, Video)"
echo "✅ Supabase storage integration"
echo "✅ Job queue system with Redis support"
echo "✅ Complete API routes and UI components"
echo "✅ Comprehensive documentation"
echo ""
echo "Total files committed: $(git ls-files | wc -l)"
echo "Repository size: $(du -sh .git | cut -f1)"
echo ""
print_success "Ready for production! 🚀"