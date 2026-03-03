export enum StorageProvider {
  LOCAL = 'local',
  GCS = 'gcs',
  S3 = 's3',
  POSTGRESQL = 'postgresql',
}

export interface StorageConfig {
  provider: StorageProvider;
  localPath?: string;
  gcsBucket?: string;
  gcsKeyFilePath?: string;
  s3Bucket?: string;
  s3Region?: string;
}
