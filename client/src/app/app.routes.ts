import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then((m) => m.LandingComponent),
    title: 'EcoLoop — Grow a greener habit',
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
    title: 'Dashboard — EcoLoop',
  },
  {
    path: 'log',
    loadComponent: () => import('./pages/log-habit/log-habit.component').then((m) => m.LogHabitComponent),
    canActivate: [authGuard],
    title: 'Log Habit — EcoLoop',
  },
  {
    path: 'stats',
    loadComponent: () => import('./pages/stats/stats.component').then((m) => m.StatsComponent),
    canActivate: [authGuard],
    title: 'Stats — EcoLoop',
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
    canActivate: [authGuard],
    title: 'Profile — EcoLoop',
  },
  { path: '**', redirectTo: '' },
];
