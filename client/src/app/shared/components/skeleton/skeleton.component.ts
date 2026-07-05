import { Component, Input } from '@angular/core';

@Component({
  selector: 'eco-skeleton',
  standalone: true,
  template: `<div class="sk" [style.width]="width" [style.height]="height" [style.border-radius]="radius"></div>`,
  styles: [`
    .sk {
      background: linear-gradient(100deg, rgba(76,139,107,0.08) 30%, rgba(76,139,107,0.16) 50%, rgba(76,139,107,0.08) 70%);
      background-size: 200% 100%;
      animation: shimmer 1.4s ease-in-out infinite;
    }
    @keyframes shimmer {
      0% { background-position: 150% 0; }
      100% { background-position: -50% 0; }
    }
  `],
})
export class SkeletonComponent {
  @Input() width = '100%';
  @Input() height = '16px';
  @Input() radius = '8px';
}
