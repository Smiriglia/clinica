import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { RECAPTCHA_SETTINGS, RECAPTCHA_V3_SITE_KEY, RecaptchaSettings, ReCaptchaV3Service } from 'ng-recaptcha';
import { DateDisplayPipe } from './pipes/date-display.pipe';
import { provideAnimations } from '@angular/platform-browser/animations';
import { DateTurnPipe } from './pipes/date-turn.pipe';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient, provideHttpClient } from '@angular/common/http';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp({ "projectId": "clinica-90464", "appId": "1:757779294869:web:1fd57fc3988daad42fc99c", "storageBucket": "clinica-90464.appspot.com", "apiKey": "AIzaSyDHANI785rSpgxUeXPwRsOoztYcabNDlW4", "authDomain": "clinica-90464.firebaseapp.com", "messagingSenderId": "757779294869" })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()), provideStorage(() => getStorage()),
    importProvidersFrom(
      ReCaptchaV3Service,
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        },
      }),
    ),
    // { provide: RECAPTCHA_V3_SITE_KEY, useValue: '6LeJ9xYqAAAAAGzmKj--vXMTxnolKM7adghUw3IA' },
    {
      provide: RECAPTCHA_SETTINGS,
      useValue: {
        siteKey: '6LeY9xYqAAAAAJGBnwlOajJJca3t8YptOrgut8Eu',
      } as RecaptchaSettings
    },
    provideAnimations(),
    DateDisplayPipe,
    DateTurnPipe,
  ]

};
