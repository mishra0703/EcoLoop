import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { DayCell } from '../../../core/models';

interface Tooltip {
  x: number;
  y: number;
  date: string;
  count: number;
}

@Component({
  selector: 'eco-leaf-heatmap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaf-heatmap.component.html',
  styleUrl: './leaf-heatmap.component.scss',
  animations: [
    trigger('tooltipAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translate(-50%, 4px) scale(0.9)' }),
        animate('140ms var(--ease-spring)', style({ opacity: 1, transform: 'translate(-50%, 0) scale(1)' })),
      ]),
      transition(':leave', [
        animate('100ms ease-in', style({ opacity: 0, transform: 'translate(-50%, 4px) scale(0.92)' })),
      ]),
    ]),
  ],
})
export class LeafHeatmapComponent {
  @Input({ required: true }) cells: DayCell[] = [];

  readonly tooltip = signal<Tooltip | null>(null);

  readonly weeks = computed(() => {
    const days = this.cells;
    if (!days.length) return [];
    const firstDow = new Date(days[0].date).getDay();
    const padded: (DayCell | null)[] = [...Array(firstDow).fill(null), ...days];
    const cols: (DayCell | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) {
      cols.push(padded.slice(i, i + 7));
    }
    return cols;
  });

  readonly monthLabels = computed(() => {
    const labels: { index: number; label: string }[] = [];
    let lastMonth = -1;
    this.weeks().forEach((week, i) => {
      const firstReal = week.find((d) => d !== null);
      if (!firstReal) return;
      const m = new Date(firstReal.date).getMonth();
      if (m !== lastMonth) {
        labels.push({ index: i, label: new Date(firstReal.date).toLocaleString('en', { month: 'short' }) });
        lastMonth = m;
      }
    });
    return labels;
  });

  showTooltip(evt: MouseEvent, cell: DayCell) {
    const rect = (evt.target as HTMLElement).getBoundingClientRect();
    const parentRect = (evt.currentTarget as HTMLElement).closest('.heatmap-scroll')?.getBoundingClientRect();
    this.tooltip.set({
      x: rect.left - (parentRect?.left ?? 0) + rect.width / 2,
      y: rect.top - (parentRect?.top ?? 0) - 8,
      date: new Date(cell.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }),
      count: cell.count,
    });
  }

  hideTooltip() {
    this.tooltip.set(null);
  }
}
