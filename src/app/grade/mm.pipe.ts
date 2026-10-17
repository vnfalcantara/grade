import { Pipe, PipeTransform } from '@angular/core';

/** Formata um valor em milímetros no padrão pt-BR, ex.: 1234.56 -> "1.234,6". */
@Pipe({ name: 'mm' })
export class MmPipe implements PipeTransform {
  transform(value: number, digits = 1): string {
    return formatMm(value, digits);
  }
}

export function formatMm(value: number, digits = 1): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: digits });
}
