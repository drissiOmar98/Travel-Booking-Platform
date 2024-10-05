import {Component, effect, inject, OnDestroy, OnInit} from '@angular/core';
import {BookingService} from "../../tenant/service/booking.service";
import {ToastService} from "../../layout/toast.service";
import {BookedListing} from "../../tenant/model/booking.model";
import {CardListingComponent} from "../../shared/card-listing/card-listing.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [
    CardListingComponent,
    FaIconComponent
  ],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.scss'
})

/**
 * The ReservationComponent is responsible for displaying the listings reserved by
 * tenants from the perspective of a landlord. It manages reservation fetching and
 * cancellation operations, and uses toast notifications to provide user feedback.
 */
export class ReservationComponent  implements OnInit, OnDestroy{

  bookingService = inject(BookingService);
  toastService = inject(ToastService);

  reservationListings = new Array<BookedListing>();

  loading = false;


  constructor() {
    this.listenToFetchReservation();
    this.listenToCancelReservation();
  }

  /**
   * Lifecycle hook that runs when the component is destroyed.
   * Resets the cancellation state to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.bookingService.resetCancel();
  }

  /**
   * Lifecycle hook that runs when the component is initialized.
   * Initiates the reservation fetching process for the landlord.
   */
  ngOnInit(): void {
    this.fetchReservation();
  }

  /**
   * Fetches reservations made by tenants for the landlord's listings.
   * Sets the loading state to true while data is being retrieved.
   */
  private fetchReservation() {
    this.loading = true; // Show loading indicator
    this.bookingService.getBookedListingForLandlord(); // Request reservations from the service
  }

  /**
   * Listens for reservation cancellation events and updates the view accordingly.
   * Removes the canceled reservation or displays an error message if cancellation fails.
   */
  private listenToCancelReservation() {
    effect(() => {
      // Get the cancellation state from the booking service
      const cancelState = this.bookingService.cancelSig();

      // Handle successful reservation cancellation
      if (cancelState.status === "OK") {
        const listingToDeleteIndex = this.reservationListings.findIndex(
          listing => listing.bookingPublicId === cancelState.value
        );
        this.reservationListings.splice(listingToDeleteIndex, 1); // Remove canceled reservation from the list
        this.toastService.send({
          severity: "success", summary: "Successfully cancelled reservation", // Show success notification
        });
      }
      // Handle error during reservation cancellation
      else if (cancelState.status === "ERROR") {
        const listingToDeleteIndex = this.reservationListings.findIndex(
          listing => listing.bookingPublicId === cancelState.value
        );
        this.reservationListings[listingToDeleteIndex].loading = false; // Reset loading state for the listing
        this.toastService.send({
          severity: "error", summary: "Error when canceling reservation", // Show error notification
        });
      }
    });
  }

  /**
   * Listens for reservation fetching events and updates the reservation list.
   * Updates the component with the fetched data or shows an error message if fetching fails.
   */
  private listenToFetchReservation() {
    effect(() => {
      // Get the reservation fetch state from the booking service
      const reservedListingsState = this.bookingService.getBookedListingForLandlordSig();

      // Handle successful fetching of reservations
      if (reservedListingsState.status === "OK") {
        this.loading = false; // Hide loading indicator
        this.reservationListings = reservedListingsState.value!; // Update reservations with fetched data
      }
      // Handle error during reservation fetching
      else if (reservedListingsState.status === "ERROR") {
        this.loading = false; // Hide loading indicator
        this.toastService.send({
          severity: "error", summary: "Error when fetching the reservation", // Show error notification
        });
      }
    });
  }

  /**
   * Cancels a reservation by setting the loading state and sending a cancel request.
   *
   * @param reservation - The reservation object to be canceled.
   */
  onCancelReservation(reservation: BookedListing): void {
    reservation.loading = true; // Show loading indicator for the specific reservation
    this.bookingService.cancel(reservation.bookingPublicId, reservation.listingPublicId, true); // Send cancel request for the reservation
  }

}
