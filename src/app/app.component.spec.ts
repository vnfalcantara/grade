import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  it('renders one vertical bar per mark', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('rect.bar-v').length).toBe(16);
    expect(el.querySelectorAll('tbody tr').length).toBe(16);
  });

  it('recalculates when the slider moves', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const slider = el.querySelector<HTMLInputElement>('input[type=range]')!;
    slider.value = '200';
    slider.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    // (2000 - 200) / 220 = 8.18 -> 8 barras
    expect(el.querySelectorAll('rect.bar-v').length).toBe(8);
  });
});
