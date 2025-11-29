import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';


import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { LOCALE_ID } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), 
              provideRouter(routes),
              provideCharts(withDefaultRegisterables()),
              provideHttpClient(),
              { provide: LOCALE_ID, useValue: 'vi-VN' },
              
              // { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ]
};
