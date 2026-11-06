import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastContainerComponent } from '../toast/toast-container';
import { ChangePasswordModalComponent } from '../change-password-modal/change-password-modal';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ToastContainerComponent,
    ChangePasswordModalComponent
  ],
  template: `
    <div class="d-flex" style="min-height: 100vh;">
      <!-- Sidebar -->
      <aside
        class="bg-dark text-white d-flex flex-column flex-shrink-0 p-3 shadow"
        [class.d-none]="isMobileMenuOpen() === false"
        [class.d-md-flex]="true"
        style="width: 275px; background-color: #0f172a !important; z-index: 1040;"
      >
        <!-- Brand Header -->
        <div class="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom border-secondary border-opacity-50">
          <div class="d-flex align-items-center gap-2 text-decoration-none text-white">
            <div class="bg-primary rounded-3 d-flex align-items-center justify-content-center text-white" style="width: 38px; height: 38px;">
              <i class="bi bi-mortarboard-fill fs-5"></i>
            </div>
            <div>
              <div class="fw-bold lh-1 text-white">Colegio San Martín</div>
              <small class="text-secondary" style="font-size: 0.75rem;">Portal Académico v2</small>
            </div>
          </div>
          <button class="btn btn-sm text-secondary d-md-none" (click)="toggleMobileMenu()">
            <i class="bi bi-x-lg fs-5"></i>
          </button>
        </div>

        <!-- Role Badge -->
        <div class="mb-3 px-3 py-2 rounded-3 bg-secondary bg-opacity-25 d-flex align-items-center gap-2">
          <i class="bi bi-person-badge text-info fs-5"></i>
          <div class="overflow-hidden">
            <small class="text-uppercase text-secondary d-block" style="font-size: 0.65rem; letter-spacing: 0.08em;">Perfil Activo</small>
            <span
              class="badge"
              [ngClass]="{
                'badge-role-admin': authService.userRole() === 'ADMIN',
                'badge-role-docente': authService.userRole() === 'DOCENTE',
                'badge-role-estudiante': authService.userRole() === 'ESTUDIANTE'
              }"
            >
              {{ authService.userRole() }}
            </span>
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="nav nav-pills flex-column gap-1 mb-auto overflow-y-auto">
          <!-- ADMIN LINKS -->
          @if (authService.userRole() === 'ADMIN') {
            <a
              routerLink="/admin/dashboard"
              routerLinkActive="active"
              class="nav-link text-white-50 d-flex align-items-center gap-2.5 px-3 py-2 rounded-3"
            >
              <i class="bi bi-grid-1x2 fs-5"></i>
              <span>Dashboard</span>
            </a>
            <a
              routerLink="/admin/estudiantes"
              routerLinkActive="active"
              class="nav-link text-white-50 d-flex align-items-center gap-2.5 px-3 py-2 rounded-3"
            >
              <i class="bi bi-people fs-5"></i>
              <span>Estudiantes</span>
            </a>
            <a
              routerLink="/admin/docentes"
              routerLinkActive="active"
              class="nav-link text-white-50 d-flex align-items-center gap-2.5 px-3 py-2 rounded-3"
            >
              <i class="bi bi-person-video3 fs-5"></i>
              <span>Docentes</span>
            </a>
            <a
              routerLink="/admin/asignaturas"
              routerLinkActive="active"
              class="nav-link text-white-50 d-flex align-items-center gap-2.5 px-3 py-2 rounded-3"
            >
              <i class="bi bi-book fs-5"></i>
              <span>Asignaturas</span>
            </a>
            <a
              routerLink="/admin/cursos"
              routerLinkActive="active"
              class="nav-link text-white-50 d-flex align-items-center gap-2.5 px-3 py-2 rounded-3"
            >
              <i class="bi bi-building fs-5"></i>
              <span>Cursos / Salones</span>
            </a>
            <a
              routerLink="/admin/cargas-academicas"
              routerLinkActive="active"
              class="nav-link text-white-50 d-flex align-items-center gap-2.5 px-3 py-2 rounded-3"
            >
              <i class="bi bi-briefcase fs-5"></i>
              <span>Cargas & Cortes</span>
            </a>
            <a
              routerLink="/admin/matriculas"
              routerLinkActive="active"
              class="nav-link text-white-50 d-flex align-items-center gap-2.5 px-3 py-2 rounded-3"
            >
              <i class="bi bi-card-checklist fs-5"></i>
              <span>Matrículas</span>
            </a>
          }

          <!-- DOCENTE LINKS -->
          @if (authService.userRole() === 'DOCENTE') {
            <a
              routerLink="/docente/mis-cargas"
              routerLinkActive="active"
              class="nav-link text-white-50 d-flex align-items-center gap-2.5 px-3 py-2.5 rounded-3"
            >
              <i class="bi bi-journal-bookmark-fill fs-5"></i>
              <span>Mis Cargas Académicas</span>
            </a>
          }

          <!-- ESTUDIANTE LINKS -->
          @if (authService.userRole() === 'ESTUDIANTE') {
            <a
              routerLink="/estudiante/mis-notas"
              routerLinkActive="active"
              class="nav-link text-white-50 d-flex align-items-center gap-2.5 px-3 py-2.5 rounded-3"
            >
              <i class="bi bi-award-fill fs-5"></i>
              <span>Mis Calificaciones</span>
            </a>
            <a
              routerLink="/estudiante/mi-curso"
              routerLinkActive="active"
              class="nav-link text-white-50 d-flex align-items-center gap-2.5 px-3 py-2.5 rounded-3"
            >
              <i class="bi bi-collection-fill fs-5"></i>
              <span>Mi Salón / Curso</span>
            </a>
          }
        </nav>

        <!-- Sidebar Footer -->
        <div class="pt-3 border-top border-secondary border-opacity-50">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <div class="text-truncate" style="max-width: 175px;">
              <div class="fw-semibold text-white small text-truncate">{{ authService.currentUser()?.correoInstitucional }}</div>
              <small class="text-secondary" style="font-size: 0.7rem;">Sesión activa</small>
            </div>
            <button
              class="btn btn-sm btn-outline-light border-0"
              (click)="openChangePasswordModal()"
              title="Cambiar Contraseña"
            >
              <i class="bi bi-key-fill text-warning"></i>
            </button>
          </div>
          <button class="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2" (click)="logout()">
            <i class="bi bi-box-arrow-right"></i>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="d-flex flex-column flex-grow-1 overflow-hidden">
        <!-- Top Navbar -->
        <header class="navbar bg-white border-bottom border-subtle px-3 py-2.5 sticky-top shadow-sm">
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-light d-md-none" (click)="toggleMobileMenu()" aria-label="Abrir menú">
              <i class="bi bi-list fs-5"></i>
            </button>
          </div>

          <div class="d-flex align-items-center gap-3">
            <div class="dropdown">
              <button
                class="btn btn-light dropdown-toggle d-flex align-items-center gap-2 border-0 bg-transparent py-1 px-2"
                type="button"
                id="userDropdown"
                (click)="toggleUserDropdown()"
              >
                <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style="width: 32px; height: 32px; font-size: 0.85rem;">
                  {{ authService.currentUser()?.correoInstitucional?.charAt(0)?.toUpperCase() || 'U' }}
                </div>
                <div class="d-none d-sm-block text-start">
                  <div class="small fw-semibold text-dark lh-1">{{ authService.currentUser()?.correoInstitucional }}</div>
                  <small class="text-muted text-uppercase" style="font-size: 0.7rem;">{{ authService.currentUser()?.rol }}</small>
                </div>
              </button>
              @if (isUserDropdownOpen()) {
                <div class="dropdown-menu dropdown-menu-end show shadow-sm border-0 position-absolute end-0 mt-2 py-1" style="min-width: 200px;">
                  <button class="dropdown-item d-flex align-items-center gap-2 py-2" (click)="openChangePasswordModal(); isUserDropdownOpen.set(false)">
                    <i class="bi bi-key text-warning"></i>
                    Cambiar Contraseña
                  </button>
                  <div class="dropdown-divider"></div>
                  <button class="dropdown-item d-flex align-items-center gap-2 py-2 text-danger" (click)="logout()">
                    <i class="bi bi-box-arrow-right"></i>
                    Cerrar Sesión
                  </button>
                </div>
              }
            </div>
          </div>
        </header>

        <!-- Main Body Outlet -->
        <main class="flex-grow-1 p-3 p-md-4 overflow-auto bg-light bg-opacity-50">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>

    <!-- Toast Notifications Container -->
    <app-toast-container></app-toast-container>

    <!-- Change Password Modal -->
    <app-change-password-modal
      [isOpen]="isChangePasswordModalOpen()"
      (closeEvent)="isChangePasswordModalOpen.set(false)"
    ></app-change-password-modal>
  `,
  styles: [`
    .nav-pills .nav-link {
      transition: all 0.15s ease-in-out;
      font-size: 0.9rem;
    }
    .nav-pills .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.08);
      color: #ffffff !important;
    }
    .nav-pills .nav-link.active {
      background-color: var(--accent-blue) !important;
      color: #ffffff !important;
      font-weight: 500;
    }
  `]
})
export class MainLayoutComponent {
  public authService = inject(AuthService);
  public isMobileMenuOpen = signal<boolean>(false);
  public isChangePasswordModalOpen = signal<boolean>(false);
  public isUserDropdownOpen = signal<boolean>(false);

  public toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  public toggleUserDropdown(): void {
    this.isUserDropdownOpen.update(v => !v);
  }

  public openChangePasswordModal(): void {
    this.isChangePasswordModalOpen.set(true);
  }

  public logout(): void {
    this.authService.logout();
  }
}
