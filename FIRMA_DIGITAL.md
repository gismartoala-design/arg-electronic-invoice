# 🔐 Guía de Implementación de Firma Digital

## 📋 Visión General

La firma digital XMLDSig ha sido implementada completamente usando las librerías `xml-crypto` y `node-forge`. Esta implementación cumple con los estándares del SRI de Ecuador para firma de comprobantes electrónicos.

## 🔑 Componentes Implementados

### 1. Dependencias Instaladas

```bash
xml-crypto ^6.1.2    # Firma digital XMLDSig
node-forge ^1.3.3    # Manejo de certificados .p12
xpath                # Navegación XML
xmldom               # Parser DOM para XML
```

### 2. Servicios Implementados

**SignatureService** (`src/modules/signature/signature.service.ts`)

Métodos disponibles:

#### `signXml(xmlContent: string): Promise<string>`
Firma un XML con el certificado digital configurado.

**Proceso:**
1. Carga el certificado .p12 y extrae clave privada
2. Parsea el XML de entrada
3. Crea firma XMLDSig con algoritmo RSA-SHA1
4. Incluye certificado X509 en KeyInfo
5. Retorna XML firmado con nodo `<ds:Signature>`

#### `verifyCertificate(): Promise<boolean>`
Verifica que el certificado digital sea válido y no haya expirado.

**Validaciones:**
- Existencia del archivo .p12
- Contraseña correcta
- Fecha de validez (notBefore < now < notAfter)

#### `getCertificateInfo(): Promise<CertificateInfo>`
Obtiene información completa del certificado digital.

**Retorna:**
```typescript
{
  subject: { CN, O, OU, ... },
  issuer: { CN, O, ... },
  validity: {
    notBefore: Date,
    notAfter: Date
  },
  serialNumber: string,
  isValid: boolean,
  daysUntilExpiration: number
}
```

#### `verifyXmlSignature(signedXml: string): Promise<boolean>`
Verifica que la firma de un XML sea válida.

### 3. Endpoints REST

**SignatureController** (`src/modules/signature/signature.controller.ts`)

#### `GET /api/v1/signature/certificate/info`
Obtener información del certificado digital configurado.

**Respuesta:**
```json
{
  "subject": {
    "CN": "JUAN PEREZ",
    "O": "BANCO CENTRAL DEL ECUADOR"
  },
  "issuer": {
    "CN": "SECURITY DATA"
  },
  "validity": {
    "notBefore": "2023-01-15T00:00:00.000Z",
    "notAfter": "2025-01-15T23:59:59.000Z"
  },
  "serialNumber": "1234567890",
  "isValid": true,
  "daysUntilExpiration": 365
}
```

#### `GET /api/v1/signature/certificate/verify`
Verificar validez del certificado.

**Respuesta:**
```json
{
  "isValid": true,
  "message": "El certificado es válido"
}
```

#### `POST /api/v1/signature/test-sign`
Probar firma digital con XML de ejemplo.

**Request:**
```json
{
  "xml": "<?xml version=\"1.0\"?><factura>...</factura>"
}
```

**Respuesta:**
```json
{
  "success": true,
  "signedXml": "<?xml version=\"1.0\"?><factura>...<ds:Signature>...</ds:Signature></factura>"
}
```

#### `POST /api/v1/signature/verify-signature`
Verificar firma de un XML.

**Request:**
```json
{
  "signedXml": "<?xml version=\"1.0\"?><factura>...<ds:Signature>...</ds:Signature></factura>"
}
```

**Respuesta:**
```json
{
  "isValid": true,
  "message": "Firma válida"
}
```

## 🚀 Configuración

### Paso 1: Obtener Certificado Digital

Necesitas un certificado digital emitido por una entidad certificadora autorizada por el SRI:

- **Security Data**
- **Banco Central del Ecuador (BCE)**
- **ANF**
- Otro proveedor autorizado

El certificado debe estar en formato **.p12** o **.pfx**

### Paso 2: Configurar Variables de Entorno

Edita tu archivo `.env`:

```env
# Ruta al certificado digital
SIGNATURE_PATH=./certificates/mi-certificado.p12

# Contraseña del certificado
SIGNATURE_PASSWORD=MiContraseñaSegura123
```

### Paso 3: Colocar el Certificado

```bash
# Crear directorio si no existe
mkdir -p certificates

# Copiar tu certificado
cp /ruta/a/tu/certificado.p12 certificates/
```

### Paso 4: Verificar Configuración

```bash
# Iniciar servidor
npm run start:dev

# Verificar certificado
curl http://localhost:3000/api/v1/signature/certificate/verify
```

## 🧪 Pruebas

### 1. Verificar Certificado

```bash
curl -X GET http://localhost:3000/api/v1/signature/certificate/info
```

Deberías ver información completa del certificado.

### 2. Probar Firma

```bash
curl -X POST http://localhost:3000/api/v1/signature/test-sign \
  -H "Content-Type: application/json" \
  -d '{
    "xml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?><factura><infoTributaria><ambiente>1</ambiente></infoTributaria></factura>"
  }'
```

El XML debe retornar con el nodo `<ds:Signature>` agregado.

### 3. Firmar Factura Completa

El flujo de autorización de factura ya usa automáticamente la firma:

