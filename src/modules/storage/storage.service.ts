import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageAdapter, StorageProvider } from './interfaces';
import { LocalStorageAdapter, GcsStorageAdapter } from './adapters';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private adapter: StorageAdapter;
  private readonly provider: StorageProvider;

  constructor(private readonly configService: ConfigService) {
    this.provider = this.configService.get<StorageProvider>(
      'storage.provider',
      StorageProvider.LOCAL,
    );
  }

  onModuleInit() {
    this.initializeAdapter();
  }

  private initializeAdapter(): void {
    switch (this.provider) {
      case StorageProvider.LOCAL:
        this.adapter = new LocalStorageAdapter(
          this.configService.get<string>('storage.localPath', './storage'),
        );
        this.logger.log('Storage initialized with LOCAL adapter');
        break;

      case StorageProvider.GCS:
        const gcsBucket = this.configService.get<string>('storage.gcsBucket');
        const gcsKeyFile = this.configService.get<string>(
          'storage.gcsKeyFilePath',
        );

        if (!gcsBucket) {
          throw new Error('GCS bucket name is required when using GCS storage');
        }

        this.adapter = new GcsStorageAdapter(gcsBucket, gcsKeyFile);
        this.logger.log('Storage initialized with GCS adapter');
        break;

      case StorageProvider.S3:
        throw new Error('S3 adapter not implemented yet');

      default:
        throw new Error(`Unknown storage provider: ${this.provider}`);
    }
  }

  /**
   * Guardar archivo en el storage
   */
  async save(
    key: string,
    content: Buffer | string,
    mimeType?: string,
  ): Promise<string> {
    return this.adapter.save(key, content, mimeType);
  }

  /**
   * Obtener archivo desde el storage
   * Soporta tanto rutas relativas como URIs completas de GCS (gs://bucket/path)
   */
  async get(key: string): Promise<Buffer> {
    // Si la key es una URI completa de GCS (gs://bucket/path), extraer solo el path
    if (key.startsWith('gs://')) {
      const parsedKey = this.parseGcsUri(key);
      return this.adapter.get(parsedKey);
    }
    return this.adapter.get(key);
  }

  /**
   * Parsear URI de GCS para extraer solo la ruta dentro del bucket
   * Ejemplo: gs://my-bucket/path/to/file.txt -> path/to/file.txt
   */
  private parseGcsUri(uri: string): string {
    // Remover el prefijo gs://
    const withoutProtocol = uri.replace(/^gs:\/\//, '');

    // Separar bucket y path
    const firstSlash = withoutProtocol.indexOf('/');

    if (firstSlash === -1) {
      throw new Error(
        `Invalid GCS URI format: ${uri}. Expected format: gs://bucket-name/path/to/file`,
      );
    }

    // Extraer solo la ruta (todo después del primer /)
    const path = withoutProtocol.substring(firstSlash + 1);

    if (!path) {
      throw new Error(`Invalid GCS URI format: ${uri}. Path cannot be empty`);
    }

    return path;
  }

  /**
   * Verificar si un archivo existe
   */
  async exists(key: string): Promise<boolean> {
    return this.adapter.exists(key);
  }

  /**
   * Eliminar archivo del storage
   */
  async delete(key: string): Promise<void> {
    return this.adapter.delete(key);
  }

  /**
   * Obtener URL firmada temporal para acceso directo
   * @param key Clave del archivo
   * @param expiresInMinutes Tiempo de expiración en minutos (default: 60)
   */
  async getSignedUrl(
    key: string,
    expiresInMinutes: number = 60,
  ): Promise<string> {
    return this.adapter.getSignedUrl(key, expiresInMinutes);
  }

  /**
   * Listar archivos con un prefijo
   */
  async list(prefix: string): Promise<string[]> {
    return this.adapter.list(prefix);
  }

  /**
   * Obtener información del provider actual
   */
  getProviderInfo(): { provider: StorageProvider } {
    return { provider: this.provider };
  }
}
