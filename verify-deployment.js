#!/usr/bin/env node

/**
 * Pre-deployment verification script
 * Checks that all components are ready for production deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 OmniTools Pre-Deployment Verification');
console.log('========================================\n');

let allChecksPass = true;

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✅' : '❌'} ${description}: ${filePath}`);
  if (!exists) allChecksPass = false;
  return exists;
}

function checkFileContent(filePath, searchText, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const hasContent = content.includes(searchText);
    console.log(`${hasContent ? '✅' : '❌'} ${description}`);
    if (!hasContent) allChecksPass = false;
    return hasContent;
  } catch (error) {
    console.log(`❌ ${description}: File not found`);
    allChecksPass = false;
    return false;
  }
}

// 1. Essential files check
console.log('📁 Essential Files:');
checkFile('package.json', 'Package configuration');
checkFile('next.config.mjs', 'Next.js configuration');
checkFile('.env.example', 'Environment template');
checkFile('README.md', 'Documentation');

// 2. Worker processors check
console.log('\n🔧 Worker Processors:');
checkFile('worker/index.ts', 'Worker main file');
checkFile('worker/processors/pdfMerge.ts', 'PDF merge processor');
checkFile('worker/processors/imageResize.ts', 'Image resize processor');
checkFile('worker/processors/videoConvert.ts', 'Video convert processor');

// 3. API endpoints check
console.log('\n🌐 API Endpoints:');
checkFile('src/app/api/pdf/merge/route.ts', 'PDF merge API');
checkFile('src/app/api/image/resize/route.ts', 'Image resize API');
checkFile('src/app/api/video/webp-to-mp4/route.ts', 'Video convert API');

// 4. Essential dependencies check
console.log('\n📦 Dependencies:');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = [
  'next', 'react', 'react-dom', '@supabase/supabase-js', 
  'sharp', 'bullmq', 'ioredis', 'tailwindcss'
];

requiredDeps.forEach(dep => {
  const hasExternal = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];
  console.log(`${hasExternal ? '✅' : '❌'} ${dep}: ${hasExternal || 'Missing'}`);
  if (!hasExternal) allChecksPass = false;
});

// 5. Configuration checks
console.log('\n⚙️  Configuration:');
checkFileContent('next.config.mjs', 'supabase.co', 'Supabase domain configured');
checkFileContent('worker/index.ts', "console.log('ready')", 'Worker ready message');
checkFileContent('package.json', '"build": "next build"', 'Build script configured');

// 6. Git status
console.log('\n📝 Git Status:');
try {
  const { execSync } = require('child_process');
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  if (gitStatus.trim()) {
    console.log('⚠️  Uncommitted changes detected');
    console.log('📋 Run: git add . && git commit -m "Final deployment prep"');
  } else {
    console.log('✅ All changes committed');
  }
} catch (error) {
  console.log('❌ Git not initialized or available');
  allChecksPass = false;
}

// 7. Build test
console.log('\n🏗️  Build Test:');
try {
  const { execSync } = require('child_process');
  console.log('🔨 Running production build...');
  execSync('npm run build', { stdio: 'pipe' });
  console.log('✅ Production build successful');
} catch (error) {
  console.log('❌ Production build failed');
  console.log('📋 Run: npm run build');
  allChecksPass = false;
}

// Summary
console.log('\n📊 Verification Summary');
console.log('======================');

if (allChecksPass) {
  console.log('🎉 All checks passed! Ready for deployment.');
  console.log('\n🚀 Next steps:');
  console.log('1. Run: node deploy-assistant.js');
  console.log('2. Follow the guided deployment process');
} else {
  console.log('⚠️  Some checks failed. Please fix the issues above before deploying.');
  console.log('\n🔧 Common fixes:');
  console.log('• Run: npm install');
  console.log('• Run: git add . && git commit -m "Fix deployment issues"');
  console.log('• Check file paths and content');
}

process.exit(allChecksPass ? 0 : 1);