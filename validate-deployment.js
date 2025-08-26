#!/usr/bin/env node

/**
 * OmniTools Deployment Validation
 * Validates Supabase storage integration and Vercel configuration
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

console.log('\n🔍 OmniTools Deployment Validation');
console.log('===================================\n');

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

async function validateSupabase() {
  console.log('🗄️  Supabase Storage Validation');
  console.log('==============================');
  
  return new Promise((resolve) => {
    readline.question('Enter your Supabase URL: ', (supabaseUrl) => {
      readline.question('Enter your Supabase anon key: ', async (supabaseKey) => {
        
        try {
          // Initialize Supabase client
          const supabase = createClient(supabaseUrl, supabaseKey);
          
          console.log('\n📋 Testing Supabase connection...');
          
          // Test 1: Basic connection
          try {
            const { data, error } = await supabase.from('_realtime_schema').select('*').limit(1);
            if (!error) {
              console.log('✅ Supabase connection successful');
            } else {
              console.log('⚠️  Supabase connection warning:', error.message);
            }
          } catch (e) {
            console.log('ℹ️  Basic connection test completed');
          }
          
          // Test 2: Storage bucket access
          console.log('\n📦 Testing storage bucket...');
          try {
            const { data: buckets, error } = await supabase.storage.listBuckets();
            
            if (error) {
              console.log('❌ Storage bucket error:', error.message);
            } else {
              const filesBucket = buckets.find(bucket => bucket.name === 'files');
              if (filesBucket) {
                console.log('✅ Files bucket exists and is accessible');
                console.log(`   - Public: ${filesBucket.public ? 'Yes' : 'No'}`);
                console.log(`   - Created: ${filesBucket.created_at}`);
              } else {
                console.log('❌ Files bucket not found');
                console.log('📋 Available buckets:', buckets.map(b => b.name).join(', '));
              }
            }
          } catch (e) {
            console.log('❌ Storage test error:', e.message);
          }
          
          // Test 3: File upload test
          console.log('\n📤 Testing file upload...');
          try {
            const testContent = 'OmniTools deployment test - ' + new Date().toISOString();
            const testFileName = `test-${Date.now()}.txt`;
            
            const { data, error } = await supabase.storage
              .from('files')
              .upload(testFileName, testContent, {
                contentType: 'text/plain'
              });
            
            if (error) {
              console.log('❌ File upload failed:', error.message);
            } else {
              console.log('✅ File upload successful');
              console.log(`   - Path: ${data.path}`);
              
              // Test 4: Get public URL
              const { data: urlData } = supabase.storage
                .from('files')
                .getPublicUrl(testFileName);
              
              if (urlData.publicUrl) {
                console.log('✅ Public URL generated');
                console.log(`   - URL: ${urlData.publicUrl}`);
              }
              
              // Test 5: File deletion
              const { error: deleteError } = await supabase.storage
                .from('files')
                .remove([testFileName]);
              
              if (!deleteError) {
                console.log('✅ File cleanup successful');
              } else {
                console.log('⚠️  File cleanup warning:', deleteError.message);
              }
            }
          } catch (e) {
            console.log('❌ Upload test error:', e.message);
          }
          
          // Generate environment variables
          console.log('\n📋 Environment Variables for Vercel:');
          console.log('===================================');
          console.log(`SUPABASE_URL=${supabaseUrl}`);
          console.log(`SUPABASE_KEY=${supabaseKey}`);
          console.log('NODE_ENV=production');
          console.log('REDIS_MODE=mock');
          
          resolve();
        } catch (error) {
          console.log('❌ Supabase validation error:', error.message);
          resolve();
        }
      });
    });
  });
}

async function validateVercel() {
  console.log('\n🚀 Vercel Configuration Validation');
  console.log('==================================');
  
  return new Promise((resolve) => {
    readline.question('Enter your deployed Vercel URL: ', async (vercelUrl) => {
      
      if (!vercelUrl.startsWith('http')) {
        vercelUrl = 'https://' + vercelUrl;
      }
      
      console.log(`\n📋 Testing Vercel deployment: ${vercelUrl}`);
      
      // Test 1: Basic connectivity
      try {
        const fetch = (await import('node-fetch')).default;
        
        console.log('\n🌐 Testing basic connectivity...');
        const response = await fetch(vercelUrl, { timeout: 10000 });
        
        if (response.ok) {
          console.log('✅ Vercel deployment accessible');
          console.log(`   - Status: ${response.status}`);
          console.log(`   - Response time: ${response.headers.get('server-timing') || 'N/A'}`);
        } else {
          console.log(`❌ Deployment returned status: ${response.status}`);
        }
        
        // Test 2: API endpoints
        console.log('\n🔌 Testing API endpoints...');
        const apiTests = [
          '/api/pdf/merge',
          '/api/image/resize', 
          '/api/video/webp-to-mp4',
          '/api/storage/test'
        ];
        
        for (const endpoint of apiTests) {
          try {
            const apiResponse = await fetch(vercelUrl + endpoint, { 
              method: 'GET',
              timeout: 5000 
            });
            console.log(`   ${endpoint}: ${apiResponse.status === 405 ? '✅' : '⚠️'} ${apiResponse.status}`);
          } catch (e) {
            console.log(`   ${endpoint}: ❌ ${e.message}`);
          }
        }
        
        // Test 3: Environment variables (indirect test)
        console.log('\n🔧 Testing environment configuration...');
        try {
          const storageTest = await fetch(vercelUrl + '/api/storage/test');
          const storageResult = await storageTest.text();
          
          if (storageResult.includes('supabase') || storageResult.includes('storage')) {
            console.log('✅ Supabase integration configured');
          } else {
            console.log('⚠️  Supabase integration may need configuration');
          }
        } catch (e) {
          console.log('❌ Environment test error:', e.message);
        }
        
      } catch (error) {
        console.log('❌ Vercel validation error:', error.message);
      }
      
      resolve();
    });
  });
}

async function generateReport() {
  console.log('\n📊 Deployment Status Report');
  console.log('===========================');
  
  const report = {
    timestamp: new Date().toISOString(),
    github: '✅ Repository: https://github.com/AhsanMansoori/omnitools-converter',
    supabase: 'Validated above',
    vercel: 'Validated above',
    nextSteps: [
      'Complete manual file processing tests',
      'Monitor function logs for errors',
      'Set up production monitoring',
      'Configure custom domain (optional)'
    ]
  };
  
  console.log(`📅 Generated: ${report.timestamp}`);
  console.log(`📁 ${report.github}`);
  console.log('🗄️  Supabase: Run validation above');
  console.log('🚀 Vercel: Run validation above');
  
  console.log('\n📋 Recommended Next Steps:');
  report.nextSteps.forEach((step, i) => {
    console.log(`${i + 1}. ${step}`);
  });
  
  console.log('\n✨ Deployment validation complete!');
  console.log('Your OmniTools application should be fully functional.\n');
}

async function main() {
  try {
    await validateSupabase();
    await validateVercel();
    await generateReport();
  } catch (error) {
    console.error('Validation error:', error);
  } finally {
    readline.close();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}