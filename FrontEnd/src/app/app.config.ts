import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import {provideHttpClient, withInterceptors, withXsrfConfiguration} from '@angular/common/http';

import { routes } from './app.routes';
import {authExpired} from "./core/auth/auth-expired.interceptor";
import {provideAnimations} from "@angular/platform-browser/animations";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([authExpired]),
      withXsrfConfiguration(
        {cookieName: "XSRF-TOKEN", headerName: "X-XSRF-TOKEN"}),
    ),
  ],
};
