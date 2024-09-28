import {Component, effect, EventEmitter, inject, input, Output} from '@angular/core';
import {CardListing} from "../../landlord/model/listing.model";
import {BookedListing} from "../../tenant/model/booking.model";
import {CountryService} from "../../landlord/properties-create/step/location-step/country.service";
import {CategoryService} from "../../layout/navbar/category/category.service";
import {Router} from "@angular/router";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {CurrencyPipe, DatePipe} from "@angular/common";

@Component({
  selector: 'app-card-listing',
  standalone: true,
  imports: [ DatePipe,
    CurrencyPipe,
    FaIconComponent],
  templateUrl: './card-listing.component.html',
  styleUrl: './card-listing.component.scss'
})

/**
 * CardListingComponent represents a card view of a listing or a booking,
 * allowing interaction such as deleting listings or canceling bookings.
 */
export class CardListingComponent {

  listing = input.required<CardListing | BookedListing>();
  cardMode = input<"landlord" | "booking">();

  @Output()
  deleteListing = new EventEmitter<CardListing>();
  @Output()
  cancelBooking = new EventEmitter<BookedListing>();

  constructor() {
    this.listenToListing();
    this.listenToCardMode();
  }


  bookingListing: BookedListing | undefined;
  cardListing: CardListing | undefined;

  router = inject(Router);
  categoryService = inject(CategoryService);
  countryService = inject(CountryService);

  /**
   * Listens to changes in the `listing` input and updates the listing's location
   * by fetching the country information from the `CountryService`.
   */
  private listenToListing() {
    effect(() => {
      const listing = this.listing();
      this.countryService.getCountryByCode(listing.location)
        .subscribe({
          next: country => {
            if (listing) {
              this.listing().location = country.region + ", " + country.name.common
            }
          }
        })
    });
  }

  /**
   * Listens to changes in the `cardMode` input and determines whether the listing
   * should be treated as a `BookedListing` or a `CardListing` based on the mode.
   */
  private listenToCardMode() {
    effect(() => {
      const cardMode = this.cardMode();
      if (cardMode && cardMode === "booking") {
        this.bookingListing = this.listing() as BookedListing
      } else {
        this.cardListing = this.listing() as CardListing;
      }
    });
  }

  /**
   * Emits an event to delete the current listing.
   *
   * @param displayCardListingDTO The listing to be deleted, emitted as an event.
   */
  onDeleteListing(displayCardListingDTO: CardListing) {
    this.deleteListing.emit(displayCardListingDTO);
  }

  /**
   * Emits an event to cancel the current booking.
   *
   * @param bookedListing The booking to be canceled, emitted as an event.
   */
  onCancelBooking(bookedListing: BookedListing) {
    this.cancelBooking.emit(bookedListing);
  }


  /**
   * Navigates to the detailed view of the listing when the card is clicked.
   *
   * @param publicId The public ID of the listing used to navigate to its detailed page.
   */
  onClickCard(publicId: string) {
    this.router.navigate(['listing'],
      {queryParams: {id: publicId}});
  }



}
