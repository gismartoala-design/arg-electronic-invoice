import { Injectable, Logger } from '@nestjs/common';
import { StorageAdapter } from '../interfaces';
import { Storage, Bucket } from '@google-cloud/storage';

@Injectable()
export class GcsStorageAdapter implements StorageAdapter {
  private readonly logger = new Logger(GcsStorageAdapter.name);
  private readonly storage: Storage;
  private readonly bucket: Bucket;

  constructor(bucketName: string, keyFilePath?: string) {
    const config: any = {};
    
    if (keyFilePath) {
      config.keyFilename = keyFilePath;
    }

    this.storage = new Storage(config);
    this.bucket = this.storage.bucket(bucketName);
    
    this.logger.log(`GCS Storage initialized with bucket: ${bucketName}`);
  }

  async save(key: string, content: Buffer | string, mimeType?: string): Promise<string> {
    try {
      const file = this.bucket.file(key);
      
      const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);

      await file.save(buffer, {
        metadata: {
          contentType: mimeType || this.getMimeType(key),
        },
      });

      this.logger.debug(`File saved to GCS: ${key}`);
      return `gs://${this.bucket.name}/${key}`;
    } catch (error) {
      this.logger.error(`Error saving file to GCS ${key}: ${error.message}`);
      throw new Error(`Failed to save file to GCS: ${error.message}`);
    }
  }

  async get(key: string): Promise<Buffer> {
    try {
      const file = this.bucket.file(key);
      const [content] = await file.download();
      return content;
    } catch (error) {
      this.logger.error(`Error reading file from GCS ${key}: ${error.message}`);
      throw new Error(`Failed to read file from GCS: ${error.message}`);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const file = this.bucket.file(key);
      const [exists] = await file.exists();
      return exists;
    } catch (error) {
      this.logger.error(`Error checking file existence in GCS ${key}: ${error.message}`);
      return false;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const file = this.bucket.file(key);
      await file.delete();
      this.logger.debug(`File deleted from GCS: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting file from GCS ${key}: ${error.message}`);
      throw new Error(`Failed to delete file from GCS: ${error.message}`);
    }
  }

  async getSignedUrl(key: string, expiresInMinutes: number = 60): Promise<string> {
    try {
      const file = this.bucket.file(key);
      
      const options = {
        version: 'v4' as const,
        action: 'read' as const,
        expires: Date.now() + expiresInMinutes * 60 * 1000,
      };

      const [url] = await file.getSignedUrl(options);
      return url;
    } catch (error) {
      this.logger.error(`Error generating signed URL for ${key}: ${error.message}`);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  async list(prefix: string): Promise<string[]> {
    try {
      const [files] = await this.bucket.getFiles({ prefix });
      return files.map((file) => file.name);
    } catch (error) {
      this.logger.error(`Error listing files with prefix ${prefix}: ${error.message}`);
      return [];
    }
  }

  private getMimeType(key: string): string {
    const extension = key.split('.').pop()?.toLowerCase();
    
    const mimeTypes: Record<string, string> = {
      xml: 'application/xml',
      pdf: 'application/pdf',
      json: 'application/json',
      txt: 'text/plain',
    };

    return mimeTypes[extension || ''] || 'application/octet-stream';
  }
}
