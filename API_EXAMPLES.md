# 📮 Ejemplos de Requests - API de Facturación Electrónica

Este documento contiene ejemplos de requests para probar la API usando herramientas como Postman, Insomnia o cURL.

## 🔧 Configuración Base

**Base URL:** `http://localhost:3000/api/v1`

**Headers comunes:**
```
Content-Type: application/json
Accept: application/json
```

## 1️⃣ Emisores (Issuers)

### 1.1 Crear Emisor

```http
POST /issuers
Content-Type: application/json

{
  "ruc": "1792146739001",
  "razonSocial": "EMPRESA EJEMPLO S.A.",
  "nombreComercial": "EJEMPLO COMERCIAL",
  "direccionMatriz": "Av. 10 de Agosto N36-123 y Naciones Unidas, Quito - Pichincha",
  "ambiente": "PRUEBAS",
  "establecimiento": "001",
  "puntoEmision": "001",
  "certP12Path": "./certificates/empresa_ejemplo.p12",
  "certPasswordEncrypted": "miPasswordSeguro123",
  "obligadoContabilidad": true,
  "email": "facturacion@empresaejemplo.com",
  "telefono": "022345678"
}
```

### 1.2 Listar Emisores

```http
GET /issuers
```

### 1.3 Obtener Emisor por ID

```http
GET /issuers/{id}
```

Ejemplo:
```http
GET /issuers/550e8400-e29b-41d4-a716-446655440000
```

### 1.4 Obtener Emisor por RUC

```http
GET /issuers/ruc/{ruc}
```

Ejemplo:
```http
GET /issuers/ruc/1792146739001
```

### 1.5 Actualizar Emisor

```http
PUT /issuers/{id}
Content-Type: application/json

{
  "email": "nuevo-email@empresaejemplo.com",
  "telefono": "022999999",
  "direccionMatriz": "Av. República E7-123 y Amazonas, Quito"
}
```

### 1.6 Eliminar Emisor

```http
DELETE /issuers/{id}
```

## 2️⃣ Facturas (Invoices)

### 2.1 Crear Factura Simple

```http
POST /invoices
Content-Type: application/json

{
  "issuerId": "550e8400-e29b-41d4-a716-446655440000",
  "tipoIdentificacionComprador": "RUC",
  "identificacionComprador": "0999999999001",
  "razonSocialComprador": "CLIENTE EJEMPLO S.A.",
  "direccionComprador": "Av. Amazonas y NNUU, Quito",
  "emailComprador": "cliente@ejemplo.com",
  "detalles": [
    {
      "codigoPrincipal": "PROD001",
      "descripcion": "Laptop Dell Inspiron 15",
      "cantidad": 1,
      "precioUnitario": 850.00,
      "descuento": 0,
      "impuestos": [
        {
          "codigo": "2",
          "codigoPorcentaje": "2",
          "tarifa": 12,
          "baseImponible": 850.00
        }
      ]
    }
  ],
  "pagos": [
    {
      "formaPago": "01",
      "total": 952.00,
      "plazo": 0,
      "unidadTiempo": "DIAS"
    }
  ],
  "infoAdicional": [
    {
      "nombre": "Email",
      "valor": "cliente@ejemplo.com"
    },
    {
      "nombre": "Teléfono",
      "valor": "0999999999"
    }
  ]
}
```

### 2.2 Crear Factura con Múltiples Items

