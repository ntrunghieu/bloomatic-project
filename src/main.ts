import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { LOCALE_ID, importProvidersFrom } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeVi from '@angular/common/locales/vi';

// ĐĂNG KÝ LOCALE VI
registerLocaleData(localeVi);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
