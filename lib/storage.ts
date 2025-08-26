import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Supabase client instance
let supabase: SupabaseClient | null = null

/**
 * Initialize Supabase client
 */
function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_KEY environment variables.')
    }

    supabase = createClient(supabaseUrl, supabaseKey)
    console.log('Supabase client initialized')
  }

  return supabase
}

/**
 * Upload file to Supabase Storage and return public URL
 * @param fileName - Name of the file to save
 * @param buffer - File content as Buffer
 * @returns Promise resolving to public URL of the uploaded file
 */
export async function saveFile(fileName: string, buffer: Buffer): Promise<string> {
  try {
    const supabaseClient = getSupabaseClient()
    const bucketName = 'files'
    
    // Generate unique file path to avoid conflicts
    const timestamp = Date.now()
    const uniqueFileName = `${timestamp}-${fileName}`
    
    console.log(`Uploading file: ${uniqueFileName} (${buffer.length} bytes)`)
    
    // Upload file to Supabase Storage
    const { data, error } = await supabaseClient.storage
      .from(bucketName)
      .upload(uniqueFileName, buffer, {
        contentType: getContentType(fileName),
        cacheControl: '3600', // Cache for 1 hour
        upsert: false // Don't overwrite existing files
      })

    if (error) {
      console.error('Supabase upload error:', error)
      throw new Error(`Failed to upload file: ${error.message}`)
    }

    if (!data || !data.path) {
      throw new Error('Upload successful but no file path returned')
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabaseClient.storage
      .from(bucketName)
      .getPublicUrl(data.path)

    if (!urlData || !urlData.publicUrl) {
      throw new Error('Failed to generate public URL for uploaded file')
    }

    console.log(`✓ File uploaded successfully: ${urlData.publicUrl}`)
    return urlData.publicUrl

  } catch (error) {
    console.error('Error in saveFile:', error)
    throw error instanceof Error ? error : new Error('Unknown error occurred during file upload')
  }
}

/**
 * Delete file from Supabase Storage
 * @param fileName - Name of the file to delete
 * @returns Promise resolving to true if successful
 */
export async function deleteFile(fileName: string): Promise<boolean> {
  try {
    const supabaseClient = getSupabaseClient()
    const bucketName = 'files'
    
    console.log(`Deleting file: ${fileName}`)
    
    // Delete file from Supabase Storage
    const { error } = await supabaseClient.storage
      .from(bucketName)
      .remove([fileName])

    if (error) {
      console.error('Supabase delete error:', error)
      throw new Error(`Failed to delete file: ${error.message}`)
    }

    console.log(`✓ File deleted successfully: ${fileName}`)
    return true

  } catch (error) {
    console.error('Error in deleteFile:', error)
    throw error instanceof Error ? error : new Error('Unknown error occurred during file deletion')
  }
}

/**
 * Get content type based on file extension
 */
function getContentType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase()
  
  const mimeTypes: Record<string, string> = {
    // Document types
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'txt': 'text/plain',
    
    // Image types
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'bmp': 'image/bmp',
    'tiff': 'image/tiff',
    'tif': 'image/tiff',
    
    // Video types
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'wmv': 'video/x-ms-wmv',
    
    // Archive types
    'zip': 'application/zip',
    'rar': 'application/vnd.rar',
    '7z': 'application/x-7z-compressed'
  }

  return mimeTypes[extension || ''] || 'application/octet-stream'
}

/**
 * Generate a unique file name with timestamp
 */
export function generateUniqueFileName(originalName: string, suffix?: string): string {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substr(2, 9)
  const extension = originalName.split('.').pop()
  const nameWithoutExt = originalName.split('.').slice(0, -1).join('.')
  
  const suffixPart = suffix ? `_${suffix}` : ''
  return `${nameWithoutExt}${suffixPart}_${timestamp}_${randomId}.${extension}`
}

/**
 * List files in the storage bucket (useful for cleanup)
 */
export async function listFiles(limit: number = 100): Promise<string[]> {
  try {
    const supabaseClient = getSupabaseClient()
    const bucketName = 'files'
    
    const { data, error } = await supabaseClient.storage
      .from(bucketName)
      .list('', {
        limit,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (error) {
      console.error('Error listing files:', error)
      throw new Error(`Failed to list files: ${error.message}`)
    }

    return data?.map(file => file.name) || []
    
  } catch (error) {
    console.error('Error in listFiles:', error)
    throw error instanceof Error ? error : new Error('Unknown error occurred while listing files')
  }
}

/**
 * Clean up old files (delete files older than specified days)
 */
export async function cleanupOldFiles(daysOld: number = 1): Promise<number> {
  try {
    const supabaseClient = getSupabaseClient()
    const bucketName = 'files'
    
    console.log(`Cleaning up files older than ${daysOld} days...`)
    
    const { data, error } = await supabaseClient.storage
      .from(bucketName)
      .list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'asc' }
      })

    if (error) {
      throw new Error(`Failed to list files for cleanup: ${error.message}`)
    }

    if (!data || data.length === 0) {
      console.log('No files to clean up')
      return 0
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const filesToDelete = data.filter(file => {
      if (!file.created_at) return false
      return new Date(file.created_at) < cutoffDate
    }).map(file => file.name)

    if (filesToDelete.length === 0) {
      console.log('No old files found to delete')
      return 0
    }

    console.log(`Deleting ${filesToDelete.length} old files...`)
    
    const { error: deleteError } = await supabaseClient.storage
      .from(bucketName)
      .remove(filesToDelete)

    if (deleteError) {
      throw new Error(`Failed to delete old files: ${deleteError.message}`)
    }

    console.log(`✓ Cleaned up ${filesToDelete.length} old files`)
    return filesToDelete.length

  } catch (error) {
    console.error('Error in cleanupOldFiles:', error)
    throw error instanceof Error ? error : new Error('Unknown error occurred during cleanup')
  }
}