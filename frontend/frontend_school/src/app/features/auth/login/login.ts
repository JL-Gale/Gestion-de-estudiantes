import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { RecuperarPasswordModalComponent } from '../recuperar-password/recuperar-password-modal';
import { ToastContainerComponent } from '../../../shared/components/toast/toast-container';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RecuperarPasswordModalComponent,
    ToastContainerComponent
  ],
  template: `
    <div class="login-wrapper min-vh-100 d-flex align-items-center justify-content-center p-3">
      <div class="card shadow-sm border-0" style="max-width: 440px; width: 100%; border-radius: 16px; overflow: hidden;">
        <!-- Institutional Header -->
        <div class="px-4 py-4 text-white text-center" style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);">
          <div class="d-inline-flex p-3 rounded-circle bg-white bg-opacity-10 mb-2">
            <i class="bi bi-mortarboard-fill fs-2"></i>
          </div>
          <h4 class="fw-bold mb-1">Colegio San Martín</h4>
          <p class="mb-0 text-white-50 small">Sistema Integral de Gestión Académica</p>
        </div>

        <div class="card-body p-4 p-md-5">
          <div class="text-center mb-4">
            <h5 class="fw-bold text-dark mb-1">Iniciar Sesión</h5>
            <p class="text-muted small">Ingresa con tus credenciales institucionales</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="mb-3">
              <label class="form-label">Correo Institucional</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0 text-muted">
                  <i class="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  class="form-control border-start-0 ps-0"
                  formControlName="correo_institucional"
                  placeholder="admin@colegio.edu.co"
                  [class.is-invalid]="form.get('correo_institucional')?.touched && form.get('correo_institucional')?.invalid"
                />
              </div>
              @if (form.get('correo_institucional')?.touched && form.get('correo_institucional')?.invalid) {
                <small class="text-danger d-block mt-1" style="font-size: 0.8rem;">
                  Ingresa un correo institucional válido.
                </small>
              }
            </div>

            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <label class="form-label mb-0">Contraseña</label>
                <button
                  type="button"
                  class="btn btn-link p-0 text-decoration-none small"
                  style="font-size: 0.8rem;"
                  (click)="isRecuperarModalOpen.set(true)"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0 text-muted">
                  <i class="bi bi-lock"></i>
                </span>
                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  class="form-control border-start-0 border-end-0 px-0"
                  formControlName="password"
                  placeholder="••••••••"
                  [class.is-invalid]="form.get('password')?.touched && form.get('password')?.invalid"
                />
                <button
                  type="button"
                  class="input-group-text bg-light border-start-0 text-muted"
                  (click)="showPassword.update(v => !v)"
                >
                  <i class="bi" [ngClass]="showPassword() ? 'bi-eye-slash' : 'bi-eye'"></i>
                </button>
              </div>
              @if (form.get('password')?.touched && form.get('password')?.invalid) {
                <small class="text-danger d-block mt-1" style="font-size: 0.8rem;">
                  La contraseña es requerida.
                </small>
              }
            </div>

            <button
              type="submit"
              class="btn btn-primary w-100 py-2.5 mt-2 d-flex align-items-center justify-content-center gap-2 shadow-sm"
              [disabled]="form.invalid || isLoading"
            >
              @if (isLoading) {
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span>Ingresando...</span>
              } @else {
                <i class="bi bi-box-arrow-in-right"></i>
                <span>Ingresar al Portal</span>
              }
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Recuperar Contraseña -->
    <app-recuperar-password-modal
      [isOpen]="isRecuperarModalOpen()"
      (closeEvent)="isRecuperarModalOpen.set(false)"
    ></app-recuperar-password-modal>

    <!-- Notificaciones Flotantes -->
    <app-toast-container></app-toast-container>
  `,
  styles: [`
    .login-wrapper {
      background-color: #0f172a;
      background-image: radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.15) 0px, transparent 50%),
                        radial-gradient(at 100% 100%, rgba(15, 23, 42, 0.8) 0px, transparent 50%);
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  public isLoading = false;
  public showPassword = signal(false);
  public isRecuperarModalOpen = signal(false);

  public form: FormGroup = this.fb.group({
    correo_institucional: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  public onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading = true;
    this.authService.login(this.form.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.notificationService.success(`Bienvenido, ${res.correoInstitucional}`, 'Acceso Exitoso');
        this.authService.redirectByRole(res.rol);
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
