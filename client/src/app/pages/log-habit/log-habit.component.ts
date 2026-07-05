import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { HabitService } from '../../core/services/habit.service';
import { Habit } from '../../core/models';
import { ConfettiComponent } from '../../shared/components/confetti/confetti.component';

type ValidationState = 'idle' | 'checking' | 'rejected' | 'accepted';

@Component({
  selector: 'eco-log-habit',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfettiComponent],
  templateUrl: './log-habit.component.html',
  styleUrl: './log-habit.component.scss',
  animations: [
    trigger('listEnter', [
      transition(':enter', [
        query('.habit-row', [
          style({ opacity: 0, transform: 'translateX(-12px)' }),
          stagger(50, animate('420ms var(--ease-out-quart)', style({ opacity: 1, transform: 'translateX(0)' }))),
        ], { optional: true }),
      ]),
    ]),
    trigger('checkPop', [
      transition('false => true', [
        animate('380ms var(--ease-spring)', style({ transform: 'scale(1.25)' })),
        animate('180ms var(--ease-spring)', style({ transform: 'scale(1)' })),
      ]),
    ]),
    trigger('feedbackAnim', [
      transition(':enter', [
        style({ opacity: 0, height: 0 }),
        animate('220ms var(--ease-out-quart)', style({ opacity: 1, height: '*' })),
      ]),
      transition(':leave', [
        animate('160ms ease-in', style({ opacity: 0, height: 0 })),
      ]),
    ]),
  ],
})
export class LogHabitComponent {
  readonly customInput = signal('');
  readonly validationState = signal<ValidationState>('idle');
  readonly rejectReason = signal('');
  readonly rejectSuggestion = signal('');
  readonly justCompleted = signal<Record<string, boolean>>({});
  readonly celebrate = signal(false);

  constructor(public habits: HabitService) {}

  async toggle(habit: Habit) {
    const wasCompleted = this.habits.isCompletedToday(habit._id);
    await this.habits.toggleToday(habit._id);
    if (!wasCompleted) {
      this.justCompleted.update((s) => ({ ...s, [habit._id]: true }));
      const streak = this.habits.currentStreak();
      if (streak === 7 || streak === 30) {
        this.celebrate.set(true);
        setTimeout(() => this.celebrate.set(false), 3200);
      }
    }
  }

  isJustCompleted(id: string): boolean {
    return !!this.justCompleted()[id];
  }

  async submitCustom() {
    const value = this.customInput().trim();
    if (!value) return;
    this.validationState.set('checking');
    const result = await this.habits.validateCustomHabit(value);
    if (!result.valid) {
      this.validationState.set('rejected');
      this.rejectReason.set(result.reason ?? '');
      this.rejectSuggestion.set(result.suggestion ?? '');
      return;
    }
    await this.habits.addCustomHabit(value, result.co2Estimate ?? 0.5);
    this.validationState.set('accepted');
    this.customInput.set('');
    setTimeout(() => this.validationState.set('idle'), 1800);
  }

  dismissRejection() {
    this.validationState.set('idle');
  }

  async removeCustom(habit: Habit) {
    await this.habits.removeCustomHabit(habit._id);
  }
}
