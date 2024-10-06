import {Component, effect, inject, OnDestroy, OnInit} from '@angular/core';
import {CardListingComponent} from "../shared/card-listing/card-listing.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {ToastService} from "../layout/toast.service";
import {CategoryService} from "../layout/navbar/category/category.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Pagination} from "../core/model/request.model";
import {CardListing} from "../landlord/model/listing.model";
import {TenantListingService} from "../tenant/tenant-listing.service";
import {filter, Subscription} from "rxjs";
import {Category} from "../layout/navbar/category/category.model";
import {Search} from "../tenant/search/search.model";
import dayjs from "dayjs";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CardListingComponent,
    FaIconComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})

/**
 * HomeComponent is responsible for displaying listings on the home page.
 * It listens for category changes and fetches corresponding listings from the server.
 * The component uses TenantListingService to retrieve data and manages subscriptions to reactive streams.
 */
export class HomeComponent implements OnInit, OnDestroy  {

  tenantListingService = inject(TenantListingService);
  toastService = inject(ToastService);
  categoryService = inject(CategoryService);
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);

  listings: Array<CardListing> | undefined;

  pageRequest: Pagination = {size: 20, page: 0, sort: []};

  loading = false;

  categoryServiceSubscription: Subscription | undefined;
  searchIsLoading = false;
  emptySearch = false;
  private searchSubscription: Subscription | undefined;


  ngOnDestroy(): void {
    this.tenantListingService.resetGetAllCategory();
    if (this.categoryServiceSubscription) {
      this.categoryServiceSubscription.unsubscribe();
    }
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }

  }

  ngOnInit(): void {
    this.startNewSearch();
    this.listenToChangeCategory();
  }


  constructor() {
    this.listenToGetAllCategory();
    this.listenToSearch();
  }


  /**
   * Listens to changes in the active category. Whenever a category change is detected,
   * it triggers the service to fetch listings for the selected category.
   */
  private listenToChangeCategory() {
    this.categoryServiceSubscription = this.categoryService.changeCategoryObs.subscribe({
      next: (category: Category) => {
        this.loading = true;
        if (!this.searchIsLoading) {
          this.tenantListingService.getAllByCategory(this.pageRequest, category.technicalName);
        }
      }
    })
  }

  /**
   * Sets up an effect to listen to changes in the listing data from TenantListingService.
   * Updates the listings when new data is fetched and handles error cases by displaying toasts.
   */
  private listenToGetAllCategory() {
    effect(() => {
      const categoryListingsState = this.tenantListingService.getAllByCategorySig();
      if (categoryListingsState.status === "OK") {
        this.listings = categoryListingsState.value?.content;
        this.loading = false;
        this.emptySearch = false;
      } else if (categoryListingsState.status === "ERROR") {
        this.toastService.send({
          severity: "error", detail: "Error when fetching the listing", summary: "Error",
        });
        this.loading = false;
        this.emptySearch = false;
      }
    });
  }

  /**
   * Subscribes to search results from the tenant listing service and updates the component state
   * based on the status of the search. It handles both successful searches and errors,
   * showing appropriate feedback to the user.
   */
  private listenToSearch() {
    this.searchSubscription = this.tenantListingService.search.subscribe({
      next: searchState => {
        if (searchState.status === "OK") {
          this.loading = false;
          this.searchIsLoading = false;
          this.listings = searchState.value?.content;
          this.emptySearch = this.listings?.length === 0;
        } else if (searchState.status === "ERROR") {
          this.loading = false;
          this.searchIsLoading = false;
          this.toastService.send({
            severity: "error", summary: "Error when search listing",
          })
        }
      }
    })
  }

  /**
   * Initiates a new search based on the query parameters from the URL.
   * Extracts search criteria such as location, dates, and property details (guests, bedrooms, etc.),
   * and then sends a request to search listings.
   */
  private startNewSearch(): void {
    this.activatedRoute.queryParams.pipe(
      filter(params => params['location']), // Proceed only if 'location' parameter is present
    ).subscribe({
      next: params => {
        this.searchIsLoading = true;
        this.loading = true;
        // Build a new search object from query parameters
        const newSearch: Search = {
          dates: {
            startDate: dayjs(params["startDate"]).toDate(),
            endDate: dayjs(params["endDate"]).toDate(),
          },
          infos: {
            guests: {value: params['guests']},
            bedrooms: {value: params['bedrooms']},
            beds: {value: params['beds']},
            baths: {value: params['baths']},
          },
          location: params['location'],
        };
        // Trigger the search using the constructed search object
        this.tenantListingService.searchListing(newSearch, this.pageRequest);
      }
    });
  }

  /**
   * Resets the search filters by navigating to the default category and clearing search results.
   * This method is used to refresh the search view and reset to initial state.
   */
  onResetSearchFilter(): void {
    this.router.navigate(["/"], {
      queryParams: {"category": this.categoryService.getCategoryByDefault().technicalName}
    });
    this.loading = true;
    this.emptySearch = false; // Reset empty search indicator
  }

}
