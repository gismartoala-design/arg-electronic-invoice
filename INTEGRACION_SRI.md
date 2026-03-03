# 🌐 Guía de Integración SOAP con el SRI

## 📋 Visión General

Se ha implementado la integración completa con los **Web Services SOAP del SRI de Ecuador** para:
1. ✅ **Recepción de comprobantes** - Validar y enviar XML firmado
2. ✅ **Autorización de comprobantes** - Consultar estado de autorización

La implementación incluye:
- 🔄 **Modo dual**: Real SOAP + Mock fallback para desarrollo
- 🛡️ **Manejo robusto de errores** con reconexión automática
- 📊 **Parsing completo** de respuestas SOAP XML
- 🔍 **Verificación de conectividad** antes de enviar

## 🏗️ Arquitectura

### Componentes Implementados

```
SriService
├── sendToReception()         → Envía XML firmado al SRI
├── checkAuthorization()       → Consulta estado de autorización
├── checkConnectivity()        → Verifica conexión con SRI
├── buildReceptionEnvelope()   → Construye SOAP para recepción
├── buildAuthorizationEnvelope() → Construye SOAP para autorización
├── parseReceptionResponse()   → Parsea respuesta de recepción
└── parseAuthorizationResponse() → Parsea respuesta de autorización
```

## 🔧 Configuración

### Variables de Entorno

```env
# Ambiente del SRI
NODE_ENV=development  # development | production

# URLs del SRI - PRUEBAS
SRI_WS_RECEPTION_URL=https://celery.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl
SRI_WS_AUTHORIZATION_URL=https://celery.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl

# URLs del SRI - PRODUCCIÓN
# SRI_WS_RECEPTION_URL=https://cel.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl
# SRI_WS_AUTHORIZATION_URL=https://cel.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl
```

### Diferencias entre Ambientes

#### Ambiente de Pruebas (celery.sri.gob.ec)
- ✅ Para desarrollo y testing
- ✅ No afecta datos reales
- ✅ Comprobantes no válidos para uso fiscal
- ⚠️ Puede tener tiempos de respuesta más lentos

#### Ambiente de Producción (cel.sri.gob.ec)
- 🔴 Solo para comprobantes fiscales reales
- 🔴 Requiere certificado digital válido y vigente
- 🔴 Los comprobantes tienen validez legal
- 🔴 Mayor disponibilidad y performance

## 🚀 Uso

### 1. Verificar Conectividad

Antes de enviar comprobantes, verifica la conectividad:

```bash
curl -X GET http://localhost:3000/api/v1/sri/connectivity
```

**Respuesta:**
```json
{
  "reception": true,
  "authorization": true,
  "message": "Conexión exitosa con servicios del SRI"
}
```

Si estás en modo desarrollo sin URLs configuradas:
```json
{
  "reception": true,
  "authorization": true,
  "message": "Recepción: Modo mock. Autorización: Modo mock."
}
```

### 2. Enviar Comprobante a Recepción

**El flujo completo se hace automáticamente** al autorizar una factura:

```bash
POST /api/v1/invoices/{id}/authorize
```

Pero si quieres probar manualmente:

```bash
curl -X POST http://localhost:3000/api/v1/sri/reception \
  -H "Content-Type: application/json" \
  -d '{
    "claveAcceso": "1501202401123456789000110010010000000011234567891",
    "xml": "<?xml version=\"1.0\"?>...</xml>"
  }'
```

**Respuesta Exitosa:**
```json
{
  "estado": "RECIBIDA",
  "comprobantes": [
    {
      "claveAcceso": "1501202401123456789000110010010000000011234567891",
      "mensajes": [
        {
          "identificador": "43",
          "mensaje": "CLAVE ACCESO REGISTRADA",
          "informacionAdicional": "",
          "tipo": "INFORMACION"
        }
      ]
    }
  ]
}
```

**Respuesta con Error:**
```json
{
  "estado": "DEVUELTA",
  "comprobantes": [
    {
      "claveAcceso": "1501202401123456789000110010010000000011234567891",
      "mensajes": [
        {
          "identificador": "65",
          "mensaje": "FIRMA ELECTRONICA NO VALIDA",
          "informacionAdicional": "El certificado ha expirado",
          "tipo": "ERROR"
        }
      ]
    }
  ]
}
```

### 3. Consultar Autorización

```bash
curl -X GET http://localhost:3000/api/v1/sri/authorization/1501202401123456789000110010010000000011234567891
```

**Respuesta Autorizada:**
```json
{
  "estado": "AUTORIZADO",
  "numeroAutorizacion": "1501202401123456789000110010010000000011234567891",
  "fechaAutorizacion": "2024-01-15T10:30:45.000-05:00",
  "ambiente": "PRUEBAS",
  "comprobante": "<?xml version=\"1.0\"?>...",
  "mensajes": []
}
```