```http
POST /invoices
Content-Type: application/json

{
  "issuerId": "550e8400-e29b-41d4-a716-446655440000",
  "tipoIdentificacionComprador": "CEDULA",
  "identificacionComprador": "1714587629",
  "razonSocialComprador": "Juan Pérez Gómez",
  "direccionComprador": "Calle Principal 123",
  "emailComprador": "juan.perez@email.com",
  "detalles": [
    {
      "codigoPrincipal": "PROD001",
      "codigoAuxiliar": "AUX001",
      "descripcion": "Monitor LG 24 pulgadas",
      "cantidad": 2,
      "precioUnitario": 250.00,
      "descuento": 25.00,
      "impuestos": [
        {
          "codigo": "2",
          "codigoPorcentaje": "2",
          "tarifa": 12,
          "baseImponible": 475.00
        }
      ]
    },
    {
      "codigoPrincipal": "PROD002",
      "descripcion": "Teclado mecánico RGB",
      "cantidad": 1,
      "precioUnitario": 120.00,
      "descuento": 0,
      "impuestos": [
        {
          "codigo": "2",
          "codigoPorcentaje": "2",
          "tarifa": 12,
          "baseImponible": 120.00
        }
      ]
    },
    {
      "codigoPrincipal": "PROD003",
      "descripcion": "Mouse inalámbrico",
      "cantidad": 1,
      "precioUnitario": 35.00,
      "descuento": 5.00,
      "impuestos": [
        {
          "codigo": "2",
          "codigoPorcentaje": "2",
          "tarifa": 12,
          "baseImponible": 30.00
        }
      ]
    }
  ],
  "pagos": [
    {
      "formaPago": "19",
      "total": 350.00,
      "plazo": 0,
      "unidadTiempo": "DIAS"
    },
    {
      "formaPago": "01",
      "total": 350.00,
      "plazo": 0,
      "unidadTiempo": "DIAS"
    }
  ],
  "infoAdicional": [
    {
      "nombre": "Email",
      "valor": "juan.perez@email.com"
    },
    {
      "nombre": "Vendedor",
      "valor": "María López"
    },
    {
      "nombre": "Observaciones",
      "valor": "Entrega inmediata"
    }
  ]
}
```

### 2.3 Crear Factura con IVA 0% y Sin Impuestos

```http
POST /invoices
Content-Type: application/json

{
  "issuerId": "550e8400-e29b-41d4-a716-446655440000",
  "tipoIdentificacionComprador": "RUC",
  "identificacionComprador": "0999999999001",
  "razonSocialComprador": "EXPORTADORA ABC S.A.",
  "direccionComprador": "Zona Industrial Km 5",
  "emailComprador": "exportadora@abc.com",
  "detalles": [
    {
      "codigoPrincipal": "SERV001",
      "descripcion": "Servicio de consultoría empresarial",
      "cantidad": 10,
      "precioUnitario": 150.00,
      "descuento": 0,
      "impuestos": [
        {
          "codigo": "2",
          "codigoPorcentaje": "0",
          "tarifa": 0,
          "baseImponible": 1500.00
        }
      ]
    }
  ],
  "pagos": [
    {
      "formaPago": "20",
      "total": 1500.00,
      "plazo": 30,
      "unidadTiempo": "DIAS"
    }
  ],
  "infoAdicional": [
    {
      "nombre": "Contrato",
      "valor": "CNT-2024-001"
    },
    {
      "nombre": "Periodo",
      "valor": "Enero 2024"
    }
  ]
}
```

### 2.4 Listar Facturas con Filtros

```http
GET /invoices?page=1&limit=10&estado=AUTORIZADA&fechaDesde=2024-01-01&fechaHasta=2024-12-31
```

Parámetros disponibles:
- `page`: Número de página (default: 1)
- `limit`: Resultados por página (default: 10, max: 100)
- `estado`: BORRADOR | EN_PROCESO | AUTORIZADA | RECHAZADA | NO_AUTORIZADA
- `fechaDesde`: Formato YYYY-MM-DD
- `fechaHasta`: Formato YYYY-MM-DD
- `identificacionComprador`: RUC o cédula

### 2.5 Obtener Factura por ID

```http
GET /invoices/{id}
```

### 2.6 Autorizar Factura

```http
POST /invoices/{id}/authorize
```

Este endpoint ejecuta todo el flujo:
1. Genera la clave de acceso
2. Construye el XML
3. Firma el XML
4. Envía a recepción del SRI
5. Consulta la autorización

### 2.7 Consultar Estado de Autorización

```http
GET /invoices/{id}/check-authorization
```

### 2.8 Reintentar Autorización

```http
POST /invoices/{id}/retry
```

## 3️⃣ Códigos de Referencia

### Tipos de Identificación

```
CEDULA = 05
RUC = 04
PASAPORTE = 06
CONSUMIDOR_FINAL = 07
IDENTIFICACION_EXTERIOR = 08
PLACA = 09
```

### Formas de Pago

```
01 = SIN UTILIZACION DEL SISTEMA FINANCIERO
15 = COMPENSACIÓN DE DEUDAS
16 = TARJETA DE DÉBITO
17 = DINERO ELECTRÓNICO
18 = TARJETA PREPAGO
19 = TARJETA DE CRÉDITO
20 = OTROS CON UTILIZACIÓN DEL SISTEMA FINANCIERO
21 = ENDOSO DE TÍTULOS
```

