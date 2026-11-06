export type Role = 'ADMIN' | 'DOCENTE' | 'ESTUDIANTE';

export interface LoginRequest {
  correo_institucional: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  idUsuario: number;
  correoInstitucional: string;
  rol: Role;
}

export interface RecuperarPasswordRequest {
  correo_institucional: string;
  numero_documento: string;
  fecha_nacimiento: string;
}

export interface CambiarPasswordRequest {
  contrasenaActual: string;
  nuevaContrasena: string;
}

export interface MessageResponse {
  message: string;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  details?: Record<string, string>;
}
