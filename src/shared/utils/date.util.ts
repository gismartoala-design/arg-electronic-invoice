import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

/**
 * Formatea una fecha al formato requerido por el SRI (dd/MM/yyyy)
 */
export function formatDateForSri(date: Date | string): string {
  return dayjs(date).format('DD/MM/YYYY');
}

/**
 * Obtiene la fecha actual en formato SRI
 */
export function getCurrentDateForSri(): string {
  return dayjs().format('DD/MM/YYYY');
}

/**
 * Valida si una fecha tiene formato válido para el SRI
 */
export function isValidSriDate(date: string): boolean {
  return dayjs(date, 'DD/MM/YYYY', true).isValid();
}

/**
 * Convierte una fecha de formato SRI a objeto Date
 */
export function parseSriDate(sriDate: string): Date {
  return dayjs(sriDate, 'DD/MM/YYYY').toDate();
}
