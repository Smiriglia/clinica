import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideFirebaseApp(() => initializeApp({"projectId":"clinica-90464","appId":"1:757779294869:web:1fd57fc3988daad42fc99c","storageBucket":"clinica-90464.appspot.com","apiKey":"AIzaSyDHANI785rSpgxUeXPwRsOoztYcabNDlW4","authDomain":"clinica-90464.firebaseapp.com","messagingSenderId":"757779294869"})), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()), provideStorage(() => getStorage())]
};
