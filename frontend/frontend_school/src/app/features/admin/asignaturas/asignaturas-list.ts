import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AsignaturaResponse } from '../../../core/models/academic.models';

@Component({
  selector: 'app-asignaturas-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 class="fw-bold text-dark mb-1">Catálogo de Asignaturas</h4>
          <p class="text-muted small mb-0">Listado de materias curriculares del colegio</p>
        </div>
        <button class="btn btn-primary d-flex align-items-center gap-2 shadow-sm" (click)="openCreateModal()">
          <i class="bi bi-journal-plus"></i>
          <span>Nueva Asignatura</span>
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
                placeholder="Buscar asignatura..."
                [value]="searchTerm()"
                (input)="onSearchInput($event)"
              />
            </div>
          </div>
          <div class="col-12 col-md-4 col-lg-6 text-md-end text-muted small">
            Total en Catálogo: <strong>{{ filteredAsignaturas().length }}</strong>
          </div>
        </div>
      </div>

      <!-- Table Card -->
      <div class="card overflow-hidden shadow-sm border-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th>Nombre de la Asignatura</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (asig of filteredAsignaturas(); track asig.idAsignatura) {
                <tr>
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <div class="bg-primary bg-opacity-10 text-primary p-2 rounded">
                        <i class="bi bi-book"></i>
                      </div>
                      <div class="fw-semibold text-dark fs-6">{{ asig.nombre }}</div>
                    </div>
                  </td>
                  <td class="text-end">
                    <div class="btn-group btn-group-sm">
                      <button
                        class="btn btn-outline-secondary"
                        (click)="openEditModal(asig)"
                        title="Editar Nombre"
                      >
                        <i class="bi bi-pencil-square"></i>
                      </button>
                      <button
                        class="btn btn-outline-danger"
                        (click)="eliminar(asig)"
                        title="Eliminar Asignatura"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="2" class="text-center py-5 text-muted">
                    <i class="bi bi-journal-x fs-1 d-block mb-2 text-secondary"></i>
                    No hay asignaturas registradas en el catálogo todavía.
                    <div class="mt-2">
                      <button class="btn btn-sm btn-primary" (click)="openCreateModal()">
                        <i class="bi bi-plus-lg me-1"></i> Crear la primera asignatura
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

    <!-- Modal Crear Asignatura -->
    @if (isCreateModalOpen()) {
      <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(15, 23, 42, 0.6);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content shadow-lg border-0">
            <div class="modal-header bg-light">
              <h5 class="modal-title fw-bold text-dark fs-6 d-flex align-items-center gap-2">
                <i class="bi bi-journal-plus text-primary"></i>
                Nueva Asignatura
              </h5>
              <button type="button" class="btn-close" (click)="isCreateModalOpen.set(false)" [disabled]="isSubmitting()"></button>
            </div>
            <form [formGroup]="form" (ngSubmit)="onCreateSubmit()">
              <div class="modal-body p-4">
                <div class="mb-3">
                  <label class="form-label">Nombre de la Asignatura <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    class="form-control"
                    formControlName="nombre"
                    placeholder="Ej: Ciencias Naturales, Matemáticas, Inglés..."
                    [class.is-invalid]="form.get('nombre')?.touched && form.get('nombre')?.invalid"
                  />
                  @if (form.get('nombre')?.touched && form.get('nombre')?.invalid) {
                    <div class="invalid-feedback">El nombre de la materia es requerido.</div>
                  }
                </div>
              </div>
              <div class="modal-footer bg-light">
                <button type="button" class="btn btn-outline-secondary" (click)="isCreateModalOpen.set(false)" [disabled]="isSubmitting()">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-primary d-flex align-items-center gap-2" [disabled]="form.invalid || isSubmitting()">
                  @if (isSubmitting()) {
                    <span class="spinner-border spinner-border-sm" role="status"></span>
                    Creando...
                  } @else {
                    <i class="bi bi-check-lg"></i>
                    Crear Asignatura
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }

    <!-- Modal Editar Asignatura -->
    @if (isEditModalOpen() && selectedAsignatura()) {
      <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(15, 23, 42, 0.6);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content shadow-lg border-0">
            <div class="modal-header bg-light">
              <h5 class="modal-title fw-bold text-dark fs-6 d-flex align-items-center gap-2">
                <i class="bi bi-pencil-square text-primary"></i>
                Editar Asignatura
              </h5>
              <button type="button" class="btn-close" (click)="isEditModalOpen.set(false)" [disabled]="isSubmitting()"></button>
            </div>
            <form [formGroup]="form" (ngSubmit)="onEditSubmit()">
              <div class="modal-body p-4">
                <div class="mb-3">
                  <label class="form-label">Nombre de la Asignatura <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" formControlName="nombre" />
                </div>
              </div>
              <div class="modal-footer bg-light">
                <button type="button" class="btn btn-outline-secondary" (click)="isEditModalOpen.set(false)" [disabled]="isSubmitting()">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-primary d-flex align-items-center gap-2" [disabled]="form.invalid || isSubmitting()">
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
    @if (isDeleteModalOpen() && asignaturaToDelete(); as asig) {
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
              <h5 class="fw-bold text-dark mb-2">¿Eliminar esta asignatura?</h5>
              <p class="text-muted small mb-0">
                Estás a punto de eliminar la materia <strong>{{ asig.nombre }}</strong> (#{{ asig.idAsignatura }}). Esta acción no se puede deshacer si tiene registros académicos asociados.
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
export class AsignaturasListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private notificationService = inject(NotificationService);

  public asignaturas = signal<AsignaturaResponse[]>([]);
  public searchTerm = signal<string>('');
  public isCreateModalOpen = signal<boolean>(false);
  public isEditModalOpen = signal<boolean>(false);
  public isDeleteModalOpen = signal<boolean>(false);
  public isSubmitting = signal<boolean>(false);
  public isDeleting = signal<boolean>(false);
  public selectedAsignatura = signal<AsignaturaResponse | null>(null);
  public asignaturaToDelete = signal<AsignaturaResponse | null>(null);

  public filteredAsignaturas = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    return this.asignaturas().filter(a => !term || a.nombre.toLowerCase().includes(term));
  });

  public form: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.cargarAsignaturas();
  }

  public cargarAsignaturas(): void {
    this.adminService.getAsignaturas().subscribe({
      next: (data) => this.asignaturas.set(data || []),
      error: () => this.asignaturas.set([])
    });
  }

  public onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  public openCreateModal(): void {
    this.form.reset();
    this.isCreateModalOpen.set(true);
  }

  public onCreateSubmit(): void {
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    this.adminService.createAsignatura(this.form.value).subscribe({
      next: (nueva) => {
        this.isSubmitting.set(false);
        this.asignaturas.update(list => [nueva, ...list]);
        this.notificationService.success(`Asignatura "${nueva.nombre}" creada con éxito.`);
        this.isCreateModalOpen.set(false);
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  public openEditModal(asig: AsignaturaResponse): void {
    this.selectedAsignatura.set(asig);
    this.form.patchValue({ nombre: asig.nombre });
    this.isEditModalOpen.set(true);
  }

  public onEditSubmit(): void {
    const asig = this.selectedAsignatura();
    if (!asig || this.form.invalid) return;

    this.isSubmitting.set(true);
    this.adminService.updateAsignatura(asig.idAsignatura, this.form.value).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.cargarAsignaturas();
        this.notificationService.success('Asignatura actualizada exitosamente.');
        this.isEditModalOpen.set(false);
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  public eliminar(asig: AsignaturaResponse): void {
    this.asignaturaToDelete.set(asig);
    this.isDeleteModalOpen.set(true);
  }

  public cancelarEliminacion(): void {
    if (this.isDeleting()) return;
    this.isDeleteModalOpen.set(false);
    this.asignaturaToDelete.set(null);
  }

  public confirmarEliminacion(): void {
    const asig = this.asignaturaToDelete();
    if (!asig) return;

    this.isDeleting.set(true);
    this.adminService.deleteAsignatura(asig.idAsignatura).subscribe({
      next: (res) => {
        this.isDeleting.set(false);
        this.isDeleteModalOpen.set(false);
        this.asignaturaToDelete.set(null);
        this.asignaturas.update(list => list.filter(item => item.idAsignatura !== asig.idAsignatura));
        this.notificationService.success(res?.message || `Asignatura "${asig.nombre}" eliminada exitosamente.`);
      },
      error: () => {
        this.isDeleting.set(false);
        this.isDeleteModalOpen.set(false);
      }
    });
  }
}
