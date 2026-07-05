import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { AuthService } from '../../core/services/auth.service';
import { HabitService } from '../../core/services/habit.service';
import { GlassCardComponent } from '../../shared/components/glass-card/glass-card.component';

@Component({
  selector: 'eco-profile',
  standalone: true,
  imports: [CommonModule, GlassCardComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
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
export class ProfileComponent {
  readonly confirmingLogout = signal(false);

  readonly customHabits = computed(() => this.habits.habits().filter((h) => h.isCustom));

  constructor(public auth: AuthService, public habits: HabitService, private router: Router) {}

  async setUnit(pref: 'kg' | 'lbs') {
    await this.auth.updateUnitPreference(pref);
  }

  async removeHabit(id: string) {
    await this.habits.removeCustomHabit(id);
  }

  requestLogout() {
    this.confirmingLogout.set(true);
  }

  cancelLogout() {
    this.confirmingLogout.set(false);
  }

  async confirmLogout() {
    await this.auth.signOut();
    this.router.navigate(['/']);
  }

  get memberSince(): string {
    const d = this.auth.user()?.createdAt;
    return d ? new Date(d).toLocaleDateString('en', { month: 'long', year: 'numeric' }) : '';
  }
}
