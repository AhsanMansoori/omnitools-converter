# Supabase Storage Integration

## Overview

OmniTools integrates with Supabase Storage as an alternative to S3 for file storage and management. The system provides seamless file upload, download, and cleanup functionality with automatic URL generation for processed files.

## Components

### 1. Storage Helper (`lib/storage.ts`)

Core storage functions for file management:

- **`saveFile(fileName: string, buffer: Buffer)`** → Uploads file and returns public URL
- **`deleteFile(fileName: string)`** → Removes file from storage  
- **`generateUniqueFileName(originalName: string, suffix?: string)`** → Creates unique file names
- **`listFiles(limit?: number)`** → Lists files in storage bucket
- **`cleanupOldFiles(daysOld?: number)`** → Removes files older than specified days

### 2. Environment Configuration

Required environment variables in `.env.local`:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
```

### 3. API Routes

#### Download Files
```http
GET /api/download/{filename}
```
Proxies files from Supabase Storage with proper headers and content types.

#### Storage Testing  
```http
GET /api/storage/test
POST /api/storage/test
```
Test Supabase configuration and upload/delete functionality.

#### Cleanup Management
```http
GET /api/cleanup
POST /api/cleanup
```
List files and clean up old files from storage.

### 4. Processor Integration

File processors automatically use Supabase Storage in production mode:

```typescript
// Development: Mock files
if (isDevelopment) {
  const mockFile = this.createMockProcessedFile(...)
  return { success: true, outputFiles: [mockFile] }
}

// Production: Real Supabase Storage
const savedFile = await this.saveProcessedFile(filename, buffer, context)
return {
  success: true,
  outputFiles: [{
    name: savedFile.name,
    url: savedFile.url,  // Direct Supabase public URL
    size: savedFile.size,
    mimeType: 'application/pdf'
  }]
}
```

## Usage Examples

### 1. Save Processed File
```typescript
import { saveFile, generateUniqueFileName } from '@/lib/storage'

const processedBuffer = Buffer.from(processedContent)
const uniqueName = generateUniqueFileName('document.pdf', 'converted')
const publicUrl = await saveFile(uniqueName, processedBuffer)

console.log('File available at:', publicUrl)
```

### 2. Test Storage Connection
```bash
# Check configuration
curl http://localhost:3000/api/storage/test

# Test file upload
curl -X POST http://localhost:3000/api/storage/test \
  -H "Content-Type: application/json" \
  -d '{"action": "upload", "fileName": "test.txt", "content": "Hello World!"}'
```

### 3. Clean Up Old Files
```bash
# List files
curl http://localhost:3000/api/cleanup

# Delete files older than 1 day
curl -X POST http://localhost:3000/api/cleanup \
  -H "Content-Type: application/json" \
  -d '{"action": "cleanup", "daysOld": 1}'
```

## Supabase Setup

### 1. Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Create new project
3. Note your Project URL and API Key

### 2. Create Storage Bucket
```sql
-- Create 'files' bucket (run in Supabase SQL Editor)
INSERT INTO storage.buckets (id, name, public)
VALUES ('files', 'files', true);
```

### 3. Set Storage Policies
```sql
-- Allow public access to files bucket
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'files');

CREATE POLICY "Enable insert for all users" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'files');

CREATE POLICY "Enable delete for all users" ON storage.objects
FOR DELETE USING (bucket_id = 'files');
```

### 4. Environment Configuration
Update `.env.local` with your Supabase credentials:

```env
SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## File Flow

### Upload Process
1. **Job Processing** → Processor generates processed file buffer
2. **Storage Upload** → `saveFile()` uploads to Supabase with unique name
3. **URL Generation** → Supabase returns public URL
4. **Job Result** → URL included in job response for download

### Download Process  
1. **User Request** → `/api/download/{filename}`
2. **Storage Fetch** → Download file from Supabase
3. **Response** → Stream file with appropriate headers

### Cleanup Process
1. **Scheduled/Manual** → Call cleanup API
2. **File Listing** → Get files older than threshold
3. **Batch Delete** → Remove old files from storage

## Development vs Production

### Development Mode
- Uses mock files for testing
- No actual Supabase calls
- Returns placeholder URLs
- Enabled when `REDIS_MODE=mock` or `NODE_ENV=development`

### Production Mode  
- Real Supabase Storage integration
- Actual file upload/download
- Public URLs from Supabase CDN
- Automatic file cleanup

## Error Handling

The system includes comprehensive error handling:

```typescript
try {
  const publicUrl = await saveFile(fileName, buffer)
  return { success: true, url: publicUrl }
} catch (error) {
  console.error('Storage error:', error)
  return { success: false, error: error.message }
}
```

Common errors:
- **Missing Config**: `SUPABASE_URL` or `SUPABASE_KEY` not set
- **Upload Failed**: Network issues or invalid bucket
- **File Not Found**: Download of non-existent file
- **Access Denied**: Incorrect permissions or policies

## Security Considerations

1. **Public Bucket**: Files are publicly accessible via URL
2. **Auto Cleanup**: Files automatically deleted after 24 hours
3. **Unique Names**: Prevents file conflicts with timestamps + random IDs
4. **Content-Type**: Proper MIME types set based on file extensions
5. **Size Limits**: Configurable limits per tool type

## Testing

Test the storage system:

```bash
# 1. Check configuration
npm run dev
curl http://localhost:3000/api/storage/test

# 2. Test job with storage
curl -X POST http://localhost:3000/api/jobs/test \
  -H "Content-Type: application/json" \
  -d '{"toolId": "pdf-to-word"}'

# 3. Check job result URL
curl http://localhost:3000/api/jobs/{jobId}
```

The storage system is fully integrated with the job processing pipeline and provides reliable file management for the OmniTools platform.