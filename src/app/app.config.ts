import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { LOCALE_ID } from '@angular/core';
import { environment } from '../environments/environment.prod';
import { JwtInterceptor } from './auth/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
  provideRouter(routes),
  provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
  provideStorage(() => getStorage()),
  provideCharts(withDefaultRegisterables()),
  provideHttpClient(withInterceptorsFromDi()),  
  {
    provide: HTTP_INTERCEPTORS,
    useClass: JwtInterceptor,
    multi: true
  },
  { provide: LOCALE_ID, useValue: 'vi-VN' },
  

    // { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ]
};
