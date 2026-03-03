export enum AmbienteType {
  PRUEBAS = 'PRUEBAS',
  PRODUCCION = 'PRODUCCION',
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT', // Borrador
  PENDING_SIGNATURE = 'PENDING_SIGNATURE', // Pendiente de firma
  SIGNED = 'SIGNED', // Firmada
  SENDING = 'SENDING', // Enviando al SRI
  AUTHORIZED = 'AUTHORIZED', // Autorizada por el SRI
  NOT_AUTHORIZED = 'NOT_AUTHORIZED', // No autorizada
  ERROR = 'ERROR', // Error en el proceso
  CANCELLED = 'CANCELLED', // Cancelada
}

export enum SriReceptionStatus {
  PENDING = 'PENDING', // Pendiente de envío
  RECEIVED = 'RECEIVED', // Recibida por el SRI
  DEVUELTA = 'DEVUELTA', // Devuelta por errores
  ERROR = 'ERROR', // Error en recepción
}

export enum SriAuthorizationStatus {
  PENDING = 'PENDING', // Pendiente de autorización
  EN_PROCESAMIENTO = 'EN_PROCESAMIENTO', // En procesamiento
  AUTORIZADO = 'AUTORIZADO', // Autorizado
  NO_AUTORIZADO = 'NO_AUTORIZADO', // No autorizado
  DEVUELTA = 'DEVUELTA', // Devuelta
}

export enum ArtifactType {
  XML_UNSIGNED = 'XML_UNSIGNED', // XML sin firmar
  XML_SIGNED = 'XML_SIGNED', // XML firmado
  XML_AUTHORIZED = 'XML_AUTHORIZED', // XML autorizado
  RIDE_PDF = 'RIDE_PDF', // PDF del comprobante
  RESPONSE_RECEPTION = 'RESPONSE_RECEPTION', // Respuesta de recepción del SRI
  RESPONSE_AUTH = 'RESPONSE_AUTH', // Respuesta de autorización del SRI
}

export enum InvoiceEventType {
  CREATED = 'CREATED',
  SIGNED = 'SIGNED',
  SENT = 'SENT',
  RECEIVED = 'RECEIVED',
  AUTHORIZED = 'AUTHORIZED',
  NOT_AUTHORIZED = 'NOT_AUTHORIZED',
  ERROR = 'ERROR',
  RETRY = 'RETRY',
  CANCELLED = 'CANCELLED',
  UPDATED = 'UPDATED',
}
