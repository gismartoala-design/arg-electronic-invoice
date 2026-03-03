# 🚀 Guía de Inicio Rápido - Sistema de Facturación Electrónica

## 📋 Pre-requisitos

1. **Node.js** (v18 o superior)
2. **PostgreSQL** (v12 o superior)
3. **Certificado Digital** (.p12 o .pfx) emitido por una entidad certificadora autorizada por el SRI
4. **Credenciales de Base de Datos** PostgreSQL

## 🗄️ Configuración de Base de Datos

### 1. Configurar Variables de Entorno

Edita tu archivo `.env`:

```env
# Base de datos
DB_HOST=194.140.198.128
DB_PORT=5432
DB_USERNAME=emerson
DB_PASSWORD=memerson19
DB_DATABASE=electronic_invoice
DB_SYNCHRONIZE=true  # Solo para desarrollo - usa migrations en producción
```

### 2. Estructura de la Base de Datos

El sistema utiliza las siguientes tablas:

- **issuer**: Datos del emisor (empresa)
- **invoice**: Datos principales de la factura
- **invoice_detail**: Líneas de detalle de la factura
- **invoice_detail_tax**: Impuestos de cada línea
- **invoice_payment**: Formas de pago
- **invoice_artifact**: Almacenamiento de XML y PDF generados
- **invoice_event**: Trazabilidad de eventos (creación, envío, autorización, etc.)

### 3. Sincronizar Base de Datos

Al iniciar la aplicación por primera vez con `DB_SYNCHRONIZE=true`, TypeORM creará automáticamente todas las tablas necesarias.

```bash
npm run start:dev
```

> ⚠️ **Importante**: En producción, usa migraciones de TypeORM en lugar de sincronización automática.

## 📝 Flujo de Trabajo Completo

### Paso 1: Crear un Emisor

Antes de crear facturas, debes registrar tu empresa como emisor:

```bash
curl -X POST http://localhost:3000/api/v1/issuers \
  -H "Content-Type: application/json" \
  -d '{
    "ruc": "1234567890001",
    "razonSocial": "MI EMPRESA S.A.",
    "nombreComercial": "MI EMPRESA",
    "direccionMatriz": "Av. Principal 123 y Secundaria",
    "ambiente": "PRUEBAS",
    "establecimiento": "001",
    "puntoEmision": "001",
    "certP12Path": "./certificates/signature.p12",
    "certPasswordEncrypted": "contraseña_del_certificado",
    "obligadoContabilidad": true,
    "email": "info@miempresa.com",
    "telefono": "0999999999"
  }'
```

**Respuesta:**
```json
{
  "id": "uuid-del-emisor",
  "ruc": "1234567890001",
  "razonSocial": "MI EMPRESA S.A.",
  ...
}
```

### Paso 2: Crear una Factura

```bash
curl -X POST http://localhost:3000/api/v1/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "issuerId": "uuid-del-emisor",
    "tipoIdentificacionComprador": "RUC",
    "identificacionComprador": "0999999999001",
    "razonSocialComprador": "CLIENTE EJEMPLO S.A.",
    "direccionComprador": "Calle Ejemplo 456",
    "emailComprador": "cliente@ejemplo.com",
    "detalles": [
      {
        "codigoPrincipal": "PROD001",
        "descripcion": "Producto de ejemplo",
        "cantidad": 2,
        "precioUnitario": 10.50,
        "descuento": 0,
        "impuestos": [
          {
            "codigo": "2",
            "codigoPorcentaje": "2",
            "tarifa": 12,
            "baseImponible": 21.00
          }
        ]
      }
    ],
    "pagos": [
      {
        "formaPago": "01",
        "total": 23.52,
        "plazo": 0,
        "unidadTiempo": "DIAS"
      }
    ],
    "infoAdicional": [
      {
        "nombre": "Email",
        "valor": "cliente@ejemplo.com"
      }
    ]
  }'
```

