import { Injectable, Logger } from '@nestjs/common';
import { StorageAdapter } from '../interfaces';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class LocalStorageAdapter implements StorageAdapter {
  private readonly logger = new Logger(LocalStorageAdapter.name);
  private readonly basePath: string;

  constructor(basePath: string = './storage') {
    this.basePath = basePath;
    this.ensureDirectoryExists();
  }

  private async ensureDirectoryExists(): Promise<void> {
    try {
      await fs.mkdir(this.basePath, { recursive: true });
    } catch (error) {
      this.logger.error(`Error creating storage directory: ${error.message}`);
    }
  }

  async save(key: string, content: Buffer | string, mimeType?: string): Promise<string> {
    try {
      const filePath = path.join(this.basePath, key);
      const directory = path.dirname(filePath);

      // Crear directorios si no existen
      await fs.mkdir(directory, { recursive: true });

      // Guardar archivo
      await fs.writeFile(filePath, content);

      this.logger.debug(`File saved: ${key}`);
      return filePath;
    } catch (error) {
      this.logger.error(`Error saving file ${key}: ${error.message}`);
      throw new Error(`Failed to save file: ${error.message}`);
    }
  }

  async get(key: string): Promise<Buffer> {
    try {
      const filePath = path.join(this.basePath, key);
      const content = await fs.readFile(filePath);
      return content;
    } catch (error) {
      this.logger.error(`Error reading file ${key}: ${error.message}`);
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const filePath = path.join(this.basePath, key);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const filePath = path.join(this.basePath, key);
      await fs.unlink(filePath);
      this.logger.debug(`File deleted: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting file ${key}: ${error.message}`);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async getSignedUrl(key: string, expiresInMinutes: number = 60): Promise<string> {
    // En local, retornamos una URL del servidor
    // En producción, esto debería ser manejado por un endpoint
    return `/api/v1/storage/local/${key}`;
  }

  async list(prefix: string): Promise<string[]> {
    try {
      const dirPath = path.join(this.basePath, prefix);
      const files = await fs.readdir(dirPath, { recursive: true });
      return files
        .filter((file) => typeof file === 'string')
        .map((file) => path.join(prefix, file as string));
    } catch (error) {
      this.logger.error(`Error listing files with prefix ${prefix}: ${error.message}`);
      return [];
    }
  }
}
