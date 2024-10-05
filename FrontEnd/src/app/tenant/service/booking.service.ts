import {computed, inject, Injectable, signal, WritableSignal} from '@angular/core';
import {State} from "../../core/model/state.model";
import {HttpClient, HttpParams} from "@angular/common/http";
import {BookedDatesDTOFromClient, BookedDatesDTOFromServer, BookedListing, CreateBooking} from "../model/booking.model";
import {environment} from "../../../environments/environment";
import {map} from "rxjs";
import dayjs from "dayjs";

@Injectable({
  providedIn: 'root'
})

/**
 * BookingService is responsible for managing booking-related operations such as
 * creating new bookings and checking the availability of bookings for a specific listing.
 * It utilizes Angular's `HttpClient` for making HTTP requests and signals for managing state.
 */
export class BookingService {

  private http = inject(HttpClient);

  /**
   * Signal to hold the state of the booking creation process.
   * Initialized with an empty state using the `State` helper.
   */
  private createBooking$: WritableSignal<State<boolean>>
    = signal(State.Builder<boolean>().forInit());

  // Computed signal to expose the create booking state publicly
  createBookingSig = computed(() => this.createBooking$());

  /**
   * Signal to hold the state of checking booking availability.
   * Initialized with an empty state using the `State` helper.
   */
  private checkAvailability$: WritableSignal<State<Array<BookedDatesDTOFromClient>>>
    = signal(State.Builder<Array<BookedDatesDTOFromClient>>().forInit());

  // Computed signal to expose the availability check state publicly
  checkAvailabilitySig = computed(() => this.checkAvailability$());




  private getBookedListing$: WritableSignal<State<Array<BookedListing>>>
    = signal(State.Builder<Array<BookedListing>>().forInit());
  getBookedListingSig = computed(() => this.getBookedListing$());

  private cancel$: WritableSignal<State<string>>
    = signal(State.Builder<string>().forInit());
  cancelSig = computed(() => this.cancel$());

  private getBookedListingForLandlord$: WritableSignal<State<Array<BookedListing>>>
    = signal(State.Builder<Array<BookedListing>>().forInit());
  getBookedListingForLandlordSig = computed(() => this.getBookedListingForLandlord$());


  /**
   * Sends a POST request to the backend to create a new booking.
   *
   * @param newBooking - The details of the booking to be created, sent as a `CreateBooking` object.
   * The booking creation result is stored in the `createBooking$` signal.
   */
  create(newBooking: CreateBooking) {
    this.http.post<boolean>(`${environment.API_URL}/booking/create`, newBooking)
      .subscribe({
        next: created => this.createBooking$.set(State.Builder<boolean>().forSuccess(created)),
        error: err => this.createBooking$.set(State.Builder<boolean>().forError(err)),
      });
  }


  /**
   * Sends a GET request to check the availability of bookings for a specific listing.
   * The listing's public ID is passed as a query parameter, and the availability data is
   * returned as an array of `BookedDatesDTOFromServer`, which is mapped to `BookedDatesDTOFromClient`.
   *
   * @param publicId - The public ID of the listing to check availability for.
   * The result is stored in the `checkAvailability$` signal.
   */
  checkAvailability(publicId: string): void {
    const params = new HttpParams().set("listingPublicId", publicId);
    this.http.get<Array<BookedDatesDTOFromServer>>(`${environment.API_URL}/booking/check-availability`, {params})
      .pipe(
        map(this.mapDateToDayJS())
      ).subscribe({
      next: bookedDates =>
        this.checkAvailability$.set(State.Builder<Array<BookedDatesDTOFromClient>>().forSuccess(bookedDates)),
      error: err => this.checkAvailability$.set(State.Builder<Array<BookedDatesDTOFromClient>>().forError(err))
    })
  }

  /**
   * Utility function that maps dates in the `BookedDatesDTOFromServer` array to DayJS objects.
   * This is used to convert server date strings to DayJS instances for easier date manipulation.
   *
   * @returns A function that maps each `BookedDatesDTOFromServer` to `BookedDatesDTOFromClient`.
   */
  private mapDateToDayJS = () => {
    return (bookedDates: Array<BookedDatesDTOFromServer>): Array<BookedDatesDTOFromClient> => {
      return bookedDates.map(reservedDate => this.convertDateToDayJS(reservedDate))
    }
  }

  /**
   * Converts a `BookedDatesDTOFromServer` object to `BookedDatesDTOFromClient` by transforming
   * date fields (`startDate`, `endDate`) into DayJS objects.
   *
   * @param dto - The server DTO containing booking dates as strings.
   * @returns A client DTO with `startDate` and `endDate` as DayJS objects.
   */
  private convertDateToDayJS<T extends BookedDatesDTOFromServer>(dto: T): BookedDatesDTOFromClient {
    return {
      ...dto,
      startDate: dayjs(dto.startDate),
      endDate: dayjs(dto.endDate),
    };
  }

  /**
   * Resets the create booking signal to its initial state. This is useful for
   * clearing any previous booking state, such as after a form submission or when navigating away.
   */
  resetCreateBooking() {
    this.createBooking$.set(State.Builder<boolean>().forInit());
  }


  getBookedListing(): void {
    this.http.get<Array<BookedListing>>(`${environment.API_URL}/booking/get-booked-listing`)
      .subscribe({
        next: bookedListings =>
          this.getBookedListing$.set(State.Builder<Array<BookedListing>>().forSuccess(bookedListings)),
        error: err => this.getBookedListing$.set(State.Builder<Array<BookedListing>>().forError(err)),
      });
  }

  cancel(bookingPublicId: string, listingPublicId: string, byLandlord: boolean): void {
    const params = new HttpParams()
      .set("bookingPublicId", bookingPublicId)
      .set("listingPublicId", listingPublicId)
      .set("byLandlord", byLandlord);
    this.http.delete<string>(`${environment.API_URL}/booking/cancel`, {params})
      .subscribe({
        next: canceledPublicId => this.cancel$.set(State.Builder<string>().forSuccess(canceledPublicId)),
        error: err => this.cancel$.set(State.Builder<string>().forError(err)),
      });
  }

  resetCancel(): void {
    this.cancel$.set(State.Builder<string>().forInit());
  }

  getBookedListingForLandlord(): void {
    this.http.get<Array<BookedListing>>(`${environment.API_URL}/booking/get-booked-listing-for-landlord`)
      .subscribe({
        next: bookedListings =>
          this.getBookedListingForLandlord$.set(State.Builder<Array<BookedListing>>().forSuccess(bookedListings)),
        error: err => this.getBookedListingForLandlord$.set(State.Builder<Array<BookedListing>>().forError(err)),
      });
  }






}