**Respuesta No Autorizada:**
```json
{
  "estado": "NO AUTORIZADO",
  "numeroAutorizacion": null,
  "fechaAutorizacion": null,
  "ambiente": "PRUEBAS",
  "comprobante": null,
  "mensajes": [
    {
      "identificador": "35",
      "mensaje": "DOCUMENTO ELECTRONICO DUPLICADO",
      "informacionAdicional": "Ya existe un comprobante con esa clave",
      "tipo": "ERROR"
    }
  ]
}
```

## 📝 Estructura SOAP

### Envelope de Recepción

```xml
<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" 
               xmlns:ec="http://ec.gob.sri.ws.recepcion">
  <soap:Header/>
  <soap:Body>
    <ec:validarComprobante>
      <xml><![CDATA[
        <?xml version="1.0" encoding="UTF-8"?>
        <factura id="comprobante" version="1.1.0">
          <!-- XML firmado del comprobante -->
        </factura>
      ]]></xml>
    </ec:validarComprobante>
  </soap:Body>
</soap:Envelope>
```

### Envelope de Autorización

```xml
<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" 
               xmlns:ec="http://ec.gob.sri.ws.autorizacion">
  <soap:Header/>
  <soap:Body>
    <ec:autorizacionComprobante>
      <claveAccesoComprobante>1501202401123456789000110010010000000011234567891</claveAccesoComprobante>
    </ec:autorizacionComprobante>
  </soap:Body>
</soap:Envelope>
```

## 🔍 Estados y Códigos de Respuesta

### Estados de Recepción

| Estado | Descripción | Acción |
|--------|-------------|--------|
| `RECIBIDA` | Comprobante recibido correctamente | ✅ Proceder a consultar autorización |
| `DEVUELTA` | Comprobante rechazado | ❌ Revisar mensajes de error y corregir |

### Estados de Autorización

| Estado | Descripción | Final |
|--------|-------------|-------|
| `AUTORIZADO` | Comprobante autorizado | ✅ Sí |
| `NO AUTORIZADO` | Comprobante rechazado | ❌ Sí |
| `EN PROCESAMIENTO` | Aún en proceso | 🔄 No, consultar nuevamente |

### Códigos de Mensaje del SRI

#### Informativos (43-44)
- **43**: Clave acceso registrada
- **44**: Comprobante procesado

#### Errores Comunes (35-999)
- **35**: Documento duplicado
- **36**: Secuencial duplicado
- **65**: Firma electrónica no válida
- **66**: Certificado revocado o inválido
- **67**: Certificado no autorizado para tipo de comprobante
- **68**: Error en estructura del XML
- **69**: Error en esquema del XML
- **70**: Clave de acceso no corresponde al comprobante

## 🔄 Modo Dual: Real + Mock

### Comportamiento Automático

```typescript
// En desarrollo SIN URLs configuradas → Mock
NODE_ENV=development
SRI_WS_RECEPTION_URL=  (vacío)
→ Usa respuestas mock

// En desarrollo CON URLs → Intenta Real, fallback a Mock
NODE_ENV=development
SRI_WS_RECEPTION_URL=https://celery.sri.gob.ec/...
→ Intenta SOAP real
→ Si falla (timeout, conexión), usa mock

// En producción → Solo Real
NODE_ENV=production
SRI_WS_RECEPTION_URL=https://cel.sri.gob.ec/...
→ Solo SOAP real
→ Si falla, lanza error
```

### Logs Diferenciados

```
[SriService] Enviando comprobante a recepción SRI: 150120240...
[SriService] Usando respuesta MOCK para recepción (modo desarrollo)
```

vs

```
[SriService] Enviando comprobante a recepción SRI: 150120240...
[SriService] Enviando a: https://celery.sri.gob.ec/...
[SriService] Respuesta de recepción: RECIBIDA
```

## 🛡️ Manejo de Errores

### Errores de Red

```typescript
try {
  const response = await sriService.sendToReception({...});
} catch (error) {
  // Error de conexión → Automáticamente usa mock en desarrollo
  // Error SOAP → Lanza error con detalles del SRI
}
```

### Tipos de Error

1. **ECONNREFUSED / ETIMEDOUT**
   - Causa: Servicios del SRI no disponibles
   - Acción: En desarrollo usa mock, en producción reintenta
   
2. **SOAP Fault**
   - Causa: Error en estructura SOAP
   - Acción: Revisar envelope y formato
   
3. **Respuesta DEVUELTA**
   - Causa: Comprobante rechazado por validaciones del SRI
   - Acción: Revisar mensajes y corregir XML

## 🧪 Testing

### Probar Conectividad

```bash
# Iniciar servidor
npm run start:dev

# Verificar conectividad
curl http://localhost:3000/api/v1/sri/connectivity
```

### Probar con Mock (Desarrollo)

```bash
# Sin configurar URLs
SRI_WS_RECEPTION_URL=
SRI_WS_AUTHORIZATION_URL=

# Autorizar factura (usará mock automáticamente)
curl -X POST http://localhost:3000/api/v1/invoices/{id}/authorize
```

### Probar con SRI Real (Pruebas)

```bash
# Configurar URLs de pruebas
SRI_WS_RECEPTION_URL=https://celery.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl
SRI_WS_AUTHORIZATION_URL=https://celery.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl

# Autorizar factura (intentará SOAP real)
curl -X POST http://localhost:3000/api/v1/invoices/{id}/authorize
```

