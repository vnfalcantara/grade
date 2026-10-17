import { GradeParams, calculateGrade, stockBarsNeeded } from './grade-calc';

const base: GradeParams = {
  moduleLength: 2000,
  height: 1000,
  horizontalSize: 30,
  verticalSize: 20,
  desiredGap: 100,
  mode: 'equal',
  modules: 1,
  stockLength: 6000,
  kerf: 3,
};

describe('calculateGrade', () => {
  it('distributes equal gaps including the ends', () => {
    const r = calculateGrade(base);
    // (2000 - 100) / 120 = 15.83 -> 16 barras; (2000 - 16·20) / 17 = 98.82
    expect(r.barCount).toBe(16);
    expect(r.gap).toBeCloseTo(1680 / 17, 6);
    expect(r.endGap).toBeCloseTo(r.gap, 6);
    expect(r.marks[0].start).toBeCloseTo(r.gap, 6);
    expect(r.marks[15].end + r.endGap).toBeCloseTo(2000, 6);
  });

  it('keeps the exact gap and splits the remainder at the ends', () => {
    const r = calculateGrade({ ...base, mode: 'fixed' });
    // floor(1900 / 120) = 15 barras; sobra = 2000 - 300 - 14·100 = 300 -> 150 por ponta
    expect(r.barCount).toBe(15);
    expect(r.gap).toBe(100);
    expect(r.endGap).toBeCloseTo(150, 6);
    expect(r.marks[1].start - r.marks[0].end).toBeCloseTo(100, 6);
  });

  it('marks are symmetric around the module center', () => {
    const r = calculateGrade({ ...base, desiredGap: 87 });
    const first = r.marks[0];
    const last = r.marks[r.marks.length - 1];
    expect(first.center + last.center).toBeCloseTo(2000, 6);
  });

  it('computes vertical cut length between horizontals and material', () => {
    const r = calculateGrade({ ...base, modules: 3 });
    expect(r.verticalCutLength).toBe(940);
    expect(r.verticalPieces).toBe(48);
    expect(r.horizontalPieces).toBe(6);
    expect(r.horizontalStockBars).toBe(3); // com perda de corte cabem só 2 peças de 2000 por barra de 6000
  });

  it('rejects impossible heights', () => {
    const r = calculateGrade({ ...base, height: 50 });
    expect(r.valid).toBeFalse();
  });
});

describe('stockBarsNeeded', () => {
  it('accounts for the saw kerf', () => {
    expect(stockBarsNeeded(6, 1000, 6000, 0)).toBe(1);
    expect(stockBarsNeeded(6, 1000, 6000, 3)).toBe(2);
  });
});