**Respuesta:**
```json
{
  "id": "uuid-de-la-factura",
  "secuencial": "000000001",
  "estado": "BORRADOR",
  "fechaEmision": "2024-01-15",
  "totalSinImpuestos": 21.00,
  "totalDescuento": 0.00,
  "propina": 0.00,
  "importeTotal": 23.52,
  ...
}
```

### Paso 3: Autorizar la Factura en el SRI

```bash
curl -X POST http://localhost:3000/api/v1/invoices/{uuid-de-la-factura}/authorize
```

Este proceso realizará automáticamente:

1. ✅ Generación de la clave de acceso (49 dígitos)
2. ✅ Construcción del XML según esquema del SRI
3. ✅ Firma digital del XML
4. ✅ Envío a Recepción del SRI
5. ✅ Consulta de Autorización

**Respuesta:**
```json
{
  "id": "uuid-de-la-factura",
  "secuencial": "000000001",
  "estado": "AUTORIZADA",
  "claveAcceso": "1501202401123456789000110010010000000011234567891",
  "numeroAutorizacion": "1501202401123456789000110010010000000011234567891",
  "fechaAutorizacion": "2024-01-15T10:30:00Z",
  "estadoSriRecepcion": "RECIBIDA",
  "estadoSriAutorizacion": "AUTORIZADO"
}
```

### Paso 4: Consultar Estado de Autorización

```bash
curl -X GET http://localhost:3000/api/v1/invoices/{uuid-de-la-factura}/check-authorization
```

### Paso 5: Reintentar Autorización (si falla)

```bash
curl -X POST http://localhost:3000/api/v1/invoices/{uuid-de-la-factura}/retry
```

El sistema reintentará automáticamente (máximo 5 intentos).

## 📊 Consultar Facturas

### Listar todas las facturas

```bash
curl -X GET 'http://localhost:3000/api/v1/invoices?page=1&limit=10&estado=AUTORIZADA'
```

Filtros disponibles:
- `page`: Número de página (default: 1)
- `limit`: Resultados por página (default: 10)
- `estado`: BORRADOR | EN_PROCESO | AUTORIZADA | RECHAZADA | NO_AUTORIZADA
- `fechaDesde`: Fecha desde (formato: YYYY-MM-DD)
- `fechaHasta`: Fecha hasta (formato: YYYY-MM-DD)
- `identificacionComprador`: RUC o cédula del comprador

### Obtener una factura específica

```bash
curl -X GET http://localhost:3000/api/v1/invoices/{uuid-de-la-factura}
```

## 🔍 Gestión de Emisores

### Listar emisores

```bash
curl -X GET http://localhost:3000/api/v1/issuers
```

### Obtener emisor por ID

```bash
curl -X GET http://localhost:3000/api/v1/issuers/{uuid-del-emisor}
```

### Obtener emisor por RUC

```bash
curl -X GET http://localhost:3000/api/v1/issuers/ruc/{ruc}
```

### Actualizar emisor

```bash
curl -X PUT http://localhost:3000/api/v1/issuers/{uuid-del-emisor} \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nuevo-email@miempresa.com",
    "telefono": "0988888888"
  }'
```

### Eliminar emisor

```bash
curl -X DELETE http://localhost:3000/api/v1/issuers/{uuid-del-emisor}
```

## 📦 Artifacts y Events

### Artifacts (Artefactos)

Cada vez que se genera un XML o PDF, se almacena en la tabla `invoice_artifact`:

- **Tipo**: SIGNED_XML, UNSIGNED_XML, AUTHORIZED_XML, PDF_RIDE
- **Ruta**: Ubicación del archivo en el sistema
- **Contenido**: Puede almacenarse el contenido completo si es necesario
- **Hash**: Hash SHA-256 para verificar integridad

### Events (Eventos)

Todos los cambios de estado se registran en `invoice_event` para trazabilidad:

