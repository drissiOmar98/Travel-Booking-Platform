import {Component, effect, inject, OnDestroy, OnInit} from '@angular/core';
import {CardListingComponent} from "../../shared/card-listing/card-listing.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {BookedListing} from "../model/booking.model";
import {ToastService} from "../../layout/toast.service";
import {BookingService} from "../service/booking.service";

@Component({
  selector: 'app-booked-listing',
  standalone: true,
  imports: [
    CardListingComponent,
    FaIconComponent
  ],
  templateUrl: './booked-listing.component.html',
  styleUrl: './booked-listing.component.scss'
})

/**
 * The BookedListingComponent manages the display of booked listings for the authenticated user
 * and handles booking cancellations. It listens to state changes for fetching and canceling bookings
 * and provides feedback to the user through toast notifications.
 */
export class BookedListingComponent  implements OnInit, OnDestroy{

  bookingService = inject(BookingService);
  toastService = inject(ToastService);
  bookedListings = new Array<BookedListing>();

  loading = false;


  constructor() {
    this.listenFetchBooking();
    this.listenCancelBooking()
  }

  /**
   * Lifecycle hook that runs when the component is destroyed.
   * Resets the booking cancellation state when leaving the component.
   */
  ngOnDestroy(): void {
    this.bookingService.resetCancel();
  }

  /**
   * Lifecycle hook that runs when the component is initialized.
   * Fetches the user's booked listings.
   */
  ngOnInit(): void {
    this.fetchBooking();
  }

  /**
   * Fetches the booked listings for the currently authenticated user.
   * Sets the loading state to true while fetching data.
   */
  private fetchBooking() {
    this.loading = true; // Show loading indicator
    this.bookingService.getBookedListing(); // Request the booked listings from the service
  }

  /**
   * Cancels a specific booking based on the provided booking information.
   * Sets the loading state for the booking being canceled and sends a cancellation request.
   *
   * @param bookedListing - The booked listing object to be canceled.
   */
  onCancelBooking(bookedListing: BookedListing) {
    bookedListing.loading = true; // Show loading indicator for the specific booking
    this.bookingService.cancel(bookedListing.bookingPublicId, bookedListing.listingPublicId, false); // Send cancel request
  }

  /**
   * Listens to changes in the booked listings state.
   * Updates the booked listings or shows an error message if fetching fails.
   */
  private listenFetchBooking() {
    effect(() => {
      // Get the state of booked listings from the booking service
      const bookedListingsState = this.bookingService.getBookedListingSig();

      // Handle successful fetching of booked listings
      if (bookedListingsState.status === "OK") {
        this.loading = false; // Hide loading indicator
        this.bookedListings = bookedListingsState.value!; // Update booked listings with fetched data
      }
      // Handle error during fetching of booked listings
      else if (bookedListingsState.status === "ERROR") {
        this.loading = false; // Hide loading indicator
        this.toastService.send({
          severity: "error", summary: "Error when fetching the listing", // Show error notification
        });
      }
    });
  }

  /**
   * Listens to changes in the booking cancellation state.
   * Updates the list of bookings or shows an error message if cancellation fails.
   */
  private listenCancelBooking() {
    effect(() => {
      // Get the state of the cancellation from the booking service
      const cancelState = this.bookingService.cancelSig();

      // Handle successful booking cancellation
      if (cancelState.status === "OK") {
        const listingToDeleteIndex = this.bookedListings.findIndex(
          listing => listing.bookingPublicId === cancelState.value
        );
        this.bookedListings.splice(listingToDeleteIndex, 1); // Remove canceled listing from the list
        this.toastService.send({
          severity: "success", summary: "Successfully cancelled booking", // Show success notification
        });
      }
      // Handle error during booking cancellation
      else if (cancelState.status === "ERROR") {
        const listingToDeleteIndex = this.bookedListings.findIndex(
          listing => listing.bookingPublicId === cancelState.value
        );
        this.bookedListings[listingToDeleteIndex].loading = false; // Reset loading state for the listing
        this.toastService.send({
          severity: "error", summary: "Error when canceling your booking", // Show error notification
        });
      }
    });
  }


}