### Códigos de Impuesto (IVA)

```
Código: 2 (IVA)
  - Porcentaje 0: tarifa 0%
  - Porcentaje 2: tarifa 12%
  - Porcentaje 3: tarifa 14%
  - Porcentaje 4: tarifa 15%
  - Porcentaje 6: No objeto de impuesto
  - Porcentaje 7: Exento de IVA
```

### Ambientes

```
PRUEBAS = 1
PRODUCCION = 2
```

## 4️⃣ Casos de Uso Completos

### Caso 1: Venta al por menor (Cliente con Cédula)

```http
POST /invoices
Content-Type: application/json

{
  "issuerId": "550e8400-e29b-41d4-a716-446655440000",
  "tipoIdentificacionComprador": "CEDULA",
  "identificacionComprador": "1714587629",
  "razonSocialComprador": "María Fernanda Torres",
  "direccionComprador": "La Floresta, Quito",
  "emailComprador": "maria.torres@email.com",
  "detalles": [
    {
      "codigoPrincipal": "ROPA001",
      "descripcion": "Camisa de vestir talla M",
      "cantidad": 2,
      "precioUnitario": 45.00,
      "descuento": 9.00,
      "impuestos": [
        {
          "codigo": "2",
          "codigoPorcentaje": "2",
          "tarifa": 12,
          "baseImponible": 81.00
        }
      ]
    }
  ],
  "pagos": [
    {
      "formaPago": "19",
      "total": 90.72,
      "plazo": 0,
      "unidadTiempo": "DIAS"
    }
  ],
  "propina": 0,
  "infoAdicional": [
    {
      "nombre": "Email",
      "valor": "maria.torres@email.com"
    },
    {
      "nombre": "Tienda",
      "valor": "Centro Histórico"
    }
  ]
}
```

### Caso 2: Venta B2B (Cliente con RUC)

```http
POST /invoices
Content-Type: application/json

{
  "issuerId": "550e8400-e29b-41d4-a716-446655440000",
  "tipoIdentificacionComprador": "RUC",
  "identificacionComprador": "1792146739001",
  "razonSocialComprador": "DISTRIBUIDORA NACIONAL S.A.",
  "direccionComprador": "Parque Industrial, Guayaquil",
  "emailComprador": "compras@distribuidora.com",
  "detalles": [
    {
      "codigoPrincipal": "MAT001",
      "descripcion": "Material de construcción - Cemento 50kg",
      "cantidad": 100,
      "precioUnitario": 8.50,
      "descuento": 85.00,
      "impuestos": [
        {
          "codigo": "2",
          "codigoPorcentaje": "2",
          "tarifa": 12,
          "baseImponible": 765.00
        }
      ]
    },
    {
      "codigoPrincipal": "MAT002",
      "descripcion": "Material de construcción - Arena m³",
      "cantidad": 20,
      "precioUnitario": 15.00,
      "descuento": 0,
      "impuestos": [
        {
          "codigo": "2",
          "codigoPorcentaje": "2",
          "tarifa": 12,
          "baseImponible": 300.00
        }
      ]
    }
  ],
  "pagos": [
    {
      "formaPago": "20",
      "total": 1192.80,
      "plazo": 60,
      "unidadTiempo": "DIAS"
    }
  ],
  "infoAdicional": [
    {
      "nombre": "Email",
      "valor": "compras@distribuidora.com"
    },
    {
      "nombre": "Orden de Compra",
      "valor": "OC-2024-0045"
    },
    {
      "nombre": "Contacto",
      "valor": "Ing. Carlos Mendoza"
    }
  ]
}
```

### Caso 3: Servicio Profesional

