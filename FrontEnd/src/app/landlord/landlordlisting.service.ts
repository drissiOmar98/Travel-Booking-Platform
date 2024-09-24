import {computed, inject, Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {CreatedListing, NewListing} from "./model/listing.model";
import {State} from "../core/model/state.model";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class LandlordlistingService {


  http = inject(HttpClient);

  // Creating a writable signal to manage the state of the created listing
  private create$: WritableSignal<State<CreatedListing>>
    = signal(State.Builder<CreatedListing>().forInit())
  // Computed property to access the current state of the create signal
  createSig = computed(() => this.create$());


  /**
   * Method to create a new listing with associated pictures.
   *
   * @param newListing The new listing data, including pictures.
   */
  create(newListing: NewListing): void {
    // Creating a FormData object to prepare the data for the HTTP request
    const formData = new FormData();

    // Loop through each picture and append it to the FormData
    for(let i = 0; i < newListing.pictures.length; ++i) {
      formData.append("picture-" + i, newListing.pictures[i].file);
    }
    // Clone the newListing object to avoid mutating the original data
    const clone = structuredClone(newListing);
    // Clear the pictures array from the clone since it's already appended
    clone.pictures = [];
    // Append the DTO as a JSON string to the FormData
    formData.append("dto", JSON.stringify(clone));
    this.http.post<CreatedListing>(`${environment.API_URL}/landlord-listing/create`,
      formData).subscribe({
      next: listing => this.create$.set(State.Builder<CreatedListing>().forSuccess(listing)),
      error: err => this.create$.set(State.Builder<CreatedListing>().forError(err)),
    });
  }

  /**
   * Method to reset the listing creation state.
   */
  resetListingCreation(): void {
    this.create$.set(State.Builder<CreatedListing>().forInit())
  }
}
