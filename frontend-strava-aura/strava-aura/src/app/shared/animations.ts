import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

export const fadeInAnimation = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(20px)' }),
    animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
  ])
]);

export const slideInAnimation = trigger('slideIn', [
  transition(':enter', [
    style({ transform: 'translateX(-100%)' }),
    animate('500ms ease-out', style({ transform: 'translateX(0)' }))
  ]),
  transition(':leave', [
    animate('500ms ease-in', style({ transform: 'translateX(100%)' }))
  ])
]);

export const staggerAnimation = trigger('stagger', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(30px)' }),
      stagger(100, [
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ], { optional: true })
  ])
]);

export const cardHoverAnimation = trigger('cardHover', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.95) translateY(20px)' }),
    animate('400ms cubic-bezier(0.4, 0.0, 0.2, 1)', 
      style({ opacity: 1, transform: 'scale(1) translateY(0)' })
    )
  ])
]);

export const scoreRevealAnimation = trigger('scoreReveal', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.8)' }),
    animate('800ms cubic-bezier(0.4, 0.0, 0.2, 1)', 
      style({ opacity: 1, transform: 'scale(1)' })
    )
  ])
]);