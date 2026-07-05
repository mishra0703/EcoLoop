import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DayCell, Habit, HabitLog } from '../models';

interface StatsResponse {
  currentStreak: number;
  longestStreak: number;
  totalCo2Saved: number;
  heatmapCells: DayCell[];
  logs: HabitLog[];
}

interface ValidateHabitResponse {
  valid: boolean;
  reason?: string;
  suggestion?: string;
  co2Estimate?: number;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

@Injectable({ providedIn: 'root' })
export class HabitService {
  private readonly _habits = signal<Habit[]>([]);
  private readonly _logs = signal<HabitLog[]>([]); 
  private readonly _heatmapCells = signal<DayCell[]>([]);
  private readonly _currentStreak = signal(0);
  private readonly _longestStreak = signal(0);
  private readonly _totalCo2Saved = signal(0);
  private readonly _nudge = signal('Log a habit today to get your first personalized nudge.');
  private readonly _loaded = signal(false);

  readonly habits = this._habits.asReadonly();
  readonly logs = this._logs.asReadonly();
  readonly heatmapCells = this._heatmapCells.asReadonly();
  readonly currentStreak = this._currentStreak.asReadonly();
  readonly longestStreak = this._longestStreak.asReadonly();
  readonly totalCo2Saved = this._totalCo2Saved.asReadonly();
  readonly loaded = this._loaded.asReadonly();

  readonly todayStr = todayStr();

  readonly todaysLogs = computed(() =>
    this._logs().filter((l) => l.date === this.todayStr && l.completed)
  );

  private readonly apiUrl = environment.apiUrl;
  private readonly opts = { withCredentials: true };

  constructor(private http: HttpClient) {}

  /**
   * Fetches habits + computed stats (streak/CO2/heatmap/logs) + nudge in
   * parallel. The authGuard calls this before letting any protected route
   * activate, so by the time a page component runs its own ngOnInit, all
   * of these signals already have real data.
   */
  async refreshAll(): Promise<void> {
    await Promise.all([this.refreshHabits(), this.refreshStats(), this.refreshNudge()]);
    this._loaded.set(true);
  }

  async refreshHabits(): Promise<void> {
    const res = await firstValueFrom(
      this.http.get<{ habits: Habit[] }>(`${this.apiUrl}/habits`, this.opts)
    );
    this._habits.set(res.habits);
  }

  async refreshStats(): Promise<void> {
    const res = await firstValueFrom(
      this.http.get<StatsResponse>(`${this.apiUrl}/logs/stats`, this.opts)
    );
    this._logs.set(res.logs);
    this._heatmapCells.set(res.heatmapCells);
    this._currentStreak.set(res.currentStreak);
    this._longestStreak.set(res.longestStreak);
    this._totalCo2Saved.set(res.totalCo2Saved);
  }

  async refreshNudge(): Promise<void> {    
      const res = await firstValueFrom(
        this.http.get<{ nudge: string }>(`${this.apiUrl}/ai/nudge`, this.opts)
      );
      this._nudge.set(res.nudge);    
  }

  isCompletedToday(habitId: string): boolean {
    return this._logs().some((l) => l.habitId === habitId && l.date === this.todayStr && l.completed);
  }

  /** Toggles today's completion for a habit, then re-syncs stats so streak/CO2/heatmap stay correct. */
  async toggleToday(habitId: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.apiUrl}/logs/toggle`, { habitId }, this.opts)
    );
    await this.refreshStats();
  }

  /** Calls the Gemini-backed validation endpoint — see server/src/controllers/ai.controller.js */
  async validateCustomHabit(input: string): Promise<ValidateHabitResponse> {
    return firstValueFrom(
      this.http.post<ValidateHabitResponse>(`${this.apiUrl}/ai/validate-habit`, { name: input }, this.opts)
    );
  }

  async addCustomHabit(name: string, co2Estimate: number): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.apiUrl}/habits`, { name, co2Estimate }, this.opts)
    );
    await this.refreshHabits();
  }

  async removeCustomHabit(habitId: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.apiUrl}/habits/${habitId}`, this.opts));
    await Promise.all([this.refreshHabits(), this.refreshStats()]);
  }

  /** Synchronous read of the last-fetched nudge (fetched by refreshAll/refreshNudge). */
  getNudge(): string {
    return this._nudge();
  }
}
