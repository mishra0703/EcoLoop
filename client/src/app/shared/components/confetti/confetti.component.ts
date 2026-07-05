import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'eco-confetti',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (active) {
      <div class="confetti-field" aria-hidden="true">
        @for (p of particles(); track $index) {
          <span
            class="piece"
            [style.left.%]="p.left"
            [style.animation-delay.ms]="p.delay"
            [style.animation-duration.ms]="p.duration"
            [style.background]="p.color"
            [style.--rot.deg]="p.rot"
          ></span>
        }
      </div>
    }
  `,
  styles: [`
    .confetti-field {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 200;
      overflow: hidden;
    }
    .piece {
      position: absolute;
      top: -12px;
      width: 8px;
      height: 12px;
      border-radius: 2px;
      opacity: 0;
      animation-name: fall;
      animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
      animation-fill-mode: forwards;
    }
    @keyframes fall {
      0% { opacity: 0; transform: translateY(0) rotate(0deg); }
      8% { opacity: 1; }
      100% { opacity: 0; transform: translateY(100vh) rotate(var(--rot)); }
    }
  `],
})
export class ConfettiComponent {
  @Input() active = false;

  private readonly colors = ['#4FBE7C', '#7ED99A', '#2F6B4F', '#F2C94C', '#FFFFFF'];

  readonly particles = computed(() =>
    Array.from({ length: 60 }, () => ({
      left: Math.random() * 100,
      delay: Math.random() * 400,
      duration: 2200 + Math.random() * 1400,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      rot: 180 + Math.random() * 540,
    }))
  );
}
