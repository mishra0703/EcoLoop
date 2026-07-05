import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'eco-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
  animations: [
    trigger('pageEnter', [
      transition(':enter', [
        query('.reveal', [
          style({ opacity: 0, transform: 'translateY(24px)' }),
          stagger(90, animate('620ms var(--ease-out-quart)', style({ opacity: 1, transform: 'translateY(0)' }))),
        ], { optional: true }),
      ]),
    ]),
  ],
})
export class LandingComponent {
  readonly features = [
    { icon: '🔥', title: 'Streak that sticks', copy: "A living heatmap of every habit you've kept, colored like moss taking hold." },
    { icon: '🤖', title: 'AI keeps you honest', copy: 'Add any custom habit — Gemini checks it is genuinely eco-related before it counts.' },
    { icon: '🌍', title: 'Real CO₂ math', copy: 'Every log converts to an estimated carbon-saved number, not a vague point score.' },
    { icon: '💬', title: 'Nudges, not nagging', copy: 'A short, personalized note on your dashboard based on how your streak is actually going.' },
  ];

  constructor(public auth: AuthService) {}

  signIn() {
    this.auth.signInWithGoogle();
  }
}
