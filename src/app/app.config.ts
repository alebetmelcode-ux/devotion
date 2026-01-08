import { ApplicationConfig, provideBrowserGlobalErrorListeners, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { LucideAngularModule, ChevronDown, ChevronUp, Menu, X } from 'lucide-angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import Aura from '@primeuix/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    providePrimeNG({
            theme: {
                preset: Aura
            }
        }),
        providePrimeNG({
    inputVariant: 'filled' 
}),
        providePrimeNG({
    ripple: true
}),
    provideAnimations(),
    MessageService,
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(LucideAngularModule.pick({ ChevronDown, ChevronUp, Menu, X }))
  ]
};
