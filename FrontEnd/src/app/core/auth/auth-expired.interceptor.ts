import {HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest} from "@angular/common/http";
import {inject} from "@angular/core";
import {AuthService} from "./auth.service";
import {tap} from "rxjs";

/**
 * HTTP Interceptor to handle expired authentication sessions.
 * Redirects to the login page if a 401 Unauthorized error occurs
 * and the request is not related to the authentication API.
 */
export const authExpired: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  return next(req).pipe(
    tap({
      error: (err: HttpErrorResponse) => {
        if(err.status === 401 && err.url && !err.url.includes("api/auth") && authService.isAuthenticated()) {
          authService.login();
        }
      }
    })
  )
}
