import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid p-0">
      <!-- Page Title -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
        <div>
          <h4 class="fw-bold text-dark mb-1">Panel de Administración</h4>
          <p class="text-muted small mb-0">Vista general y métricas institucionales (API v2)</p>
        </div>
      </div>

      <!-- Metric Cards Grid -->
      <div class="row g-3 mb-4">
        <!-- Estudiantes -->
        <div class="col-12 col-sm-6 col-xl-4">
          <div class="card card-hoverable h-100 p-3">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <small class="text-muted text-uppercase fw-semibold" style="font-size: 0.75rem;">Estudiantes</small>
                <h3 class="fw-bold text-dark my-1">{{ totalEstudiantes() }}</h3>
                <small class="text-muted d-flex align-items-center gap-1">
                  <i class="bi bi-people"></i> Registrados en BD
                </small>
              </div>
              <div class="bg-primary bg-opacity-10 text-primary rounded-3 p-3">
                <i class="bi bi-people-fill fs-3"></i>
              </div>
            </div>
            <div class="mt-3 pt-2 border-top">
              <a routerLink="/admin/estudiantes" class="text-decoration-none small fw-semibold text-primary d-flex align-items-center justify-content-between">
                <span>Gestionar alumnos</span>
                <i class="bi bi-chevron-right"></i>
              </a>
            </div>
          </div>
        </div>

        <!-- Docentes -->
        <div class="col-12 col-sm-6 col-xl-4">
          <div class="card card-hoverable h-100 p-3">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <small class="text-muted text-uppercase fw-semibold" style="font-size: 0.75rem;">Docentes</small>
                <h3 class="fw-bold text-dark my-1">{{ totalDocentes() }}</h3>
                <small class="text-muted d-flex align-items-center gap-1">
                  <i class="bi bi-person-workspace"></i> Planta de profesores
                </small>
              </div>
              <div class="bg-info bg-opacity-10 text-info rounded-3 p-3">
                <i class="bi bi-person-video3 fs-3"></i>
              </div>
            </div>
            <div class="mt-3 pt-2 border-top">
              <a routerLink="/admin/docentes" class="text-decoration-none small fw-semibold text-info d-flex align-items-center justify-content-between">
                <span>Gestionar profesores</span>
                <i class="bi bi-chevron-right"></i>
              </a>
            </div>
          </div>
        </div>

        <!-- Cursos / Salones -->
        <div class="col-12 col-sm-6 col-xl-4">
          <div class="card card-hoverable h-100 p-3">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <small class="text-muted text-uppercase fw-semibold" style="font-size: 0.75rem;">Cursos / Salones</small>
                <h3 class="fw-bold text-dark my-1">{{ totalCursos() }}</h3>
                <small class="text-muted d-flex align-items-center gap-1">
                  <i class="bi bi-building"></i> Grados y grupos activos
                </small>
              </div>
              <div class="bg-success bg-opacity-10 text-success rounded-3 p-3">
                <i class="bi bi-building-fill fs-3"></i>
              </div>
            </div>
            <div class="mt-3 pt-2 border-top">
              <a routerLink="/admin/cursos" class="text-decoration-none small fw-semibold text-success d-flex align-items-center justify-content-between">
                <span>Ver cursos</span>
                <i class="bi bi-chevron-right"></i>
              </a>
            </div>
          </div>
        </div>

        <!-- Asignaturas Base -->
        <div class="col-12 col-sm-6 col-xl-4">
          <div class="card card-hoverable h-100 p-3">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <small class="text-muted text-uppercase fw-semibold" style="font-size: 0.75rem;">Asignaturas</small>
                <h3 class="fw-bold text-dark my-1">{{ totalAsignaturas() }}</h3>
                <small class="text-muted d-flex align-items-center gap-1">
                  <i class="bi bi-book"></i> Catálogo de materias
                </small>
              </div>
              <div class="bg-warning bg-opacity-10 text-warning rounded-3 p-3">
                <i class="bi bi-journal-bookmark-fill fs-3"></i>
              </div>
            </div>
            <div class="mt-3 pt-2 border-top">
              <a routerLink="/admin/asignaturas" class="text-decoration-none small fw-semibold text-warning d-flex align-items-center justify-content-between">
                <span>Catálogo base</span>
                <i class="bi bi-chevron-right"></i>
              </a>
            </div>
          </div>
        </div>

        <!-- Cargas Académicas -->
        <div class="col-12 col-sm-6 col-xl-4">
          <div class="card card-hoverable h-100 p-3">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <small class="text-muted text-uppercase fw-semibold" style="font-size: 0.75rem;">Cargas Académicas</small>
                <h3 class="fw-bold text-dark my-1">{{ totalCargas() }}</h3>
                <small class="text-muted d-flex align-items-center gap-1">
                  <i class="bi bi-briefcase"></i> Clases asignadas
                </small>
              </div>
              <div class="bg-purple bg-opacity-10 text-primary rounded-3 p-3" style="background-color: #ede9fe; color: #6d28d9;">
                <i class="bi bi-briefcase-fill fs-3"></i>
              </div>
            </div>
            <div class="mt-3 pt-2 border-top">
              <a routerLink="/admin/cargas-academicas" class="text-decoration-none small fw-semibold text-primary d-flex align-items-center justify-content-between">
                <span>Cargas & cortes 100%</span>
                <i class="bi bi-chevron-right"></i>
              </a>
            </div>
          </div>
        </div>

        <!-- Matrículas -->
        <div class="col-12 col-sm-6 col-xl-4">
          <div class="card card-hoverable h-100 p-3">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <small class="text-muted text-uppercase fw-semibold" style="font-size: 0.75rem;">Matrículas</small>
                <h3 class="fw-bold text-dark my-1">{{ totalMatriculas() }}</h3>
                <small class="text-success d-flex align-items-center gap-1">
                  <i class="bi bi-check-circle-fill"></i> Inscritos a salones
                </small>
              </div>
              <div class="bg-secondary bg-opacity-10 text-secondary rounded-3 p-3">
                <i class="bi bi-card-checklist fs-3"></i>
              </div>
            </div>
            <div class="mt-3 pt-2 border-top">
              <a routerLink="/admin/matriculas" class="text-decoration-none small fw-semibold text-secondary d-flex align-items-center justify-content-between">
                <span>Gestionar matrículas</span>
                <i class="bi bi-chevron-right"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Action Modules -->
      <div class="card p-4">
        <h5 class="fw-bold text-dark mb-3">Flujo Académico Institucional</h5>
        <div class="row g-3">
          <div class="col-12 col-md-4">
            <div class="p-3 border rounded-3 bg-light bg-opacity-50 h-100">
              <div class="d-flex align-items-center gap-2 mb-2 text-primary fw-bold">
                <i class="bi bi-1-circle-fill fs-5"></i>
                <span>Estructura Base</span>
              </div>
              <p class="small text-muted mb-3">
                Crea los cursos/salones (ej: 10° A 2026), el catálogo de materias y registra docentes y alumnos.
              </p>
              <div class="d-flex gap-2">
                <a routerLink="/admin/cursos" class="btn btn-sm btn-outline-primary">Cursos</a>
                <a routerLink="/admin/asignaturas" class="btn btn-sm btn-outline-secondary">Materias</a>
              </div>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="p-3 border rounded-3 bg-light bg-opacity-50 h-100">
              <div class="d-flex align-items-center gap-2 mb-2 text-info fw-bold">
                <i class="bi bi-2-circle-fill fs-5"></i>
                <span>Cargas & Ponderaciones</span>
              </div>
              <p class="small text-muted mb-3">
                Asigna a un docente qué materia dictará en qué salón y define los cortes evaluativos (deben sumar 100%).
              </p>
              <a routerLink="/admin/cargas-academicas" class="btn btn-sm btn-outline-info">
                Asignar Cargas
              </a>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="p-3 border rounded-3 bg-light bg-opacity-50 h-100">
              <div class="d-flex align-items-center gap-2 mb-2 text-success fw-bold">
                <i class="bi bi-3-circle-fill fs-5"></i>
                <span>Matrícula de Alumnos</span>
              </div>
              <p class="small text-muted mb-3">
                Inscribe a cada estudiante en su salón correspondiente. Esto habilitará automáticamente las materias para el profesor y el estudiante.
              </p>
              <a routerLink="/admin/matriculas" class="btn btn-sm btn-outline-success">
                Matricular Alumnos
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);

  public totalEstudiantes = signal<number>(0);
  public totalDocentes = signal<number>(0);
  public totalAsignaturas = signal<number>(0);
  public totalCursos = signal<number>(0);
  public totalCargas = signal<number>(0);
  public totalMatriculas = signal<number>(0);

  ngOnInit(): void {
    this.cargarMetricas();
  }

  public cargarMetricas(): void {
    this.adminService.getEstudiantes().subscribe({
      next: (data) => this.totalEstudiantes.set(data.length),
      error: () => { }
    });
    this.adminService.getDocentes().subscribe({
      next: (data) => this.totalDocentes.set(data.length),
      error: () => { }
    });
    this.adminService.getAsignaturas().subscribe({
      next: (data) => this.totalAsignaturas.set(data.length),
      error: () => { }
    });
    this.adminService.getCursos().subscribe({
      next: (data) => this.totalCursos.set(data.length),
      error: () => { }
    });
    this.adminService.getCargasAcademicas().subscribe({
      next: (data) => this.totalCargas.set(data.length),
      error: () => { }
    });
    this.adminService.getMatriculas().subscribe({
      next: (data) => this.totalMatriculas.set(data.length),
      error: () => { }
    });
  }
}
