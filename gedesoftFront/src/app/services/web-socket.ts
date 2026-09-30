import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket = inject(Socket);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    // Solo conectarse en el navegador para no bloquear SSR
    if (isPlatformBrowser(this.platformId)) {
      this.socket.connect();
    }
    
    // Si quieres logs inmediatos al crear la instancia:
    try {
      // Conexión (usualmente ngx-socket-io conecta automáticamente según configuración)
      const ioSocket: any = (this.socket as any).ioSocket;
      if (ioSocket) {
        ioSocket.on('connect', () => console.log('[WS] connect', ioSocket.id));
        ioSocket.on('disconnect', (reason: any) => console.log('[WS] disconnect', reason));
        ioSocket.on('connect_error', (err: any) => console.error('[WS] connect_error', err));

        // onAny está disponible en socket.io-client >=3: usamos ioSocket.onAny si existe
        if (typeof ioSocket.onAny === 'function') {
          ioSocket.onAny((event: string, ...args: any[]) => {
            console.log(`[WS onAny] event='${event}'`, args);
          });
        } else {
          console.log('[WS] onAny no disponible en esta versión del cliente');
        }
      } else {
        console.warn('[WS] ioSocket no accesible - ngx-socket-io versión distinta?');
      }
    } catch (e) {
      console.warn('[WS] error inicializando logs avanzados', e);
    }
  }

  // --- Para emitir eventos AL SERVIDOR (Ej: Cocinero marca listo) ---
  emit(eventName: string, data: any) {
    console.log('[WS emit]', eventName, data);
    this.socket.emit(eventName, data);
  }

  // Emit con ACK (callback) para confirmar que servidor recibió
  emitWithAck(eventName: string, data: any, cb?: (ack: any) => void) {
    try {
      const ioSocket: any = (this.socket as any).ioSocket;
      if (ioSocket && typeof ioSocket.emit === 'function') {
        console.log('[WS emitWithAck]', eventName, data);
        ioSocket.emit(eventName, data, (response: any) => {
          console.log('[WS ack]', eventName, response);
          if (cb) cb(response);
        });
      } else {
        // Fallback: emitir sin ack
        this.emit(eventName, data);
        if (cb) cb({ ok: false, fallback: true });
      }
    } catch (err) {
      console.error('[WS emitWithAck error]', err);
      this.emit(eventName, data);
      if (cb) cb({ ok: false, error: err });
    }
  }

  // --- Para escuchar eventos DEL SERVIDOR (Ej: Llega nuevo pedido) ---
  listen(eventName: string): Observable<any> {
    // fromEvent ya expone la escucha. Mantenemos wrapper para loggeo.
    return new Observable(sub => {
      const subObs = this.socket.fromEvent<any>(eventName).subscribe((data: any) => {
        console.log(`[WS listen] '${eventName}' ->`, data);
        sub.next(data);
      });
      return () => subObs.unsubscribe();
    });
  }

  // (Opcional) método para registrar a nivel app un observable de todos los eventos (solo si ioSocket.onAny disponible)
  listenAll(): Observable<{ event: string, args: any[] }> {
    return new Observable(sub => {
      const ioSocket: any = (this.socket as any).ioSocket;
      if (ioSocket && typeof ioSocket.onAny === 'function') {
        const handler = (event: string, ...args: any[]) => sub.next({ event, args });
        ioSocket.onAny(handler);
        return () => ioSocket.offAny(handler);
      } else {
        console.warn('[WS listenAll] onAny no disponible en ioSocket');
        return () => {};
      }
    });
  }
}