```http
POST /invoices
Content-Type: application/json

{
  "issuerId": "550e8400-e29b-41d4-a716-446655440000",
  "tipoIdentificacionComprador": "CEDULA",
  "identificacionComprador": "0987654321",
  "razonSocialComprador": "Roberto Andrade Pérez",
  "direccionComprador": "González Suárez N27-142",
  "emailComprador": "roberto.andrade@email.com",
  "detalles": [
    {
      "codigoPrincipal": "SERV-LEGAL-001",
      "descripcion": "Asesoría jurídica - Caso civil",
      "cantidad": 1,
      "precioUnitario": 500.00,
      "descuento": 0,
      "impuestos": [
        {
          "codigo": "2",
          "codigoPorcentaje": "2",
          "tarifa": 12,
          "baseImponible": 500.00
        }
      ]
    }
  ],
  "pagos": [
    {
      "formaPago": "20",
      "total": 560.00,
      "plazo": 0,
      "unidadTiempo": "DIAS"
    }
  ],
  "infoAdicional": [
    {
      "nombre": "Email",
      "valor": "roberto.andrade@email.com"
    },
    {
      "nombre": "Caso",
      "valor": "Divorcio contencioso"
    },
    {
      "nombre": "Expediente",
      "valor": "2024-0234"
    }
  ]
}
```

## 5️⃣ Respuestas Esperadas

### Respuesta Exitosa - Crear Factura (201 Created)

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "secuencial": "000000001",
  "estado": "BORRADOR",
  "fechaEmision": "2024-01-15",
  "totalSinImpuestos": 850.00,
  "totalDescuento": 0.00,
  "propina": 0.00,
  "importeTotal": 952.00,
  "moneda": "DOLAR",
  "comprador": {
    "tipoIdentificacion": "RUC",
    "identificacion": "0999999999001",
    "razonSocial": "CLIENTE EJEMPLO S.A.",
    "direccion": "Av. Amazonas y NNUU, Quito",
    "email": "cliente@ejemplo.com"
  },
  "detalles": [...],
  "pagos": [...],
  "totalConImpuestos": [...],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Respuesta Exitosa - Autorizar Factura (200 OK)

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "secuencial": "000000001",
  "estado": "AUTORIZADA",
  "claveAcceso": "1501202401179214673900110010010000000011234567891",
  "numeroAutorizacion": "1501202401179214673900110010010000000011234567891",
  "fechaAutorizacion": "2024-01-15T10:35:00.000Z",
  "estadoSriRecepcion": "RECIBIDA",
  "estadoSriAutorizacion": "AUTORIZADO",
  "mensajeSri": null,
  ...
}
```

### Respuesta de Error (400 Bad Request)

```json
{
  "statusCode": 400,
  "message": [
    "identificacionComprador must be a valid RUC or Cedula",
    "totalConImpuestos should not be empty"
  ],
  "error": "Bad Request"
}
```

### Respuesta de Error (404 Not Found)

```json
{
  "statusCode": 404,
  "message": "Factura con ID 123e4567-e89b-12d3-a456-426614174000 no encontrada",
  "error": "Not Found"
}
```

## 6️⃣ Tips y Mejores Prácticas

### 1. Validación antes de enviar

Asegúrate de validar los datos antes de crear la factura:
- RUC/Cédula válidos
- Totales correctos
- Códigos de impuestos correctos según tabla del SRI

### 2. Manejo de errores

Implementa reintentos automáticos para:
- Timeout del SRI
- Errores de red
- Estado "EN PROCESO" del SRI

### 3. Ambiente de pruebas

Siempre prueba en ambiente de PRUEBAS antes de pasar a PRODUCCION:
- URL de pruebas del SRI: `celery.sri.gob.ec`
- URL de producción del SRI: `cel.sri.gob.ec`

### 4. Almacenamiento de comprobantes

Los XML y PDF autorizados se almacenan automáticamente en `invoice_artifact`.

### 5. Auditoría

Todos los eventos se registran en `invoice_event` para trazabilidad completa.

## 7️⃣ Collection de Postman

Puedes importar esta estructura básica en Postman:

```json
{
  "info": {
    "name": "Facturación Electrónica SRI",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Issuers",
      "item": [
        {
          "name": "Create Issuer",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/issuers",
            "body": {...}
          }
        }
      ]
    },
    {
      "name": "Invoices",
      "item": [
        {
          "name": "Create Invoice",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/invoices",
            "body": {...}
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000/api/v1"
    }
  ]
}
```

---

Para más información, consulta:
- [README.md](./README.md) - Documentación general
- [QUICKSTART.md](./QUICKSTART.md) - Guía de inicio rápido
- [Swagger UI](http://localhost:3000/api/v1/docs) - Documentación interactiva
