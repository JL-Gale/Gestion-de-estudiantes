import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-change-password-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (isOpen) {
      <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(15, 23, 42, 0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content shadow-lg">
            <div class="modal-header bg-light">
              <h5 class="modal-title d-flex align-items-center gap-2 text-dark">
                <i class="bi bi-shield-lock-fill text-primary"></i>
                Cambiar Contraseña
              </h5>
              <button type="button" class="btn-close" (click)="close()" [disabled]="isLoading" aria-label="Close"></button>
            </div>
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <div class="modal-body p-4">
                <div class="mb-3">
                  <label class="form-label">Contraseña Actual <span class="text-danger">*</span></label>
                  <input
                    type="password"
                    class="form-control"
                    formControlName="contrasenaActual"
                    placeholder="Ingresa tu contraseña actual"
                    [class.is-invalid]="form.get('contrasenaActual')?.touched && form.get('contrasenaActual')?.invalid"
                  />
                  @if (form.get('contrasenaActual')?.touched && form.get('contrasenaActual')?.invalid) {
                    <div class="invalid-feedback">La contraseña actual es requerida.</div>
                  }
                </div>

                <div class="mb-3">
                  <label class="form-label">Nueva Contraseña <span class="text-danger">*</span></label>
                  <input
                    type="password"
                    class="form-control"
                    formControlName="nuevaContrasena"
                    placeholder="Mínimo 6 caracteres"
                    [class.is-invalid]="form.get('nuevaContrasena')?.touched && form.get('nuevaContrasena')?.invalid"
                  />
                  @if (form.get('nuevaContrasena')?.touched && form.get('nuevaContrasena')?.invalid) {
                    <div class="invalid-feedback">La nueva contraseña debe tener al menos 6 caracteres.</div>
                  }
                </div>
              </div>
              <div class="modal-footer bg-light">
                <button type="button" class="btn btn-outline-secondary" (click)="close()" [disabled]="isLoading">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-primary d-flex align-items-center gap-2" [disabled]="form.invalid || isLoading">
                  @if (isLoading) {
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Guardando...
                  } @else {
                    <i class="bi bi-check-lg"></i>
                    Actualizar Contraseña
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }
  `
})
export class ChangePasswordModalComponent {
  @Input() isOpen = false;
  @Output() closeEvent = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  public isLoading = false;
  public form: FormGroup = this.fb.group({
    contrasenaActual: ['', [Validators.required]],
    nuevaContrasena: ['', [Validators.required, Validators.minLength(6)]]
  });

  public close(): void {
    this.form.reset();
    this.closeEvent.emit();
  }

  public onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading = true;
    this.authService.cambiarPassword(this.form.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.notificationService.success(res.message || 'Contraseña actualizada con éxito');
        this.close();
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}

