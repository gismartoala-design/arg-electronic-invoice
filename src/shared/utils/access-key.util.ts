import { IAccessKey } from '../interfaces/common.interfaces';
import { FIELD_LENGTHS } from '../constants/sri.constants';

/**
 * Genera la clave de acceso de 49 dígitos según especificaciones del SRI
 */
export function generateAccessKey(data: IAccessKey): string {
  const {
    fecha,
    tipoComprobante,
    ruc,
    ambiente,
    serie,
    numeroComprobante,
    codigoNumerico,
    tipoEmision,
  } = data;

  // Formato: ddmmaaaa + tipo comprobante + ruc + ambiente + serie + número + código numérico + tipo emisión
  const fechaParts = fecha.split('/');
  const fechaFormateada = fechaParts[0] + fechaParts[1] + fechaParts[2];

  const claveBase =
    fechaFormateada +
    tipoComprobante +
    ruc +
    ambiente +
    serie +
    numeroComprobante.padStart(FIELD_LENGTHS.SECUENCIAL, '0') +
    codigoNumerico.padStart(8, '0') +
    tipoEmision;

  // Calcular dígito verificador
  const digitoVerificador = calculateModulo11(claveBase);

  return claveBase + digitoVerificador;
}

/**
 * Calcula el dígito verificador usando módulo 11
 */
function calculateModulo11(clave: string): number {
  let suma = 0;
  let factor = 2;

  for (let i = clave.length - 1; i >= 0; i--) {
    suma += parseInt(clave.charAt(i)) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }

  const modulo = suma % 11;
  const resultado = 11 - modulo;

  // Reglas SRI para módulo 11:
  // 11 => 0, 10 => 1, caso contrario => resultado.
  if (resultado === 11) return 0;
  if (resultado === 10) return 1;

  return resultado;
}

/**
 * Valida una clave de acceso
 */
export function validateAccessKey(claveAcceso: string): boolean {
  if (!claveAcceso || claveAcceso.length !== FIELD_LENGTHS.CLAVE_ACCESO) {
    return false;
  }

  const claveBase = claveAcceso.substring(0, 48);
  const digitoVerificador = parseInt(claveAcceso.charAt(48));

  return calculateModulo11(claveBase) === digitoVerificador;
}

/**
 * Extrae información de una clave de acceso
 */
export function parseAccessKey(claveAcceso: string): IAccessKey | null {
  if (!validateAccessKey(claveAcceso)) {
    return null;
  }

  return {
    fecha: claveAcceso.substring(0, 8),
    tipoComprobante: claveAcceso.substring(8, 10),
    ruc: claveAcceso.substring(10, 23),
    ambiente: claveAcceso.substring(23, 24),
    serie: claveAcceso.substring(24, 30),
    numeroComprobante: claveAcceso.substring(30, 39),
    codigoNumerico: claveAcceso.substring(39, 47),
    tipoEmision: claveAcceso.substring(47, 48),
  };
}

/**
 * Genera un código numérico aleatorio de 8 dígitos
 */
export function generateNumericCode(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}
