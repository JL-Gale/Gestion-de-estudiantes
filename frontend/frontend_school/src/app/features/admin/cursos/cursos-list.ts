import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CursoResponse } from '../../../core/models/academic.models';

@Component({
  selector: 'app-cursos-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 class="fw-bold text-dark mb-1">Gestión de Cursos y Salones</h4>
          <p class="text-muted small mb-0">Configuración y consulta de salones académicos por grado y grupo</p>
        </div>
        <button class="btn btn-primary d-flex align-items-center gap-2 shadow-sm" (click)="openCreateModal()">
          <i class="bi bi-building-add"></i>
          <span>Nuevo Curso</span>
        </button>
      </div>

      <!-- Barra de Estado y Consulta Histórica (SIN FORMULARIO HTML PARA EVITAR REFRESH) -->
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




      <!-- Filter Card -->
      <div class="card mb-4 p-3 shadow-sm border-0">
        <div class="row g-3 align-items-center">
          <div class="col-12 col-md-8 col-lg-6">
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0 text-muted">
                <i class="bi bi-search"></i>
              </span>
              <input
                type="text"
                class="form-control border-start-0 ps-0"
                placeholder="Filtrar por grado o grupo (ej: 11, A)..."
                [value]="searchTerm()"
                (input)="onSearchInput($event)"
              />
            </div>
          </div>
          <div class="col-12 col-md-4 col-lg-6 text-md-end text-muted small">
            Total salones: <strong>{{ filteredCursos().length }}</strong>
          </div>
        </div>
      </div>

      <!-- CAJAS DE CURSOS -->
      <div class="row g-4">
        @for (curso of filteredCursos(); track curso.idCurso) {
          <div class="col-12 col-md-6 col-lg-4">
            <div class="card card-hoverable h-100 shadow-sm border border-light-subtle rounded-4 p-4 d-flex flex-column justify-content-between bg-white">
              <!-- Center Content: Icono + Título "11 A" -->
              <div class="d-flex align-items-center gap-3 py-3">
                <div
                  class="bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style="width: 52px; height: 52px;"
                >
                  <i class="bi bi-mortarboard-fill fs-3"></i>
                </div>
                <div class="fw-bold fs-1 text-dark lh-1">
                  {{ curso.grado }} {{ curso.grupo }}
                </div>
              </div>

              <!-- Bottom Row: Botones Editar y Eliminar con estilo suave idéntico a la imagen -->
              <div class="pt-3">
                <div class="row g-2">
                  <div class="col-6">
                    @if (curso.anioLectivo >= currentYear) {
                      <button
                        type="button"
                        class="btn btn-sm w-100 py-2 d-flex align-items-center justify-content-center gap-1.5 fw-semibold border-0 text-primary bg-primary bg-opacity-10"
                        (click)="openEditModal(curso)"
                        title="Editar Curso"
                      >
                        <i class="bi bi-pencil"></i>
                        <span>Editar</span>
                      </button>
                    } @else {
                      <button
                        type="button"
                        class="btn btn-sm w-100 py-2 d-flex align-items-center justify-content-center gap-1.5 fw-semibold border-0 text-muted bg-secondary bg-opacity-10"
                        disabled
                        title="Los cursos de años anteriores son históricos y no se pueden editar"
                      >
                        <i class="bi bi-lock-fill"></i>
                        <span>Histórico</span>
                      </button>
                    }
                  </div>
                  <div class="col-6">
                    <button
                      type="button"
                      class="btn btn-sm w-100 py-2 d-flex align-items-center justify-content-center gap-1.5 fw-semibold border-0 text-danger bg-danger bg-opacity-10"
                      (click)="eliminar(curso)"
                      title="Eliminar Curso"
                    >
                      <i class="bi bi-trash"></i>
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        } @empty {
          <div class="col-12">
            <div class="card text-center p-5 shadow-sm border-0">
              <i class="bi bi-building-x fs-1 text-muted mb-3"></i>
              <h5 class="fw-bold text-dark">No hay salones registrados para este periodo</h5>
              <p class="text-muted small mb-3">
                No se encontraron cursos en el año lectivo {{ selectedYear() }}.
              </p>
              <div>
                <button type="button" class="btn btn-sm btn-primary" (click)="openCreateModal()">
                  <i class="bi bi-plus-lg me-1"></i> Crear Curso
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Modal Crear Curso -->
    @if (isCreateModalOpen()) {
      <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(15, 23, 42, 0.65);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content shadow-lg border-0">
            <div class="modal-header bg-primary text-white border-bottom-0">
              <h5 class="modal-title fw-bold fs-6 d-flex align-items-center gap-2">
                <i class="bi bi-building-add"></i>
                Registrar Nuevo Curso
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="isCreateModalOpen.set(false)" [disabled]="isSubmitting()"></button>
            </div>
            <form [formGroup]="createForm" (ngSubmit)="onCreateSubmit()">
              <div class="modal-body p-4">
                <div class="row g-2 mb-3">
                  <div class="col-6">
                    <label class="form-label fw-semibold small text-dark">Grado (Número) <span class="text-danger">*</span></label>
                    <input
                      type="number"
                      class="form-control"
                      formControlName="grado"
                      placeholder="Ej: 11"
                      min="1"
                      max="12"
                      [class.is-invalid]="createForm.get('grado')?.touched && createForm.get('grado')?.invalid"
                    />
                    @if (createForm.get('grado')?.touched && createForm.get('grado')?.invalid) {
                      <div class="invalid-feedback">Ingresa un grado válido (1-12).</div>
                    }
                  </div>
                  <div class="col-6">
                    <label class="form-label fw-semibold small text-dark">Grupo / Sección <span class="text-danger">*</span></label>
                    <input
                      type="text"
                      class="form-control text-uppercase"
                      formControlName="grupo"
                      placeholder="Ej: A, B o 1"
                      [class.is-invalid]="createForm.get('grupo')?.touched && createForm.get('grupo')?.invalid"
                    />
                    @if (createForm.get('grupo')?.touched && createForm.get('grupo')?.invalid) {
                      <div class="invalid-feedback">El grupo es requerido.</div>
                    }
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold small text-dark">Año Lectivo <span class="text-danger">*</span></label>
                  <input
                    type="number"
                    class="form-control"
                    formControlName="anio_lectivo"
                    placeholder="Ej: 2026"
                    min="2020"
                    max="2040"
                    [class.is-invalid]="createForm.get('anio_lectivo')?.touched && createForm.get('anio_lectivo')?.invalid"
                  />
                </div>
              </div>
              <div class="modal-footer bg-light border-top-0 px-4 py-3">
                <button type="button" class="btn btn-secondary" (click)="isCreateModalOpen.set(false)" [disabled]="isSubmitting()">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-primary d-flex align-items-center gap-2" [disabled]="createForm.invalid || isSubmitting()">
                  @if (isSubmitting()) {
                    <span class="spinner-border spinner-border-sm" role="status"></span>
                    Creando...
                  } @else {
                    <i class="bi bi-check-lg"></i>
                    Crear Curso
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }

    <!-- Modal Editar Curso -->
    @if (isEditModalOpen() && selectedCurso()) {
      <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(15, 23, 42, 0.65);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content shadow-lg border-0">
            <div class="modal-header bg-primary text-white border-bottom-0">
              <h5 class="modal-title fw-bold fs-6 d-flex align-items-center gap-2">
                <i class="bi bi-pencil-square"></i>
                Editar: Grado {{ selectedCurso()?.grado }} Grupo {{ selectedCurso()?.grupo }}
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="isEditModalOpen.set(false)" [disabled]="isSubmitting()"></button>
            </div>
            <form [formGroup]="editForm" (ngSubmit)="onEditSubmit()">
              <div class="modal-body p-4">
                <div class="row g-2 mb-3">
                  <div class="col-6">
                    <label class="form-label fw-semibold small text-dark">Grado <span class="text-danger">*</span></label>
                    <input type="number" class="form-control" formControlName="grado" />
                  </div>
                  <div class="col-6">
                    <label class="form-label fw-semibold small text-dark">Grupo <span class="text-danger">*</span></label>
                    <input type="text" class="form-control text-uppercase" formControlName="grupo" />
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold small text-dark">Año Lectivo <span class="text-danger">*</span></label>
                  <input type="number" class="form-control" formControlName="anio_lectivo" />
                </div>
              </div>
              <div class="modal-footer bg-light border-top-0 px-4 py-3">
                <button type="button" class="btn btn-secondary" (click)="isEditModalOpen.set(false)" [disabled]="isSubmitting()">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-primary d-flex align-items-center gap-2" [disabled]="editForm.invalid || isSubmitting()">
                  @if (isSubmitting()) {
                    <span class="spinner-border spinner-border-sm" role="status"></span>
                    Guardando...
                  } @else {
                    <i class="bi bi-check-lg"></i>
                    Actualizar
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }

    <!-- Modal Confirmar Eliminación (Aviso en Pantalla) -->
    @if (isDeleteModalOpen() && cursoToDelete(); as curso) {
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
              <h5 class="fw-bold text-dark mb-2">¿Eliminar este curso?</h5>
              <p class="text-muted small mb-0">
                Estás a punto de eliminar el salón <strong>{{ curso.grado }} {{ curso.grupo }}</strong>. Esta acción no se puede deshacer.
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
export class CursosListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private notificationService = inject(NotificationService);

  public currentYear: number = new Date().getFullYear();
  public selectedYear = signal<number>(new Date().getFullYear());
  // El formulario tiene por defecto el año actual
  public inputHistoricoAnio = signal<number>(new Date().getFullYear());
  public historicoErrorMsg = signal<string>('');

  public cursos = signal<CursoResponse[]>([]);
  public searchTerm = signal<string>('');
  public isCreateModalOpen = signal<boolean>(false);
  public isEditModalOpen = signal<boolean>(false);
  public isDeleteModalOpen = signal<boolean>(false);
  public isSubmitting = signal<boolean>(false);
  public isDeleting = signal<boolean>(false);
  public selectedCurso = signal<CursoResponse | null>(null);
  public cursoToDelete = signal<CursoResponse | null>(null);

  public filteredCursos = computed(() => {
    const term = this.searchTerm().toLowerCase().replace(/\s+/g, '');
    return this.cursos().filter(c => {
      const match1 = `${c.grado}${c.grupo}`.toLowerCase();
      const match2 = `${c.grupo}${c.grado}`.toLowerCase();
      const match3 = `grado${c.grado}grupo${c.grupo}`.toLowerCase();
      const match4 = c.nombreCompleto.toLowerCase().replace(/\s+/g, '');
      return (
        !term ||
        match1.includes(term) ||
        match2.includes(term) ||
        match3.includes(term) ||
        match4.includes(term) ||
        String(c.grado).includes(term) ||
        String(c.anioLectivo).includes(term)
      );
    });
  });

  public createForm: FormGroup = this.fb.group({
    grado: [11, [Validators.required, Validators.min(1), Validators.max(12)]],
    grupo: ['A', [Validators.required]],
    anio_lectivo: [new Date().getFullYear(), [Validators.required, Validators.min(2020), Validators.max(2040)]]
  });

  public editForm: FormGroup = this.fb.group({
    grado: [11, [Validators.required, Validators.min(1), Validators.max(12)]],
    grupo: ['A', [Validators.required]],
    anio_lectivo: [new Date().getFullYear(), [Validators.required, Validators.min(2020), Validators.max(2040)]]
  });

  ngOnInit(): void {
    this.cargarCursos();
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
    this.cargarCursos();
    if (val === this.currentYear) {
      this.notificationService.info(`Mostrando cursos del año lectivo actual (${this.currentYear}).`);
    } else {
      this.notificationService.info(`Consultando salones del periodo ${val}.`);
    }
  }

  public resetToCurrentYear(): void {
    this.selectedYear.set(this.currentYear);
    this.inputHistoricoAnio.set(this.currentYear);
    this.historicoErrorMsg.set('');
    this.cargarCursos();
  }

  public cargarCursos(): void {
    if (this.selectedYear() === this.currentYear) {
      this.adminService.getCursos().subscribe({
        next: (data) => this.cursos.set(data || []),
        error: () => this.cursos.set([])
      });
    } else {
      this.adminService.getHistorialCursos(this.selectedYear()).subscribe({
        next: (data) => this.cursos.set(data || []),
        error: () => this.cursos.set([])
      });
    }
  }

  public onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  public openCreateModal(): void {
    this.createForm.reset({ grado: 11, grupo: 'A', anio_lectivo: this.currentYear });
    this.isCreateModalOpen.set(true);
  }

  public onCreateSubmit(): void {
    if (this.createForm.invalid) return;

    this.isSubmitting.set(true);
    const body = {
      grado: Number(this.createForm.value.grado),
      grupo: String(this.createForm.value.grupo).toUpperCase().trim(),
      anio_lectivo: Number(this.createForm.value.anio_lectivo)
    };

    this.adminService.createCurso(body).subscribe({
      next: (nuevo) => {
        this.isSubmitting.set(false);
        this.notificationService.success(`Curso Grado ${nuevo.grado} Grupo ${nuevo.grupo} creado exitosamente.`);
        this.isCreateModalOpen.set(false);
        this.cargarCursos();
      },
      error: () => {
        this.isSubmitting.set(false);
        // El interceptor HTTP muestra el mensaje de error correspondiente con título "Error".
      }
    });
  }

  public openEditModal(curso: CursoResponse): void {
    if (curso.anioLectivo < this.currentYear) {
      this.notificationService.warning(`El salón "${curso.grado} ${curso.grupo}" es del año ${curso.anioLectivo} (histórico) y no se puede editar.`);
      return;
    }
    this.selectedCurso.set(curso);
    this.editForm.patchValue({
      grado: curso.grado,
      grupo: curso.grupo,
      anio_lectivo: curso.anioLectivo
    });
    this.isEditModalOpen.set(true);
  }

  public onEditSubmit(): void {
    if (this.editForm.invalid || !this.selectedCurso()) return;

    if (this.selectedCurso()!.anioLectivo < this.currentYear) {
      this.notificationService.error('No se pueden modificar cursos de años anteriores.');
      return;
    }

    this.isSubmitting.set(true);
    const id = this.selectedCurso()!.idCurso;
    const body = {
      grado: Number(this.editForm.value.grado),
      grupo: String(this.editForm.value.grupo).toUpperCase().trim(),
      anio_lectivo: Number(this.editForm.value.anio_lectivo)
    };

    this.adminService.updateCurso(id, body).subscribe({
      next: (actualizado) => {
        this.isSubmitting.set(false);
        this.notificationService.success(`Curso Grado ${actualizado.grado} Grupo ${actualizado.grupo} actualizado.`);
        this.isEditModalOpen.set(false);
        this.cargarCursos();
      },
      error: () => {
        this.isSubmitting.set(false);
        // El interceptor HTTP muestra el mensaje de error correspondiente con título "Error".
      }
    });
  }

  public eliminar(curso: CursoResponse): void {
    // Abrir aviso en pantalla (modal personalizado) en vez de ventana del navegador
    this.cursoToDelete.set(curso);
    this.isDeleteModalOpen.set(true);
  }

  public cancelarEliminacion(): void {
    if (this.isDeleting()) return;
    this.isDeleteModalOpen.set(false);
    this.cursoToDelete.set(null);
  }

  public confirmarEliminacion(): void {
    const curso = this.cursoToDelete();
    if (!curso) return;

    this.isDeleting.set(true);
    this.adminService.deleteCurso(curso.idCurso).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.isDeleteModalOpen.set(false);
        this.cursoToDelete.set(null);
        this.notificationService.success(`Curso ${curso.grado} ${curso.grupo} eliminado correctamente.`);
        this.cursos.update(list => list.filter(c => c.idCurso !== curso.idCurso));
      },
      error: () => {
        this.isDeleting.set(false);
        this.isDeleteModalOpen.set(false);
        // El interceptor global se encarga de mostrar la notificación con título "Error"
        // y la razón exacta devuelta por el backend.
      }
    });
  }
}
