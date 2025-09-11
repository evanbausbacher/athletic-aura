import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

export const fadeInAnimation = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(10px)' }),
    animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
  ])
]);

export const slideInAnimation = trigger('slideIn', [
  transition(':enter', [
    style({ transform: 'translateX(-100%)' }),
    animate('300ms ease-out', style({ transform: 'translateX(0)' }))
  ]),
  transition(':leave', [
    animate('300ms ease-in', style({ transform: 'translateX(100%)' }))
  ])
]);

export const staggerAnimation = trigger('stagger', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(15px)' }),
      stagger(50, [
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ], { optional: true })
  ])
]);

export const cardHoverAnimation = trigger('cardHover', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.98) translateY(10px)' }),
    animate('250ms cubic-bezier(0.4, 0.0, 0.2, 1)', 
      style({ opacity: 1, transform: 'scale(1) translateY(0)' })
    )
  ])
]);

export const scoreRevealAnimation = trigger('scoreReveal', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.95)' }),
    animate('400ms cubic-bezier(0.4, 0.0, 0.2, 1)', 
      style({ opacity: 1, transform: 'scale(1)' })
    )
  ])
]);