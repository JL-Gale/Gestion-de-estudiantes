import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstudianteService } from '../../../core/services/estudiante.service';
import { NotificationService } from '../../../core/services/notification.service';
import { EstudianteNotasResponse, EstudianteMateriaReporte, CorteNotaReporte } from '../../../core/models/academic.models';

@Component({
  selector: 'app-consolidado-notas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 class="fw-bold text-dark mb-1">Boletín y Consolidado de Calificaciones</h4>
          <p class="text-muted small mb-0">Seguimiento académico detallado por cortes evaluativos y promedios ponderados</p>
        </div>
        @if (reporte()) {
          <span class="badge bg-light text-dark border py-2 px-3 fs-6">
            <i class="bi bi-mortarboard me-1 text-primary"></i> Curso: <strong>{{ reporte()?.curso }}</strong>
          </span>
        }
      </div>

      <!-- Formulario de Consulta Histórica -->
      <div class="card mb-4 p-3 shadow-sm border-0">
        <div class="row g-3 align-items-center justify-content-between">
          <div class="col-12 col-md-5">
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <span
                class="badge py-2 px-3 fs-6"
                [ngClass]="selectedYear() === currentYear ? 'bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25' : 'bg-warning bg-opacity-10 text-warning-emphasis border border-warning'"
              >
                <i class="bi me-1" [ngClass]="selectedYear() === currentYear ? 'bi-calendar-check' : 'bi-clock-history'"></i>
                {{ selectedYear() === currentYear ? 'Año Lectivo Actual: ' + currentYear : 'Histórico Consultado: ' + selectedYear() }}
              </span>
              @if (selectedYear() !== currentYear) {
                <button
                  type="button"
                  class="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                  (click)="resetToCurrentYear()"
                >
                  <i class="bi bi-arrow-counterclockwise"></i>
                  <span>Volver al Año Actual ({{ currentYear }})</span>
                </button>
              }
            </div>
          </div>

          <div class="col-12 col-md-7 col-lg-6">
            <div class="d-flex flex-column flex-sm-row align-items-sm-center gap-2 justify-content-md-end">
              <label class="small fw-semibold text-muted text-nowrap">Consultar Histórico por Año:</label>
              <div class="input-group input-group-sm" style="max-width: 250px;">
                <input
                  type="number"
                  class="form-control"
                  [min]="2000"
                  [max]="currentYear"
                  [value]="inputHistoricoAnio()"
                  (input)="onHistoricoInputChange($event)"
                  (keydown.enter)="$event.preventDefault(); consultarHistorico()"
                />
                <button
                  type="button"
                  class="btn btn-primary d-flex align-items-center gap-1"
                  (click)="consultarHistorico()"
                  [disabled]="isHistoricoInvalid()"
                >
                  <i class="bi bi-search"></i>
                  <span>Consultar</span>
                </button>
              </div>
            </div>
            @if (historicoErrorMsg()) {
              <small class="text-danger d-block text-md-end mt-1">
                <i class="bi bi-exclamation-circle me-1"></i>{{ historicoErrorMsg() }}
              </small>
            }
          </div>
        </div>
      </div>

      <!-- History Notice Banner if past year selected -->
      @if (selectedYear() < currentYear) {
        <div class="alert alert-info border-info-subtle d-flex align-items-center gap-2 py-2 mb-4">
          <i class="bi bi-clock-history fs-5"></i>
          <div>
            <strong>Boletín Histórico {{ selectedYear() }}:</strong> Estás consultando el registro de notas de un año lectivo anterior.
          </div>
        </div>
      }

      <!-- Top Summary Metrics Card -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-md-4">
          <div class="card p-3 shadow-sm border-0">
            <small class="text-muted text-uppercase fw-semibold" style="font-size: 0.7rem;">Materias en Curso</small>
            <h3 class="fw-bold text-dark my-1">{{ reporte()?.materias?.length || 0 }}</h3>
            <small class="text-primary d-flex align-items-center gap-1">
              <i class="bi bi-book-half"></i> Total asignaturas del plan
            </small>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div class="card p-3 shadow-sm border-0">
            <small class="text-muted text-uppercase fw-semibold" style="font-size: 0.7rem;">Promedio Ponderado General</small>
            <h3
              class="fw-bold my-1"
              [ngClass]="promedioGeneral() >= 3.0 ? 'text-success' : 'text-danger'"
            >
              {{ promedioGeneral() | number:'1.2-2' }}
            </h3>
            <small class="text-muted">Escala de 0.0 a 5.0 (Aprobación: 3.0)</small>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div class="card p-3 shadow-sm border-0">
            <small class="text-muted text-uppercase fw-semibold" style="font-size: 0.7rem;">Estado Académico Actual</small>
            <div class="my-1">
              <span
                class="badge fs-6 py-1 px-3"
                [ngClass]="(reporte()?.materias?.length || 0) === 0 ? 'bg-secondary' : (promedioGeneral() >= 3.0 ? 'bg-success' : 'bg-warning text-dark')"
              >
                <i class="bi me-1" [ngClass]="promedioGeneral() >= 3.0 ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'"></i>
                {{ (reporte()?.materias?.length || 0) === 0 ? 'Sin registros' : (promedioGeneral() >= 3.0 ? 'Rendimiento Satisfactorio' : 'En Seguimiento') }}
              </span>
            </div>
            <small class="text-muted">Actualizado en tiempo real</small>
          </div>
        </div>
      </div>

      <!-- Consolidado de Calificaciones: UNA SOLA TABLA CON UNA FILA POR MATERIA -->
      @if (reporte()?.materias && reporte()!.materias.length > 0) {
        <div class="card overflow-hidden shadow-sm border-0 mb-4">
          <div class="card-header bg-white p-3 border-bottom d-flex align-items-center justify-content-between">
            <h6 class="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              <i class="bi bi-table text-primary"></i>
              <span>Consolidado de Calificaciones por Asignatura</span>
            </h6>
            <small class="text-muted">
              Total asignaturas: <strong>{{ reporte()!.materias.length }}</strong>
            </small>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th style="min-width: 220px;">Asignatura</th>
                  @for (col of columnasCortes(); track col.nombre) {
                    <th class="text-center" style="min-width: 120px;">
                      <div>{{ col.nombre }}</div>
                      @if (col.porcentaje) {
                        <small class="text-primary fw-normal">({{ col.porcentaje }}%)</small>
                      }
                    </th>
                  }
                  <th class="text-center" style="min-width: 140px;">Definitiva / Acumulado</th>
                  <th class="text-center" style="min-width: 120px;">Estado</th>
                  <th style="width: 50px;"></th>
                </tr>
              </thead>
              <tbody>
                @for (materia of reporte()!.materias; track materia.idCarga) {
                  <tr>
                    <!-- Asignatura y Docente -->
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <div class="bg-primary bg-opacity-10 text-primary p-2 rounded-2">
                          <i class="bi bi-book"></i>
                        </div>
                        <div>
                          <strong class="text-dark d-block fs-6">{{ materia.nombreAsignatura }}</strong>
                          <small class="text-muted">
                            <i class="bi bi-person-video3 me-1"></i>{{ materia.nombreDocente }}
                          </small>
                        </div>
                      </div>
                    </td>

                    <!-- Cortes Evaluativos en una sola fila -->
                    @for (col of columnasCortes(); track col.nombre) {
                      <td class="text-center">
                        @if (getCorte(materia, col.nombre); as c) {
                          @if (c.idCalificacion !== null && c.nota !== null) {
                            <div class="d-inline-flex align-items-center gap-1">
                              <span
                                class="fs-6 fw-bold"
                                [ngClass]="c.nota >= 3.0 ? 'text-success' : 'text-danger'"
                              >
                                {{ c.nota | number:'1.1-2' }}
                              </span>
                              @if (c.observaciones) {
                                <i
                                  class="bi bi-chat-text-fill text-primary"
                                  [title]="c.observaciones"
                                  style="font-size: 0.8rem; cursor: help;"
                                ></i>
                              }
                            </div>
                          } @else {
                            <span class="badge bg-secondary-subtle text-secondary border font-monospace" style="font-size: 0.72rem;">
                              Pendiente
                            </span>
                          }
                        } @else {
                          <span class="text-muted small">&mdash;</span>
                        }
                      </td>
                    }

                    <!-- Promedio Acumulado / Definitiva -->
                    <td class="text-center">
                      <div class="d-flex flex-column align-items-center">
                        <span
                          class="fs-5 fw-bold"
                          [ngClass]="materia.promedioPonderadoAcumulado >= 3.0 ? 'text-success' : 'text-danger'"
                        >
                          {{ materia.promedioPonderadoAcumulado | number:'1.2-2' }}
                        </span>
                        <small class="text-muted" style="font-size: 0.7rem;">
                          {{ materia.porcentajeEvaluado }}% evaluado
                        </small>
                      </div>
                    </td>

                    <!-- Estado Aprobado / Reprobado -->
                    <td class="text-center">
                      <span
                        class="badge px-2.5 py-1.5"
                        [ngClass]="materia.promedioPonderadoAcumulado >= 3.0 ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'"
                      >
                        {{ materia.promedioPonderadoAcumulado >= 3.0 ? 'Aprobado' : 'Reprobado' }}
                      </span>
                    </td>

                    <!-- Botón para ver comentarios/observaciones -->
                    <td class="text-end pe-3">
                      @if (hasObservaciones(materia)) {
                        <button
                          type="button"
                          class="btn btn-sm btn-light border rounded-circle p-1"
                          style="width: 30px; height: 30px;"
                          (click)="toggleMateriaExpand(materia.idCarga)"
                          [title]="isExpanded(materia.idCarga) ? 'Ocultar observaciones' : 'Ver comentarios del profesor'"
                        >
                          <i class="bi" [ngClass]="isExpanded(materia.idCarga) ? 'bi-chevron-up text-primary' : 'bi-chat-left-text text-secondary'"></i>
                        </button>
                      }
                    </td>
                  </tr>

                  <!-- Fila desplegable con observaciones si el alumno hace clic -->
                  @if (isExpanded(materia.idCarga)) {
                    <tr class="table-light">
                      <td [attr.colspan]="4 + columnasCortes().length" class="p-3">
                        <div class="p-2 bg-white rounded-3 border shadow-xs">
                          <small class="text-uppercase fw-semibold text-primary d-block mb-2" style="font-size: 0.72rem; letter-spacing: 0.05em;">
                            <i class="bi bi-chat-left-quote-fill me-1"></i> Comentarios y observaciones del docente ({{ materia.nombreAsignatura }}):
                          </small>
                          <div class="row g-2">
                            @for (c of materia.cortes; track c.idCorte) {
                              @if (c.observaciones) {
                                <div class="col-12 col-md-6 col-lg-4">
                                  <div class="border rounded-2 p-2 bg-light bg-opacity-50">
                                    <div class="d-flex align-items-center justify-content-between mb-1">
                                      <strong class="text-dark small">{{ c.nombreCorte }} ({{ c.porcentaje }}%)</strong>
                                      <span
                                        class="badge"
                                        [ngClass]="c.nota && c.nota >= 3.0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'"
                                      >
                                        {{ c.nota | number:'1.1-2' }}
                                      </span>
                                    </div>
                                    <small class="text-muted d-block fst-italic">"{{ c.observaciones }}"</small>
                                  </div>
                                </div>
                              }
                            }
                          </div>
                        </div>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
        </div>
      } @else {
        <div class="card text-center p-5 shadow-sm border-0">
          <i class="bi bi-award fs-1 text-muted mb-3"></i>
          <h5 class="fw-bold text-dark">No hay calificaciones registradas en la base de datos</h5>
          <p class="text-muted small mb-0">
            Aún no tienes asignaturas con notas registradas para este periodo escolar.
          </p>
        </div>
      }
    </div>
  `
})
export class ConsolidadoNotasComponent implements OnInit {
  private estudianteService = inject(EstudianteService);
  private notificationService = inject(NotificationService);

  public currentYear: number = new Date().getFullYear();
  public selectedYear = signal<number>(new Date().getFullYear());
  public inputHistoricoAnio = signal<number>(new Date().getFullYear());
  public historicoErrorMsg = signal<string>('');

  public reporte = signal<EstudianteNotasResponse | null>(null);

  // Set de materias expandidas para ver observaciones
  public expandedMaterias = signal<Set<number>>(new Set());

  // Promedio ponderado general de todas las materias
  public promedioGeneral = computed(() => {
    const rep = this.reporte();
    if (!rep || !rep.materias || rep.materias.length === 0) return 0;
    const total = rep.materias.reduce((sum, m) => sum + (m.promedioPonderadoAcumulado || 0), 0);
    return total / rep.materias.length;
  });

  // Columnas dinámicas de cortes calculadas a partir de las materias
  public columnasCortes = computed(() => {
    const materias = this.reporte()?.materias || [];
    if (materias.length === 0) return [];

    const map = new Map<string, { nombre: string; porcentaje?: number }>();
    materias.forEach((m) => {
      m.cortes.forEach((c) => {
        if (!map.has(c.nombreCorte)) {
          map.set(c.nombreCorte, { nombre: c.nombreCorte, porcentaje: c.porcentaje });
        }
      });
    });
    return Array.from(map.values());
  });

  ngOnInit(): void {
    this.cargarNotas();
  }

  public getCorte(materia: EstudianteMateriaReporte, nombreCorte: string): CorteNotaReporte | undefined {
    return materia.cortes.find((c) => c.nombreCorte === nombreCorte);
  }

  public hasObservaciones(materia: EstudianteMateriaReporte): boolean {
    return materia.cortes.some((c) => !!c.observaciones && c.observaciones.trim().length > 0);
  }

  public toggleMateriaExpand(idCarga: number): void {
    const set = new Set(this.expandedMaterias());
    if (set.has(idCarga)) {
      set.delete(idCarga);
    } else {
      set.add(idCarga);
    }
    this.expandedMaterias.set(set);
  }

  public isExpanded(idCarga: number): boolean {
    return this.expandedMaterias().has(idCarga);
  }

  public onHistoricoInputChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.inputHistoricoAnio.set(val);

    if (val <= 0) {
      this.historicoErrorMsg.set('El año no puede ser negativo o cero.');
    } else if (val > this.currentYear) {
      this.historicoErrorMsg.set(`El año no puede ser mayor al año actual (${this.currentYear}).`);
    } else {
      this.historicoErrorMsg.set('');
    }
  }

  public isHistoricoInvalid(): boolean {
    const y = this.inputHistoricoAnio();
    if (y === null || y === undefined || isNaN(y)) return true;
    if (y <= 0) return true;
    if (y > this.currentYear) return true;
    return false;
  }

  public consultarHistorico(): void {
    const val = this.inputHistoricoAnio();
    if (this.isHistoricoInvalid()) {
      if (val <= 0) {
        this.notificationService.error('El año no puede ser negativo o cero.');
      } else if (val > this.currentYear) {
        this.notificationService.error(`El año no puede ser mayor al actual (${this.currentYear}).`);
      } else {
        this.notificationService.error('Ingresa un año válido.');
      }
      return;
    }

    this.selectedYear.set(val);
    this.cargarNotas();
  }

  public resetToCurrentYear(): void {
    this.selectedYear.set(this.currentYear);
    this.inputHistoricoAnio.set(this.currentYear - 1);
    this.historicoErrorMsg.set('');
    this.cargarNotas();
  }

  public cargarNotas(): void {
    if (this.selectedYear() === this.currentYear) {
      this.estudianteService.getMisNotas().subscribe({
        next: (data) => {
          this.reporte.set(data || null);
        },
        error: () => {
          this.reporte.set(null);
        }
      });
    } else {
      this.estudianteService.getHistorialMisNotas(this.selectedYear()).subscribe({
        next: (data) => {
          this.reporte.set(data || null);
        },
        error: () => {
          this.reporte.set(null);
        }
      });
    }
  }
}
