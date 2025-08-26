#!/usr/bin/env node

/**
 * OmniTools Live Deployment Testing
 * Automated testing of deployed application
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const FormData = require('form-data');

console.log('\n🧪 OmniTools Live Deployment Testing');
console.log('====================================\n');

// Get deployment URL from user
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('Enter your deployed app URL (e.g., https://omnitools-converter.vercel.app): ', async (url) => {
  readline.close();
  
  if (!url.startsWith('http')) {
    url = 'https://' + url;
  }
  
  console.log(`\n🎯 Testing deployment at: ${url}\n`);
  
  const tests = [];
  let passedTests = 0;
  let totalTests = 0;
  
  // Helper function to make HTTP requests
  function makeRequest(endpoint, method = 'GET', data = null) {
    return new Promise((resolve) => {
      const urlObj = new URL(url + endpoint);
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname,
        method: method,
        timeout: 30000,
        headers: {
          'User-Agent': 'OmniTools-Test/1.0'
        }
      };
      
      if (data) {
        options.headers['Content-Type'] = 'application/json';
        options.headers['Content-Length'] = Buffer.byteLength(data);
      }
      
      const client = urlObj.protocol === 'https:' ? https : http;
      
      const req = client.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        });
      });
      
      req.on('error', (error) => {
        resolve({ error: error.message });
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve({ error: 'Request timeout' });
      });
      
      if (data) {
        req.write(data);
      }
      
      req.end();
    });
  }
  
  // Test function
  async function runTest(name, testFn) {
    totalTests++;
    process.stdout.write(`📋 ${name}... `);
    
    try {
      const result = await testFn();
      if (result) {
        console.log('✅ PASS');
        passedTests++;
        return true;
      } else {
        console.log('❌ FAIL');
        return false;
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      return false;
    }
  }
  
  console.log('🏠 Basic Connectivity Tests');
  console.log('===========================');
  
  // Test 1: Homepage loads
  await runTest('Homepage loads', async () => {
    const response = await makeRequest('/');
    return response.statusCode === 200 && !response.error;
  });
  
  // Test 2: API health check
  await runTest('API endpoints accessible', async () => {
    const response = await makeRequest('/api/jobs/test');
    return response.statusCode && !response.error;
  });
  
  // Test 3: Tools page loads
  await runTest('Tools page loads', async () => {
    const response = await makeRequest('/tools');
    return response.statusCode === 200 && !response.error;
  });
  
  console.log('\n🔧 Tool Page Tests');
  console.log('==================');
  
  // Test 4: PDF merge page
  await runTest('PDF merge tool page', async () => {
    const response = await makeRequest('/tools/pdf-merge');
    return response.statusCode === 200 && !response.error;
  });
  
  // Test 5: Image resize page
  await runTest('Image resize tool page', async () => {
    const response = await makeRequest('/tools/image-resize');
    return response.statusCode === 200 && !response.error;
  });
  
  // Test 6: WebP to MP4 page
  await runTest('WebP to MP4 tool page', async () => {
    const response = await makeRequest('/tools/webp-to-mp4');
    return response.statusCode === 200 && !response.error;
  });
  
  // Test 7: Background removal page
  await runTest('Background removal page', async () => {
    const response = await makeRequest('/tools/image-bg-remove');
    return response.statusCode === 200 && !response.error;
  });
  
  console.log('\n🌐 API Endpoint Tests');
  console.log('====================');
  
  // Test 8: PDF merge API endpoint
  await runTest('PDF merge API responds', async () => {
    const response = await makeRequest('/api/pdf/merge', 'GET');
    return response.statusCode === 405; // Should return Method Not Allowed for GET
  });
  
  // Test 9: Image resize API endpoint
  await runTest('Image resize API responds', async () => {
    const response = await makeRequest('/api/image/resize', 'GET');
    return response.statusCode === 405; // Should return Method Not Allowed for GET
  });
  
  // Test 10: Video conversion API endpoint
  await runTest('Video conversion API responds', async () => {
    const response = await makeRequest('/api/video/webp-to-mp4', 'GET');
    return response.statusCode === 405; // Should return Method Not Allowed for GET
  });
  
  console.log('\n📊 Supabase Integration Tests');
  console.log('=============================');
  
  // Test 11: Storage test endpoint
  await runTest('Supabase storage test', async () => {
    const response = await makeRequest('/api/storage/test');
    return response.statusCode && !response.error;
  });
  
  console.log('\n🎨 UI Component Tests');
  console.log('=====================');
  
  // Test 12: Theme functionality (check for theme CSS)
  await runTest('Theme system working', async () => {
    const response = await makeRequest('/');
    return response.data.includes('dark') || response.data.includes('theme');
  });
  
  // Test 13: Navigation functionality
  await runTest('Navigation components', async () => {
    const response = await makeRequest('/');
    return response.data.includes('Tools') && response.data.includes('FAQ');
  });
  
  console.log('\n📱 Mobile Responsiveness');
  console.log('=======================');
  
  // Test 14: Mobile viewport meta tag
  await runTest('Mobile viewport configured', async () => {
    const response = await makeRequest('/');
    return response.data.includes('viewport') && response.data.includes('mobile');
  });
  
  console.log('\n🔒 Security Tests');
  console.log('================');
  
  // Test 15: Security headers
  await runTest('Security headers present', async () => {
    const response = await makeRequest('/');
    return response.headers && (
      response.headers['x-frame-options'] || 
      response.headers['content-security-policy'] ||
      response.headers['x-content-type-options']
    );
  });
  
  console.log('\n⚡ Performance Tests');
  console.log('===================');
  
  // Test 16: Page load time
  await runTest('Homepage loads quickly (<3s)', async () => {
    const startTime = Date.now();
    const response = await makeRequest('/');
    const loadTime = Date.now() - startTime;
    console.log(`    (Load time: ${loadTime}ms)`);
    return loadTime < 3000 && response.statusCode === 200;
  });
  
  console.log('\n📊 Test Results Summary');
  console.log('=======================');
  
  const successRate = Math.round((passedTests / totalTests) * 100);
  
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests (${successRate}%)`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests} tests`);
  
  if (successRate >= 90) {
    console.log('\n🎉 Excellent! Your deployment is working great!');
  } else if (successRate >= 70) {
    console.log('\n⚠️  Good deployment, but some issues need attention.');
  } else {
    console.log('\n🚨 Deployment has significant issues that need fixing.');
  }
  
  console.log('\n🔗 Useful Links:');
  console.log(`📱 Live App: ${url}`);
  console.log(`📊 Vercel Dashboard: https://vercel.com/dashboard`);
  console.log(`🗄️  Supabase Dashboard: https://supabase.com/dashboard`);
  
  console.log('\n📋 Manual Testing Checklist:');
  console.log('□ Upload and merge PDF files');
  console.log('□ Resize and convert images');
  console.log('□ Convert WebP to MP4');
  console.log('□ Remove image backgrounds');
  console.log('□ Verify files are stored in Supabase');
  console.log('□ Check file cleanup after 24 hours');
  console.log('□ Test on mobile devices');
  console.log('□ Verify theme switching works');
  
  console.log('\n✨ Deployment testing complete!\n');
});