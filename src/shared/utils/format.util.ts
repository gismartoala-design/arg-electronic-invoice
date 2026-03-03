/**
 * Formatea un número a formato decimal con 2 decimales
 */
export function formatDecimal(value: number): string {
  return value.toFixed(2);
}

/**
 * Redondea un número a 2 decimales
 */
export function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Suma un array de números con precisión
 */
export function sumArray(numbers: number[]): number {
  return roundToTwo(numbers.reduce((acc, val) => acc + val, 0));
}

/**
 * Calcula el IVA
 */
export function calculateIVA(baseImponible: number, tarifa: number): number {
  return roundToTwo((baseImponible * tarifa) / 100);
}

/**
 * Calcula el subtotal sin impuestos
 */
export function calculateSubtotal(
  precioUnitario: number,
  cantidad: number,
  descuento: number = 0,
): number {
  return roundToTwo(precioUnitario * cantidad - descuento);
}

/**
 * Valida que un monto sea positivo
 */
export function isPositiveAmount(amount: number): boolean {
  return amount >= 0;
}

/**
 * Convierte texto a mayúsculas sin acentos
 */
export function normalizeText(text: string): string {
  return text
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
