import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AsignaturaRequest,
  AsignaturaResponse,
  CargaAcademicaRequest,
  CargaAcademicaResponse,
  CorteConfigItem,
  CorteResponse,
  CursoRequest,
  CursoResponse,
  DocenteCreateRequest,
  DocenteResponse,
  DocenteUpdateRequest,
  EstudianteCreateRequest,
  EstudianteResponse,
  EstudianteUpdateRequest,
  MatriculaRequest,
  MatriculaResponse
} from '../models/academic.models';
import { MessageResponse } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/admin`;

  // ==================== ESTUDIANTES ====================
  public getEstudiantes(search?: string, limit?: number): Observable<EstudianteResponse[]> {
    let url = `${this.baseUrl}/estudiantes`;
    const params: string[] = [];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (limit) params.push(`limit=${limit}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return this.http.get<EstudianteResponse[]>(url);
  }

  public buscarEstudiantes(q: string, limit: number = 15): Observable<EstudianteResponse[]> {
    return this.http.get<EstudianteResponse[]>(
      `${this.baseUrl}/estudiantes/buscar?q=${encodeURIComponent(q)}&limit=${limit}`
    );
  }

  public getEstudiante(id: number): Observable<EstudianteResponse> {
    return this.http.get<EstudianteResponse>(`${this.baseUrl}/estudiantes/${id}`);
  }

  public createEstudiante(data: EstudianteCreateRequest): Observable<EstudianteResponse> {
    return this.http.post<EstudianteResponse>(`${this.baseUrl}/estudiantes`, data);
  }

  public updateEstudiante(id: number, data: EstudianteUpdateRequest): Observable<EstudianteResponse> {
    return this.http.put<EstudianteResponse>(`${this.baseUrl}/estudiantes/${id}`, data);
  }

  public deleteEstudiante(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.baseUrl}/estudiantes/${id}`);
  }

  // ==================== DOCENTES ====================
  public getDocentes(): Observable<DocenteResponse[]> {
    return this.http.get<DocenteResponse[]>(`${this.baseUrl}/docentes`);
  }

  public getDocente(id: number): Observable<DocenteResponse> {
    return this.http.get<DocenteResponse>(`${this.baseUrl}/docentes/${id}`);
  }

  public createDocente(data: DocenteCreateRequest): Observable<DocenteResponse> {
    return this.http.post<DocenteResponse>(`${this.baseUrl}/docentes`, data);
  }

  public updateDocente(id: number, data: DocenteUpdateRequest): Observable<DocenteResponse> {
    return this.http.put<DocenteResponse>(`${this.baseUrl}/docentes/${id}`, data);
  }

  public deleteDocente(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.baseUrl}/docentes/${id}`);
  }

  // ==================== ASIGNATURAS (CATÁLOGO) ====================
  public getAsignaturas(): Observable<AsignaturaResponse[]> {
    return this.http.get<AsignaturaResponse[]>(`${this.baseUrl}/asignaturas`);
  }

  public getAsignatura(id: number): Observable<AsignaturaResponse> {
    return this.http.get<AsignaturaResponse>(`${this.baseUrl}/asignaturas/${id}`);
  }

  public createAsignatura(data: AsignaturaRequest): Observable<AsignaturaResponse> {
    return this.http.post<AsignaturaResponse>(`${this.baseUrl}/asignaturas`, data);
  }

  public updateAsignatura(id: number, data: AsignaturaRequest): Observable<AsignaturaResponse> {
    return this.http.put<AsignaturaResponse>(`${this.baseUrl}/asignaturas/${id}`, data);
  }

  public deleteAsignatura(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.baseUrl}/asignaturas/${id}`);
  }

  // ==================== CURSOS (GRADOS Y GRUPOS) ====================
  public getCursos(): Observable<CursoResponse[]> {
    return this.http.get<CursoResponse[]>(`${this.baseUrl}/cursos`);
  }

  public getCurso(id: number): Observable<CursoResponse> {
    return this.http.get<CursoResponse>(`${this.baseUrl}/cursos/${id}`);
  }

  public createCurso(data: CursoRequest): Observable<CursoResponse> {
    return this.http.post<CursoResponse>(`${this.baseUrl}/cursos`, data);
  }

  public updateCurso(id: number, data: CursoRequest): Observable<CursoResponse> {
    return this.http.put<CursoResponse>(`${this.baseUrl}/cursos/${id}`, data);
  }

  public deleteCurso(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.baseUrl}/cursos/${id}`);
  }

  public getHistorialCursos(anio: number): Observable<CursoResponse[]> {
    return this.http.get<CursoResponse[]>(`${this.baseUrl}/historial/cursos/${anio}`);
  }

  // ==================== CARGA ACADÉMICA & CORTES ====================
  public getCargasAcademicas(): Observable<CargaAcademicaResponse[]> {
    return this.http.get<CargaAcademicaResponse[]>(`${this.baseUrl}/cargas-academicas`);
  }

  public getHistorialCargas(anio: number): Observable<CargaAcademicaResponse[]> {
    return this.http.get<CargaAcademicaResponse[]>(`${this.baseUrl}/historial/cargas-academicas/${anio}`);
  }

  public createCargaAcademica(data: CargaAcademicaRequest): Observable<CargaAcademicaResponse> {
    return this.http.post<CargaAcademicaResponse>(`${this.baseUrl}/cargas-academicas`, data);
  }

  public deleteCargaAcademica(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.baseUrl}/cargas-academicas/${id}`);
  }

  public getCortesCarga(idCarga: number): Observable<CorteResponse[]> {
    return this.http.get<CorteResponse[]>(`${this.baseUrl}/cargas-academicas/${idCarga}/cortes`);
  }

  public configurarCortesCarga(idCarga: number, cortes: CorteConfigItem[]): Observable<CorteResponse[]> {
    return this.http.post<CorteResponse[]>(`${this.baseUrl}/cargas-academicas/${idCarga}/cortes`, cortes);
  }

  // ==================== MATRÍCULAS ====================
  public getMatriculas(): Observable<MatriculaResponse[]> {
    return this.http.get<MatriculaResponse[]>(`${this.baseUrl}/matriculas`);
  }

  public createMatricula(data: MatriculaRequest): Observable<MatriculaResponse> {
    return this.http.post<MatriculaResponse>(`${this.baseUrl}/matriculas`, data);
  }

  public deleteMatricula(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.baseUrl}/matriculas/${id}`);
  }

  public getHistorialMatriculas(anio: number): Observable<MatriculaResponse[]> {
    return this.http.get<MatriculaResponse[]>(`${this.baseUrl}/historial/matriculas/${anio}`);
  }
}
