import { ChangeDetectionStrategy, Component, WritableSignal, computed, signal } from '@angular/core';
import { GradeParams, SpacingMode, calculateGrade } from './grade/grade-calc';
import { GradePreviewComponent } from './grade/grade-preview.component';
import { MmPipe } from './grade/mm.pipe';

/** Vão máximo recomendado pela NBR 14718 para guarda-corpos (evita passagem de crianças). */
const MAX_SAFE_GAP = 110;

@Component({
  selector: 'app-root',
  imports: [GradePreviewComponent, MmPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  protected readonly moduleLength = signal(2000);
  protected readonly height = signal(1000);
  protected readonly horizontalSize = signal(30);
  protected readonly verticalSize = signal(20);
  protected readonly desiredGap = signal(100);
  protected readonly mode = signal<SpacingMode>('equal');
  protected readonly modules = signal(1);
  protected readonly stockLength = signal(6000);
  protected readonly kerf = signal(3);

  protected readonly gapMin = 10;
  protected readonly gapMax = computed(() =>
    Math.max(this.gapMin + 10, Math.min(400, Math.floor((this.moduleLength() - this.verticalSize()) / 2))),
  );
  protected readonly maxSafeGap = MAX_SAFE_GAP;

  protected readonly params = computed<GradeParams>(() => ({
    moduleLength: this.moduleLength(),
    height: this.height(),
    horizontalSize: this.horizontalSize(),
    verticalSize: this.verticalSize(),
    desiredGap: this.desiredGap(),
    mode: this.mode(),
    modules: this.modules(),
    stockLength: this.stockLength(),
    kerf: this.kerf(),
  }));

  protected readonly result = computed(() => calculateGrade(this.params()));

  protected setNumber(target: WritableSignal<number>, event: Event): void {
    const value = (event.target as HTMLInputElement).valueAsNumber;
    if (Number.isFinite(value) && value >= 0) {
      target.set(value);
    }
  }

  protected readonly printDate = signal(new Date().toLocaleDateString('pt-BR'));

  protected print(): void {
    this.printDate.set(new Date().toLocaleDateString('pt-BR'));
    window.print();
  }

  protected setMode(event: Event): void {
    this.mode.set((event.target as HTMLInputElement).value as SpacingMode);
  }

  protected stepGap(delta: number): void {
    this.desiredGap.update((g) => Math.min(this.gapMax(), Math.max(this.gapMin, g + delta)));
  }
}
