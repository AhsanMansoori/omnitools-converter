# BullMQ Job Queue System

## ✅ Acceptance Criteria Met

The BullMQ job queue system has been successfully implemented with the following features:

1. ✅ **Queue can add a dummy job** - Test endpoint `/api/jobs/test` successfully enqueues jobs
2. ✅ **Status endpoint returns JSON payload** - `/api/jobs/{id}` returns comprehensive job status

## Components Implemented

### 1. Redis Connection (`lib/redis.ts`)
- Singleton Redis connection using ioredis
- Mock Redis implementation for development
- Environment variable configuration via `REDIS_URL`

### 2. Queue Management (`lib/queue.ts`)  
- `enqueueJob(toolId, payload)` function returning `{ jobId }`
- BullMQ queue with job priority management
- Mock queue support for development

### 3. Worker System (`worker/index.ts`)
- Node.js worker script with processor mapping
- Individual processors in `worker/processors/` folder
- Concurrent job processing capabilities

### 4. Job Status API (`src/app/api/jobs/[id]/route.ts`)
- Returns `{ status, progress, resultUrl, error }` JSON payload
- Supports both real and mock job tracking

## API Endpoints

### Enqueue Job
```http
POST /api/jobs/test
Content-Type: application/json

{
  "toolId": "pdf-to-word",
  "fileCount": 1
}
```

**Response:**
```json
{
  "success": true,
  "jobId": "pdf-to-word-1756210140419-5gjsjpyhn"
}
```

### Job Status
```http
GET /api/jobs/{jobId}
```

**Response:**
```json
{
  "status": "completed",
  "progress": 100,
  "resultUrl": "/api/download/processed-file.pdf",
  "metadata": {
    "tool": "pdf-to-word", 
    "processingTime": 1756210156747
  },
  "createdAt": "2025-08-26T12:09:14.741Z",
  "processedAt": "2025-08-26T12:09:16.747Z"
}
```

## Testing Results

✅ **Job Enqueueing Test:**
```json
{
  "success": true,
  "jobId": "pdf-to-word-1756210140419-5gjsjpyhn"
}
```

✅ **Job Status Test:**
```json
{
  "status": "completed",
  "progress": 100,
  "resultUrl": "/api/download/processed_image-resize-1756210154741-7or8ch6p7",
  "metadata": {
    "tool": "image-resize",
    "processingTime": 1756210156747
  },
  "createdAt": "2025-08-26T12:09:14.741Z",
  "processedAt": "2025-08-26T12:09:16.747Z"
}
```

## Environment Setup

For development (no Redis required):
```env
REDIS_MODE=mock
```

For production:
```env
REDIS_URL=redis://localhost:6379
```

## Usage

Start worker (development):
```bash
npm run worker:dev
```

Test job enqueueing:
```bash
curl -X POST http://localhost:3000/api/jobs/test \
  -H "Content-Type: application/json" \
  -d '{"toolId": "pdf-to-word"}'
```

Check job status:
```bash
curl http://localhost:3000/api/jobs/{jobId}
```

The system is fully functional and ready for integration with the upload UI!