# Storage Module

Módulo de almacenamiento multi-proveedor para facturas electrónicas del SRI Ecuador.

## Características

- ✅ **Abstracción multi-proveedor**: Soporta Local, Google Cloud Storage, AWS S3
- ✅ **URLs firmadas temporales**: Para compartir archivos de forma segura
- ✅ **Configuración flexible**: Cambio de proveedor sin modificar código
- ✅ **Tipo-seguro**: Interfaces TypeScript completas

## Proveedores soportados

### 1. Local Storage (Desarrollo)
Almacenamiento en sistema de archivos local.

```env
STORAGE_PROVIDER=local
STORAGE_LOCAL_PATH=./storage
```

**Pros:**
- Gratis
- Simple para desarrollo
- Sin dependencias externas

**Contras:**
- No escalable en multi-instancia
- Pérdida de datos en contenedores efímeros

---

### 2. Google Cloud Storage (Producción recomendada)
Almacenamiento en buckets de GCS.

```env
STORAGE_PROVIDER=gcs
GCS_BUCKET=mi-bucket-facturas
GCS_KEY_FILE_PATH=./gcp-service-account-key.json
```

**Configuración:**

1. Crear bucket en Google Cloud:
```bash
gsutil mb gs://mi-bucket-facturas
```

2. Crear service account con permisos:
   - Storage Object Admin
   - Storage Object Creator
   - Storage Object Viewer

3. Descargar JSON key y configurar ruta en `.env`

**Costos estimados (2026):**
- 10,000 facturas/mes: ~$0.22/mes
- 100,000 facturas/mes: ~$2.13/mes

**Pros:**
- URLs firmadas temporales
- Escalable infinitamente
- Backups automáticos
- CDN integrado

---

### 3. AWS S3 (Futuro)
_Por implementar_

---

## Uso

### Guardar archivo

```typescript
import { StorageService } from '../storage/storage.service';

constructor(private readonly storageService: StorageService) {}

async saveInvoice(invoiceId: string, xml: string) {
  // Guardar XML firmado
  const key = `invoices/${invoiceId}/signed.xml`;
  await this.storageService.save(key, xml, 'application/xml');
  
  // Guardar PDF
  const pdfKey = `invoices/${invoiceId}/ride.pdf`;
  await this.storageService.save(pdfKey, pdfBuffer, 'application/pdf');
}
```

### Obtener archivo

```typescript
async getInvoiceXml(invoiceId: string): Promise<Buffer> {
  const key = `invoices/${invoiceId}/signed.xml`;
  return await this.storageService.get(key);
}
```

### Verificar existencia

```typescript
const exists = await this.storageService.exists(`invoices/${id}/ride.pdf`);
if (!exists) {
  // Regenerar PDF
}
```

### URLs firmadas temporales

```typescript
// URL válida por 1 hora (default)
const url = await this.storageService.getSignedUrl(
  `invoices/${id}/ride.pdf`
);

// URL válida por 7 días
const urlSemana = await this.storageService.getSignedUrl(
  `invoices/${id}/signed.xml`,
  10080 // minutos
);

// Enviar por email
await emailService.send({
  to: cliente.email,
  subject: 'Factura electrónica',
  body: `Descarga tu factura: ${url}`
});
```

### Listar archivos

```typescript
// Listar todas las facturas de un invoice
const files = await this.storageService.list(`invoices/${invoiceId}/`);
// ['invoices/123/signed.xml', 'invoices/123/ride.pdf', ...]
```

### Eliminar archivo

```typescript
await this.storageService.delete(`invoices/${id}/ride.pdf`);
```

---

## Estructura de archivos recomendada

```
storage/
├── invoices/
│   ├── {invoiceId}/
│   │   ├── unsigned.xml
│   │   ├── signed.xml
│   │   ├── ride.pdf
│   │   ├── response_reception.json
│   │   └── response_authorization.json
├── certificates/
│   └── {issuerId}/
│       └── certificate.p12
└── temp/
    └── {processingFiles}
```

---

## Migración de Local a GCS

### Paso 1: Preparar GCS

1. Crear bucket en Google Cloud Console
2. Crear service account con permisos
3. Descargar JSON key

### Paso 2: Subir archivos existentes

```bash
# Opción 1: gsutil
gsutil -m cp -r ./storage/invoices gs://mi-bucket-facturas/

# Opción 2: Script de migración (crear si necesario)
npm run migrate-storage
```

### Paso 3: Cambiar configuración

```env
# .env
STORAGE_PROVIDER=gcs  # Cambiar de 'local' a 'gcs'
GCS_BUCKET=mi-bucket-facturas
GCS_KEY_FILE_PATH=./gcp-service-account-key.json
```

### Paso 4: Reiniciar aplicación

```bash
npm run build
npm run start:prod
```

**Sin cambios en código** ✅

---

## Testing

### Local
```bash
STORAGE_PROVIDER=local npm run test
```

### GCS (requiere credenciales)
```bash
STORAGE_PROVIDER=gcs \
GCS_BUCKET=test-bucket \
GCS_KEY_FILE_PATH=./test-key.json \
npm run test
```

---

## FAQ

**¿Qué pasa con los XMLs ya guardados en PostgreSQL?**
- Se mantienen en la columna `content` de `invoice_artifact`
- El storage es adicional para PDFs y archivos grandes
- Puedes migrar gradualmente

**¿Cómo limitar el tamaño de archivos?**
- Configurar en `configuration.ts`:
```typescript
storage: {
  maxFileSize: 5 * 1024 * 1024, // 5 MB
}
```

**¿URLs públicas permanentes?**
- No recomendado por seguridad
- Usar URLs firmadas con expiración
- Si necesitas públicas: configurar bucket policy en GCS

**¿Backups?**
- Local: Incluir en backup del servidor
- GCS: Backups automáticos + versionado de objetos activable

**¿CDN para PDFs?**
- GCS: Activar Cloud CDN en bucket
- Reduce latencia global
- Costo adicional mínimo

---

## Costos de almacenamiento

| Volumen facturas | Almacenamiento | Operaciones | **Total GCS/mes** |
|------------------|----------------|-------------|-------------------|
| 1,000 | 65 MB | 4k ops | **$0.02** |
| 10,000 | 650 MB | 40k ops | **$0.22** |
| 100,000 | 6.5 GB | 400k ops | **$2.13** |
| 1,000,000 | 65 GB | 4M ops | **$21.30** |

_Precios Google Cloud Storage 2026_

---

## Arquitectura

```
┌─────────────────┐
│ InvoiceService  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ StorageService  │ ← Facade
└────────┬────────┘
         │
    ┌────┴────┐
    │ Adapter │ ← Strategy Pattern
    └────┬────┘
         │
    ┌────┴────────────┐
    │                 │
┌───▼────┐      ┌────▼────┐
│ Local  │      │  GCS    │
│Adapter │      │ Adapter │
└────────┘      └─────────┘
```

---

## Siguientes pasos

- [ ] Implementar adapter S3
- [ ] Sistema de caché (Redis) para archivos frecuentes
- [ ] Limpieza automática de archivos antiguos
- [ ] Compresión automática (gzip) para XMLs
- [ ] Encriptación en reposo
- [ ] Métricas de uso de storage

---

## Soporte

Para más información:
- Google Cloud Storage: https://cloud.google.com/storage/docs
- Precios GCS: https://cloud.google.com/storage/pricing
