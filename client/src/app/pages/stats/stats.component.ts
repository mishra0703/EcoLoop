import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { AuthService } from '../../core/services/auth.service';
import { HabitService } from '../../core/services/habit.service';
import { GlassCardComponent } from '../../shared/components/glass-card/glass-card.component';

interface WeekBar {
  label: string;
  count: number;
  heightPct: number;
}

interface CalDay {
  day: number | null;
  dateStr: string;
  count: number;
}

@Component({
  selector: 'eco-stats',
  standalone: true,
  imports: [CommonModule, GlassCardComponent],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss',
  animations: [
    trigger('pageEnter', [
      transition(':enter', [
        query('.reveal', [
          style({ opacity: 0, transform: 'translateY(16px)' }),
          stagger(70, animate('520ms var(--ease-out-quart)', style({ opacity: 1, transform: 'translateY(0)' }))),
        ], { optional: true }),
      ]),
    ]),
  ],
})
export class StatsComponent {
  readonly monthOffset = signal(0);

  constructor(public auth: AuthService, public habits: HabitService) {}

  get unit(): 'kg' | 'lbs' {
    return this.auth.user()?.unitPreference ?? 'kg';
  }

  private toKg(v: number): number {
    return this.unit === 'kg' ? v : Math.round(v * 2.2046 * 10) / 10;
  }

  readonly weeklyTrend = computed<WeekBar[]>(() => {
    const logs = this.habits.logs().filter((l) => l.completed);
    const buckets: { label: string; count: number }[] = [];
    for (let w = 7; w >= 0; w--) {
      const end = new Date();
      end.setDate(end.getDate() - w * 7);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      const count = logs.filter((l) => {
        const d = new Date(l.date);
        return d >= start && d <= end;
      }).length;
      buckets.push({ label: `${start.getMonth() + 1}/${start.getDate()}`, count });
    }
    const max = Math.max(1, ...buckets.map((b) => b.count));
    return buckets.map((b) => ({ ...b, heightPct: Math.max(6, (b.count / max) * 100) }));
  });

  readonly habitBreakdown = computed(() => {
    const habitsMap = new Map(this.habits.habits().map((h) => [h._id, h]));
    const tally = new Map<string, number>();
    this.habits.logs().filter((l) => l.completed).forEach((l) => {
      tally.set(l.habitId, (tally.get(l.habitId) ?? 0) + 1);
    });
    const rows = [...tally.entries()]
      .map(([id, count]) => ({ habit: habitsMap.get(id), count }))
      .filter((r) => r.habit)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
    const max = Math.max(1, ...rows.map((r) => r.count));
    return rows.map((r) => ({ ...r, pct: (r.count / max) * 100 }));
  });

  readonly monthLabel = computed(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + this.monthOffset());
    return d.toLocaleString('en', { month: 'long', year: 'numeric' });
  });

  readonly calendarDays = computed<CalDay[]>(() => {
    const base = new Date();
    base.setMonth(base.getMonth() + this.monthOffset());
    const year = base.getFullYear();
    const month = base.getMonth();
    const firstDow = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const logsByDate = new Map<string, number>();
    this.habits.logs().filter((l) => l.completed).forEach((l) => {
      logsByDate.set(l.date, (logsByDate.get(l.date) ?? 0) + 1);
    });

    const cells: CalDay[] = [];
    for (let i = 0; i < firstDow; i++) cells.push({ day: null, dateStr: '', count: 0 });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, dateStr, count: logsByDate.get(dateStr) ?? 0 });
    }
    return cells;
  });

  readonly totalCo2 = computed(() => this.toKg(this.habits.totalCo2Saved()));

  readonly monthCo2 = computed(() => {
    const base = new Date();
    base.setMonth(base.getMonth() + this.monthOffset());
    const year = base.getFullYear();
    const month = base.getMonth();
    const habitsMap = new Map(this.habits.habits().map((h) => [h._id, h]));
    const sum = this.habits.logs()
      .filter((l) => l.completed)
      .filter((l) => {
        const d = new Date(l.date);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .reduce((acc, l) => acc + (habitsMap.get(l.habitId)?.co2Estimate ?? 0), 0);
    return this.toKg(sum);
  });

  shiftMonth(delta: number) {
    this.monthOffset.update((v) => v + delta);
  }
}
