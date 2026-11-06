import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
  AsignaturaResponse,
  CargaAcademicaResponse,
  CorteConfigItem,
  CorteResponse,
  CursoResponse,
  DocenteResponse
} from '../../../core/models/academic.models';

@Component({
  selector: 'app-cargas-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 class="fw-bold text-dark mb-1">Cargas Académicas y Cortes Evaluativos</h4>
          <p class="text-muted small mb-0">
            Vinculación de Curso + Asignatura + Docente y configuración de porcentajes de evaluación
          </p>
        </div>
        <button
          class="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
          (click)="openCreateModal()"
          [disabled]="selectedYear() < currentYear"
          [title]="selectedYear() < currentYear ? 'Solo se pueden crear cargas en el año actual' : 'Nueva Carga Académica'"
        >
          <i class="bi bi-plus-circle"></i>
          <span>Nueva Carga Académica</span>
        </button>
      </div>

      <!-- Barra de Estado y Consulta Histórica -->
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

      <!-- Banner Informativo de Histórico -->


      <!-- Filters & Search -->
      <div class="card mb-4 p-3 shadow-sm border-0">
        <div class="row g-3 align-items-center">
          <div class="col-12 col-md-6 col-lg-4">
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0 text-muted">
                <i class="bi bi-search"></i>
              </span>
              <input
                type="text"
                class="form-control border-start-0 ps-0"
                placeholder="Buscar por curso, materia o profesor..."
                [value]="searchTerm()"
                (input)="onSearchInput($event)"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 col-lg-4">
            <select class="form-select" [value]="selectedCursoFilter()" (change)="onCursoFilterChange($event)">
              <option value="">Todos los Cursos</option>
              @for (c of cursos(); track c.idCurso) {
                <option [value]="c.idCurso">{{ c.nombreCompleto }}</option>
              }
            </select>
          </div>

        </div>
      </div>

      <!-- Main Cargas Table -->
      <div class="card overflow-hidden shadow-sm border-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Curso / Salón</th>
                <th>Asignatura</th>
                <th>Docente Asignado</th>
                <th class="text-center">Cortes Evaluativos</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (carga of filteredCargas(); track carga.idCarga) {
                <tr>
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <div class="bg-primary bg-opacity-10 text-primary p-2 rounded-2">
                        <i class="bi bi-building"></i>
                      </div>
                      <div>
                        <strong class="text-dark">{{ carga.curso }}</strong>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-light text-dark border px-2 py-1">
                      <i class="bi bi-book me-1 text-primary"></i>
                      {{ carga.asignatura }}
                    </span>
                  </td>
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <i class="bi bi-person-video3 text-muted"></i>
                      <span>{{ carga.docente }}</span>
                    </div>
                  </td>
                  <td class="text-center">
                    @if (selectedYear() === currentYear) {
                      <button
                        class="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1.5"
                        (click)="openCortesModal(carga)"
                      >
                        <i class="bi bi-sliders"></i>
                        <span>Configurar Cortes</span>
                      </button>
                    } @else {
                      <span class="badge bg-light text-muted border py-1.5 px-2">
                        <i class="bi bi-lock-fill me-1"></i>Histórico
                      </span>
                    }
                  </td>
                  <td class="text-end">
                    <button
                      class="btn btn-sm btn-outline-danger"
                      (click)="confirmDeleteCarga(carga)"
                      title="Eliminar Carga"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="text-center py-5">
                    <div class="text-muted">
                      <i class="bi bi-journal-x fs-1 d-block mb-2"></i>
                      <h6 class="fw-semibold text-dark">No hay cargas académicas registradas en este periodo</h6>
                      <p class="small mb-3">No se encontraron cargas académicas para el año lectivo {{ selectedYear() }}.</p>
                      @if (selectedYear() === currentYear) {
                        <button class="btn btn-sm btn-primary" (click)="openCreateModal()">
                          <i class="bi bi-plus-circle me-1"></i> Asignar Primera Carga
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL: CREAR CARGA ACADÉMICA -->
    @if (showCreateModal()) {
      <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(15, 23, 42, 0.65);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg">
            <div class="modal-header bg-primary text-white border-bottom-0">
              <h5 class="modal-title fw-bold d-flex align-items-center gap-2">
                <i class="bi bi-plus-circle"></i>
                <span>Nueva Carga Académica</span>
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="closeCreateModal()"></button>
            </div>
            <form [formGroup]="cargaForm" (ngSubmit)="saveCarga()">
              <div class="modal-body p-4">
                <div class="mb-3">
                  <label class="form-label fw-semibold small text-dark">
                    Curso / Salón <span class="text-danger">*</span>
                  </label>
                  <select
                    class="form-select"
                    formControlName="id_curso"
                    [class.is-invalid]="cargaForm.get('id_curso')?.invalid && cargaForm.get('id_curso')?.touched"
                  >
                    <option [ngValue]="null" disabled>Selecciona el curso...</option>
                    @for (curso of cursos(); track curso.idCurso) {
                      <option [ngValue]="curso.idCurso">{{ curso.nombreCompleto }}</option>
                    }
                  </select>
                  @if (cargaForm.get('id_curso')?.invalid && cargaForm.get('id_curso')?.touched) {
                    <div class="invalid-feedback">Debes seleccionar un curso</div>
                  }
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold small text-dark">
                    Asignatura <span class="text-danger">*</span>
                  </label>
                  <select
                    class="form-select"
                    formControlName="id_asignatura"
                    [class.is-invalid]="cargaForm.get('id_asignatura')?.invalid && cargaForm.get('id_asignatura')?.touched"
                  >
                    <option [ngValue]="null" disabled>Selecciona la asignatura...</option>
                    @for (asig of asignaturas(); track asig.idAsignatura) {
                      <option [ngValue]="asig.idAsignatura">{{ asig.nombre }}</option>
                    }
                  </select>
                  @if (cargaForm.get('id_asignatura')?.invalid && cargaForm.get('id_asignatura')?.touched) {
                    <div class="invalid-feedback">Debes seleccionar una asignatura</div>
                  }
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold small text-dark">
                    Docente Titular <span class="text-danger">*</span>
                  </label>
                  <select
                    class="form-select"
                    formControlName="id_docente"
                    [class.is-invalid]="cargaForm.get('id_docente')?.invalid && cargaForm.get('id_docente')?.touched"
                  >
                    <option [ngValue]="null" disabled>Selecciona el docente...</option>
                    @for (doc of docentes(); track doc.idDocente) {
                      <option [ngValue]="doc.idDocente">{{ doc.nombres }} {{ doc.apellidos }} (Doc: {{ doc.numeroDocumento }})</option>
                    }
                  </select>
                  @if (cargaForm.get('id_docente')?.invalid && cargaForm.get('id_docente')?.touched) {
                    <div class="invalid-feedback">Debes seleccionar un docente</div>
                  }
                </div>

                @if (cursos().length === 0 || asignaturas().length === 0 || docentes().length === 0) {
                  <div class="alert alert-warning small mb-0 d-flex gap-2 align-items-center">
                    <i class="bi bi-exclamation-triangle-fill fs-5"></i>
                    <div>
                      Asegúrate de tener al menos un curso, una asignatura y un docente creados en el sistema antes de asignar cargas.
                    </div>
                  </div>
                }
              </div>
              <div class="modal-footer bg-light border-top-0 px-4 py-3">
                <button type="button" class="btn btn-secondary" (click)="closeCreateModal()">Cancelar</button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  [disabled]="cargaForm.invalid || isSubmitting()"
                >
                  @if (isSubmitting()) {
                    <span class="spinner-border spinner-border-sm me-1" role="status"></span>
                  }
                  Guardar Carga
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }

    <!-- MODAL: CONFIGURAR CORTES EVALUATIVOS (DEBE SUMAR 100%) -->
    @if (showCortesModal() && selectedCargaForCortes()) {
      <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(15, 23, 42, 0.65);">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg">
            <div class="modal-header bg-dark text-white border-bottom-0">
              <div>
                <h5 class="modal-title fw-bold d-flex align-items-center gap-2">
                  <i class="bi bi-sliders text-primary"></i>
                  <span>Configuración de Cortes Evaluativos</span>
                </h5>
                <small class="text-secondary">
                  {{ selectedCargaForCortes()?.curso }} &bull; {{ selectedCargaForCortes()?.asignatura }} ({{ selectedCargaForCortes()?.docente }})
                </small>
              </div>
              <button type="button" class="btn-close btn-close-white" (click)="closeCortesModal()"></button>
            </div>
            <div class="modal-body p-4">
              <!-- Preset shortcuts -->
              <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 pb-2 border-bottom">
                <span class="small fw-semibold text-muted">Plantillas rápidas:</span>
                <div class="btn-group btn-group-sm">
                  <button type="button" class="btn btn-outline-secondary" (click)="applyPreset([30, 30, 40])">
                    3 Cortes (30% - 30% - 40%)
                  </button>
                  <button type="button" class="btn btn-outline-secondary" (click)="applyPreset([25, 25, 25, 25])">
                    4 Cortes (25% cada uno)
                  </button>
                  <button type="button" class="btn btn-outline-secondary" (click)="applyPreset([50, 50])">
                    2 Cortes (50% - 50%)
                  </button>
                </div>
              </div>

              <!-- Sum indicator bar -->
              <div class="card mb-4 p-3 border-0" [ngClass]="cortesSum() === 100 ? 'bg-success bg-opacity-10' : 'bg-warning bg-opacity-10'">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="fw-semibold small" [ngClass]="cortesSum() === 100 ? 'text-success' : 'text-warning-emphasis'">
                    <i class="bi me-1" [ngClass]="cortesSum() === 100 ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'"></i>
                    {{ cortesSum() === 100 ? 'La sumatoria cumple la regla del 100% de la API' : 'La sumatoria de porcentajes DEBE sumar exactamente 100%' }}
                  </span>
                  <span class="fs-5 fw-bold" [ngClass]="cortesSum() === 100 ? 'text-success' : 'text-danger'">
                    {{ cortesSum() }}% / 100%
                  </span>
                </div>
                <div class="progress" style="height: 8px;">
                  <div
                    class="progress-bar transition-all"
                    [ngClass]="cortesSum() === 100 ? 'bg-success' : (cortesSum() > 100 ? 'bg-danger' : 'bg-warning')"
                    [style.width.%]="cortesSum() > 100 ? 100 : cortesSum()"
                  ></div>
                </div>
              </div>

              <!-- Dynamic Cortes Form -->
              <form [formGroup]="cortesForm">
                <div formArrayName="cortes">
                  @for (corteCtrl of cortesArray.controls; track $index) {
                    <div [formGroupName]="$index" class="card p-3 mb-3 bg-light border-0">
                      <div class="row g-2 align-items-center">
                        <div class="col-12 col-md-5">
                          <label class="form-label small text-muted mb-1">Nombre del Corte <span class="text-danger">*</span></label>
                          <input
                            type="text"
                            class="form-control form-control-sm"
                            placeholder="Ej: 1er Periodo"
                            formControlName="nombre"
                          />
                        </div>
                        <div class="col-6 col-md-2">
                          <label class="form-label small text-muted mb-1">Porcentaje <span class="text-danger">*</span></label>
                          <div class="input-group input-group-sm">
                            <input
                              type="number"
                              min="1"
                              max="100"
                              step="0.5"
                              class="form-control"
                              placeholder="30"
                              formControlName="porcentaje"
                            />
                            <span class="input-group-text">%</span>
                          </div>
                        </div>
                        <div class="col-6 col-md-2">
                          <label class="form-label small text-muted mb-1">Fecha Inicio <span class="text-muted small fw-normal">(Opcional)</span></label>
                          <input
                            type="date"
                            class="form-control form-control-sm"
                            formControlName="fechaInicioCalificacion"
                          />
                        </div>
                        <div class="col-10 col-md-2">
                          <label class="form-label small text-muted mb-1">Fecha Fin <span class="text-muted small fw-normal">(Opcional)</span></label>
                          <input
                            type="date"
                            class="form-control form-control-sm"
                            formControlName="fechaFinCalificacion"
                          />
                        </div>
                        <div class="col-2 col-md-1 text-end pt-md-4">
                          <button
                            type="button"
                            class="btn btn-sm btn-outline-danger border-0 p-1"
                            (click)="removeCorteRow($index)"
                            [disabled]="cortesArray.length <= 1"
                            title="Eliminar corte"
                          >
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>

                      @if (corteCtrl.get('fechaInicioCalificacion')?.value && corteCtrl.get('fechaFinCalificacion')?.value && corteCtrl.get('fechaFinCalificacion')?.value < corteCtrl.get('fechaInicioCalificacion')?.value) {
                        <div class="text-danger small mt-2">
                          <i class="bi bi-exclamation-triangle-fill me-1"></i> La fecha de fin no puede ser anterior a la fecha de inicio.
                        </div>
                      }
                    </div>
                  }
                </div>

                <div class="mt-2">
                  <button type="button" class="btn btn-sm btn-outline-primary" (click)="addCorteRow()">
                    <i class="bi bi-plus-lg me-1"></i> Agregar Otro Corte
                  </button>
                </div>
              </form>
            </div>
            <div class="modal-footer bg-light border-top-0 px-4 py-3">
              <button type="button" class="btn btn-secondary" (click)="closeCortesModal()">Cancelar</button>
              <button
                type="button"
                class="btn btn-primary"
                [disabled]="cortesSum() !== 100 || cortesForm.invalid || isSubmitting()"
                (click)="saveCortesConfig()"
              >
                @if (isSubmitting()) {
                  <span class="spinner-border spinner-border-sm me-1" role="status"></span>
                }
                Guardar Configuración (100%)
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Modal Confirmar Eliminación (Aviso en Pantalla) -->
    @if (isDeleteModalOpen() && cargaToDelete(); as carga) {
      <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(15, 23, 42, 0.65);">
        <div class="modal-dialog modal-dialog-centered" style="max-width: 440px;">
          <div class="modal-content shadow-lg border-0 rounded-4 overflow-hidden">
            <div class="modal-body p-4 text-center">
              <div
                class="bg-danger bg-opacity-10 text-danger rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style="width: 58px; height: 58px;"
              >
                <i class="bi bi-trash3 fs-3"></i>
              </div>
              <h5 class="fw-bold text-dark mb-2">¿Eliminar esta carga académica?</h5>
              <p class="text-muted small mb-0">
                Estás a punto de eliminar la carga de <strong>{{ carga.asignatura }}</strong> asignada a <strong>{{ carga.docente }}</strong> en el salón <strong>{{ carga.curso }}</strong>. Esta acción no se puede deshacer si ya existen calificaciones registradas.
              </p>
            </div>
            <div class="modal-footer bg-light border-0 px-4 py-3 d-flex gap-2 justify-content-center">
              <button
                type="button"
                class="btn btn-outline-secondary px-4 fw-semibold"
                (click)="cancelarEliminacion()"
                [disabled]="isDeleting()"
              >
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-danger px-4 fw-semibold d-flex align-items-center gap-2"
                (click)="confirmarEliminacion()"
                [disabled]="isDeleting()"
              >
                @if (isDeleting()) {
                  <span class="spinner-border spinner-border-sm" role="status"></span>
                  <span>Eliminando...</span>
                } @else {
                  <i class="bi bi-trash"></i>
                  <span>Sí, Eliminar</span>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class CargasListComponent implements OnInit {
  private adminService = inject(AdminService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  public currentYear: number = new Date().getFullYear();
  public selectedYear = signal<number>(new Date().getFullYear());
  public inputHistoricoAnio = signal<number>(new Date().getFullYear());
  public historicoErrorMsg = signal<string>('');

  public cargas = signal<CargaAcademicaResponse[]>([]);
  public cursos = signal<CursoResponse[]>([]);
  public asignaturas = signal<AsignaturaResponse[]>([]);
  public docentes = signal<DocenteResponse[]>([]);

  public searchTerm = signal<string>('');
  public selectedCursoFilter = signal<string>('');

  public showCreateModal = signal<boolean>(false);
  public showCortesModal = signal<boolean>(false);
  public isDeleteModalOpen = signal<boolean>(false);
  public selectedCargaForCortes = signal<CargaAcademicaResponse | null>(null);
  public cargaToDelete = signal<CargaAcademicaResponse | null>(null);
  public isSubmitting = signal<boolean>(false);
  public isDeleting = signal<boolean>(false);

  // Forms
  public cargaForm: FormGroup = this.fb.group({
    id_curso: [null, [Validators.required]],
    id_asignatura: [null, [Validators.required]],
    id_docente: [null, [Validators.required]]
  });

  public cortesForm: FormGroup = this.fb.group({
    cortes: this.fb.array([])
  });

  get cortesArray(): FormArray {
    return this.cortesForm.get('cortes') as FormArray;
  }

  // Live sum of percentages
  public cortesSum = signal<number>(0);

  public filteredCargas = computed(() => {
    let list = this.cargas();
    const query = this.searchTerm().toLowerCase().trim();
    const cursoFilter = this.selectedCursoFilter();

    if (cursoFilter) {
      list = list.filter((c) => c.idCurso === Number(cursoFilter));
    }

    if (query) {
      list = list.filter(
        (c) =>
          c.curso.toLowerCase().includes(query) ||
          c.asignatura.toLowerCase().includes(query) ||
          c.docente.toLowerCase().includes(query)
      );
    }
    return list;
  });

  ngOnInit(): void {
    this.loadInitialData();

    // Listen to changes in cortesArray to calculate live sum
    this.cortesForm.valueChanges.subscribe(() => {
      this.recalculateCortesSum();
    });
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
    const val = Number(this.inputHistoricoAnio());
    if (this.isHistoricoInvalid()) {
      if (val <= 0) {
        this.notificationService.error('El año no puede ser negativo o cero.');
      } else if (val > this.currentYear) {
        this.notificationService.error(`El año no puede ser mayor al año actual (${this.currentYear}).`);
      } else {
        this.notificationService.error('Ingresa un año válido.');
      }
      return;
    }

    this.selectedYear.set(val);
    this.selectedCursoFilter.set('');
    this.loadInitialData();
    if (val === this.currentYear) {
      this.notificationService.info(`Mostrando cargas académicas del año lectivo actual (${this.currentYear}).`);
    } else {
      this.notificationService.info(`Consultando historial de cargas académicas del año ${val}.`);
    }
  }

  public resetToCurrentYear(): void {
    this.selectedYear.set(this.currentYear);
    this.inputHistoricoAnio.set(this.currentYear);
    this.historicoErrorMsg.set('');
    this.selectedCursoFilter.set('');
    this.loadInitialData();
  }

  public loadInitialData(): void {
    if (this.selectedYear() === this.currentYear) {
      this.adminService.getCargasAcademicas().subscribe({
        next: (data) => this.cargas.set(data || []),
        error: () => this.cargas.set([])
      });

      this.adminService.getCursos().subscribe({
        next: (data) => this.cursos.set((data || []).filter(c => c.anioLectivo === this.currentYear || !c.anioLectivo)),
        error: () => { }
      });
    } else {
      this.adminService.getHistorialCargas(this.selectedYear()).subscribe({
        next: (data) => this.cargas.set(data || []),
        error: () => this.cargas.set([])
      });

      this.adminService.getHistorialCursos(this.selectedYear()).subscribe({
        next: (data) => this.cursos.set(data || []),
        error: () => { }
      });
    }

    this.adminService.getAsignaturas().subscribe({
      next: (data) => this.asignaturas.set(data || []),
      error: () => { }
    });

    this.adminService.getDocentes().subscribe({
      next: (data) => this.docentes.set(data || []),
      error: () => { }
    });
  }

  public onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  public onCursoFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedCursoFilter.set(value);
  }

  // ==================== CREAR CARGA ====================
  public openCreateModal(): void {
    this.cargaForm.reset({
      id_curso: null,
      id_asignatura: null,
      id_docente: null
    });
    this.showCreateModal.set(true);
  }

  public closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  public saveCarga(): void {
    if (this.cargaForm.invalid) {
      this.cargaForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const req = {
      id_curso: Number(this.cargaForm.value.id_curso),
      id_asignatura: Number(this.cargaForm.value.id_asignatura),
      id_docente: Number(this.cargaForm.value.id_docente)
    };

    this.adminService.createCargaAcademica(req).subscribe({
      next: (created) => {
        this.notificationService.success(`Carga asignada correctamente para ${created.asignatura}`);
        this.loadInitialData();
        this.closeCreateModal();
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.notificationService.error(err.error?.mensaje || 'Error al crear la carga académica');
      }
    });
  }

  public confirmDeleteCarga(carga: CargaAcademicaResponse): void {
    this.cargaToDelete.set(carga);
    this.isDeleteModalOpen.set(true);
  }

  public cancelarEliminacion(): void {
    if (this.isDeleting()) return;
    this.isDeleteModalOpen.set(false);
    this.cargaToDelete.set(null);
  }

  public confirmarEliminacion(): void {
    const carga = this.cargaToDelete();
    if (!carga) return;

    this.isDeleting.set(true);
    this.adminService.deleteCargaAcademica(carga.idCarga).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.isDeleteModalOpen.set(false);
        this.cargaToDelete.set(null);
        this.notificationService.success(`Carga académica de ${carga.asignatura} eliminada correctamente.`);
        this.loadInitialData();
      },
      error: () => {
        this.isDeleting.set(false);
        this.isDeleteModalOpen.set(false);
      }
    });
  }

  // ==================== CORTES EVALUATIVOS ====================
  public openCortesModal(carga: CargaAcademicaResponse): void {
    if (this.selectedYear() < this.currentYear) {
      this.notificationService.warning('No se pueden configurar cortes evaluativos para cargas de periodos anteriores.');
      return;
    }
    this.selectedCargaForCortes.set(carga);
    this.cortesArray.clear();

    // Load existing cortes from backend
    this.adminService.getCortesCarga(carga.idCarga).subscribe({
      next: (existing) => {
        if (existing && existing.length > 0) {
          existing.forEach((c) => {
            const start = c.fechaInicioCalificacion || c.fecha_inicio_calificacion || '';
            const end = c.fechaFinCalificacion || c.fecha_fin_calificacion || '';
            this.cortesArray.push(
              this.fb.group({
                nombre: [c.nombre, Validators.required],
                porcentaje: [c.porcentaje, [Validators.required, Validators.min(0.01), Validators.max(100)]],
                fechaInicioCalificacion: [start],
                fechaFinCalificacion: [end]
              })
            );
          });
        } else {
          // Default to standard 3 cuts (30, 30, 40) with default date windows
          this.applyPreset([30, 30, 40]);
        }
        this.recalculateCortesSum();
        this.showCortesModal.set(true);
      },
      error: () => {
        this.applyPreset([30, 30, 40]);
        this.recalculateCortesSum();
        this.showCortesModal.set(true);
      }
    });
  }

  public closeCortesModal(): void {
    this.showCortesModal.set(false);
    this.selectedCargaForCortes.set(null);
  }

  public addCorteRow(nombre: string = '', porcentaje: number = 20, fechaInicio: string = '', fechaFin: string = ''): void {
    this.cortesArray.push(
      this.fb.group({
        nombre: [nombre, Validators.required],
        porcentaje: [porcentaje, [Validators.required, Validators.min(0.01), Validators.max(100)]],
        fechaInicioCalificacion: [fechaInicio || ''],
        fechaFinCalificacion: [fechaFin || '']
      })
    );
    this.recalculateCortesSum();
  }

  public removeCorteRow(index: number): void {
    if (this.cortesArray.length > 1) {
      this.cortesArray.removeAt(index);
      this.recalculateCortesSum();
    }
  }

  public applyPreset(percents: number[]): void {
    this.cortesArray.clear();
    const year = new Date().getFullYear();

    if (percents.length === 3) {
      // 3 Cortes (30%, 30%, 40%)
      const defs = [
        { nombre: '1er Periodo', pct: percents[0], start: `${year}-02-01`, end: `${year}-04-15` },
        { nombre: '2do Periodo', pct: percents[1], start: `${year}-04-16`, end: `${year}-07-31` },
        { nombre: '3er Periodo', pct: percents[2], start: `${year}-08-01`, end: `${year}-11-30` }
      ];
      defs.forEach((d) => this.addCorteRow(d.nombre, d.pct, d.start, d.end));
    } else if (percents.length === 4) {
      // 4 Cortes (25% cada uno)
      const defs = [
        { nombre: '1er Periodo', pct: 25, start: `${year}-02-01`, end: `${year}-04-10` },
        { nombre: '2do Periodo', pct: 25, start: `${year}-04-11`, end: `${year}-06-20` },
        { nombre: '3er Periodo', pct: 25, start: `${year}-07-15`, end: `${year}-09-25` },
        { nombre: '4to Periodo', pct: 25, start: `${year}-09-26`, end: `${year}-11-30` }
      ];
      defs.forEach((d) => this.addCorteRow(d.nombre, d.pct, d.start, d.end));
    } else if (percents.length === 2) {
      // 2 Semestres (50% cada uno)
      const defs = [
        { nombre: '1er Semestre', pct: 50, start: `${year}-02-01`, end: `${year}-06-30` },
        { nombre: '2do Semestre', pct: 50, start: `${year}-07-15`, end: `${year}-11-30` }
      ];
      defs.forEach((d) => this.addCorteRow(d.nombre, d.pct, d.start, d.end));
    } else {
      percents.forEach((pct, idx) => {
        this.addCorteRow(`Corte ${idx + 1}`, pct, `${year}-02-01`, `${year}-11-30`);
      });
    }

    this.recalculateCortesSum();
  }

  public recalculateCortesSum(): void {
    const raw = this.cortesArray.value as Array<{ nombre: string; porcentaje: number }>;
    const total = raw.reduce((sum, item) => sum + (Number(item.porcentaje) || 0), 0);
    this.cortesSum.set(Math.round(total * 10) / 10);
  }

  public saveCortesConfig(): void {
    if (this.cortesSum() !== 100) {
      this.notificationService.error('La suma de los cortes debe ser exactamente 100%');
      return;
    }
    if (this.cortesForm.invalid) {
      this.cortesForm.markAllAsTouched();
      this.notificationService.error('Por favor completa el nombre y porcentaje de cada corte.');
      return;
    }

    // Validación cronológica: solo aplica a cortes que tengan fechas ingresadas
    for (const c of this.cortesArray.value) {
      const hasStart = !!c.fechaInicioCalificacion;
      const hasEnd = !!c.fechaFinCalificacion;

      if (hasStart && hasEnd) {
        if (c.fechaFinCalificacion < c.fechaInicioCalificacion) {
          this.notificationService.error(`En "${c.nombre}", la fecha fin no puede ser anterior a la fecha de inicio.`);
          return;
        }
      } else if (hasStart || hasEnd) {
        this.notificationService.error(`En "${c.nombre}", debes completar tanto la fecha de inicio como la de fin, o dejar ambas en blanco.`);
        return;
      }
    }

    const carga = this.selectedCargaForCortes();
    if (!carga) return;

    this.isSubmitting.set(true);
    const body: CorteConfigItem[] = this.cortesArray.value.map((c: any) => ({
      nombre: c.nombre.trim(),
      porcentaje: Number(c.porcentaje),
      fechaInicioCalificacion: c.fechaInicioCalificacion ? c.fechaInicioCalificacion : null,
      fechaFinCalificacion: c.fechaFinCalificacion ? c.fechaFinCalificacion : null,
      fecha_inicio_calificacion: c.fechaInicioCalificacion ? c.fechaInicioCalificacion : null,
      fecha_fin_calificacion: c.fechaFinCalificacion ? c.fechaFinCalificacion : null
    }));

    this.adminService.configurarCortesCarga(carga.idCarga, body).subscribe({
      next: (res) => {
        this.notificationService.success(`Se configuraron ${res.length} cortes evaluativos exitosamente`);
        this.closeCortesModal();
        this.isSubmitting.set(false);
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }
}

