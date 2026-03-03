/**
 * Tipos de Comprobantes Electrónicos según el SRI
 */
export enum TipoComprobante {
  FACTURA = '01',
  NOTA_CREDITO = '04',
  NOTA_DEBITO = '05',
  GUIA_REMISION = '06',
  COMPROBANTE_RETENCION = '07',
}

/**
 * Tipos de Identificación
 */
export enum TipoIdentificacion {
  RUC = '04',
  CEDULA = '05',
  PASAPORTE = '06',
  CONSUMIDOR_FINAL = '07',
  IDENTIFICACION_EXTERIOR = '08',
  PLACA = '09',
}

/**
 * Tipos de Ambiente
 */
export enum TipoAmbiente {
  PRUEBAS = '1',
  PRODUCCION = '2',
}

/**
 * Tipos de Emisión
 */
export enum TipoEmision {
  NORMAL = '1',
  INDISPONIBILIDAD = '2',
}

/**
 * Estados de Autorización del SRI
 */
export enum EstadoAutorizacion {
  AUTORIZADO = 'AUTORIZADO',
  NO_AUTORIZADO = 'NO AUTORIZADO',
  DEVUELTO = 'DEVUELTO',
  RECIBIDA = 'RECIBIDA',
  EN_PROCESAMIENTO = 'EN PROCESAMIENTO',
}

/**
 * Códigos de Impuesto
 */
export enum CodigoImpuesto {
  IVA = '2',
  ICE = '3',
  IRBPNR = '5',
}

/**
 * Tarifas de IVA
 */
export enum TarifaIVA {
  IVA_0 = '0',
  IVA_12 = '2',
  IVA_14 = '3',
  IVA_15 = '4',
  NO_OBJETO_IVA = '6',
  EXENTO_IVA = '7',
}

/**
 * Formas de Pago
 */
export enum FormaPago {
  SIN_UTILIZACION = '01',
  EFECTIVO = '01',
  CHEQUE = '02',
  TRANSFERENCIA = '03',
  TARJETA_DEBITO = '04',
  TARJETA_CREDITO = '05',
  OTROS = '20',
}

/**
 * Versiones de XSD del SRI
 */
export const SRI_VERSIONS = {
  FACTURA: '1.1.0',
  NOTA_CREDITO: '1.1.0',
  NOTA_DEBITO: '1.0.0',
  GUIA_REMISION: '1.1.0',
  COMPROBANTE_RETENCION: '2.0.0',
};

/**
 * Longitudes de campos
 */
export const FIELD_LENGTHS = {
  CLAVE_ACCESO: 49,
  RUC: 13,
  CEDULA: 10,
  ESTABLECIMIENTO: 3,
  PUNTO_EMISION: 3,
  SECUENCIAL: 9,
};

/**
 * Expresiones regulares de validación
 */
export const REGEX_PATTERNS = {
  RUC: /^\d{13}$/,
  CEDULA: /^\d{10}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  NUMERIC: /^\d+$/,
  DECIMAL: /^\d+(\.\d{1,2})?$/,
};
