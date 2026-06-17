/**
 * Formats a numeric value into the standard Kwanza (Kz) representation required:
 * dot (.) as thousands separator and comma (,) for decimals (e.g. 12.000,00 Kz).
 */
export function formatKz(value: number | string | null | undefined): string {
  if (value === null || value === undefined) {
    return '0,00 Kz';
  }
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) {
    return '0,00 Kz';
  }
  const parts = num.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${parts.join(',')} Kz`;
}

/**
 * Formats a numeric value into the standard representation without "Kz" suffix.
 * Useful for fields, inputs, or labels where Kz is already indicated (e.g. 12.000,00).
 */
export function formatKzNum(value: number | string | null | undefined): string {
  if (value === null || value === undefined) {
    return '0,00';
  }
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) {
    return '0,00';
  }
  const parts = num.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return parts.join(',');
}
