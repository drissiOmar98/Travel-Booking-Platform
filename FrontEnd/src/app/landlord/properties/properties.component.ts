import {Component, effect, inject, OnDestroy, OnInit} from '@angular/core';
import {CardListingComponent} from "../../shared/card-listing/card-listing.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {ToastService} from "../../layout/toast.service";
import {LandlordListingService} from "../landlordListing.service";
import {CardListing} from "../model/listing.model";

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [
    CardListingComponent,
    FaIconComponent
  ],
  templateUrl: './properties.component.html',
  styleUrl: './properties.component.scss'
})

/**
 * PropertiesComponent handles the display and management of property listings
 * for a landlord, including fetching all listings and deleting individual ones.
 * It listens to state changes from LandlordListingService and reacts accordingly.
 */
export class PropertiesComponent  implements OnInit, OnDestroy{

  landlordListingService = inject(LandlordListingService);
  toastService = inject(ToastService);

  listings: Array<CardListing> | undefined = [];
  loadingDeletion = false;
  loadingFetchAll = false;

  constructor() {
    this.listenFetchAll();
    this.listenDeleteByPublicId();
  }

  /**
   * Listens for changes in the getAllSig state signal, which tracks the result
   * of fetching all listings from the server.
   * - If successful, it updates the listings and stops the loading state.
   * - If an error occurs, it displays an error toast notification.
   */
  private listenFetchAll() {
    effect(() => {
      const allListingState = this.landlordListingService.getAllSig();
      if (allListingState.status === "OK" && allListingState.value) {
        this.loadingFetchAll = false;
        this.listings = allListingState.value;
      } else if (allListingState.status === "ERROR") {
        this.toastService.send({
          severity: "error", summary: "Error", detail: "Error when fetching the listing",
        });
      }
    });
  }

  /**
   * Listens for changes in the deleteSig state signal, which tracks the result
   * of deleting a listing by its public ID.
   * - If successful, it removes the listing from the list and shows a success toast.
   * - If an error occurs, it stops the deletion loading and shows an error toast.
   */
  private listenDeleteByPublicId() {
    effect(() => {
      const deleteState = this.landlordListingService.deleteSig();
      if (deleteState.status === "OK" && deleteState.value) {
        const listingToDeleteIndex = this.listings?.findIndex(listing => listing.publicId === deleteState.value);
        this.listings?.splice(listingToDeleteIndex!, 1);
        this.toastService.send({
          severity: "success", summary: "Deleted successfully", detail: "Listing deleted successfully.",
        });
      } else if (deleteState.status === "ERROR") {
        const listingToDeleteIndex = this.listings?.findIndex(listing => listing.publicId === deleteState.value);
        this.listings![listingToDeleteIndex!].loading = false;
        this.toastService.send({
          severity: "error", summary: "Error", detail: "Error when deleting the listing",
        });
      }
      this.loadingDeletion = false;
    });
  }

  /**
   * Angular lifecycle hook for initialization.
   * Fetches the property listings when the component is initialized.
   */
  ngOnInit(): void {
    this.fetchListings()
  }

  /**
   * Handles the deletion of a listing. Sets the listing to a loading state
   * while the deletion request is processed.
   *
   * @param listing The listing to delete.
   */
  onDeleteListing(listing: CardListing): void {
    listing.loading = true;
    this.landlordListingService.delete(listing.publicId);
  }

  /**
   * Fetches all property listings from the server.
   * Sets the loading state to true while the request is being processed.
   */
  private fetchListings() {
    this.loadingFetchAll = true;
    this.landlordListingService.getAll();
  }

  /**
   * Angular lifecycle hook for cleanup.
   * Currently unused but may be implemented if resources need to be released.
   */
  ngOnDestroy(): void {
  }


}
