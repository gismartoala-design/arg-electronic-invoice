# API de Integración ERP/POS: `POST /invoices/issue`

Esta guía describe cómo consumir el endpoint de emisión externa de facturas para el flujo ERP/POS.

## Objetivo

El ERP/POS genera el documento fiscal y este servicio actúa como `authorizer gateway`:

- valida la factura
- genera el XML
- firma el comprobante
- envía al SRI
- consulta la autorización
- devuelve el estado fiscal del documento

## Principios del flujo

- La `claveAcceso` es la llave funcional del documento.
- Si el ERP envía la misma `claveAcceso` nuevamente, el servicio no crea otra factura.
- El servicio no genera el PDF del ERP/POS.
- El ERP/POS puede consultar luego el estado por `claveAcceso`.

## Endpoint principal

```http
POST /invoices/issue
Content-Type: application/json
```

## Request

### Campos obligatorios

- `issuerId`
- `fechaEmision`
- `clienteTipoIdentificacion`
- `clienteIdentificacion`
- `clienteRazonSocial`
- `totalSinImpuestos`
- `importeTotal`
- `detalles`
- `pagos`
- `establecimiento`
- `puntoEmision`
- `secuencial`
- `claveAcceso`

### Ejemplo de request

```json
{
  "issuerId": "a7a30e57-0f7a-4e55-84fa-f4f1b9c68d21",
  "fechaEmision": "23/03/2026",
  "clienteTipoIdentificacion": "05",
  "clienteIdentificacion": "0912345678",
  "clienteRazonSocial": "Cliente Demo",
  "clienteDireccion": "Guayaquil",
  "clienteEmail": "cliente@demo.com",
  "clienteTelefono": "0999999999",
  "totalSinImpuestos": 100,
  "totalDescuento": 0,
  "propina": 0,
  "importeTotal": 115,
  "moneda": "DOLAR",
  "establecimiento": "001",
  "puntoEmision": "002",
  "secuencial": "000000123",
  "claveAcceso": "2303202601099999999990010010020000001231234567811",
  "infoAdicional": {
    "posId": "POS-01",
    "cashierId": "USR-15"
  },
  "detalles": [
    {
      "codigoPrincipal": "SKU-001",
      "descripcion": "Producto demo",
      "cantidad": 1,
      "precioUnitario": 100,
      "descuento": 0,
      "precioTotalSinImpuesto": 100,
      "impuestos": [
        {
          "codigo": "2",
          "codigoPorcentaje": "4",
          "tarifa": 15,
          "baseImponible": 100,
          "valor": 15
        }
      ]
    }
  ],
  "pagos": [
    {
      "formaPago": "01",
      "total": 115
    }
  ]
}
```

## Respuesta

La respuesta es JSON e incluye el estado fiscal del documento.

### Campos principales de respuesta

- `id`: identificador interno del documento
- `claveAcceso`: llave funcional del comprobante
- `status`: estado interno del documento
- `sriReceptionStatus`: estado de recepción en SRI
- `sriAuthorizationStatus`: estado de autorización en SRI
- `authorizationNumber`: número de autorización cuando exista
- `authorizedAt`: fecha de autorización cuando exista
- `lastError`: detalle del último error cuando exista
- `artifacts.signedXmlUrl`: URL del XML firmado
- `artifacts.authorizedXmlUrl`: URL del XML autorizado

### Ejemplo de respuesta autorizada

