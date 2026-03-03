export interface StorageAdapter {
  /**
   * Guardar contenido en el storage
   */
  save(key: string, content: Buffer | string, mimeType?: string): Promise<string>;

  /**
   * Obtener contenido desde el storage
   */
  get(key: string): Promise<Buffer>;

  /**
   * Verificar si un archivo existe
   */
  exists(key: string): Promise<boolean>;

  /**
   * Eliminar un archivo
   */
  delete(key: string): Promise<void>;

  /**
   * Obtener URL firmada temporal para acceso directo
   */
  getSignedUrl(key: string, expiresInMinutes?: number): Promise<string>;

  /**
   * Listar archivos con un prefijo
   */
  list(prefix: string): Promise<string[]>;
}
