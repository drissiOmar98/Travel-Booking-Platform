import {computed, inject, Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {CardListing, CreatedListing, NewListing} from "./model/listing.model";
import {State} from "../core/model/state.model";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class LandlordListingService {


  http = inject(HttpClient);

  /**
   * A writable signal to manage the state of the 'create listing' operation.
   * Initially, it is set to a state indicating that no listing has been created yet.
   *
   * WritableSignal<State<CreatedListing>>: Tracks the state of the created listing,
   * it can hold different states such as 'init', 'loading', 'success', or 'error'.
   */
  private create$: WritableSignal<State<CreatedListing>> = signal(State.Builder<CreatedListing>().forInit());

  /**
   * Computed signal to access the current state of the create listing operation.
   * It provides a read-only reference to the writable signal for components to subscribe to.
   *
   * Computed(() => this.create$()): Returns the current state of the `create$` signal.
   */
  createSig = computed(() => this.create$());

  /**
   * A writable signal to manage the state of the 'get all listings' operation.
   * It holds the state for fetching all listings related to the landlord.
   *
   * WritableSignal<State<Array<CardListing>>>: Manages the state of fetching all listings
   * in an array, tracking states like 'init', 'loading', 'success', or 'error'.
   */
  private getAll$: WritableSignal<State<Array<CardListing>>> = signal(State.Builder<Array<CardListing>>().forInit());

  /**
   * Computed signal to access the current state of the 'get all listings' operation.
   * It provides a read-only reference to the writable signal for other components.
   *
   * Computed(() => this.getAll$()): Returns the current state of the `getAll$` signal.
   */
  getAllSig = computed(() => this.getAll$());

  /**
   * A writable signal to manage the state of the 'delete listing' operation.
   * It holds the state for tracking the deletion of a listing, either in progress or completed.
   *
   * WritableSignal<State<string>>: Tracks the state of the listing deletion process.
   * It can hold values such as 'init', 'loading', 'success', or 'error', with the success state returning a string (e.g., the ID of the deleted listing).
   */
  private delete$: WritableSignal<State<string>> = signal(State.Builder<string>().forInit());

  /**
   * Computed signal to access the current state of the 'delete listing' operation.
   * This provides a read-only reference to the writable signal for other components to use.
   *
   * Computed(() => this.delete$()): Returns the current state of the `delete$` signal.
   */
  deleteSig = computed(() => this.delete$());




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



  /**
   * Fetches all listings related to the landlord.
   *
   * This method makes an HTTP GET request to the backend to retrieve all listings associated
   * with the current landlord. On success, it updates the `getAll$` writable signal to hold the listings.
   * If an error occurs, it sets an error state in the `create$` signal (which might be a typo and should
   * probably set the error in `getAll$` instead).
   *
   * @returns void
   */
  getAll(): void {
    this.http.get<Array<CardListing>>(`${environment.API_URL}/landlord-listing/get-all`)
      .subscribe({
        next: listings => this.getAll$.set(State.Builder<Array<CardListing>>().forSuccess(listings)),
        error: err => this.create$.set(State.Builder<CreatedListing>().forError(err)),
      });
  }


  /**
   * Deletes a specific listing by its public ID.
   *
   * This method sends an HTTP DELETE request to remove a listing identified by the given public ID.
   * On success, it updates the `delete$` writable signal with the public ID of the deleted listing.
   * If an error occurs, the error is set in the `create$` signal (which again, might be a typo and should
   * likely target `delete$`).
   *
   * @param publicId The public ID of the listing to be deleted.
   * @returns void
   */
  delete(publicId: string): void {
    const params = new HttpParams().set("publicId", publicId);
    this.http.delete<string>(`${environment.API_URL}/landlord-listing/delete`, {params})
      .subscribe({
        next: publicId => this.delete$.set(State.Builder<string>().forSuccess(publicId)),
        error: err => this.create$.set(State.Builder<CreatedListing>().forError(err)),
      });
  }


  /**
   * Resets the delete signal to its initial state.
   *
   * This method resets the `delete$` signal to its initial state, essentially indicating that
   * no delete operation is currently in progress.
   *
   * @returns void
   */
  resetDelete() {
    this.delete$.set(State.Builder<string>().forInit());
  }
}
