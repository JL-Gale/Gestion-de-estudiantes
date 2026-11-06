import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-recuperar-password-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (isOpen) {
      <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(15, 23, 42, 0.6);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content shadow-lg border-0">
            <div class="modal-header bg-light border-bottom">
              <h5 class="modal-title d-flex align-items-center gap-2 text-dark fs-6 fw-bold">
                <i class="bi bi-question-circle-fill text-primary"></i>
                Recuperación de Contraseña
              </h5>
              <button type="button" class="btn-close" (click)="close()" [disabled]="isLoading" aria-label="Cerrar"></button>
            </div>
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <div class="modal-body p-4">
                <div class="alert alert-info d-flex align-items-start gap-2 mb-3" style="font-size: 0.85rem;">
                  <i class="bi bi-info-circle-fill fs-5 mt-n1"></i>
                  <div>
                    Ingresa tus datos registrados. Si coinciden con tu registro de estudiante o docente, tu contraseña será restablecida automáticamente a tu <strong>número de documento de identidad</strong>.
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Correo Institucional <span class="text-danger">*</span></label>
                  <input
                    type="email"
                    class="form-control"
                    formControlName="correo_institucional"
                    placeholder="ejemplo@colegio.edu.co"
                    [class.is-invalid]="form.get('correo_institucional')?.touched && form.get('correo_institucional')?.invalid"
                  />
                  @if (form.get('correo_institucional')?.touched && form.get('correo_institucional')?.invalid) {
                    <div class="invalid-feedback">Ingresa un correo institucional válido.</div>
                  }
                </div>

                <div class="mb-3">
                  <label class="form-label">Número de Documento de Identidad <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    class="form-control"
                    formControlName="numero_documento"
                    placeholder="Número de cédula, TI o registro"
                    [class.is-invalid]="form.get('numero_documento')?.touched && form.get('numero_documento')?.invalid"
                  />
                  @if (form.get('numero_documento')?.touched && form.get('numero_documento')?.invalid) {
                    <div class="invalid-feedback">El documento es obligatorio.</div>
                  }
                </div>

                <div class="mb-3">
                  <label class="form-label">Fecha de Nacimiento <span class="text-danger">*</span></label>
                  <input
                    type="date"
                    class="form-control"
                    formControlName="fecha_nacimiento"
                    [class.is-invalid]="form.get('fecha_nacimiento')?.touched && form.get('fecha_nacimiento')?.invalid"
                  />
                  @if (form.get('fecha_nacimiento')?.touched && form.get('fecha_nacimiento')?.invalid) {
                    <div class="invalid-feedback">La fecha de nacimiento es requerida.</div>
                  }
                </div>
              </div>

              <div class="modal-footer bg-light border-top">
                <button type="button" class="btn btn-outline-secondary" (click)="close()" [disabled]="isLoading">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-primary d-flex align-items-center gap-2" [disabled]="form.invalid || isLoading">
                  @if (isLoading) {
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Restableciendo...
                  } @else {
                    <i class="bi bi-arrow-repeat"></i>
                    Restablecer Contraseña
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
export class RecuperarPasswordModalComponent {
  @Input() isOpen = false;
  @Output() closeEvent = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  public isLoading = false;
  public form: FormGroup = this.fb.group({
    correo_institucional: ['', [Validators.required, Validators.email]],
    numero_documento: ['', [Validators.required]],
    fecha_nacimiento: ['', [Validators.required]]
  });

  public close(): void {
    this.form.reset();
    this.closeEvent.emit();
  }

  public onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading = true;
    this.authService.recuperarPassword(this.form.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.notificationService.success(res.message || 'Contraseña restablecida exitosamente a su número de identidad.');
        this.close();
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
