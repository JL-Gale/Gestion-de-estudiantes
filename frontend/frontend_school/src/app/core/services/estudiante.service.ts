import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EstudianteCursoResponse, EstudianteNotasResponse } from '../models/academic.models';

@Injectable({
  providedIn: 'root'
})
export class EstudianteService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/estudiante`;

  public getMiCurso(): Observable<EstudianteCursoResponse> {
    return this.http.get<EstudianteCursoResponse>(`${this.baseUrl}/mi-curso`);
  }

  public getMisNotas(): Observable<EstudianteNotasResponse> {
    return this.http.get<EstudianteNotasResponse>(`${this.baseUrl}/mis-notas`);
  }

  public getHistorialMisNotas(anio: number): Observable<EstudianteNotasResponse> {
    return this.http.get<EstudianteNotasResponse>(`${this.baseUrl}/historial/mis-notas/${anio}`);
  }
}
