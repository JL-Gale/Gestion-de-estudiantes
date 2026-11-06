import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EstudianteService } from '../../../core/services/estudiante.service';
import { NotificationService } from '../../../core/services/notification.service';
import { EstudianteCursoResponse } from '../../../core/models/academic.models';

@Component({
  selector: 'app-mis-cursos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid p-0">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 class="fw-bold text-dark mb-1">Mi Curso y Salón Asignado</h4>
          <p class="text-muted small mb-0">Información sobre tu grado escolar, grupo y matrícula académica activa</p>
        </div>
        <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 py-2 px-3 fs-6">
          <i class="bi bi-mortarboard me-1"></i> Estado: <strong>Matriculado</strong>
        </span>
      </div>

      <!-- Course Details Card -->
      @if (curso(); as c) {
        <div class="row g-4">
          <div class="col-12 col-lg-8">
            <div class="card p-4 shadow-sm border-0">
              <div class="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                <div class="bg-primary text-white rounded-3 p-3 d-flex align-items-center justify-content-center" style="width: 56px; height: 56px;">
                  <i class="bi bi-building fs-3"></i>
                </div>
                <div>
                  <h4 class="fw-bold text-dark mb-0">{{ c.nombreCompleto }}</h4>
                  <span class="badge bg-light text-secondary border mt-1">
                    Año Lectivo {{ c.anioLectivo }}
                  </span>
                </div>
              </div>

              <div class="row g-3 mb-4">
                <div class="col-12 col-sm-4">
                  <div class="p-3 bg-light rounded-3">
                    <small class="text-muted text-uppercase d-block" style="font-size: 0.7rem;">Grado Escolar</small>
                    <span class="fs-5 fw-bold text-dark">{{ c.grado }}°</span>
                  </div>
                </div>
                <div class="col-12 col-sm-4">
                  <div class="p-3 bg-light rounded-3">
                    <small class="text-muted text-uppercase d-block" style="font-size: 0.7rem;">Grupo / Sección</small>
                    <span class="fs-5 fw-bold text-dark">Grupo {{ c.grupo }}</span>
                  </div>
                </div>
                <div class="col-12 col-sm-4">
                  <div class="p-3 bg-light rounded-3">
                    <small class="text-muted text-uppercase d-block" style="font-size: 0.7rem;">Fecha Matrícula</small>
                    <span class="fs-6 fw-semibold text-dark">{{ c.fechaMatricula }}</span>
                  </div>
                </div>
              </div>

              <div class="d-flex flex-wrap gap-3">
                <a routerLink="/estudiante/mis-notas" class="btn btn-primary d-flex align-items-center gap-2">
                  <i class="bi bi-award-fill"></i>
                  <span>Consultar Mis Calificaciones</span>
                </a>
              </div>
            </div>
          </div>

          <div class="col-12 col-lg-4">
            <div class="card p-4 shadow-sm border-0 bg-white">
              <h6 class="fw-bold text-dark mb-3">
                <i class="bi bi-info-circle text-primary me-2"></i>Información Institucional
              </h6>
              <p class="text-muted small mb-3">
                Tu asignación a este curso te habilita automáticamente para cursar todas las asignaturas y cargas curriculares programadas por el colegio para este año lectivo.
              </p>
              <div class="p-3 rounded-2 bg-primary bg-opacity-10 border border-primary border-opacity-25 small text-primary">
                <i class="bi bi-shield-check me-1"></i> Si requieres cambio de grupo o jornada, contacta a la secretaría académica de la institución.
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="card text-center p-5 shadow-sm border-0">
          <i class="bi bi-journal-x fs-1 text-muted mb-3"></i>
          <h5 class="fw-bold text-dark">No tienes curso asignado actualmente</h5>
          <p class="text-muted small mb-0">
            Aún no apareces matriculado en ningún grado escolar. Consulta con la administración del colegio.
          </p>
        </div>
      }
    </div>
  `
})
export class MisCursosComponent implements OnInit {
  private estudianteService = inject(EstudianteService);
  private notificationService = inject(NotificationService);

  public curso = signal<EstudianteCursoResponse | null>(null);

  ngOnInit(): void {
    this.estudianteService.getMiCurso().subscribe({
      next: (data) => {
        this.curso.set(data || null);
      },
      error: () => {
        // If 404 or empty, leave as null to show clean empty state
        this.curso.set(null);
      }
    });
  }
}
