import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HabitService } from '../services/habit.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const habits = inject(HabitService);
  const router = inject(Router);

  await auth.checkSession();

  if (!auth.isLoggedIn()) {
    router.navigate(['/']);
    return false;
  }

  await habits.refreshAll();

  return true;
};