## 📊 Monitoreo

### Logs del Servicio

```bash
# Ver todos los logs del SRI
npm run start:dev | grep SriService

# Filtrar solo errores
npm run start:dev | grep "ERROR"

# Filtrar solo warnings (mock mode)
npm run start:dev | grep "WARN"
```

### Ejemplos de Logs

```
[SriService] Enviando comprobante a recepción SRI: 150120240...
[SriService] Enviando a: https://celery.sri.gob.ec/...
[SriService] Respuesta de recepción: RECIBIDA
[SriService] Consultando autorización en SRI: 150120240...
[SriService] Estado de autorización: AUTORIZADO
✅ Conectividad con SRI: OK
```

## 🔐 Seguridad

### Consideraciones

1. **Certificado Digital Válido**
   - Debe estar vigente
   - Debe estar autorizado por el SRI
   - Renovar antes del vencimiento

2. **URLs Correctas por Ambiente**
   - Pruebas: `celery.sri.gob.ec`
   - Producción: `cel.sri.gob.ec`
   - No mezclar ambientes

3. **Manejo de Timeouts**
   - 30 segundos configurado
   - Reintentos automáticos implementados
   - No reintentar comprobantes DEVUELTOS

## 🐛 Troubleshooting

### Error: "ECONNREFUSED"

**Causa:** No se puede conectar al servidor del SRI

**Solución:**
1. Verificar que las URLs estén correctas
2. Verificar conexión a internet
3. Verificar que el SRI esté operativo (pueden tener mantenimientos)
4. En desarrollo, usar modo mock temporalmente

### Error: "Firma electrónica no válida"

**Causa:** El certificado o la firma tienen problemas

**Solución:**
1. Verificar que el certificado esté vigente
2. Verificar que la contraseña sea correcta
3. Verificar que la firma XMLDSig sea válida
4. Regenerar y firmar nuevamente

### Error: "Documento duplicado"

**Causa:** Ya existe un comprobante con esa clave de acceso

**Solución:**
1. Generar nueva clave de acceso (incrementar secuencial)
2. No reintentar con la misma clave
3. Consultar estado del comprobante duplicado

### Error: "Parsing response failed"

**Causa:** La respuesta SOAP no tiene el formato esperado

**Solución:**
1. Revisar logs para ver XML de respuesta
2. Verificar compatibilidad con versión del servicio SOAP
3. Reportar issue si es bug del parser

## 📈 Performance

### Tiempos Esperados

- **Recepción:** 1-5 segundos
- **Autorización (primera consulta):** 2-10 segundos
- **Autorización (consultas posteriores):** 1-3 segundos

### Optimizaciones

1. **Reintentos con backoff exponencial** (ya implementado)
2. **Caché de resultados** de autorización (pendiente)
3. **Queue de envíos** para lotes grandes (pendiente)

## 🎯 Integración Completa

### Flujo Automático en Autorización

```typescript
POST /api/v1/invoices/{id}/authorize
  ↓
1. ✅ Generar clave de acceso
  ↓
2. ✅ Construir XML según esquema SRI
  ↓
3. ✅ Firmar XML con certificado digital
  ↓
4. 🌐 Enviar a Recepción SRI (SOAP) ← IMPLEMENTADO
  ↓
5. ⏳ Esperar 2 segundos
  ↓
6. 🌐 Consultar Autorización SRI (SOAP) ← IMPLEMENTADO
  ↓
7. ✅ Guardar estado y artifacts
  ↓
8. ✅ Retornar factura autorizada
```

Todo el proceso es automático y transparente para el usuario.

## 📚 Referencias

- [Documentación Oficial SRI](https://www.sri.gob.ec/facturacion-electronica)
- [Esquemas XSD SRI](https://www.sri.gob.ec/esquemas-xsd)
- [SOAP Specification](https://www.w3.org/TR/soap/)
- [XML Digital Signature](https://www.w3.org/TR/xmldsig-core/)

## 🎉 Estado Actual

✅ **Integración SOAP Completa**
- ✅ Recepción de comprobantes
- ✅ Autorización de comprobantes
- ✅ Parsing de respuestas XML
- ✅ Manejo de errores robusto
- ✅ Modo dual (Real + Mock)
- ✅ Verificación de conectividad

## 🚀 Próximos Pasos

1. 📝 Generación de PDF RIDE con código QR
2. 📧 Envío de comprobantes por email
3. 🔄 Sistema de colas para envíos masivos
4. 💾 Caché de autorizaciones
5. 📊 Dashboard de estadísticas de envíos

---

**La integración SOAP con el SRI está completamente funcional y lista para uso en producción!** 🎉

Para más información:
- [QUICKSTART.md](./QUICKSTART.md) - Inicio rápido
- [FIRMA_DIGITAL.md](./FIRMA_DIGITAL.md) - Firma digital
- [API_EXAMPLES.md](./API_EXAMPLES.md) - Ejemplos de API
