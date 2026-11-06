// ==================== ESTUDIANTE ====================
export interface EstudianteCreateRequest {
  numero_documento: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  telefono: string;
}

export interface EstudianteUpdateRequest {
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  telefono: string;
}

export interface EstudianteResponse {
  idEstudiante: number;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  telefono: string;
  correoInstitucional: string;
  idUsuario: number;
}

// ==================== DOCENTE ====================
export interface DocenteCreateRequest {
  numero_documento: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  telefono: string;
}

export interface DocenteUpdateRequest {
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  telefono: string;
}

export interface DocenteResponse {
  idDocente: number;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  telefono: string;
  correoInstitucional: string;
  idUsuario: number;
}

// ==================== ASIGNATURA ====================
export interface AsignaturaRequest {
  nombre: string;
}

export interface AsignaturaResponse {
  idAsignatura: number;
  nombre: string;
}

// ==================== CURSO ====================
export interface CursoRequest {
  grado: number;
  grupo: string;
  anio_lectivo: number;
}

export interface CursoResponse {
  idCurso: number;
  grado: number;
  grupo: string;
  anioLectivo: number;
  nombreCompleto: string;
}

// ==================== CARGA ACADEMICA & CORTES ====================
export interface CargaAcademicaRequest {
  id_curso: number;
  id_asignatura: number;
  id_docente: number;
}

export interface CargaAcademicaResponse {
  idCarga: number;
  idCurso: number;
  curso: string;
  idAsignatura: number;
  asignatura: string;
  idDocente: number;
  docente: string;
}

export interface CorteConfigItem {
  nombre: string;
  porcentaje: number;
  fechaInicioCalificacion?: string | null;
  fechaFinCalificacion?: string | null;
  fecha_inicio_calificacion?: string | null;
  fecha_fin_calificacion?: string | null;
}

export interface CorteResponse {
  idCorte: number;
  idCarga: number;
  nombre: string;
  porcentaje: number;
  fechaInicioCalificacion?: string;
  fechaFinCalificacion?: string;
  fecha_inicio_calificacion?: string;
  fecha_fin_calificacion?: string;
}

// ==================== MATRICULA ====================
export interface MatriculaRequest {
  id_estudiante: number;
  id_curso: number;
}

export interface MatriculaResponse {
  idMatricula: number;
  idEstudiante: number;
  nombreEstudiante: string;
  numeroDocumento: string;
  idCurso: number;
  curso: string;
  fechaMatricula: string;
}

// ==================== DOCENTE PANEL ====================
export interface DocenteCargaResponse {
  idCarga: number;
  idCurso: number;
  curso: string;
  idAsignatura: number;
  asignatura: string;
}

export interface DocenteEstudianteResponse {
  idEstudiante: number;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  telefono: string;
}

export interface CalificacionUpsertRequest {
  id_estudiante: number;
  id_corte: number;
  nota: number;
  observaciones?: string;
}

export interface CalificacionResponse {
  idCalificacion: number;
  idEstudiante: number;
  nombreEstudiante: string;
  idCorte: number;
  nombreCorte: string;
  porcentajeCorte: number;
  nota: number;
  observaciones?: string;
}

// ==================== ESTUDIANTE PANEL ====================
export interface EstudianteCursoResponse {
  idCurso: number;
  grado: number;
  grupo: string;
  anioLectivo: number;
  nombreCompleto: string;
  fechaMatricula: string;
}

export interface CorteNotaReporte {
  idCorte: number;
  nombreCorte: string;
  porcentaje: number;
  idCalificacion: number | null;
  nota: number | null;
  observaciones: string | null;
}

export interface EstudianteMateriaReporte {
  idCarga: number;
  idAsignatura: number;
  nombreAsignatura: string;
  nombreDocente: string;
  cortes: CorteNotaReporte[];
  promedioPonderadoAcumulado: number;
  porcentajeEvaluado: number;
}

export interface EstudianteNotasResponse {
  idEstudiante: number;
  nombreEstudiante: string;
  numeroDocumento: string;
  curso: string;
  materias: EstudianteMateriaReporte[];
}
