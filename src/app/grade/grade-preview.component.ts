import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { GradeParams, GradeResult } from './grade-calc';
import { formatMm } from './mm.pipe';

interface Space {
  x0: number;
  x1: number;
  label: string;
  showLabel: boolean;
  isEnd: boolean;
}

/** Desenho em escala do módulo. O viewBox do SVG está em milímetros. */
@Component({
  selector: 'app-grade-preview',
  templateUrl: './grade-preview.component.html',
  styleUrl: './grade-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GradePreviewComponent {
  readonly params = input.required<GradeParams>();
  readonly result = input.required<GradeResult>();

  protected readonly geo = computed(() => {
    const p = this.params();
    const r = this.result();
    const L = p.moduleLength;
    const H = p.height;
    const hs = p.horizontalSize;
    const fs = Math.max(14, Math.max(L, H) * 0.022);
    const post = Math.max(40, L * 0.025);
    const top = fs * 3.2;
    const bottom = fs * 5;
    const pad = fs * 0.8;

    const labelAll = r.gap >= fs * 3.2;
    const edges = [0, ...r.marks.flatMap((m) => [m.start, m.end]), L];
    const spaces: Space[] = [];
    for (let i = 0; i < edges.length; i += 2) {
      const isEnd = i === 0 || i === edges.length - 2;
      const x0 = edges[i];
      const x1 = edges[i + 1];
      spaces.push({ x0, x1, label: formatMm(x1 - x0), showLabel: labelAll || isEnd, isEnd });
    }

    return {
      L,
      H,
      hs,
      fs,
      post,
      verticalTop: hs,
      verticalHeight: Math.max(H - 2 * hs, 0),
      viewBox: `${-post - pad} ${-top} ${L + 2 * (post + pad)} ${H + top + bottom}`,
      spaces,
      labelAll,
      dimY: H + fs * 1.6,
      summaryY: H + fs * 4,
      totalLabel: `${formatMm(L)} mm`,
      heightLabel: `${formatMm(H)} mm`,
    };
  });
}
