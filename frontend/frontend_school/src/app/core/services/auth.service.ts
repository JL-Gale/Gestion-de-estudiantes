import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CambiarPasswordRequest,
  LoginRequest,
  LoginResponse,
  MessageResponse,
  RecuperarPasswordRequest,
  Role
} from '../models/auth.models';

const TOKEN_KEY = 'school_auth_token';
const USER_KEY = 'school_auth_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private tokenSignal = signal<string | null>(this.getStoredToken());
  private userSignal = signal<LoginResponse | null>(this.getStoredUser());

  public token = this.tokenSignal.asReadonly();
  public currentUser = this.userSignal.asReadonly();
  public isAuthenticated = computed(() => !!this.tokenSignal());
  public userRole = computed(() => this.userSignal()?.rol ?? null);

  public login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap((response) => {
        this.saveSession(response);
      })
    );
  }

  public recuperarPassword(data: RecuperarPasswordRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${environment.apiUrl}/auth/recuperar-password`, data);
  }

  public cambiarPassword(data: CambiarPasswordRequest): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(`${environment.apiUrl}/cuenta/cambiar-password`, data);
  }

  public redirectByRole(role?: Role | null): void {
    const targetRole = role ?? this.userRole();
    if (targetRole === 'ADMIN') {
      this.router.navigate(['/admin/dashboard']);
    } else if (targetRole === 'DOCENTE') {
      this.router.navigate(['/docente/mis-cargas']);
    } else if (targetRole === 'ESTUDIANTE') {
      this.router.navigate(['/estudiante/mis-notas']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  public logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }

  private saveSession(response: LoginResponse): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response));
    }
    this.tokenSignal.set(response.token);
    this.userSignal.set(response);
  }

  private getStoredToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }

  private getStoredUser(): LoginResponse | null {
    if (typeof localStorage !== 'undefined') {
      const data = localStorage.getItem(USER_KEY);
      if (data) {
        try {
          return JSON.parse(data) as LoginResponse;
        } catch {
          return null;
        }
      }
    }
    return null;
  }
}
