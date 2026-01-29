import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  importProvidersFrom
} from '@angular/core';

import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';

import { provideAnimations } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

import {
  LucideAngularModule,
  ChevronDown,
  ChevronUp,
  Menu,
  X
} from 'lucide-angular';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [

    // ============================
    // PrimeNG
    // ============================
    providePrimeNG({
      theme: { preset: Aura }
    }),
    providePrimeNG({
      inputVariant: 'filled'
    }),
    providePrimeNG({
      ripple: true
    }),

    // ============================
    // Angular Core
    // ============================
    provideAnimations(),
    MessageService,
    provideBrowserGlobalErrorListeners(),

    // ============================
    // Router
    // ============================
    provideRouter(routes),

    // ============================
    // HTTP + AUTH INTERCEPTOR (CLAVE)
    // ============================
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),

    // ============================
    // Icons
    // ============================
    importProvidersFrom(
      LucideAngularModule.pick({
        ChevronDown,
        ChevronUp,
        Menu,
        X
      })
    )
  ]
};
