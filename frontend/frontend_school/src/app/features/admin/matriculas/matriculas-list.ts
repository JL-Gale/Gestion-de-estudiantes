import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CursoResponse, EstudianteResponse, MatriculaResponse } from '../../../core/models/academic.models';

@Component({
  selector: 'app-matriculas-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid p-0">
      
      <!-- ========================================================================= -->
      <!-- VISTA PRINCIPAL: CAJITAS DE SALONES ACADÉMICOS -->
      <!-- ========================================================================= -->
      <!-- Encabezado Principal -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 class="fw-bold text-dark mb-1">Matrículas de Estudiantes por Curso</h4>
          <p class="text-muted small mb-0">
            Haz clic en un salón para abrir su ventana de gestión, consultar sus estudiantes y matricular nuevos alumnos.
          </p>
        </div>
      </div>

      <!-- Barra de Año Lectivo y Consulta Histórica -->
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

      <!-- Banner Informativo Histórico -->
      @if (selectedYear() < currentYear) {
        <div class="alert alert-info border-info-subtle d-flex align-items-center gap-2 py-2 mb-4">
          <i class="bi bi-clock-history fs-5"></i>
          <div>
            <strong>Archivo Histórico {{ selectedYear() }}:</strong> Mostrando los salones académicos del año {{ selectedYear() }} (Modo consulta).
          </div>
        </div>
      }

      <!-- Filtro buscador de salones -->
      <div class="card mb-4 p-3 shadow-sm border-0">
        <div class="row g-3 align-items-center">
          <div class="col-12 col-md-6 col-lg-5">
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0 text-muted">
                <i class="bi bi-search"></i>
              </span>
              <input
                type="text"
                class="form-control border-start-0 ps-0"
                placeholder="Filtrar salones (ej: 11, A)..."
                [value]="salonSearchTerm()"
                (input)="onSalonSearchInput($event)"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 col-lg-7 text-md-end text-muted small">
            Total salones activos: <strong>{{ filteredCursos().length }}</strong>
          </div>
        </div>
      </div>

      <!-- GRILLA DE CAJITAS DE SALONES -->
      <div class="row g-4">
        @for (curso of filteredCursos(); track curso.idCurso) {
          <div class="col-12 col-md-6 col-lg-4">
            <div
              class="card card-hoverable h-100 shadow-sm border border-light-subtle rounded-4 p-4 d-flex flex-column justify-content-between bg-white position-relative"
              (click)="abrirVentanaSalon(curso)"
              style="cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;"
            >
              <div>
                <!-- Encabezado de la caja: Icono + Contador de estudiantes matriculados -->
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <div
                    class="bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center"
                    style="width: 52px; height: 52px;"
                  >
                    <i class="bi bi-mortarboard-fill fs-3"></i>
                  </div>
                  <span class="badge bg-light text-dark border px-2.5 py-1.5 font-monospace">
                    <i class="bi bi-people-fill me-1 text-primary"></i>
                    {{ countMatriculasPorCurso(curso.idCurso) }} {{ countMatriculasPorCurso(curso.idCurso) === 1 ? 'estudiante' : 'estudiantes' }}
                  </span>
                </div>

                <!-- Título del salón en formato limpio "11 A" -->
                <div class="fw-bold fs-1 text-dark lh-1 mb-2">
                  {{ curso.grado }} {{ curso.grupo }}
                </div>
                <p class="text-muted small mb-0">
                  Salón de clases escolar &bull; Grado {{ curso.grado }}°
                </p>
              </div>

              <!-- Botón de acción: Abrir Ventana del Salón -->
              <div class="pt-4 mt-3 border-top">
                <button
                  type="button"
                  class="btn btn-sm w-100 py-2 d-flex align-items-center justify-content-center gap-2 fw-semibold border-0 text-primary bg-primary bg-opacity-10"
                  (click)="abrirVentanaSalon(curso); $event.stopPropagation()"
                >
                  <i class="bi bi-window-stack"></i>
                  <span>Abrir Ventana del Salón</span>
                </button>
              </div>
            </div>
          </div>
        } @empty {
          <div class="col-12">
            <div class="card text-center p-5 shadow-sm border-0">
              <i class="bi bi-building-x fs-1 text-muted mb-3"></i>
              <h5 class="fw-bold text-dark">No hay salones disponibles en este periodo</h5>
              <p class="text-muted small mb-0">
                No se encontraron cursos académicos para el año lectivo {{ selectedYear() }}.
              </p>
            </div>
          </div>
        }
      </div>

    </div>

    <!-- ========================================================================= -->
    <!-- VENTANA MODAL DE GESTIÓN DEL SALÓN (ESTUDIANTES + MATRICULAR) -->
    <!-- ========================================================================= -->
    @if (activeCurso(); as salon) {
      <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(15, 23, 42, 0.65);">
        <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            
            <!-- Modal Header -->
            <div class="modal-header bg-primary text-white border-bottom-0 py-3 px-4">
              <div class="d-flex align-items-center gap-3">
                <div class="bg-white bg-opacity-20 text-white rounded-3 p-2 d-flex align-items-center justify-content-center" style="width: 44px; height: 44px;">
                  <i class="bi bi-mortarboard-fill fs-4"></i>
                </div>
                <div>
                  <div class="d-flex align-items-center gap-2 flex-wrap">
                    <h5 class="modal-title fw-bold mb-0">Salón {{ salon.grado }} {{ salon.grupo }}</h5>
                    <span class="badge bg-white text-primary fw-semibold font-monospace">
                      Año {{ selectedYear() }}
                    </span>
                    <span class="badge bg-white bg-opacity-25 text-white border border-white border-opacity-25">
                      Grado {{ salon.grado }}°
                    </span>
                  </div>
                  <small class="text-white-50">
                    Gestión de matrículas y asignación de alumnos para el salón escolar
                  </small>
                </div>
              </div>
              <div class="d-flex align-items-center gap-2">
                <span class="badge bg-white text-dark px-3 py-2 font-monospace fs-6">
                  <i class="bi bi-people-fill text-primary me-1"></i>
                  {{ matriculasDelSalon().length }} {{ matriculasDelSalon().length === 1 ? 'inscrito' : 'inscritos' }}
                </span>
                <button type="button" class="btn-close btn-close-white ms-2" (click)="cerrarVentanaSalon()" title="Cerrar ventana"></button>
              </div>
            </div>

            <!-- Modal Body -->
            <div class="modal-body p-4 bg-light bg-opacity-50">
              
              <!-- Banner Histórico si aplica -->
              @if (selectedYear() < currentYear) {
                <div class="alert alert-info border-info-subtle d-flex align-items-center gap-2 py-2 mb-4">
                  <i class="bi bi-clock-history fs-5"></i>
                  <div>
                    <strong>Archivo Histórico {{ selectedYear() }}:</strong> Consultando alumnos matriculados en este salón en modo solo lectura.
                  </div>
                </div>
              }

              <!-- SECCIÓN 1: CARGADOR Y ASIGNADOR DE ESTUDIANTE -->
              @if (selectedYear() === currentYear) {
                <div class="card p-3 mb-4 shadow-sm border-0 rounded-3 bg-white">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <h6 class="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                      <i class="bi bi-person-plus-fill text-primary"></i>
                      <span>Matricular Estudiante en este Salón</span>
                    </h6>
                    <small class="text-muted">Búsqueda rápida por nombre o número de cédula</small>
                  </div>

                  @if (selectedStudent(); as student) {
                    <!-- Tarjeta de estudiante seleccionado -->
                    <div class="card p-3 border-success bg-success bg-opacity-10 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 rounded-3 mt-2">
                      <div class="d-flex align-items-center gap-3">
                        <div class="bg-success text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 44px; height: 44px;">
                          <i class="bi bi-check-lg fs-4"></i>
                        </div>
                        <div>
                          <strong class="text-dark d-block fs-6">{{ student.nombres }} {{ student.apellidos }}</strong>
                          <span class="badge bg-light text-dark border font-monospace me-2">Doc: {{ student.numeroDocumento }}</span>
                          <small class="text-muted">{{ student.correoInstitucional }}</small>
                        </div>
                      </div>
                      <div class="d-flex align-items-center gap-2">
                        <button
                          type="button"
                          class="btn btn-sm btn-outline-secondary"
                          (click)="clearSelectedStudent()"
                          [disabled]="isSubmitting()"
                        >
                          <i class="bi bi-x-lg me-1"></i> Cambiar
                        </button>
                        <button
                          type="button"
                          class="btn btn-sm btn-primary d-flex align-items-center gap-2 px-3"
                          (click)="saveMatricula()"
                          [disabled]="isSubmitting()"
                        >
                          @if (isSubmitting()) {
                            <span class="spinner-border spinner-border-sm" role="status"></span>
                          }
                          <i class="bi bi-check-circle-fill"></i>
                          <span>Confirmar Matrícula</span>
                        </button>
                      </div>
                    </div>
                  } @else {
                    <!-- Buscador de Estudiante -->
                    <div class="position-relative mt-2">
                      <div class="input-group">
                        <span class="input-group-text bg-white border-end-0 text-muted">
                          <i class="bi bi-search"></i>
                        </span>
                        <input
                          type="text"
                          class="form-control border-start-0"
                          placeholder="Escribe el nombre o documento del alumno (ej: Jorge, 1052...)"
                          [value]="modalStudentSearchQuery()"
                          (input)="onModalStudentSearchInput($event)"
                        />
                        @if (modalStudentSearchQuery()) {
                          <button
                            class="btn btn-outline-secondary"
                            type="button"
                            (click)="modalStudentSearchQuery.set(''); serverMatchedStudents.set([])"
                          >
                            <i class="bi bi-x-lg"></i>
                          </button>
                        }
                      </div>

                      <!-- Dropdown flotante con resultados dinámicos -->
                      @if (modalStudentSearchQuery().trim().length >= 2) {
                        <div
                          class="list-group position-absolute w-100 mt-1 shadow-lg border rounded-3 overflow-y-auto"
                          style="max-height: 220px; z-index: 1060; background: #ffffff;"
                        >
                          @for (est of filteredModalStudentOptions(); track est.idEstudiante) {
                            <button
                              type="button"
                              class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-2.5"
                              (click)="selectStudent(est)"
                            >
                              <div class="d-flex align-items-center gap-2">
                                <i class="bi bi-person-circle text-primary fs-5"></i>
                                <div>
                                  <span class="fw-semibold text-dark">{{ est.nombres }} {{ est.apellidos }}</span>
                                  <small class="text-muted d-block" style="font-size: 0.75rem;">
                                    {{ est.correoInstitucional }}
                                  </small>
                                </div>
                              </div>
                              <span class="badge bg-light text-dark font-monospace border">
                                Doc: {{ est.numeroDocumento }}
                              </span>
                            </button>
                          } @empty {
                            <div class="p-3 text-center text-muted small">
                              <i class="bi bi-exclamation-circle me-1"></i>
                              No se encontraron estudiantes que coincidan con "{{ modalStudentSearchQuery() }}".
                            </div>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              }

              <!-- SECCIÓN 2: TABLA DE ESTUDIANTES MATRICULADOS EN ESTE SALÓN -->
              <div class="card overflow-hidden shadow-sm border-0 rounded-3 bg-white">
                <div class="p-3 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
                  <h6 class="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                    <i class="bi bi-people-fill text-primary"></i>
                    <span>Estudiantes Matriculados en Salón {{ salon.grado }} {{ salon.grupo }}</span>
                  </h6>
                  <div class="input-group input-group-sm" style="max-width: 280px;">
                    <span class="input-group-text bg-white border-end-0 text-muted">
                      <i class="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      class="form-control border-start-0"
                      placeholder="Filtrar en este salón..."
                      [value]="studentSearchTerm()"
                      (input)="onStudentSearchInput($event)"
                    />
                  </div>
                </div>

                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                      <tr>
                        <th>Estudiante</th>
                        <th>Documento</th>
                        <th>Fecha Matrícula</th>
                        <th class="text-end">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (m of matriculasDelSalon(); track m.idMatricula) {
                        <tr>
                          <td>
                            <div class="d-flex align-items-center gap-2">
                              <div
                                class="bg-primary bg-opacity-10 text-primary p-2 rounded-circle"
                                style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;"
                              >
                                <i class="bi bi-person-fill"></i>
                              </div>
                              <div>
                                <strong class="text-dark d-block">{{ m.nombreEstudiante }}</strong>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span class="badge bg-light text-dark font-monospace border px-2.5 py-1">
                              {{ m.numeroDocumento }}
                            </span>
                          </td>
                          <td class="text-muted small">
                            <i class="bi bi-calendar3 me-1"></i>
                            {{ m.fechaMatricula }}
                          </td>
                          <td class="text-end">
                            @if (selectedYear() === currentYear) {
                              <button
                                class="btn btn-sm btn-outline-danger"
                                (click)="confirmDeleteMatricula(m)"
                                title="Anular matrícula"
                              >
                                <i class="bi bi-trash me-1"></i> Anular
                              </button>
                            } @else {
                              <span class="badge bg-light text-muted border">
                                <i class="bi bi-lock-fill me-1"></i>Cerrado
                              </span>
                            }
                          </td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="4" class="text-center py-5">
                            <div class="text-muted">
                              <i class="bi bi-person-x fs-1 d-block mb-2 text-secondary"></i>
                              <h6 class="fw-semibold text-dark">No hay estudiantes matriculados en este salón</h6>
                              <p class="small mb-0">
                                @if (selectedYear() === currentYear) {
                                  Utiliza el buscador superior para asignar alumnos al salón {{ salon.grado }} {{ salon.grupo }}.
                                } @else {
                                  No se encontraron registros de matrículas en este periodo.
                                }
                              </p>
                            </div>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            <!-- Modal Footer -->
            <div class="modal-footer bg-light border-top-0 px-4 py-3 d-flex justify-content-between">
              <small class="text-muted">
                Total matriculados en salón: <strong>{{ matriculasDelSalon().length }}</strong>
              </small>
              <button type="button" class="btn btn-secondary px-4" (click)="cerrarVentanaSalon()">
                Cerrar
              </button>
            </div>

          </div>
        </div>
      </div>
    }

    <!-- ========================================================================= -->
    <!-- MODAL: CONFIRMAR ANULACIÓN DE MATRÍCULA -->
    <!-- ========================================================================= -->
    @if (isDeleteModalOpen() && matriculaToAnular(); as m) {
      <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(15, 23, 42, 0.75); z-index: 1070;">
        <div class="modal-dialog modal-dialog-centered" style="max-width: 440px;">
          <div class="modal-content shadow-lg border-0 rounded-4 overflow-hidden">
            <div class="modal-body p-4 text-center">
              <div
                class="bg-danger bg-opacity-10 text-danger rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style="width: 58px; height: 58px;"
              >
                <i class="bi bi-person-x fs-3"></i>
              </div>
              <h5 class="fw-bold text-dark mb-2">¿Anular esta matrícula?</h5>
              <p class="text-muted small mb-0">
                Estás a punto de anular la matrícula de <strong>{{ m.nombreEstudiante }}</strong> (Doc: {{ m.numeroDocumento }}). Esta acción retirará al alumno de este salón.
              </p>
            </div>
            <div class="modal-footer bg-light border-0 px-4 py-3 d-flex gap-2 justify-content-center">
              <button
                type="button"
                class="btn btn-outline-secondary px-4 fw-semibold"
                (click)="cancelarAnulacion()"
                [disabled]="isAnulando()"
              >
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-danger px-4 fw-semibold d-flex align-items-center gap-2"
                (click)="confirmarAnulacion()"
                [disabled]="isAnulando()"
              >
                @if (isAnulando()) {
                  <span class="spinner-border spinner-border-sm" role="status"></span>
                  <span>Anulando...</span>
                } @else {
                  <i class="bi bi-x-circle"></i>
                  <span>Sí, Anular Matrícula</span>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .card-hoverable:hover {
      border-color: #3b82f6 !important;
      box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.15), 0 8px 10px -6px rgba(59, 130, 246, 0.1) !important;
      transform: translateY(-2px);
    }
  `]
})
export class MatriculasListComponent implements OnInit {
  private adminService = inject(AdminService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  public currentYear: number = new Date().getFullYear();
  public selectedYear = signal<number>(new Date().getFullYear());
  public inputHistoricoAnio = signal<number>(new Date().getFullYear());
  public historicoErrorMsg = signal<string>('');

  public matriculas = signal<MatriculaResponse[]>([]);
  public estudiantes = signal<EstudianteResponse[]>([]);
  public cursos = signal<CursoResponse[]>([]);

  // Salón activo para abrir en la ventana modal
  public activeCurso = signal<CursoResponse | null>(null);

  // Filtros de búsqueda
  public salonSearchTerm = signal<string>('');
  public studentSearchTerm = signal<string>('');

  // Estado de modales y operaciones
  public isDeleteModalOpen = signal<boolean>(false);
  public isSubmitting = signal<boolean>(false);
  public isAnulando = signal<boolean>(false);
  public matriculaToAnular = signal<MatriculaResponse | null>(null);

  // Search & Typeahead de estudiantes dentro de la ventana
  public modalStudentSearchQuery = signal<string>('');
  public serverMatchedStudents = signal<EstudianteResponse[]>([]);
  public selectedStudent = signal<EstudianteResponse | null>(null);

  public matriculaForm: FormGroup = this.fb.group({
    id_estudiante: [null, [Validators.required]],
    id_curso: [null, [Validators.required]]
  });

  // Salones filtrados para la vista de cajas
  public filteredCursos = computed(() => {
    const list = this.cursos();
    const query = this.salonSearchTerm().toLowerCase().trim();
    if (!query) return list;

    return list.filter((c) =>
      `${c.grado} ${c.grupo}`.toLowerCase().includes(query) ||
      `${c.grado}${c.grupo}`.toLowerCase().includes(query) ||
      c.nombreCompleto.toLowerCase().includes(query) ||
      c.grado.toString().includes(query) ||
      c.grupo.toLowerCase().includes(query)
    );
  });

  // Estudiantes del salón activo en la ventana
  public matriculasDelSalon = computed(() => {
    const active = this.activeCurso();
    if (!active) return [];

    let list = this.matriculas().filter((m) => m.idCurso === active.idCurso);
    const query = this.studentSearchTerm().toLowerCase().trim();

    if (query) {
      list = list.filter(
        (m) =>
          m.nombreEstudiante.toLowerCase().includes(query) ||
          m.numeroDocumento.toLowerCase().includes(query)
      );
    }
    return list;
  });

  // Opciones de estudiantes para el autocomplete
  public filteredModalStudentOptions = computed(() => {
    const query = this.modalStudentSearchQuery().toLowerCase().trim();
    const serverResults = this.serverMatchedStudents();

    if (serverResults.length > 0) {
      return serverResults;
    }

    const all = this.estudiantes();
    if (!query) {
      return all.slice(0, 10);
    }

    return all
      .filter(
        (e) =>
          e.nombres.toLowerCase().includes(query) ||
          e.apellidos.toLowerCase().includes(query) ||
          e.numeroDocumento.toLowerCase().includes(query) ||
          `${e.nombres} ${e.apellidos}`.toLowerCase().includes(query)
      )
      .slice(0, 15);
  });

  ngOnInit(): void {
    this.loadInitialData();
  }

  public loadInitialData(): void {
    if (this.selectedYear() === this.currentYear) {
      this.adminService.getMatriculas().subscribe({
        next: (data) => this.matriculas.set(data || []),
        error: (err) => this.notificationService.error(err.error?.message || err.error?.mensaje || 'Error al cargar matrículas')
      });

      this.adminService.getCursos().subscribe({
        next: (data) => {
          this.cursos.set(data || []);
          if (this.activeCurso()) {
            const found = data?.find((c) => c.idCurso === this.activeCurso()!.idCurso);
            this.activeCurso.set(found || null);
          }
        },
        error: () => this.cursos.set([])
      });
    } else {
      this.adminService.getHistorialMatriculas(this.selectedYear()).subscribe({
        next: (data) => this.matriculas.set(data || []),
        error: (err) => this.notificationService.error(err.error?.message || err.error?.mensaje || `Error al cargar historial de matrículas del año ${this.selectedYear()}`)
      });

      this.adminService.getHistorialCursos(this.selectedYear()).subscribe({
        next: (data) => {
          this.cursos.set(data || []);
          if (this.activeCurso()) {
            const found = data?.find((c) => c.idCurso === this.activeCurso()!.idCurso);
            this.activeCurso.set(found || null);
          }
        },
        error: () => this.cursos.set([])
      });
    }

    this.adminService.getEstudiantes('', 20).subscribe({
      next: (data) => this.estudiantes.set(data || []),
      error: () => {}
    });
  }

  public countMatriculasPorCurso(idCurso: number): number {
    return this.matriculas().filter((m) => m.idCurso === idCurso).length;
  }

  // ==================== VENTANA MODAL DEL SALÓN ====================
  public abrirVentanaSalon(curso: CursoResponse): void {
    this.activeCurso.set(curso);
    this.studentSearchTerm.set('');
    this.clearSelectedStudent();
    this.matriculaForm.reset({
      id_estudiante: null,
      id_curso: curso.idCurso
    });
  }

  public cerrarVentanaSalon(): void {
    this.activeCurso.set(null);
    this.studentSearchTerm.set('');
    this.clearSelectedStudent();
  }

  public onSalonSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.salonSearchTerm.set(value);
  }

  public onStudentSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.studentSearchTerm.set(value);
  }

  // ==================== CONSULTA HISTÓRICA ====================
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
    this.activeCurso.set(null);
    this.loadInitialData();
  }

  public resetToCurrentYear(): void {
    this.selectedYear.set(this.currentYear);
    this.inputHistoricoAnio.set(this.currentYear);
    this.historicoErrorMsg.set('');
    this.activeCurso.set(null);
    this.loadInitialData();
  }

  // ==================== ASIGNADOR DE MATRÍCULA ====================
  public onModalStudentSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.modalStudentSearchQuery.set(value);

    if (value.trim().length >= 2) {
      this.adminService.buscarEstudiantes(value.trim(), 15).subscribe({
        next: (res) => this.serverMatchedStudents.set(res || []),
        error: () => this.serverMatchedStudents.set([])
      });
    } else {
      this.serverMatchedStudents.set([]);
    }
  }

  public selectStudent(student: EstudianteResponse): void {
    this.selectedStudent.set(student);
    this.matriculaForm.patchValue({ id_estudiante: student.idEstudiante });
    this.matriculaForm.get('id_estudiante')?.markAsTouched();
    this.modalStudentSearchQuery.set('');
    this.serverMatchedStudents.set([]);
  }

  public clearSelectedStudent(): void {
    this.selectedStudent.set(null);
    this.matriculaForm.patchValue({ id_estudiante: null });
    this.modalStudentSearchQuery.set('');
    this.serverMatchedStudents.set([]);
  }

  public saveMatricula(): void {
    const salon = this.activeCurso();
    if (!salon || this.matriculaForm.invalid) {
      this.matriculaForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const req = {
      id_estudiante: Number(this.matriculaForm.value.id_estudiante),
      id_curso: salon.idCurso
    };

    this.adminService.createMatricula(req).subscribe({
      next: () => {
        this.notificationService.success(`Estudiante matriculado con éxito en el salón ${salon.grado} ${salon.grupo}`);
        this.clearSelectedStudent();
        this.isSubmitting.set(false);
        this.loadInitialData();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.notificationService.error(err.error?.message || err.error?.mensaje || 'Error al matricular estudiante');
      }
    });
  }

  // ==================== ANULACIÓN DE MATRÍCULA ====================
  public confirmDeleteMatricula(m: MatriculaResponse): void {
    this.matriculaToAnular.set(m);
    this.isDeleteModalOpen.set(true);
  }

  public cancelarAnulacion(): void {
    if (this.isAnulando()) return;
    this.isDeleteModalOpen.set(false);
    this.matriculaToAnular.set(null);
  }

  public confirmarAnulacion(): void {
    const m = this.matriculaToAnular();
    if (!m) return;

    this.isAnulando.set(true);
    this.adminService.deleteMatricula(m.idMatricula).subscribe({
      next: () => {
        this.isAnulando.set(false);
        this.isDeleteModalOpen.set(false);
        this.matriculaToAnular.set(null);
        this.notificationService.success(`Matrícula de ${m.nombreEstudiante} anulada exitosamente.`);
        this.loadInitialData();
      },
      error: () => {
        this.isAnulando.set(false);
        this.isDeleteModalOpen.set(false);
      }
    });
  }
}
