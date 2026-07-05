import { Component, ElementRef, Input, OnChanges, SimpleChanges, signal } from '@angular/core';

@Component({
  selector: 'eco-streak-counter',
  standalone: true,
  template: `<span class="count mono">{{ display() }}</span>`,
  styles: [`
    .count {
      font-variant-numeric: tabular-nums;
    }
  `],
})
export class StreakCounterComponent implements OnChanges {
  @Input() value = 0;
  @Input() durationMs = 900;
  @Input() decimals = 0;

  readonly display = signal('0');

  constructor(private host: ElementRef<HTMLElement>) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['value']) return;
    const from = Number(changes['value'].previousValue ?? 0);
    const to = Number(changes['value'].currentValue ?? 0);
    this.animateTo(from, to);
  }

  private animateTo(from: number, to: number) {
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / this.durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + (to - from) * eased;
      this.display.set(current.toFixed(this.decimals));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}
