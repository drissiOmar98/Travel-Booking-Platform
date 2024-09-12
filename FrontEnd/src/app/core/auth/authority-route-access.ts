import {ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot} from "@angular/router";
import {inject} from "@angular/core";
import {AuthService} from "./auth.service";
import {map} from "rxjs";

/**
 * Route guard to check user authority before accessing a route.
 * Ensures that the user has the required authorities to access the route.
 * If the user is not authenticated, redirects to the login page.
 */
export const authorityRouteAccess: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  return authService.fetchHttpUser(false).pipe(
    map(connectedUser => {
      if (connectedUser) {
        const authorities = next.data['authorities'];
        return !authorities || authorities.length === 0 || authService.hasAnyAuthority(authorities);
      }
      authService.login();
      return false;
    })
  );
}
