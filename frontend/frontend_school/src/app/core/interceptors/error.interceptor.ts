import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocurrió un error inesperado';

      if (error.error && typeof error.error === 'object') {
        if (error.error.message) {
          errorMessage = error.error.message;
        }
        if (error.error.details && typeof error.error.details === 'object') {
          const detailMessages = Object.entries(error.error.details)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(' | ');
          if (detailMessages) {
            errorMessage += ` (${detailMessages})`;
          }
        }
      } else if (typeof error.error === 'string') {
        errorMessage = error.error;
      }

      switch (error.status) {
        case 400:
          notificationService.error(errorMessage, 'Datos Inválidos');
          break;
        case 401:
          if (!req.url.includes('/auth/login')) {
            notificationService.warning('Sesión expirada o no autorizada. Inicia sesión nuevamente.', 'Sesión');
            authService.logout();
          } else {
            notificationService.error('Credenciales incorrectas.', 'Error de Acceso');
          }
          break;
        case 403:
          notificationService.error('No tienes permisos suficientes para realizar esta acción.', 'Acceso Prohibido');
          break;
        case 404:
          notificationService.warning(errorMessage, 'No Encontrado');
          break;
        case 409:
          notificationService.warning(errorMessage, 'Conflicto');
          break;
        case 422:
          notificationService.error(errorMessage, 'Error');
          break;
        case 0:
          notificationService.error('No se pudo conectar con el servidor backend (Spring Boot en http://localhost:8080). Verifica que el servicio esté corriendo.', 'Conexión Fallida');
          break;
        default:
          notificationService.error(errorMessage, 'Error');
          break;
      }

      return throwError(() => error);
    })
  );
};