```json
{
  "id": "4d2d0d10-9f57-4978-8d25-3fffc154a36e",
  "issuerId": "a7a30e57-0f7a-4e55-84fa-f4f1b9c68d21",
  "secuencial": "000000123",
  "establecimiento": "001",
  "puntoEmision": "002",
  "claveAcceso": "2303202601099999999990010010020000001231234567811",
  "fechaEmision": "23/03/2026",
  "clienteTipoIdentificacion": "05",
  "clienteIdentificacion": "0912345678",
  "clienteRazonSocial": "Cliente Demo",
  "clienteDireccion": "Guayaquil",
  "clienteEmail": "cliente@demo.com",
  "clienteTelefono": "0999999999",
  "totalSinImpuestos": 100,
  "totalDescuento": 0,
  "propina": 0,
  "importeTotal": 115,
  "moneda": "DOLAR",
  "status": "AUTHORIZED",
  "sriReceptionStatus": "RECEIVED",
  "sriAuthorizationStatus": "AUTORIZADO",
  "authorizationNumber": "2303202601099999999990010010020000001231234567811",
  "authorizedAt": "2026-03-23T18:35:10.000Z",
  "retryCount": 0,
  "lastError": null,
  "createdAt": "2026-03-23T18:35:01.000Z",
  "updatedAt": "2026-03-23T18:35:10.000Z",
  "detalles": [],
  "pagos": [],
  "infoAdicional": {
    "posId": "POS-01",
    "cashierId": "USR-15"
  },
  "artifacts": {
    "signedXmlUrl": "/invoices/4d2d0d10-9f57-4978-8d25-3fffc154a36e/artifacts/XML_SIGNED",
    "authorizedXmlUrl": "/invoices/4d2d0d10-9f57-4978-8d25-3fffc154a36e/artifacts/XML_AUTHORIZED"
  }
}
```

### Ejemplo de respuesta en proceso

```json
{
  "id": "4d2d0d10-9f57-4978-8d25-3fffc154a36e",
  "claveAcceso": "2303202601099999999990010010020000001231234567811",
  "status": "SENDING",
  "sriReceptionStatus": "RECEIVED",
  "sriAuthorizationStatus": "EN_PROCESAMIENTO",
  "authorizationNumber": null,
  "authorizedAt": null,
  "lastError": null,
  "artifacts": {
    "signedXmlUrl": "/invoices/4d2d0d10-9f57-4978-8d25-3fffc154a36e/artifacts/XML_SIGNED"
  }
}
```

### Ejemplo de respuesta con error

```json
{
  "id": "4d2d0d10-9f57-4978-8d25-3fffc154a36e",
  "claveAcceso": "2303202601099999999990010010020000001231234567811",
  "status": "ERROR",
  "sriReceptionStatus": "DEVUELTA",
  "sriAuthorizationStatus": null,
  "authorizationNumber": null,
  "authorizedAt": null,
  "lastError": "[43] ERROR EN ESTRUCTURA XML",
  "artifacts": {
    "signedXmlUrl": "/invoices/4d2d0d10-9f57-4978-8d25-3fffc154a36e/artifacts/XML_SIGNED"
  }
}
```

## Consulta por clave de acceso

```http
GET /invoices/by-access-key/:claveAcceso
```

Este endpoint permite consultar el estado del documento usando la misma `claveAcceso` enviada por el ERP/POS.

## Descarga de artefactos

```http
GET /invoices/:id/artifacts/XML_SIGNED
GET /invoices/:id/artifacts/XML_AUTHORIZED
GET /invoices/:id/artifacts/RESPONSE_RECEPTION
GET /invoices/:id/artifacts/RESPONSE_AUTH
```

## Comportamiento de idempotencia

Si el ERP/POS vuelve a enviar la misma factura con la misma `claveAcceso`:

- no se crea un nuevo documento
- se reutiliza el registro existente
- el servicio devuelve el estado actual
- si el flujo quedó incompleto, el servicio intenta reanudarlo

## Errores esperados

### `400 Bad Request`

Se devuelve cuando el request es inválido, por ejemplo:

- `claveAcceso` con formato incorrecto
- `establecimiento` o `puntoEmision` inválidos
- totales inconsistentes
- datos fiscales que no coinciden con la `claveAcceso`

### `404 Not Found`

Se devuelve cuando:

- el `issuerId` no existe o está inactivo
- la factura consultada por `claveAcceso` no existe

## Recomendaciones para el cliente

- usar siempre la misma `claveAcceso` como identificador funcional
- guardar `id` y `claveAcceso` de la respuesta
- no regenerar el documento si el primer intento no respondió; consultar por `claveAcceso`
- consumir los XML desde `artifacts`
- generar el PDF/RIDE del lado del ERP/POS