```bash
# 1. Crear factura
curl -X POST http://localhost:3000/api/v1/invoices -d '{...}'

# 2. Autorizar (esto firma automáticamente)
curl -X POST http://localhost:3000/api/v1/invoices/{id}/authorize
```

## 📝 Estructura de la Firma XMLDSig

La firma generada sigue el estándar XMLDSig y tiene esta estructura:

```xml
<ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
  <ds:SignedInfo>
    <ds:CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
    <ds:SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/>
    <ds:Reference URI="">
      <ds:Transforms>
        <ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
      </ds:Transforms>
      <ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/>
      <ds:DigestValue>...</ds:DigestValue>
    </ds:Reference>
  </ds:SignedInfo>
  <ds:SignatureValue>...</ds:SignatureValue>
  <ds:KeyInfo>
    <ds:X509Data>
      <ds:X509Certificate>...</ds:X509Certificate>
    </ds:X509Data>
  </ds:KeyInfo>
</ds:Signature>
```

### Componentes:

- **SignedInfo**: Información de la firma (algoritmos, referencias)
- **SignatureValue**: Valor de la firma RSA en Base64
- **KeyInfo**: Información de la clave pública (certificado X509)

## 🔍 Validación del SRI

El SRI valida:

1. ✅ **Integridad**: Digest SHA1 del documento coincide
2. ✅ **Autenticidad**: Firma RSA válida con certificado
3. ✅ **Certificado Válido**: No expirado y emitido por entidad autorizada
4. ✅ **Estructura XML**: Cumple con esquema XSD

## 🐛 Troubleshooting

### Error: "No se encontró el certificado en el archivo"

**Causa:** El archivo .p12 está corrupto o la contraseña es incorrecta.

**Solución:**
```bash
# Verificar certificado con OpenSSL
openssl pkcs12 -info -in certificates/certificado.p12 -nodes
```

### Error: "El certificado ha expirado"

**Causa:** El certificado digital está vencido.

**Solución:** Renovar el certificado con tu proveedor (Security Data, BCE, etc.)

### Error: "Firma inválida"

**Causa:** El XML fue modificado después de firmarse.

**Solución:** No modificar el XML después de firmarlo. Cualquier cambio invalida la firma.

### Error: "Cannot read property 'cert' of undefined"

**Causa:** El archivo .p12 no contiene un certificado válido.

**Solución:**
1. Verificar que el archivo sea un .p12 válido
2. Verificar que contenga tanto el certificado como la clave privada
3. Regenerar el certificado si es necesario

## 📊 Logs y Monitoreo

El servicio registra todos los eventos importantes:

```typescript
// Firma iniciada
[SignatureService] Iniciando firma digital del XML

// Firma completada
[SignatureService] XML firmado exitosamente

// Certificado verificado
[SignatureService] Certificado válido

// Errores
[SignatureService] Error al firmar XML: ...
```

Puedes monitorear los logs durante el desarrollo:

```bash
npm run start:dev | grep SignatureService
```

## 🔐 Seguridad

### Mejores Prácticas:

1. **Nunca commitear certificados** al repositorio
   ```bash
   # .gitignore
   certificates/*.p12
   certificates/*.pfx
   .env
   ```

2. **Usar variables de entorno** para contraseñas
   ```env
   SIGNATURE_PASSWORD=contraseña-segura
   ```

3. **Permisos de archivos** restrictivos
   ```bash
   chmod 600 certificates/*.p12
   ```

4. **Rotar certificados** antes del vencimiento

5. **Monitorear días hasta expiración**
   ```bash
   curl http://localhost:3000/api/v1/signature/certificate/info | jq '.daysUntilExpiration'
   ```

## 🔄 Integración con Flujo de Facturación

La firma se integra automáticamente en el flujo de autorización:

```
POST /invoices/{id}/authorize
  ↓
  1. Generar clave de acceso
  ↓
  2. Construir XML (XmlBuilderService)
  ↓
  3. 🔐 Firmar XML (SignatureService) ← AQUÍ
  ↓
  4. Enviar a SRI
  ↓
  5. Obtener autorización
```

El XML firmado se guarda automáticamente en `invoice_artifact` con tipo `SIGNED_XML`.

## 📚 Referencias

- [XMLDSig Specification](https://www.w3.org/TR/xmldsig-core/)
- [xml-crypto Documentation](https://github.com/node-saml/xml-crypto)
- [node-forge Documentation](https://github.com/digitalbazaar/forge)
- [Documentación SRI Ecuador](https://www.sri.gob.ec/facturacion-electronica)

## 💡 Próximos Pasos

1. ✅ Implementación completa de firma XMLDSig
2. ✅ Endpoints de verificación de certificado
3. 🔄 Integración con flujo de facturación
4. 📝 Pendiente: Implementar SOAP real del SRI (actualmente mock)
5. 📝 Pendiente: Generar PDF RIDE con código QR

---

Para más ayuda, consulta:
- [QUICKSTART.md](./QUICKSTART.md) - Guía de inicio rápido
- [API_EXAMPLES.md](./API_EXAMPLES.md) - Ejemplos de API
- [CERTIFICADO.md](./CERTIFICADO.md) - Guía de certificados digitales
