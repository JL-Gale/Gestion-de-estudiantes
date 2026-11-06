import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DocenteService } from '../../../core/services/docente.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DocenteCargaResponse } from '../../../core/models/academic.models';

@Component({
  selector: 'app-mis-asignaturas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid p-0">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 class="fw-bold text-dark mb-1">Mis Cargas Académicas</h4>
          <p class="text-muted small mb-0">Cursos y asignaturas asignadas a tu perfil docente</p>
        </div>
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

      @if (selectedYear() < currentYear) {
        <div class="alert alert-info border-info-subtle d-flex align-items-center gap-2 py-2 mb-4">
          <i class="bi bi-clock-history fs-5"></i>
          <div>
            <strong>Historial de Cargas {{ selectedYear() }}:</strong> Mostrando las asignaturas que dictaste durante el año lectivo {{ selectedYear() }}.
          </div>
        </div>
      }

      <!-- Cargas Cards Grid -->
      <div class="row g-4">
        @for (carga of cargas(); track carga.idCarga) {
          <div class="col-12 col-md-6 col-xl-4">
            <div class="card card-hoverable h-100 overflow-hidden shadow-sm">
              <div class="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
                <span class="badge bg-primary bg-opacity-10 text-primary font-monospace fw-semibold px-2.5 py-1">
                  Carga #{{ carga.idCarga }}
                </span>
                <span class="badge bg-success-subtle text-success border border-success-subtle">
                  <i class="bi bi-check-circle-fill me-1"></i> Activa
                </span>
              </div>
              <div class="card-body p-4">
                <div class="d-flex align-items-center gap-2 text-muted small mb-1">
                  <i class="bi bi-building text-primary"></i>
                  <span>Curso / Salón:</span>
                </div>
                <h5 class="fw-bold text-dark mb-3">{{ carga.curso }}</h5>

                <div class="d-flex align-items-center gap-2 text-muted small mb-1">
                  <i class="bi bi-book text-primary"></i>
                  <span>Asignatura Curricular:</span>
                </div>
                <h6 class="fw-semibold text-secondary mb-4">{{ carga.asignatura }}</h6>

                <a
                  [routerLink]="['/docente/cargas', carga.idCarga, 'calificaciones']"
                  class="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                >
                  <i class="bi bi-table"></i>
                  <span>Planilla de Calificaciones</span>
                </a>
              </div>
            </div>
          </div>
        } @empty {
          <div class="col-12">
            <div class="card text-center p-5 shadow-sm border-0">
              <i class="bi bi-journal-x fs-1 text-muted mb-3"></i>
              <h5 class="fw-bold text-dark">No tienes cargas académicas asignadas en la base de datos</h5>
              <p class="text-muted small mb-0">
                La administración escolar aún no te ha vinculado a cursos y materias para este periodo lectivo.
              </p>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class MisAsignaturasComponent implements OnInit {
  private docenteService = inject(DocenteService);
  private notificationService = inject(NotificationService);

  public currentYear: number = new Date().getFullYear();
  public selectedYear = signal<number>(new Date().getFullYear());
  public inputHistoricoAnio = signal<number>(new Date().getFullYear());
  public historicoErrorMsg = signal<string>('');

  public cargas = signal<DocenteCargaResponse[]>([]);

  ngOnInit(): void {
    this.cargarCargas();
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
    this.cargarCargas();
  }

  public resetToCurrentYear(): void {
    this.selectedYear.set(this.currentYear);
    this.inputHistoricoAnio.set(this.currentYear - 1);
    this.historicoErrorMsg.set('');
    this.cargarCargas();
  }

  public cargarCargas(): void {
    if (this.selectedYear() === this.currentYear) {
      this.docenteService.getMisCargas().subscribe({
        next: (data) => {
          this.cargas.set(data || []);
        },
        error: (err) => {
          this.notificationService.error(err.error?.message || err.error?.mensaje || 'Error al obtener tus cargas académicas');
        }
      });
    } else {
      this.docenteService.getHistorialMisCargas(this.selectedYear()).subscribe({
        next: (data) => {
          this.cargas.set(data || []);
        },
        error: (err) => {
          this.notificationService.error(err.error?.message || err.error?.mensaje || `Error al obtener historial de cargas del año ${this.selectedYear()}`);
        }
      });
    }
  }
}
