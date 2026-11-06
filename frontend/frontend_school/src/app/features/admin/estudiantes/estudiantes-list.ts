import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';
import { EstudianteResponse } from '../../../core/models/academic.models';

@Component({
  selector: 'app-estudiantes-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 class="fw-bold text-dark mb-1">Gestión de Estudiantes</h4>
          <p class="text-muted small mb-0">Registro y administración de los estudiantes del colegio</p>
        </div>
        <button class="btn btn-primary d-flex align-items-center gap-2 shadow-sm" (click)="openCreateModal()">
          <i class="bi bi-person-plus-fill"></i>
          <span>Nuevo Estudiante</span>
        </button>
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
                placeholder="Buscar por documento, nombre o correo..."
                [value]="searchTerm()"
                (input)="onSearchInput($event)"
              />
            </div>
          </div>
          <div class="col-12 col-md-4 col-lg-6 text-md-end text-muted small">
            Total en BD: <strong>{{ filteredEstudiantes().length }}</strong>
          </div>
        </div>
      </div>

      <!-- Table Card -->
      <div class="card overflow-hidden shadow-sm border-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Nombre Completo</th>
                <th>Correo Institucional</th>
                <th>Teléfono</th>
                <th>Fecha Nacimiento</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (est of filteredEstudiantes(); track est.idEstudiante) {
                <tr>
                  <td>
                    <span class="fw-semibold font-monospace text-primary bg-primary bg-opacity-10 px-2 py-1 rounded">
                      {{ est.numeroDocumento }}
                    </span>
                  </td>
                  <td>
                    <div class="fw-semibold text-dark">{{ est.nombres }} {{ est.apellidos }}</div>
                  </td>
                  <td>
                    <span class="text-muted">{{ est.correoInstitucional }}</span>
                  </td>
                  <td>
                    <span>{{ est.telefono || 'Sin teléfono' }}</span>
                  </td>
                  <td>
                    <span>{{ est.fechaNacimiento }}</span>
                  </td>
                  <td class="text-end">
                    <div class="btn-group btn-group-sm">
                      <button
                        class="btn btn-outline-secondary"
                        (click)="openEditModal(est)"
                        title="Editar Datos"
                      >
                        <i class="bi bi-pencil-square"></i>
                      </button>
                      <button
                        class="btn btn-outline-danger"
                        (click)="eliminar(est)"
                        title="Eliminar Estudiante"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="text-center py-5 text-muted">
                    <i class="bi bi-people fs-1 d-block mb-2 text-secondary"></i>
                    No hay estudiantes registrados en la base de datos todavía.
                    <div class="mt-2">
                      <button class="btn btn-sm btn-primary" (click)="openCreateModal()">
                        <i class="bi bi-plus-lg me-1"></i> Registrar el primer estudiante
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Crear Estudiante -->
    @if (isCreateModalOpen()) {
      <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(15, 23, 42, 0.6);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content shadow-lg border-0">
            <div class="modal-header bg-light">
              <h5 class="modal-title fw-bold text-dark fs-6 d-flex align-items-center gap-2">
                <i class="bi bi-person-plus text-primary"></i>
                Registrar Nuevo Estudiante
              </h5>
              <button type="button" class="btn-close" (click)="isCreateModalOpen.set(false)" [disabled]="isSubmitting()"></button>
            </div>
            <form [formGroup]="createForm" (ngSubmit)="onCreateSubmit()">
              <div class="modal-body p-4">
                <div class="mb-3">
                  <label class="form-label">Número de Documento <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    class="form-control"
                    formControlName="numero_documento"
                    placeholder="Ej: 1025896321"
                    [class.is-invalid]="createForm.get('numero_documento')?.touched && createForm.get('numero_documento')?.invalid"
                  />
                  @if (createForm.get('numero_documento')?.touched && createForm.get('numero_documento')?.invalid) {
                    <div class="invalid-feedback">El número de documento es obligatorio.</div>
                  }
                </div>

                <div class="row g-2 mb-3">
                  <div class="col-6">
                    <label class="form-label">Nombres <span class="text-danger">*</span></label>
                    <input
                      type="text"
                      class="form-control"
                      formControlName="nombres"
                      placeholder="Juan Camilo"
                      [class.is-invalid]="createForm.get('nombres')?.touched && createForm.get('nombres')?.invalid"
                    />
                  </div>
                  <div class="col-6">
                    <label class="form-label">Apellidos <span class="text-danger">*</span></label>
                    <input
                      type="text"
                      class="form-control"
                      formControlName="apellidos"
                      placeholder="Rodríguez Gómez"
                      [class.is-invalid]="createForm.get('apellidos')?.touched && createForm.get('apellidos')?.invalid"
                    />
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Fecha de Nacimiento <span class="text-danger">*</span></label>
                  <input
                    type="date"
                    class="form-control"
                    formControlName="fecha_nacimiento"
                    [class.is-invalid]="createForm.get('fecha_nacimiento')?.touched && createForm.get('fecha_nacimiento')?.invalid"
                  />
                </div>

                <div class="mb-3">
                  <label class="form-label">Teléfono <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    class="form-control"
                    formControlName="telefono"
                    placeholder="Ej: 3001234567"
                    [class.is-invalid]="createForm.get('telefono')?.touched && createForm.get('telefono')?.invalid"
                  />
                </div>

                <div class="alert alert-light border small text-muted d-flex align-items-center gap-2 mb-0">
                  <i class="bi bi-info-circle text-primary"></i>
                  <span>El correo institucional y la contraseña inicial (su número de documento) serán generados automáticamente por el backend.</span>
                </div>
              </div>
              <div class="modal-footer bg-light">
                <button type="button" class="btn btn-outline-secondary" (click)="isCreateModalOpen.set(false)" [disabled]="isSubmitting()">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-primary d-flex align-items-center gap-2" [disabled]="createForm.invalid || isSubmitting()">
                  @if (isSubmitting()) {
                    <span class="spinner-border spinner-border-sm" role="status"></span>
                    Guardando...
                  } @else {
                    <i class="bi bi-check-lg"></i>
                    Crear Estudiante
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }

    <!-- Modal Editar Estudiante -->
    @if (isEditModalOpen() && selectedEstudiante()) {
      <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(15, 23, 42, 0.6);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content shadow-lg border-0">
            <div class="modal-header bg-light">
              <h5 class="modal-title fw-bold text-dark fs-6 d-flex align-items-center gap-2">
                <i class="bi bi-pencil-square text-primary"></i>
                Editar Estudiante: {{ selectedEstudiante()?.numeroDocumento }}
              </h5>
              <button type="button" class="btn-close" (click)="isEditModalOpen.set(false)" [disabled]="isSubmitting()"></button>
            </div>
            <form [formGroup]="editForm" (ngSubmit)="onEditSubmit()">
              <div class="modal-body p-4">
                <div class="row g-2 mb-3">
                  <div class="col-6">
                    <label class="form-label">Nombres <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" formControlName="nombres" />
                  </div>
                  <div class="col-6">
                    <label class="form-label">Apellidos <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" formControlName="apellidos" />
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Fecha de Nacimiento <span class="text-danger">*</span></label>
                  <input type="date" class="form-control" formControlName="fecha_nacimiento" />
                </div>

                <div class="mb-3">
                  <label class="form-label">Teléfono <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" formControlName="telefono" />
                </div>
              </div>
              <div class="modal-footer bg-light">
                <button type="button" class="btn btn-outline-secondary" (click)="isEditModalOpen.set(false)" [disabled]="isSubmitting()">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-primary d-flex align-items-center gap-2" [disabled]="editForm.invalid || isSubmitting()">
                  @if (isSubmitting()) {
                    <span class="spinner-border spinner-border-sm" role="status"></span>
                    Actualizando...
                  } @else {
                    <i class="bi bi-check-lg"></i>
                    Guardar Cambios
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }

    <!-- Modal Confirmar Eliminación (Aviso en Pantalla) -->
    @if (isDeleteModalOpen() && estudianteToDelete(); as est) {
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
              <h5 class="fw-bold text-dark mb-2">¿Eliminar este estudiante?</h5>
              <p class="text-muted small mb-0">
                Estás a punto de eliminar al estudiante <strong>{{ est.nombres }} {{ est.apellidos }}</strong> (Doc: {{ est.numeroDocumento }}). Esta acción también eliminará su usuario y no se puede deshacer.
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
export class EstudiantesListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private notificationService = inject(NotificationService);

  public estudiantes = signal<EstudianteResponse[]>([]);
  public searchTerm = signal<string>('');
  public isCreateModalOpen = signal<boolean>(false);
  public isEditModalOpen = signal<boolean>(false);
  public isDeleteModalOpen = signal<boolean>(false);
  public isSubmitting = signal<boolean>(false);
  public isDeleting = signal<boolean>(false);
  public selectedEstudiante = signal<EstudianteResponse | null>(null);
  public estudianteToDelete = signal<EstudianteResponse | null>(null);

  public filteredEstudiantes = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    return this.estudiantes().filter(e => {
      return (
        !term ||
        e.nombres.toLowerCase().includes(term) ||
        e.apellidos.toLowerCase().includes(term) ||
        e.numeroDocumento.toLowerCase().includes(term) ||
        e.correoInstitucional.toLowerCase().includes(term)
      );
    });
  });

  public createForm: FormGroup = this.fb.group({
    numero_documento: ['', [Validators.required]],
    nombres: ['', [Validators.required]],
    apellidos: ['', [Validators.required]],
    fecha_nacimiento: ['', [Validators.required]],
    telefono: ['', [Validators.required]]
  });

  public editForm: FormGroup = this.fb.group({
    nombres: ['', [Validators.required]],
    apellidos: ['', [Validators.required]],
    fecha_nacimiento: ['', [Validators.required]],
    telefono: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.cargarEstudiantes();
  }

  public cargarEstudiantes(): void {
    this.adminService.getEstudiantes().subscribe({
      next: (data) => this.estudiantes.set(data || []),
      error: () => this.estudiantes.set([])
    });
  }

  public onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const term = input.value.trim();
    this.searchTerm.set(term);

    if (term.length >= 2) {
      this.adminService.getEstudiantes(term, 50).subscribe({
        next: (data) => this.estudiantes.set(data || []),
        error: () => {}
      });
    } else if (term.length === 0) {
      this.cargarEstudiantes();
    }
  }

  public openCreateModal(): void {
    this.createForm.reset();
    this.isCreateModalOpen.set(true);
  }

  public onCreateSubmit(): void {
    if (this.createForm.invalid) return;

    this.isSubmitting.set(true);
    this.adminService.createEstudiante(this.createForm.value).subscribe({
      next: (nuevo) => {
        this.isSubmitting.set(false);
        this.estudiantes.update(list => [nuevo, ...list]);
        this.notificationService.success(`Estudiante ${nuevo.nombres} ${nuevo.apellidos} creado exitosamente.`);
        this.isCreateModalOpen.set(false);
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  public openEditModal(est: EstudianteResponse): void {
    this.selectedEstudiante.set(est);
    this.editForm.patchValue({
      nombres: est.nombres,
      apellidos: est.apellidos,
      fecha_nacimiento: est.fechaNacimiento,
      telefono: est.telefono
    });
    this.isEditModalOpen.set(true);
  }

  public onEditSubmit(): void {
    const est = this.selectedEstudiante();
    if (!est || this.editForm.invalid) return;

    this.isSubmitting.set(true);
    this.adminService.updateEstudiante(est.idEstudiante, this.editForm.value).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.cargarEstudiantes();
        this.notificationService.success('Datos del estudiante actualizados correctamente.');
        this.isEditModalOpen.set(false);
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  public eliminar(est: EstudianteResponse): void {
    this.estudianteToDelete.set(est);
    this.isDeleteModalOpen.set(true);
  }

  public cancelarEliminacion(): void {
    if (this.isDeleting()) return;
    this.isDeleteModalOpen.set(false);
    this.estudianteToDelete.set(null);
  }

  public confirmarEliminacion(): void {
    const est = this.estudianteToDelete();
    if (!est) return;

    this.isDeleting.set(true);
    this.adminService.deleteEstudiante(est.idEstudiante).subscribe({
      next: (res) => {
        this.isDeleting.set(false);
        this.isDeleteModalOpen.set(false);
        this.estudianteToDelete.set(null);
        this.estudiantes.update(list => list.filter(item => item.idEstudiante !== est.idEstudiante));
        this.notificationService.success(res?.message || `Estudiante ${est.nombres} ${est.apellidos} eliminado exitosamente.`);
      },
      error: () => {
        this.isDeleting.set(false);
        this.isDeleteModalOpen.set(false);
      }
    });
  }
}
