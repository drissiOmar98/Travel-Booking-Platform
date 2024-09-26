import {computed, inject, Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {State} from "../../../../core/model/state.model";
import {Country} from "./country.model";
import {catchError, map, Observable, of, shareReplay, tap} from "rxjs";

@Injectable({
  providedIn: 'root'
})
/**
 * Service to manage country-related data and handle fetching countries from a JSON file.
 * Provides functionality to fetch all countries and get a country by its code.
 */
export class CountryService {

  http = inject(HttpClient);


  /**
   * Signal holding the state of the countries list. It is writable and allows tracking the current state.
   * Initialized with an empty list of countries in a 'not loaded' state.
   */
  private countries$: WritableSignal<State<Array<Country>>> =
    signal(State.Builder<Array<Country>>().forInit());

  /**
   * Computed signal that provides the current state of countries.
   * Other components can subscribe to this signal to get the latest state of countries.
   */
  countries = computed(() => this.countries$());

  /** Observable used to fetch country data from the JSON file. */
  private fetchCountry$ = new Observable<Array<Country>>();

  constructor() {
    this.initFetchGetAllCountries();
    this.fetchCountry$.subscribe();
  }

  /**
   * Initializes the process of fetching all countries from the local JSON file.
   * Sets the signal state to success if countries are successfully fetched.
   * If an error occurs during the fetch, the state is set to an error.
   * Shares the latest fetched result using `shareReplay` to avoid refetching on subsequent requests.
   */
  initFetchGetAllCountries(): void {
    this.fetchCountry$ = this.http.get<Array<Country>>("/assets/countries.json")
      .pipe(
        tap(countries =>
          this.countries$.set(State.Builder<Array<Country>>().forSuccess(countries))),
        catchError(err => {
          this.countries$.set(State.Builder<Array<Country>>().forError(err));
          return of(err);
        }),
        shareReplay(1) // Share the latest successful result with multiple subscribers
      );
  }

  /**
   * Gets a country by its code (cca3).
   * @param code - The country code (e.g., 'USA', 'FRA') to filter by.
   * @returns An observable containing the country object matching the code.
   */
  public getCountryByCode(code: string): Observable<Country> {
    return this.fetchCountry$.pipe(
      map(countries => countries.filter(country => country.cca3 === code)),
      map(countries => countries[0])
    );
  }
}
