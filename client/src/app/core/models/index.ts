export interface EcoUser {
  googleId: string;
  name: string;
  email: string;
  avatarUrl: string;
  createdAt: string;
  unitPreference: 'kg' | 'lbs';
}

export interface Habit {
  _id: string;
  name: string;
  icon: string;
  type: 'fixed' | 'custom';
  co2Estimate: number; 
  isCustom: boolean;
}

export interface HabitLog {
  _id: string;
  habitId: string;
  date: string; 
  completed: boolean;
}

export interface DayCell {
  date: string;
  count: number; 
  level: 0 | 1 | 2 | 3 | 4;
}
