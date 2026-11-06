import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1080;">
      @for (toast of notificationService.notifications(); track toast.id) {
        <div
          class="toast show align-items-center border-0 shadow-lg mb-2"
          [ngClass]="{
            'text-bg-success': toast.type === 'success',
            'text-bg-danger': toast.type === 'danger',
            'text-bg-warning': toast.type === 'warning',
            'text-bg-info': toast.type === 'info'
          }"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div class="d-flex">
            <div class="toast-body d-flex align-items-center gap-2">
              <i
                class="bi fs-5"
                [ngClass]="{
                  'bi-check-circle-fill': toast.type === 'success',
                  'bi-exclamation-triangle-fill': toast.type === 'danger',
                  'bi-exclamation-circle-fill': toast.type === 'warning',
                  'bi-info-circle-fill': toast.type === 'info'
                }"
              ></i>
              <div>
                @if (toast.title) {
                  <div class="fw-bold">{{ toast.title }}</div>
                }
                <div>{{ toast.message }}</div>
              </div>
            </div>
            <button
              type="button"
              class="btn-close btn-close-white me-2 m-auto"
              (click)="notificationService.remove(toast.id)"
              aria-label="Cerrar"
            ></button>
          </div>
        </div>
      }
    </div>
  `
})
export class ToastContainerComponent {
  public notificationService = inject(NotificationService);
}

