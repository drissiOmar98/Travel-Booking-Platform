import {Component, effect, inject, OnDestroy, OnInit} from '@angular/core';
import {AvatarComponent} from "../../layout/navbar/avatar/avatar.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {TenantListingService} from "../tenant-listing.service";
import {ActivatedRoute} from "@angular/router";
import {CountryService} from "../../landlord/properties-create/step/location-step/country.service";
import {CategoryService} from "../../layout/navbar/category/category.service";
import {ToastService} from "../../layout/toast.service";
import {Category} from "../../layout/navbar/category/category.model";
import {DisplayPicture, Listing} from "../../landlord/model/listing.model";
import {map} from "rxjs";
import {NgClass} from "@angular/common";
import {BookDateComponent} from "../book-date/book-date.component";

@Component({
  selector: 'app-display-listing',
  standalone: true,
  imports: [
    AvatarComponent,
    FaIconComponent,
    NgClass,
    BookDateComponent
  ],
  templateUrl: './display-listing.component.html',
  styleUrl: './display-listing.component.scss'
})

/**
 * Component responsible for displaying the details of a specific listing,
 * fetching it based on the public ID from the query parameters, and handling
 * related services like category and country information.
 */
export class DisplayListingComponent implements OnInit, OnDestroy {

  tenantListingService = inject(TenantListingService);
  activatedRoute = inject(ActivatedRoute);
  toastService = inject(ToastService);
  categoryService = inject(CategoryService);
  countryService = inject(CountryService);

  listing: Listing | undefined;
  category: Category | undefined;
  currentPublicId = "";

  loading = true;

  constructor() {
    this.listenToFetchListing();
  }

  /**
   * Lifecycle hook that runs when the component is destroyed.
   * Resets the listing state to its initial form.
   */
  ngOnDestroy(): void {
    this.tenantListingService.resetGetOneByPublicId();
  }

  /**
   * Lifecycle hook that runs when the component is initialized.
   * Extracts the listing ID from the URL query parameters and fetches the listing.
   */
  ngOnInit(): void {
    this.extractIdParamFromRouter();
  }

  /**
   * Extracts the 'id' query parameter from the route and triggers the fetch
   * of the listing associated with that ID.
   */
  private extractIdParamFromRouter() {
    this.activatedRoute.queryParams.pipe(
      map(params => params['id'])
    ).subscribe({
      next: publicId => this.fetchListing(publicId)
    })
  }


  /**
   * Fetches the listing details based on the public ID and
   * updates the loading state.
   * @param publicId - The public ID of the listing to fetch.
   */
  private fetchListing(publicId: string) {
    this.loading = true;
    this.currentPublicId = publicId;
    this.tenantListingService.getOneByPublicId(publicId);
  }

  /**
   * Sets up an effect to listen to changes in the listing state
   * after it is fetched from the service, updates the view,
   * and handles any errors encountered during the fetch.
   */
  private listenToFetchListing() {
    effect(() => {
      const listingByPublicIdState = this.tenantListingService.getOneByPublicIdSig();

      // Handle successful fetch of the listing
      if (listingByPublicIdState.status === "OK") {
        this.loading = false;
        this.listing = listingByPublicIdState.value;

        // If the listing is available, update category and location details
        if (this.listing) {
          this.listing.pictures = this.putCoverPictureFirst(this.listing.pictures);
          this.category = this.categoryService.getCategoryByTechnicalName(this.listing.category);

          // Fetch and update the country location details
          this.countryService.getCountryByCode(this.listing.location)
            .subscribe({
              next: country => {
                if (this.listing) {
                  this.listing.location = `${country.region}, ${country.name.common}`;
                }
              }
            });
        }

        // Handle errors encountered during the fetch
      } else if (listingByPublicIdState.status === "ERROR") {
        this.loading = false;
        this.toastService.send({
          severity: "error", detail: "Error when fetching the listing",
        });
      }
    });
  }

  /**
   * Moves the cover picture of the listing to the first position in the array
   * of pictures to ensure it is displayed as the primary image.
   * @param pictures - Array of listing pictures.
   * @returns The updated array of pictures with the cover picture at the front.
   */
  private putCoverPictureFirst(pictures: Array<DisplayPicture>) {
    const coverIndex = pictures.findIndex(picture => picture.isCover);
    if (coverIndex) {
      const cover = pictures[coverIndex];
      pictures.splice(coverIndex, 1);
      pictures.unshift(cover);
    }
    return pictures;
  }



}
