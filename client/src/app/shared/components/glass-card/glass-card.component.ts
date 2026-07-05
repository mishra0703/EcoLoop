import { Component, Input } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'eco-glass-card',
  standalone: true,
  template: `<div class="glass card" [style.animation-delay.ms]="delay" @riseIn><ng-content></ng-content></div>`,
  styles: [`
    .card {
      border-radius: var(--radius-lg);
      padding: 28px;
      animation: rise 620ms var(--ease-out-quart) both;
    }
    @keyframes rise {
      from { opacity: 0; transform: translateY(18px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
  animations: [
    trigger('riseIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('10ms', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class GlassCardComponent {
  @Input() delay = 0;
}
