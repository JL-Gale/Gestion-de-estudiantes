import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/auth.models';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as Role[] | undefined;
  const currentRole = authService.userRole();

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (allowedRoles && currentRole && allowedRoles.includes(currentRole)) {
    return true;
  }

  authService.redirectByRole();
  return false;
};

