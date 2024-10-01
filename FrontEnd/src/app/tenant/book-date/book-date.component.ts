import {Component, effect, inject, input, OnDestroy, OnInit} from '@angular/core';
import {CalendarModule} from "primeng/calendar";
import {MessageModule} from "primeng/message";
import {Listing} from "../../landlord/model/listing.model";
import {BookingService} from "../service/booking.service";
import {ToastService} from "../../layout/toast.service";
import {AuthService} from "../../core/auth/auth.service";
import {Router} from "@angular/router";
import dayjs from "dayjs";
import {BookedDatesDTOFromClient, CreateBooking} from "../model/booking.model";
import {CurrencyPipe} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-book-date',
  standalone: true,
  imports: [
    CalendarModule,
    MessageModule,
    CurrencyPipe,
    FormsModule,
  ],
  templateUrl: './book-date.component.html',
  styleUrl: './book-date.component.scss'
})

/**
 * BookDateComponent handles booking date selection, validation, and booking creation for a listing.
 * It interacts with the BookingService to check availability and create bookings, while displaying feedback via the ToastService.
 */
export class BookDateComponent implements OnInit, OnDestroy {

  listing = input.required<Listing>();
  listingPublicId = input.required<string>();

  bookingService = inject(BookingService);
  toastService = inject(ToastService);
  authService = inject(AuthService);
  router = inject(Router);

  // Array to store selected booking dates
  bookingDates = new Array<Date>();

  // Total price for the selected booking dates
  totalPrice = 0;

  // Minimum date that can be selected (current date)
  minDate = new Date();

  // Array to store dates that are already booked and unavailable for selection
  bookedDates = new Array<Date>();

  constructor() {
    this.listenToCheckAvailableDate();
    this.listenToCreateBooking()
  }


  /**
   * Lifecycle hook for cleaning up resources.
   * Resets the booking state when the component is destroyed to avoid state persistence.
   */
  ngOnDestroy(): void {
    this.bookingService.resetCreateBooking();
  }

  /**
   * Lifecycle hook to initialize component state.
   * It triggers a check for availability of dates for the current listing.
   */
  ngOnInit(): void {
    this.bookingService.checkAvailability(this.listingPublicId());
    this.listenToCheckAvailableDate(); // Listen for changes to availability state
    this.listenToCreateBooking(); // Listen for changes to booking creation state
  }

  /**
   * Handles date selection changes and calculates the total price based on the selected dates.
   *
   * @param newBookingDates - The new array of selected booking dates.
   */
  onDateChange(newBookingDates: Array<Date>) {
    this.bookingDates = newBookingDates;
    if (this.validateMakeBooking()) {
      const startBookingDateDayJS = dayjs(newBookingDates[0]);
      const endBookingDateDayJS = dayjs(newBookingDates[1]);
      this.totalPrice = endBookingDateDayJS.diff(startBookingDateDayJS, "days") * this.listing().price.value;
    } else {
      this.totalPrice = 0;
    }
  }

  /**
   * Validates whether a booking can be made with the selected dates.
   * Ensures there are two valid dates, the dates are different, and the user is authenticated.
   *
   * @returns True if the booking is valid, otherwise false.
   */
  validateMakeBooking() {
    return this.bookingDates.length === 2
      && this.bookingDates[0] !== null
      && this.bookingDates[1] !== null
      && this.bookingDates[0].getDate() !== this.bookingDates[1].getDate()
      && this.authService.isAuthenticated();
  }

  /**
   * Initiates the booking creation process.
   * Sends a request to the BookingService to create a new booking with the selected dates.
   */
  onNewBooking() {
    const newBooking: CreateBooking = {
      listingPublicId: this.listingPublicId(),
      startDate: this.bookingDates[0],
      endDate: this.bookingDates[1],
    }
    this.bookingService.create(newBooking);
  }

  /**
   * Effect listener to react to changes in the availability check state from BookingService.
   * Updates the list of booked dates or displays an error if the request fails.
   */
  private listenToCheckAvailableDate() {
    effect(() => {
      const checkAvailabilityState = this.bookingService.checkAvailabilitySig();
      if (checkAvailabilityState.status === "OK") {
        this.bookedDates = this.mapBookedDatesToDate(checkAvailabilityState.value!);
      } else if (checkAvailabilityState.status === "ERROR") {
        this.toastService.send({
          severity: "error", detail: "Error when fetching the not available dates", summary: "Error",
        });
      }
    });
  }


  /**
   * Maps the unavailable booked dates from the server format (`BookedDatesDTOFromClient`) to Date objects.
   *
   * @param bookedDatesDTOFromClients - Array of booked date DTOs received from the server.
   * @returns Array of unavailable Date objects.
   */
  private mapBookedDatesToDate(bookedDatesDTOFromClients: Array<BookedDatesDTOFromClient>): Array<Date> {
    const bookedDates = new Array<Date>();

    // For each booked date, retrieve all dates in the range and add them to the unavailable dates
    for (let bookedDate of bookedDatesDTOFromClients) {
      bookedDates.push(...this.getDatesInRange(bookedDate));
    }

    return bookedDates;
  }


  /**
   * Generates an array of Date objects for each day in the range between start and end date.
   *
   * @param bookedDate - A booked date range DTO with start and end date.
   * @returns Array of Date objects for each day in the booked date range.
   */
  private getDatesInRange(bookedDate: BookedDatesDTOFromClient) {
    const dates = new Array<Date>();

    let currentDate = bookedDate.startDate;
    while (currentDate <= bookedDate.endDate) {
      dates.push(currentDate.toDate());
      currentDate = currentDate.add(1, "day");
    }

    return dates;
  }

  /**
   * Effect listener to react to changes in the booking creation state from BookingService.
   * Displays success or error messages based on the booking creation result, and navigates to the booking page if successful.
   */
  private listenToCreateBooking() {
    effect(() => {
      const createBookingState = this.bookingService.createBookingSig();
      if (createBookingState.status === "OK") {
        this.toastService.send({
          severity: "success", detail: "Booking created successfully",
        });
        this.router.navigate(['/booking']);
      } else if (createBookingState.status === "ERROR") {
        this.toastService.send({
          severity: "error", detail: "Booking created failed",
        });
      }
    });
  }


}
