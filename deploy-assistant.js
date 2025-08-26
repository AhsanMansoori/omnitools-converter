#!/usr/bin/env node

/**
 * OmniTools Deployment Assistant
 * 
 * This script guides you through the remaining deployment steps that require
 * manual action with external services (GitHub, Supabase, Vercel).
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n🚀 OmniTools Deployment Assistant');
console.log('===================================\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json') || !fs.existsSync('next.config.mjs')) {
  console.error('❌ Please run this script from the omnitools project root directory');
  process.exit(1);
}

console.log('✅ Project structure verified');

// Step 1: GitHub Repository Setup
console.log('\n📁 STEP 1: GitHub Repository Setup');
console.log('==================================');

console.log('\n🔗 Please follow these steps manually:');
console.log('1. Go to: https://github.com/new');
console.log('2. Repository name: omnitools-converter');
console.log('3. Description: Professional file converter built with Next.js 14');
console.log('4. Set to Public (recommended) or Private');
console.log('5. Do NOT initialize with README, .gitignore, or license');
console.log('6. Click "Create repository"');

console.log('\n⏳ After creating the repository, come back here and press ENTER to continue...');
require('child_process').spawnSync('pause', {shell: true, stdio: [0, 1, 2]});

// Check git status
try {
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  if (gitStatus.trim()) {
    console.log('\n📝 Committing any remaining changes...');
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Final deployment preparation"', { stdio: 'inherit' });
  }
} catch (error) {
  console.log('ℹ️  No changes to commit');
}

console.log('\n🚀 Ready to push to GitHub!');
console.log('\nPlease enter your GitHub username:');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('GitHub username: ', (username) => {
  readline.close();
  
  const repoUrl = `https://github.com/${username}/omnitools-converter.git`;
  
  console.log(`\n📤 Pushing to: ${repoUrl}`);
  
  try {
    // Add remote origin
    try {
      execSync(`git remote add origin ${repoUrl}`, { stdio: 'inherit' });
    } catch (error) {
      console.log('ℹ️  Remote origin already exists, updating...');
      execSync(`git remote set-url origin ${repoUrl}`, { stdio: 'inherit' });
    }
    
    // Push to GitHub
    execSync('git push -u origin main', { stdio: 'inherit' });
    console.log('\n✅ Successfully pushed to GitHub!');
    
    // Step 2: Supabase Setup
    console.log('\n🗄️  STEP 2: Supabase Project Setup');
    console.log('=================================');
    
    console.log('\n🔗 Please follow these steps:');
    console.log('1. Go to: https://supabase.com/dashboard');
    console.log('2. Click "New project"');
    console.log('3. Choose your organization');
    console.log('4. Project name: omnitools-converter');
    console.log('5. Database password: (choose a strong password)');
    console.log('6. Region: (choose closest to your users)');
    console.log('7. Click "Create new project"');
    console.log('8. Wait for project creation (2-3 minutes)');
    
    console.log('\n📦 After project creation:');
    console.log('1. Go to Storage > Buckets');
    console.log('2. Click "Create bucket"');
    console.log('3. Name: files');
    console.log('4. Public bucket: ✅ (checked)');
    console.log('5. Click "Create bucket"');
    
    console.log('\n🔑 Get your credentials:');
    console.log('1. Go to Settings > API');
    console.log('2. Copy "Project URL"');
    console.log('3. Copy "anon public" key');
    
    console.log('\n⏳ After setting up Supabase, press ENTER to continue...');
    require('child_process').spawnSync('pause', {shell: true, stdio: [0, 1, 2]});
    
    // Step 3: Vercel Deployment
    console.log('\n🌐 STEP 3: Vercel Deployment');
    console.log('===========================');
    
    console.log('\n🔗 Please follow these steps:');
    console.log('1. Go to: https://vercel.com/dashboard');
    console.log('2. Click "Add New..." > "Project"');
    console.log('3. Import from GitHub: omnitools-converter');
    console.log('4. Framework Preset: Next.js');
    console.log('5. Build Command: npm run build');
    console.log('6. Output Directory: .next');
    console.log('7. Install Command: npm install');
    
    console.log('\n🔧 Environment Variables (add these in Vercel):');
    console.log('SUPABASE_URL=https://your-project-id.supabase.co');
    console.log('SUPABASE_KEY=your-supabase-anon-key');
    console.log('NODE_ENV=production');
    
    console.log('\n🚀 Deploy steps:');
    console.log('1. Click "Deploy"');
    console.log('2. Wait for deployment (2-3 minutes)');
    console.log('3. Visit your live URL');
    console.log('4. Test file conversion tools');
    
    console.log('\n✅ Deployment Complete!');
    console.log('======================');
    console.log('\n🎉 Your OmniTools application should now be live!');
    console.log('\n📋 Post-deployment checklist:');
    console.log('□ Test PDF merge functionality');
    console.log('□ Test image resize/format conversion');
    console.log('□ Test video conversion (WebP to MP4)');
    console.log('□ Verify file storage in Supabase');
    console.log('□ Check Vercel function logs for any errors');
    
    console.log('\n📊 Monitoring:');
    console.log('• Vercel Dashboard: Monitor deployments and functions');
    console.log('• Supabase Dashboard: Monitor storage usage and API calls');
    
    console.log('\n🔗 Useful links:');
    console.log(`• GitHub Repo: ${repoUrl}`);
    console.log('• Vercel Dashboard: https://vercel.com/dashboard');
    console.log('• Supabase Dashboard: https://supabase.com/dashboard');
    
  } catch (error) {
    console.error('\n❌ Error pushing to GitHub:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure you created the GitHub repository');
    console.log('2. Check your Git credentials');
    console.log('3. Try: git push origin main --force');
    process.exit(1);
  }
});