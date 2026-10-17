/** Todas as medidas em milímetros. */
export type SpacingMode = 'equal' | 'fixed';

export interface GradeParams {
  /** Comprimento livre do módulo, entre as traves. */
  moduleLength: number;
  /** Altura total do módulo (de fora a fora das barras horizontais). */
  height: number;
  /** Seção das barras horizontais (superior e inferior), ex.: 30 para 30x30. */
  horizontalSize: number;
  /** Seção das barras verticais, ex.: 20 para 20x20. */
  verticalSize: number;
  /** Vão livre desejado entre barras verticais (definido pelo slider). */
  desiredGap: number;
  /**
   * equal: ajusta o vão para que todos os espaços (inclusive as pontas) fiquem iguais.
   * fixed: mantém o vão desejado entre as barras e divide a sobra igualmente nas pontas.
   */
  mode: SpacingMode;
  modules: number;
  /** Comprimento da barra comercial, normalmente 6000 mm. */
  stockLength: number;
  /** Perda por corte (espessura do disco). */
  kerf: number;
}

export interface BarMark {
  index: number;
  /** Distâncias medidas a partir da ponta esquerda da barra horizontal. */
  start: number;
  center: number;
  end: number;
}

export interface GradeResult {
  valid: boolean;
  message?: string;
  barCount: number;
  /** Vão livre entre barras verticais. */
  gap: number;
  /** Vão livre entre a trave e a primeira/última barra. */
  endGap: number;
  /** Distância entre eixos (centro a centro) das barras verticais. */
  centerToCenter: number;
  /** Vão que deixaria todos os espaços iguais com a mesma quantidade de barras. */
  idealGap: number;
  marks: BarMark[];
  verticalCutLength: number;
  verticalPieces: number;
  verticalTotalLength: number;
  verticalStockBars: number;
  horizontalPieces: number;
  horizontalTotalLength: number;
  horizontalStockBars: number;
}

export function calculateGrade(p: GradeParams): GradeResult {
  const L = p.moduleLength;
  const w = p.verticalSize;
  const g = Math.max(p.desiredGap, 1);
  const verticalCutLength = p.height - 2 * p.horizontalSize;

  if (!(L > 0) || !(w > 0) || !(p.height > 0) || !(p.horizontalSize > 0)) {
    return invalid('Informe medidas maiores que zero.');
  }
  if (verticalCutLength <= 0) {
    return invalid('A altura precisa ser maior que a soma das duas barras horizontais.');
  }
  if (L < w + 2) {
    return invalid('O módulo é menor que a largura de uma barra vertical.');
  }

  // Com n barras e pontas iguais ao vão: L = n·w + (n + 1)·vão
  const barCount =
    p.mode === 'equal'
      ? Math.max(1, Math.round((L - g) / (w + g)))
      : Math.max(1, Math.floor((L - g) / (w + g)));

  const idealGap = (L - barCount * w) / (barCount + 1);
  const gap = p.mode === 'equal' ? idealGap : g;
  const endGap = p.mode === 'equal' ? idealGap : (L - barCount * w - (barCount - 1) * g) / 2;

  const marks: BarMark[] = [];
  for (let i = 0; i < barCount; i++) {
    const start = endGap + i * (w + gap);
    marks.push({ index: i + 1, start, center: start + w / 2, end: start + w });
  }

  const modules = Math.max(1, Math.floor(p.modules));
  const verticalPieces = barCount * modules;
  const horizontalPieces = 2 * modules;

  return {
    valid: true,
    barCount,
    gap,
    endGap,
    centerToCenter: gap + w,
    idealGap,
    marks,
    verticalCutLength,
    verticalPieces,
    verticalTotalLength: verticalPieces * verticalCutLength,
    verticalStockBars: stockBarsNeeded(verticalPieces, verticalCutLength, p.stockLength, p.kerf),
    horizontalPieces,
    horizontalTotalLength: horizontalPieces * L,
    horizontalStockBars: stockBarsNeeded(horizontalPieces, L, p.stockLength, p.kerf),
  };
}

/** Quantas barras comerciais são necessárias para cortar `pieces` peças de `length`. */
export function stockBarsNeeded(pieces: number, length: number, stockLength: number, kerf: number): number {
  if (pieces <= 0 || !(stockLength > 0)) return 0;
  if (length > stockLength) {
    // Peça maior que a barra comercial: emenda, conta por metragem.
    return Math.ceil((pieces * length) / stockLength);
  }
  const perBar = Math.floor((stockLength + kerf) / (length + kerf));
  return Math.ceil(pieces / perBar);
}

function invalid(message: string): GradeResult {
  return {
    valid: false,
    message,
    barCount: 0,
    gap: 0,
    endGap: 0,
    centerToCenter: 0,
    idealGap: 0,
    marks: [],
    verticalCutLength: 0,
    verticalPieces: 0,
    verticalTotalLength: 0,
    verticalStockBars: 0,
    horizontalPieces: 0,
    horizontalTotalLength: 0,
    horizontalStockBars: 0,
  };
}
