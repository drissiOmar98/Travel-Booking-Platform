import {computed, inject, Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient, HttpParams, HttpStatusCode} from "@angular/common/http";
import {State} from "./model/state.model";
import {User} from "./model/user.model";
import {Location} from "@angular/common";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  http = inject(HttpClient);

  // Injecting Location service to manage and manipulate URLs
  location = inject(Location);

  // A constant representing the "not connected" state for a user
  notConnected = "NOT_CONNECTED";

  // Writable signal to hold the user state, initially set as not connected
  private fetchUser$: WritableSignal<State<User>> =
    signal(State.Builder<User>().forSuccess({email: this.notConnected}));
  // Computed signal to access the current state of the fetched user
  fetchUser = computed(() => this.fetchUser$());

  /**
   * Fetches the authenticated user from the server, optionally forcing a resync.
   * Updates the fetchUser$ signal based on the result.
   *
   * @param forceResync - whether to forcefully resync the user data.
   */
  fetch(forceResync: boolean): void {
    this.fetchHttpUser(forceResync)
      .subscribe({
        next: user => this.fetchUser$.set(State.Builder<User>().forSuccess(user)),
        error: err => {
          // If unauthorized and the user is authenticated, set user as not connected
          if (err.status === HttpStatusCode.Unauthorized && this.isAuthenticated()) {
            this.fetchUser$.set(State.Builder<User>().forSuccess({email: this.notConnected}));
          } else {
            this.fetchUser$.set(State.Builder<User>().forError(err));
          }
        }
      })
  }

  /**
   * Redirects the user to the login page using the Okta authorization endpoint.
   */
  login(): void {
    location.href = `${location.origin}${this.location.prepareExternalUrl("oauth2/authorization/okta")}`;
  }


  /**
   * Logs the user out by calling the server's logout endpoint and resetting the user state.
   * Redirects the user to the logout URL returned by the server.
   */
  logout(): void {
    this.http.post(`${environment.API_URL}/auth/logout`, {})
      .subscribe({
        next: (response: any) => {
          this.fetchUser$.set(State.Builder<User>()
            .forSuccess({email: this.notConnected}));
          location.href = response.logoutUrl
        }
      })
  }

  /**
   * Checks if the current user is authenticated based on their email.
   *
   * @returns - true if the user is authenticated, false otherwise.
   */
  isAuthenticated(): boolean {
    if (this.fetchUser$().value) {
      // If the user's email is not "NOT_CONNECTED", they are authenticated
      return this.fetchUser$().value!.email !== this.notConnected;
    } else {
      return false;
    }
  }


  /**
   * Fetches the authenticated user's data from the server using an HTTP GET request.
   *
   * @param forceResync - a flag indicating whether to force a resync with the identity provider.
   * @returns - an observable that emits the user data.
   */
  fetchHttpUser(forceResync: boolean): Observable<User> {
    const params = new HttpParams().set('forceResync', forceResync);
    return this.http.get<User>(`${environment.API_URL}/auth/get-authenticated-user`, {params})
  }



  /**
   * Checks if the current user has any of the specified authorities (roles/permissions).
   *
   * @param authorities - a string or array of strings representing the required authorities.
   * @returns - true if the user has at least one of the specified authorities, false otherwise.
   */
  hasAnyAuthority(authorities: string[] | string): boolean {
    // If the user is not connected, return false
    if(this.fetchUser$().value!.email === this.notConnected) {
      return false;
    }
    if(!Array.isArray(authorities)) {
      authorities = [authorities];
    }
    // Check if the user has any of the specified authorities
    return this.fetchUser$().value!.authorities!
      .some((authority: string) => authorities.includes(authority));
  }



}
