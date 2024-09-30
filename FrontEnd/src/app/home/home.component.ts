import {Component, effect, inject, OnDestroy, OnInit} from '@angular/core';
import {CardListingComponent} from "../shared/card-listing/card-listing.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {ToastService} from "../layout/toast.service";
import {CategoryService} from "../layout/navbar/category/category.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Pagination} from "../core/model/request.model";
import {CardListing} from "../landlord/model/listing.model";
import {TenantListingService} from "../tenant/tenant-listing.service";
import {Subscription} from "rxjs";
import {Category} from "../layout/navbar/category/category.model";

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

  }

  ngOnInit(): void {
    this.listenToChangeCategory();
  }


  constructor() {
    this.listenToGetAllCategory();
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


}
