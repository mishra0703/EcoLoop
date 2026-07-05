import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { AuthService } from '../../core/services/auth.service';
import { HabitService } from '../../core/services/habit.service';
import { GlassCardComponent } from '../../shared/components/glass-card/glass-card.component';
import { LeafHeatmapComponent } from '../../shared/components/leaf-heatmap/leaf-heatmap.component';
import { StreakCounterComponent } from '../../shared/components/streak-counter/streak-counter.component';
import { ConfettiComponent } from '../../shared/components/confetti/confetti.component';

@Component({
  selector: 'eco-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, GlassCardComponent, LeafHeatmapComponent, StreakCounterComponent, ConfettiComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
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
export class DashboardComponent implements OnInit {
  readonly confettiActive = signal(false);
  readonly nudge = computed(() => this.habits.getNudge());

  readonly milestoneBadge = computed(() => {
    const s = this.habits.currentStreak();
    if (s >= 30) return '30-day canopy';
    if (s >= 7) return '7-day sprout';
    return null;
  });

  constructor(public auth: AuthService, public habits: HabitService) {}

  ngOnInit() {
    const streak = this.habits.currentStreak();
    if (streak === 7 || streak === 30) {
      this.confettiActive.set(true);
      setTimeout(() => this.confettiActive.set(false), 3200);
    }
  }

  get firstName(): string {
    return this.auth.user()?.name?.split(' ')[0] ?? 'there';
  }

  get unit(): 'kg' | 'lbs' {
    return this.auth.user()?.unitPreference ?? 'kg';
  }

  get co2Display(): number {
    const kg = this.habits.totalCo2Saved();
    return this.unit === 'kg' ? kg : Math.round(kg * 2.2046 * 10) / 10;
  }
}
