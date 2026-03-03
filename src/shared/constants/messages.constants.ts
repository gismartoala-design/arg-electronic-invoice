/**
 * Mensajes de error comunes
 */
export const ERROR_MESSAGES = {
  // Validación
  INVALID_RUC: 'RUC inválido',
  INVALID_CEDULA: 'Cédula inválida',
  INVALID_EMAIL: 'Email inválido',
  INVALID_DATE: 'Fecha inválida',
  INVALID_AMOUNT: 'Monto inválido',
  REQUIRED_FIELD: 'Campo requerido',

  // SRI
  SRI_RECEPTION_ERROR: 'Error al enviar comprobante a recepción del SRI',
  SRI_AUTHORIZATION_ERROR: 'Error al consultar autorización del SRI',
  SRI_CONNECTION_ERROR: 'Error de conexión con el SRI',
  SRI_TIMEOUT: 'Tiempo de espera agotado al comunicar con el SRI',

  // Firma Digital
  SIGNATURE_ERROR: 'Error al firmar el documento',
  CERTIFICATE_NOT_FOUND: 'Certificado digital no encontrado',
  CERTIFICATE_EXPIRED: 'Certificado digital expirado',
  CERTIFICATE_INVALID: 'Certificado digital inválido',
  INVALID_PASSWORD: 'Contraseña del certificado incorrecta',

  // XML
  XML_GENERATION_ERROR: 'Error al generar XML',
  XML_VALIDATION_ERROR: 'Error de validación del XML',
  XML_PARSE_ERROR: 'Error al parsear XML',

  // General
  NOT_FOUND: 'Recurso no encontrado',
  UNAUTHORIZED: 'No autorizado',
  FORBIDDEN: 'Prohibido',
  INTERNAL_ERROR: 'Error interno del servidor',
};

/**
 * Mensajes de éxito
 */
export const SUCCESS_MESSAGES = {
  CREATED: 'Creado exitosamente',
  UPDATED: 'Actualizado exitosamente',
  DELETED: 'Eliminado exitosamente',
  AUTHORIZED: 'Autorizado exitosamente',
  SENT: 'Enviado exitosamente',
};
