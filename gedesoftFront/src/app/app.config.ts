import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';

import { routes } from './app.routes';

import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { authInterceptor } from './auth/auth-interceptor';
import { provideSocketIo, SocketIoConfig } from 'ngx-socket-io';


const config: SocketIoConfig = {
  url:'http://localhost:3000', // URL del servidor de Socket.IO
  options: {
    autoConnect: false // MUST be false so SSR doesn't hang waiting for websockets
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes), 
    provideHttpClient(withInterceptors([authInterceptor]),withFetch()), 
    provideClientHydration(withEventReplay()),
    provideSocketIo(config)
  ]
};
