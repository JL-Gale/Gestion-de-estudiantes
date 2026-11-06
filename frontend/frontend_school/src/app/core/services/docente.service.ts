import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CalificacionResponse,
  CalificacionUpsertRequest,
  CorteResponse,
  DocenteCargaResponse,
  DocenteEstudianteResponse
} from '../models/academic.models';

@Injectable({
  providedIn: 'root'
})
export class DocenteService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/docente`;

  public getMisCargas(): Observable<DocenteCargaResponse[]> {
    return this.http.get<DocenteCargaResponse[]>(`${this.baseUrl}/mis-cargas`);
  }

  public getHistorialMisCargas(anio: number): Observable<DocenteCargaResponse[]> {
    return this.http.get<DocenteCargaResponse[]>(`${this.baseUrl}/historial/mis-cargas/${anio}`);
  }

  public getEstudiantesCarga(idCarga: number): Observable<DocenteEstudianteResponse[]> {
    return this.http.get<DocenteEstudianteResponse[]>(`${this.baseUrl}/cargas/${idCarga}/estudiantes`);
  }

  public getCortesCarga(idCarga: number): Observable<CorteResponse[]> {
    return this.http.get<CorteResponse[]>(`${this.baseUrl}/cargas/${idCarga}/cortes`);
  }

  public getCalificacionesCarga(idCarga: number): Observable<CalificacionResponse[]> {
    return this.http.get<CalificacionResponse[]>(`${this.baseUrl}/cargas/${idCarga}/calificaciones`);
  }

  public guardarCalificacion(data: CalificacionUpsertRequest): Observable<CalificacionResponse> {
    return this.http.post<CalificacionResponse>(`${this.baseUrl}/calificaciones`, data);
  }
}