- CREATED: Factura creada
- AUTHORIZATION_STARTED: Inicio del proceso de autorización
- ACCESS_KEY_GENERATED: Clave de acceso generada
- XML_GENERATED: XML generado
- XML_SIGNED: XML firmado digitalmente
- SENT_TO_RECEPTION: Enviado a recepción del SRI
- RECEIVED_BY_SRI: Recibido por el SRI
- AUTHORIZED: Autorizado por el SRI
- REJECTED: Rechazado por el SRI
- ERROR: Error en el proceso

## 🔔 Estados de una Factura

1. **BORRADOR**: Factura creada pero no enviada al SRI
2. **EN_PROCESO**: En proceso de autorización con el SRI
3. **AUTORIZADA**: Autorizada por el SRI (estado final exitoso)
4. **RECHAZADA**: Rechazada por el SRI (estado final fallido)
5. **NO_AUTORIZADA**: No autorizada después de varios intentos (estado final fallido)

## 📈 Diagramas de Flujo

### Flujo de Autorización

```
[Cliente] → POST /invoices → [Sistema]
    ↓
[Sistema] → Crear factura en BD (estado: BORRADOR)
    ↓
[Cliente] → POST /invoices/{id}/authorize → [Sistema]
    ↓
[Sistema] → Cambiar estado a EN_PROCESO
    ↓
[Sistema] → Generar clave de acceso (49 dígitos)
    ↓
[Sistema] → Construir XML según esquema SRI
    ↓
[Sistema] → Firmar XML con certificado digital
    ↓
[Sistema] → Guardar artifact (SIGNED_XML)
    ↓
[Sistema] → Enviar a Recepción SRI
    ↓
[SRI] → Responde: RECIBIDA o ERROR
    ↓ (si RECIBIDA)
[Sistema] → Consultar Autorización SRI
    ↓
[SRI] → Responde: AUTORIZADO, NO AUTORIZADO o EN PROCESO
    ↓ (si AUTORIZADO)
[Sistema] → Cambiar estado a AUTORIZADA
    ↓
[Sistema] → Guardar artifact (AUTHORIZED_XML)
    ↓
[Sistema] → Guardar número y fecha de autorización
    ↓
[Sistema] → Crear evento: AUTHORIZED
    ↓
[Cliente] ← Respuesta con factura autorizada
```

## 🛡️ Validaciones Implementadas

- ✅ Validación de RUC (13 dígitos con dígito verificador)
- ✅ Validación de Cédula (10 dígitos con dígito verificador)
- ✅ Validación de formato de fechas
- ✅ Validación de estructura de XML según esquema XSD del SRI
- ✅ Validación de códigos de impuestos según tabla del SRI
- ✅ Validación de formas de pago según tabla del SRI
- ✅ Cálculo automático de totales e impuestos
- ✅ Generación de clave de acceso con dígito verificador módulo 11

## 🔐 Seguridad

- Certificados digitales almacenados de forma segura
- Contraseñas encriptadas con bcrypt
- Validación de datos en cada endpoint
- Manejo seguro de errores sin exponer información sensible
- Logs de auditoría completos

## 📞 Soporte

Para más información sobre los estándares del SRI, consulta:
- [ESTANDARES_SRI.md](./ESTANDARES_SRI.md)
- [CERTIFICADO.md](./CERTIFICADO.md)
- [Documentación oficial del SRI](https://www.sri.gob.ec/facturacion-electronica)

## 🐛 Troubleshooting

### Error: "Cannot connect to database"
- Verifica que PostgreSQL esté corriendo
- Verifica las credenciales en `.env`
- Verifica que la base de datos exista

### Error: "Certificado inválido"
- Verifica la ruta del certificado en `.env`
- Verifica la contraseña del certificado
- Asegúrate que el certificado sea .p12 o .pfx válido

### Error: "RUC inválido"
- El RUC debe tener 13 dígitos
- El último dígito es verificador (usar algoritmo módulo 11)

### Error: "SRI timeout"
- Los servicios del SRI pueden estar caídos
- Verifica la conectividad a internet
- Usa el endpoint de retry para reintentar

