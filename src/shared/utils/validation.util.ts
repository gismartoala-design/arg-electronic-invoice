import { FIELD_LENGTHS } from '../constants/sri.constants';

/**
 * Valida un RUC ecuatoriano
 */
export function validateRuc(ruc: string): boolean {
  if (!ruc || ruc.length !== FIELD_LENGTHS.RUC) {
    return false;
  }

  const coeficientes = [4, 3, 2, 7, 6, 5, 4, 3, 2];
  const tercerDigito = parseInt(ruc.charAt(2));

  // Validación según el tercer dígito
  if (tercerDigito < 6) {
    // Persona natural o jurídica
    return validateCedula(ruc.substring(0, 10));
  } else if (tercerDigito === 6) {
    // Entidad pública
    return validatePublicEntity(ruc);
  } else if (tercerDigito === 9) {
    // Persona jurídica
    return validateCompany(ruc);
  }

  return false;
}

/**
 * Valida una cédula ecuatoriana
 */
export function validateCedula(cedula: string): boolean {
  if (!cedula || cedula.length !== FIELD_LENGTHS.CEDULA) {
    return false;
  }

  const provincia = parseInt(cedula.substring(0, 2));
  if (provincia < 1 || provincia > 24) {
    return false;
  }

  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let valor = parseInt(cedula.charAt(i)) * coeficientes[i];
    if (valor >= 10) {
      valor -= 9;
    }
    suma += valor;
  }

  const digitoVerificador = parseInt(cedula.charAt(9));
  const resultado = suma % 10;
  const verificador = resultado === 0 ? 0 : 10 - resultado;

  return verificador === digitoVerificador;
}

/**
 * Valida RUC de entidad pública
 */
function validatePublicEntity(ruc: string): boolean {
  const coeficientes = [3, 2, 7, 6, 5, 4, 3, 2];
  let suma = 0;

  for (let i = 0; i < 8; i++) {
    suma += parseInt(ruc.charAt(i)) * coeficientes[i];
  }

  const digitoVerificador = parseInt(ruc.charAt(8));
  const resultado = suma % 11;
  const verificador = resultado === 0 ? 0 : 11 - resultado;

  return verificador === digitoVerificador;
}

/**
 * Valida RUC de persona jurídica
 */
function validateCompany(ruc: string): boolean {
  const coeficientes = [4, 3, 2, 7, 6, 5, 4, 3, 2];
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    suma += parseInt(ruc.charAt(i)) * coeficientes[i];
  }

  const digitoVerificador = parseInt(ruc.charAt(9));
  const resultado = suma % 11;
  const verificador = resultado === 0 ? 0 : 11 - resultado;

  return verificador === digitoVerificador;
}
