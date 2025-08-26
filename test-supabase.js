#!/usr/bin/env node

/**
 * Supabase Storage Test Configuration
 * Validates and tests Supabase integration for OmniTools deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🗄️ Supabase Storage Test Configuration');
console.log('=======================================\n');

// Test configuration
const supabaseConfig = {
  requiredEnvVars: ['SUPABASE_URL', 'SUPABASE_KEY'],
  bucketName: 'files',
  testFiles: {
    small: 'test-file-small.txt',
    medium: 'test-file-medium.pdf',
    large: 'test-file-large.mp4'
  },
  policies: [
    'public_read_access',
    'authenticated_upload',
    'automatic_cleanup'
  ]
};

// Mock Supabase client for testing
class MockSupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
    this.storage = new MockStorage();
  }
}

class MockStorage {
  constructor() {
    this.buckets = new Map();
  }
  
  from(bucketName) {
    return new MockBucket(bucketName, this.buckets);
  }
}

class MockBucket {
  constructor(name, buckets) {
    this.name = name;
    this.buckets = buckets;
    if (!buckets.has(name)) {
      buckets.set(name, new Map());
    }
  }
  
  async upload(fileName, buffer, options = {}) {
    const bucket = this.buckets.get(this.name);
    bucket.set(fileName, {
      buffer,
      options,
      createdAt: new Date(),
      size: buffer.length
    });
    
    return {
      data: { path: fileName },
      error: null
    };
  }
  
  getPublicUrl(fileName) {
    return {
      data: {
        publicUrl: `https://mock-project.supabase.co/storage/v1/object/public/${this.name}/${fileName}`
      }
    };
  }
  
  async remove(fileNames) {
    const bucket = this.buckets.get(this.name);
    fileNames.forEach(fileName => bucket.delete(fileName));
    return { error: null };
  }
  
  async list(prefix = '', options = {}) {
    const bucket = this.buckets.get(this.name);
    const files = Array.from(bucket.entries()).map(([name, data]) => ({
      name,
      created_at: data.createdAt.toISOString(),
      updated_at: data.createdAt.toISOString(),
      size: data.size
    }));
    
    return {
      data: files.filter(f => f.name.startsWith(prefix)),
      error: null
    };
  }
}

// Test Results
let testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  total: 0
};

function logTest(testName, status, details = '') {
  testResults.total++;
  let emoji, colorStart = '', colorEnd = '';
  
  switch (status) {
    case 'PASS':
      emoji = '✅';
      testResults.passed++;
      break;
    case 'FAIL':
      emoji = '❌';
      testResults.failed++;
      break;
    case 'WARN':
      emoji = '⚠️';
      testResults.warnings++;
      break;
  }
  
  console.log(`${emoji} ${testName}: ${status}`);
  if (details) {
    console.log(`   ${details}`);
  }
}

// Validate storage integration code
function validateStorageIntegration() {
  console.log('🔍 Validating Storage Integration Code\n');
  
  const storageFile = 'lib/storage.ts';
  if (fs.existsSync(storageFile)) {
    logTest('Storage module exists', 'PASS', `Found: ${storageFile}`);
    
    const content = fs.readFileSync(storageFile, 'utf8');
    
    // Check required functions
    const requiredFunctions = [
      { name: 'saveFile', pattern: /export.*function saveFile|export.*saveFile.*=/ },
      { name: 'deleteFile', pattern: /export.*function deleteFile|export.*deleteFile.*=/ },
      { name: 'generateUniqueFileName', pattern: /export.*function generateUniqueFileName|export.*generateUniqueFileName.*=/ },
      { name: 'getContentType', pattern: /function getContentType|getContentType.*=/ }
    ];
    
    requiredFunctions.forEach(func => {
      if (func.pattern.test(content)) {
        logTest(`Storage ${func.name} function`, 'PASS');
      } else {
        logTest(`Storage ${func.name} function`, 'FAIL', `Missing: ${func.name}`);
      }
    });
    
    // Check Supabase integration
    const supabaseChecks = [
      { name: 'Supabase import', pattern: /@supabase\/supabase-js/ },
      { name: 'Client creation', pattern: /createClient/ },
      { name: 'Environment variables', pattern: /SUPABASE_URL.*SUPABASE_KEY/ },
      { name: 'Error handling', pattern: /throw.*Error|catch.*error/ }
    ];
    
    supabaseChecks.forEach(check => {
      if (check.pattern.test(content)) {
        logTest(`${check.name}`, 'PASS');
      } else {
        logTest(`${check.name}`, 'FAIL', `Missing: ${check.name}`);
      }
    });
    
  } else {
    logTest('Storage module exists', 'FAIL', `Missing: ${storageFile}`);
  }
}

// Test storage API endpoint
function testStorageAPI() {
  console.log('\n🔌 Testing Storage API Endpoints\n');
  
  const apiTests = [
    {
      name: 'Storage Test API',
      path: 'src/app/api/storage/test/route.ts',
      required: ['GET', 'supabase', 'test']
    },
    {
      name: 'Download API', 
      path: 'src/app/api/download/[filename]/route.ts',
      required: ['GET', 'params', 'filename']
    },
    {
      name: 'Cleanup API',
      path: 'src/app/api/cleanup/route.ts', 
      required: ['POST', 'cleanup', 'old']
    }
  ];
  
  apiTests.forEach(test => {
    if (fs.existsSync(test.path)) {
      logTest(`${test.name} exists`, 'PASS', `Found: ${test.path}`);
      
      const content = fs.readFileSync(test.path, 'utf8');
      test.required.forEach(req => {
        if (content.includes(req)) {
          logTest(`${test.name} ${req} support`, 'PASS');
        } else {
          logTest(`${test.name} ${req} support`, 'WARN', `Should include: ${req}`);
        }
      });
    } else {
      logTest(`${test.name} exists`, 'FAIL', `Missing: ${test.path}`);
    }
  });
}

// Mock Supabase functionality test
async function testSupabaseFunctionality() {
  console.log('\n🧪 Testing Supabase Functionality (Mock)\n');
  
  const mockClient = new MockSupabaseClient(
    'https://mock-project.supabase.co',
    'mock-anon-key'
  );
  
  try {
    // Test file upload
    const testBuffer = Buffer.from('test file content');
    const uploadResult = await mockClient.storage
      .from('files')
      .upload('test-file.txt', testBuffer);
    
    if (uploadResult.data && uploadResult.data.path) {
      logTest('File upload simulation', 'PASS', `Path: ${uploadResult.data.path}`);
    } else {
      logTest('File upload simulation', 'FAIL', 'No path returned');
    }
    
    // Test public URL generation
    const urlResult = mockClient.storage
      .from('files')
      .getPublicUrl('test-file.txt');
    
    if (urlResult.data && urlResult.data.publicUrl) {
      logTest('Public URL generation', 'PASS', urlResult.data.publicUrl);
    } else {
      logTest('Public URL generation', 'FAIL', 'No URL returned');
    }
    
    // Test file listing
    const listResult = await mockClient.storage
      .from('files')
      .list();
    
    if (listResult.data && Array.isArray(listResult.data)) {
      logTest('File listing simulation', 'PASS', `Found ${listResult.data.length} files`);
    } else {
      logTest('File listing simulation', 'FAIL', 'No data returned');
    }
    
    // Test file deletion
    const deleteResult = await mockClient.storage
      .from('files')
      .remove(['test-file.txt']);
    
    if (!deleteResult.error) {
      logTest('File deletion simulation', 'PASS', 'No errors');
    } else {
      logTest('File deletion simulation', 'FAIL', deleteResult.error);
    }
    
  } catch (error) {
    logTest('Supabase functionality test', 'FAIL', error.message);
  }
}

// Generate Supabase setup SQL
function generateSupabaseSQL() {
  console.log('\n📝 Supabase Setup SQL\n');
  
  const sql = `
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
`;
  
  // Write SQL to file
  fs.writeFileSync('supabase-setup.sql', sql.trim());
  logTest('Supabase SQL generated', 'PASS', 'File: supabase-setup.sql');
  
  console.log('📋 SQL Commands:');
  console.log(sql);
}

// Environment validation
function validateEnvironment() {
  console.log('\n🔧 Environment Configuration Validation\n');
  
  const envExample = '.env.example';
  if (fs.existsSync(envExample)) {
    const content = fs.readFileSync(envExample, 'utf8');
    
    supabaseConfig.requiredEnvVars.forEach(envVar => {
      if (content.includes(envVar)) {
        logTest(`${envVar} in environment template`, 'PASS');
      } else {
        logTest(`${envVar} in environment template`, 'FAIL', `Missing: ${envVar}`);
      }
    });
    
  } else {
    logTest('Environment template exists', 'FAIL', `Missing: ${envExample}`);
  }
  
  // Check for environment files
  const envFiles = ['.env.local', '.env.development', '.env.production.example'];
  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      logTest(`${file} exists`, 'PASS');
    } else {
      logTest(`${file} exists`, 'WARN', `Optional: ${file}`);
    }
  });
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Supabase Storage Testing...\n');
  
  validateStorageIntegration();
  testStorageAPI();
  await testSupabaseFunctionality();
  validateEnvironment();
  generateSupabaseSQL();
  
  // Final results
  console.log('\n📊 SUPABASE TEST RESULTS');
  console.log('=========================');
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`⚠️  Warnings: ${testResults.warnings}`);
  console.log(`Success Rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`);
  
  console.log('\n🔧 SUPABASE SETUP CHECKLIST');
  console.log('============================');
  
  const setupSteps = [
    'Create Supabase project at https://supabase.com',
    'Create storage bucket named "files"',
    'Set bucket to PUBLIC access',
    'Run SQL commands from supabase-setup.sql',
    'Copy Project URL from Settings > API',
    'Copy Anon Key from Settings > API',
    'Add environment variables to deployment'
  ];
  
  setupSteps.forEach((step, index) => {
    console.log(`${index + 1}. ${step}`);
  });
  
  console.log('\n🎯 NEXT STEPS');
  console.log('==============');
  console.log('1. Follow setup checklist above');
  console.log('2. Test storage with real Supabase credentials');
  console.log('3. Deploy to Vercel with environment variables');
  console.log('4. Monitor storage usage in Supabase dashboard');
  
  if (testResults.failed === 0) {
    console.log('\n🎉 Supabase integration is ready for deployment!');
  } else {
    console.log('\n⚠️ Fix failed tests before deploying to production.');
  }
  
  return testResults;
}

// Run if called directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, supabaseConfig };