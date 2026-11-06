import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DocenteService } from '../../../core/services/docente.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
  CalificacionResponse,
  CalificacionUpsertRequest,
  CorteResponse,
  DocenteCargaResponse,
  DocenteEstudianteResponse
} from '../../../core/models/academic.models';

interface GradeRecord {
  nota: number;
  observaciones?: string;
  nombreCorte?: string;
}

@Component({
  selector: 'app-planilla-calificaciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container-fluid p-0">
      <!-- Breadcrumb & Header -->
      <nav aria-label="breadcrumb" class="mb-2">
        <ol class="breadcrumb small">
          <li class="breadcrumb-item"><a routerLink="/docente/mis-cargas" class="text-decoration-none">Mis Cargas Académicas</a></li>
          <li class="breadcrumb-item active" aria-current="page">Planilla de Calificaciones</li>
        </ol>
      </nav>

      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <h4 class="fw-bold text-dark mb-0">Planilla de Calificaciones</h4>
            @if (currentCarga()) {
              <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 fs-6">
                {{ currentCarga()?.curso }} &bull; {{ currentCarga()?.asignatura }}
              </span>
            }
          </div>
          <p class="text-muted small mb-0">
            Registro, actualización y seguimiento de calificaciones en escala de 0.0 a 5.0
          </p>
        </div>
        <div class="d-flex gap-2">
          <a routerLink="/docente/mis-cargas" class="btn btn-outline-secondary d-flex align-items-center gap-2">
            <i class="bi bi-arrow-left"></i>
            <span>Volver a Mis Cargas</span>
          </a>
        </div>
      </div>

      <!-- Information & Summary Card -->
      <div class="card mb-4 p-3 bg-white shadow-sm border-0">
        <div class="d-flex flex-wrap gap-4 align-items-center">
          <div>
            <small class="text-muted d-block text-uppercase fw-semibold" style="font-size: 0.7rem;">Cortes y Ventanas de Calificación</small>
            <div class="d-flex flex-wrap gap-2 mt-1">
              @for (corte of cortes(); track corte.idCorte) {
                <div class="border rounded-2 p-2 bg-light d-flex align-items-center gap-2">
                  <div>
                    <strong class="text-dark">{{ corte.nombre }}</strong>
                    <span class="badge bg-primary bg-opacity-10 text-primary ms-1">{{ corte.porcentaje }}%</span>
                    @if (corte.fechaInicioCalificacion && corte.fechaFinCalificacion) {
                      <div class="text-muted small" style="font-size: 0.72rem;">
                        <i class="bi bi-calendar-event me-1"></i>{{ corte.fechaInicioCalificacion }} a {{ corte.fechaFinCalificacion }}
                      </div>
                    } @else {
                      <div class="text-muted small" style="font-size: 0.72rem;">
                        <i class="bi bi-calendar-x me-1"></i>Sin fechas asignadas
                      </div>
                    }
                  </div>
                  @let status = getCorteStatus(corte);
                  <span class="badge" [ngClass]="status.badgeClass">
                    <i class="bi me-1" [ngClass]="status.icon"></i> {{ status.label }}
                  </span>
                </div>
              } @empty {
                <span class="badge bg-warning bg-opacity-10 text-warning-emphasis border border-warning">
                  <i class="bi bi-exclamation-triangle-fill me-1"></i> Sin cortes configurados en el sistema
                </span>
              }
            </div>
          </div>
          <div class="ms-md-auto text-muted small">
            Estudiantes Matriculados: <strong>{{ estudiantes().length }}</strong>
          </div>
        </div>
      </div>

      <!-- Grades Matrix Table Card -->
      <div class="card shadow-sm border-0 overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th style="min-width: 140px;">Doc. Identidad</th>
                <th style="min-width: 220px;">Estudiante</th>
                <!-- Dynamic columns for cortes -->
                @for (corte of cortes(); track corte.idCorte) {
                  <th class="text-center" style="min-width: 160px;">
                    <div>{{ corte.nombre }}</div>
                    <small class="text-primary fw-normal">({{ corte.porcentaje }}%)</small>
                    <div class="mt-1">
                      @let status = getCorteStatus(corte);
                      <span class="badge" [ngClass]="status.badgeClass" style="font-size: 0.65rem;">
                        <i class="bi me-1" [ngClass]="status.icon"></i>{{ status.label }}
                      </span>
                    </div>
                  </th>
                }
              </tr>
            </thead>
            <tbody>
              @for (est of estudiantes(); track est.idEstudiante) {
                <tr>
                  <td>
                    <span class="badge bg-light text-dark font-monospace border px-2 py-1">
                      {{ est.numeroDocumento }}
                    </span>
                  </td>
                  <td>
                    <div class="fw-semibold text-dark">{{ est.nombres }} {{ est.apellidos }}</div>
                    <small class="text-muted d-block">
                      <i class="bi bi-telephone me-1"></i>{{ est.telefono || 'Sin teléfono' }}
                    </small>
                  </td>

                  <!-- Dynamic Grade Cells -->
                  @for (corte of cortes(); track corte.idCorte) {
                    <td class="text-center">
                      @if (getGrade(est.idEstudiante, corte.idCorte); as g) {
                        <div class="d-flex flex-column align-items-center">
                          @if (isCorteOpen(corte)) {
                            <button
                              class="btn btn-sm btn-light border px-3 py-1 fw-bold text-dark d-flex align-items-center gap-1.5 shadow-sm"
                              [ngClass]="g.nota >= 3.0 ? 'border-success text-success' : 'border-danger text-danger'"
                              (click)="openGradeModal(est, corte)"
                              title="Periodo abierto - Haz clic para modificar nota"
                            >
                              <span class="fs-6">{{ g.nota | number:'1.1-2' }}</span>
                              <i class="bi bi-pencil-square text-muted" style="font-size: 0.75rem;"></i>
                            </button>
                          } @else {
                            <span
                              class="badge bg-light border px-3 py-1 fw-bold d-flex align-items-center gap-1.5 shadow-sm"
                              [ngClass]="g.nota >= 3.0 ? 'border-success text-success' : 'border-danger text-danger'"
                              title="Periodo cerrado - Nota definitiva guardada (Solo lectura)"
                            >
                              <span class="fs-6">{{ g.nota | number:'1.1-2' }}</span>
                              <i class="bi bi-lock-fill text-muted" style="font-size: 0.75rem;"></i>
                            </span>
                          }
                          @if (g.observaciones) {
                            <small class="text-muted text-truncate mt-1" style="max-width: 130px;" [title]="g.observaciones">
                              {{ g.observaciones }}
                            </small>
                          }
                        </div>
                      } @else {
                        @if (isCorteOpen(corte)) {
                          <button
                            class="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 px-2.5 py-1"
                            (click)="openGradeModal(est, corte)"
                            title="Asignar nota para este periodo"
                          >
                            <i class="bi bi-plus-lg"></i>
                            <span>Asignar</span>
                          </button>
                        } @else {
                          <span
                            class="badge bg-light text-muted border py-1.5 px-2"
                            [title]="!corte.fechaInicioCalificacion || !corte.fechaFinCalificacion ? 'Periodo sin fechas asignadas (Bloqueado)' : 'Periodo cerrado (Sin nota)'"
                          >
                            <i class="bi bi-lock-fill me-1"></i>Bloqueado
                          </span>
                        }
                      }
                    </td>
                  }
                </tr>
              } @empty {
                <tr>
                  <td [attr.colspan]="2 + (cortes().length || 1)" class="text-center py-5">
                    <div class="text-muted">
                      <i class="bi bi-people-fill fs-1 d-block mb-2 text-secondary"></i>
                      <h6 class="fw-semibold text-dark">No hay estudiantes matriculados en este curso</h6>
                      <p class="small mb-0">El administrador debe matricular estudiantes en este grado/grupo.</p>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL: REGISTRAR / MODIFICAR NOTA (UPSERT) -->
    @if (showGradeModal() && selectedStudent() && selectedCorte()) {
      <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(15, 23, 42, 0.65);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg">
            <div class="modal-header bg-primary text-white border-bottom-0">
              <h5 class="modal-title fw-bold d-flex align-items-center gap-2">
                <i class="bi bi-award-fill"></i>
                <span>Calificar Estudiante</span>
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="closeGradeModal()"></button>
            </div>
            <form [formGroup]="gradeForm" (ngSubmit)="saveGrade()">
              <div class="modal-body p-4">
                <div class="card p-3 bg-light border-0 mb-3">
                  <div class="row g-2">
                    <div class="col-6">
                      <small class="text-muted d-block">Estudiante:</small>
                      <strong class="text-dark">{{ selectedStudent()?.nombres }} {{ selectedStudent()?.apellidos }}</strong>
                    </div>
                    <div class="col-6">
                      <small class="text-muted d-block">Corte Evaluativo:</small>
                      <strong class="text-primary">{{ selectedCorte()?.nombre }} ({{ selectedCorte()?.porcentaje }}%)</strong>
                      @if (selectedCorte()?.fechaInicioCalificacion && selectedCorte()?.fechaFinCalificacion) {
                        <div class="text-muted small" style="font-size: 0.72rem;">
                          Plazo: {{ selectedCorte()?.fechaInicioCalificacion }} al {{ selectedCorte()?.fechaFinCalificacion }}
                        </div>
                      } @else {
                        <div class="text-danger small" style="font-size: 0.72rem;">
                          Sin fechas asignadas
                        </div>
                      }
                    </div>
                  </div>
                </div>

                @if (selectedCorte() && !isCorteOpen(selectedCorte()!)) {
                  <div class="alert alert-warning small mb-3 d-flex align-items-center gap-2">
                    <i class="bi bi-exclamation-triangle-fill fs-5"></i>
                    <div>
                      <strong>Periodo no habilitado:</strong>
                      @if (selectedCorte()?.fechaInicioCalificacion && selectedCorte()?.fechaFinCalificacion) {
                        El sistema solo permite registrar notas entre {{ selectedCorte()?.fechaInicioCalificacion }} y {{ selectedCorte()?.fechaFinCalificacion }}.
                      } @else {
                        Este periodo aún no tiene fechas de calificación asignadas por la administración.
                      }
                    </div>
                  </div>
                }

                <div class="mb-3">
                  <label class="form-label fw-semibold small text-dark">
                    Nota Definitiva del Corte (0.0 - 5.0) <span class="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="5"
                    class="form-control form-control-lg"
                    placeholder="Ej: 4.5"
                    formControlName="nota"
                    [class.is-invalid]="gradeForm.get('nota')?.invalid && gradeForm.get('nota')?.touched"
                  />
                  @if (gradeForm.get('nota')?.invalid && gradeForm.get('nota')?.touched) {
                    <div class="invalid-feedback">Ingresa una nota válida entre 0.0 y 5.0</div>
                  }
                  <div class="form-text small">Mínimo aprobatorio institucional: 3.0</div>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold small text-dark">Observaciones Académicas (Opcional)</label>
                  <textarea
                    rows="3"
                    class="form-control"
                    placeholder="Retroalimentación para el estudiante..."
                    formControlName="observaciones"
                  ></textarea>
                </div>
              </div>
              <div class="modal-footer bg-light border-top-0 px-4 py-3">
                <button type="button" class="btn btn-secondary" (click)="closeGradeModal()">Cancelar</button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  [disabled]="gradeForm.invalid || isSubmitting() || (selectedCorte() && !isCorteOpen(selectedCorte()!))"
                >
                  @if (isSubmitting()) {
                    <span class="spinner-border spinner-border-sm me-1" role="status"></span>
                  }
                  Guardar Calificación
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }
  `
})
export class PlanillaCalificacionesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private docenteService = inject(DocenteService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  public idCarga: number = 0;
  public currentCarga = signal<DocenteCargaResponse | null>(null);
  public cortes = signal<CorteResponse[]>([]);
  public estudiantes = signal<DocenteEstudianteResponse[]>([]);

  // Map of studentId_corteId -> GradeRecord
  public gradesMap = signal<Map<string, GradeRecord>>(new Map());

  // Modal State
  public showGradeModal = signal<boolean>(false);
  public selectedStudent = signal<DocenteEstudianteResponse | null>(null);
  public selectedCorte = signal<CorteResponse | null>(null);
  public isSubmitting = signal<boolean>(false);

  public gradeForm: FormGroup = this.fb.group({
    nota: [null, [Validators.required, Validators.min(0), Validators.max(5)]],
    observaciones: ['']
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('idCarga') || this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.idCarga = Number(idParam);
      this.loadData();
    }
  }

  public loadData(): void {
    // 1. Get carga info
    this.docenteService.getMisCargas().subscribe({
      next: (cargas) => {
        const found = (cargas || []).find((c) => c.idCarga === this.idCarga);
        if (found) {
          this.currentCarga.set(found);
        }
      },
      error: () => {}
    });

    // 2. Get Cortes
    this.docenteService.getCortesCarga(this.idCarga).subscribe({
      next: (cortes) => this.cortes.set(cortes || []),
      error: (err) => this.notificationService.error(err.error?.mensaje || 'Error al cargar cortes')
    });

    // 3. Get Estudiantes
    this.docenteService.getEstudiantesCarga(this.idCarga).subscribe({
      next: (estudiantes) => this.estudiantes.set(estudiantes || []),
      error: (err) => this.notificationService.error(err.error?.mensaje || 'Error al cargar estudiantes del curso')
    });

    // 4. Get Calificaciones existentes de la carga
    this.docenteService.getCalificacionesCarga(this.idCarga).subscribe({
      next: (calificaciones) => {
        const newMap = new Map<string, GradeRecord>();
        (calificaciones || []).forEach((c) => {
          newMap.set(`${c.idEstudiante}_${c.idCorte}`, {
            nota: c.nota,
            observaciones: c.observaciones || '',
            nombreCorte: c.nombreCorte
          });
        });
        this.gradesMap.set(newMap);
      },
      error: () => {}
    });
  }

  public getGrade(idEstudiante: number, idCorte: number): GradeRecord | undefined {
    return this.gradesMap().get(`${idEstudiante}_${idCorte}`);
  }

  public isCorteOpen(corte: CorteResponse): boolean {
    const start = corte.fechaInicioCalificacion || corte.fecha_inicio_calificacion;
    const end = corte.fechaFinCalificacion || corte.fecha_fin_calificacion;
    if (!start || !end) return false;
    const today = new Date().toISOString().split('T')[0];
    return today >= start && today <= end;
  }

  public getCorteStatus(corte: CorteResponse): { label: string; badgeClass: string; icon: string } {
    const start = corte.fechaInicioCalificacion || corte.fecha_inicio_calificacion;
    const end = corte.fechaFinCalificacion || corte.fecha_fin_calificacion;
    if (!start || !end) {
      return {
        label: 'Sin fechas',
        badgeClass: 'bg-secondary-subtle text-secondary border border-secondary-subtle',
        icon: 'bi-calendar-x'
      };
    }
    const today = new Date().toISOString().split('T')[0];
    if (today < start) {
      return {
        label: 'Próximo',
        badgeClass: 'bg-warning-subtle text-warning-emphasis border border-warning-subtle',
        icon: 'bi-clock-history'
      };
    }
    if (today >= start && today <= end) {
      return {
        label: 'Abierto',
        badgeClass: 'bg-success-subtle text-success border border-success-subtle',
        icon: 'bi-unlock-fill'
      };
    }
    return {
      label: 'Cerrado',
      badgeClass: 'bg-danger-subtle text-danger border border-danger-subtle',
      icon: 'bi-lock-fill'
    };
  }

  public openGradeModal(student: DocenteEstudianteResponse, corte: CorteResponse): void {
    if (!this.isCorteOpen(corte)) {
      const start = corte.fechaInicioCalificacion || corte.fecha_inicio_calificacion;
      const end = corte.fechaFinCalificacion || corte.fecha_fin_calificacion;
      if (!start || !end) {
        this.notificationService.error(`El periodo (${corte.nombre}) aún no tiene habilitadas las fechas de calificación.`);
      } else {
        this.notificationService.error(`El sistema de notas se encuentra cerrado para este periodo (${corte.nombre}). Plazo: ${start} al ${end}.`);
      }
      return;
    }

    this.selectedStudent.set(student);
    this.selectedCorte.set(corte);

    const existing = this.getGrade(student.idEstudiante, corte.idCorte);
    this.gradeForm.reset({
      nota: existing ? existing.nota : null,
      observaciones: existing ? existing.observaciones : ''
    });

    this.showGradeModal.set(true);
  }

  public closeGradeModal(): void {
    this.showGradeModal.set(false);
    this.selectedStudent.set(null);
    this.selectedCorte.set(null);
  }

  public saveGrade(): void {
    if (this.gradeForm.invalid) {
      this.gradeForm.markAllAsTouched();
      return;
    }

    const student = this.selectedStudent();
    const corte = this.selectedCorte();
    if (!student || !corte) return;

    this.isSubmitting.set(true);
    const req: CalificacionUpsertRequest = {
      id_estudiante: student.idEstudiante,
      id_corte: corte.idCorte,
      nota: Number(this.gradeForm.value.nota),
      observaciones: this.gradeForm.value.observaciones?.trim() || undefined
    };

    this.docenteService.guardarCalificacion(req).subscribe({
      next: (res: CalificacionResponse) => {
        this.notificationService.success(`Calificación guardada para ${student.nombres}`);

        // Update local map
        const newMap = new Map(this.gradesMap());
        newMap.set(`${student.idEstudiante}_${corte.idCorte}`, {
          nota: res.nota,
          observaciones: res.observaciones,
          nombreCorte: res.nombreCorte
        });
        this.gradesMap.set(newMap);

        this.closeGradeModal();
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.notificationService.error(err.error?.message || err.error?.mensaje || 'Error al guardar la calificación');
      }
    });
  }
}
