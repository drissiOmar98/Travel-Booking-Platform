import {computed, inject, Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient, HttpStatusCode} from "@angular/common/http";
import {State} from "./model/state.model";
import {User} from "./model/user.model";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  http = inject(HttpClient);

  location = inject(Location);

  notConnected = "NOT_CONNECTED";



  constructor() { }
}
