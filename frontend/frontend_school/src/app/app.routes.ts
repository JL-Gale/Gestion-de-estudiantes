import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then((m) => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () =>
      import('./shared/components/layout/main-layout').then((m) => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      // ==================== ADMIN ROUTES ====================
      {
        path: 'admin/dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard').then((m) => m.AdminDashboardComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/estudiantes',
        loadComponent: () =>
          import('./features/admin/estudiantes/estudiantes-list').then((m) => m.EstudiantesListComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/docentes',
        loadComponent: () =>
          import('./features/admin/docentes/docentes-list').then((m) => m.DocentesListComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/asignaturas',
        loadComponent: () =>
          import('./features/admin/asignaturas/asignaturas-list').then((m) => m.AsignaturasListComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/cursos',
        loadComponent: () =>
          import('./features/admin/cursos/cursos-list').then((m) => m.CursosListComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/cargas-academicas',
        loadComponent: () =>
          import('./features/admin/cargas/cargas-list').then((m) => m.CargasListComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/matriculas',
        loadComponent: () =>
          import('./features/admin/matriculas/matriculas-list').then((m) => m.MatriculasListComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },

      // ==================== DOCENTE ROUTES ====================
      {
        path: 'docente/mis-cargas',
        loadComponent: () =>
          import('./features/docente/asignaturas/mis-asignaturas').then((m) => m.MisAsignaturasComponent),
        canActivate: [roleGuard],
        data: { roles: ['DOCENTE'] }
      },
      {
        path: 'docente/cargas/:idCarga/calificaciones',
        loadComponent: () =>
          import('./features/docente/calificaciones/planilla-calificaciones').then(
            (m) => m.PlanillaCalificacionesComponent
          ),
        canActivate: [roleGuard],
        data: { roles: ['DOCENTE'] }
      },
      {
        path: 'docente/asignaturas',
        redirectTo: 'docente/mis-cargas',
        pathMatch: 'full'
      },

      // ==================== ESTUDIANTE ROUTES ====================
      {
        path: 'estudiante/mis-notas',
        loadComponent: () =>
          import('./features/estudiante/notas/consolidado-notas').then((m) => m.ConsolidadoNotasComponent),
        canActivate: [roleGuard],
        data: { roles: ['ESTUDIANTE'] }
      },
      {
        path: 'estudiante/mi-curso',
        loadComponent: () =>
          import('./features/estudiante/asignaturas/mis-cursos').then((m) => m.MisCursosComponent),
        canActivate: [roleGuard],
        data: { roles: ['ESTUDIANTE'] }
      },
      {
        path: 'estudiante/notas',
        redirectTo: 'estudiante/mis-notas',
        pathMatch: 'full'
      },
      {
        path: 'estudiante/asignaturas',
        redirectTo: 'estudiante/mi-curso',
        pathMatch: 'full'
      },

      // ==================== DEFAULT REDIRECTS ====================
      {
        path: 'admin',
        redirectTo: 'admin/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'docente',
        redirectTo: 'docente/mis-cargas',
        pathMatch: 'full'
      },
      {
        path: 'estudiante',
        redirectTo: 'estudiante/mis-notas',
        pathMatch: 'full'
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'admin/dashboard'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
