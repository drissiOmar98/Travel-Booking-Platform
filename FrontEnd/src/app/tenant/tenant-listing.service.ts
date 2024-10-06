import {computed, inject, Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {State} from "../core/model/state.model";
import {createPaginationOption, Page, Pagination} from "../core/model/request.model";
import {CardListing, Listing} from "../landlord/model/listing.model";
import {environment} from "../../environments/environment";
import {CategoryName} from "../layout/navbar/category/category.model";
import {Subject} from "rxjs";
import {Search} from "./search/search.model";

@Injectable({
  providedIn: 'root'
})
export class TenantListingService {

  http = inject(HttpClient);

  /**
   * Signal to track the state of fetching all listings by category.
   * It holds a State object that can be in an initialized, success, or error state.
   */
  private getAllByCategory$: WritableSignal<State<Page<CardListing>>>
    = signal(State.Builder<Page<CardListing>>().forInit());

  /**
   * Computed signal that allows components to reactively observe changes
   * to the state of `getAllByCategory$`.
   */
  getAllByCategorySig = computed(() => this.getAllByCategory$());

  /**
   * Signal to track the state of fetching a single listing by its public ID.
   * It holds a State object that can be in an initialized, success, or error state.
   */
  private getOneByPublicId$: WritableSignal<State<Listing>>
    = signal(State.Builder<Listing>().forInit());

  /**
   * Computed signal that allows components to reactively observe changes
   * to the state of `getOneByPublicId$`.
   */
  getOneByPublicIdSig = computed(() => this.getOneByPublicId$());


  private search$: Subject<State<Page<CardListing>>> =
    new Subject<State<Page<CardListing>>>();
  search = this.search$.asObservable();


  constructor() { }


  /**
   * Fetches all listings filtered by a given category. The result is paginated and managed via a signal.
   * The method updates the state signal `getAllByCategory$` based on the success or failure of the HTTP request.
   *
   * @param pageRequest - Pagination options, including page number and page size.
   * @param category - The name of the category to filter the listings.
   */
  getAllByCategory(pageRequest: Pagination, category: CategoryName) : void {
    let params = createPaginationOption(pageRequest);
    params = params.set("category", category);
    this.http.get<Page<CardListing>>(`${environment.API_URL}/tenant-listing/get-all-by-category`, {params})
      .subscribe({
        next: displayListingCards =>
          this.getAllByCategory$.set(State.Builder<Page<CardListing>>().forSuccess(displayListingCards)),
        error: error => this.getAllByCategory$.set(State.Builder<Page<CardListing>>().forError(error))
      })
  }

  /**
   * Resets the signal for fetching listings by category to its initial state.
   * This is useful when clearing out the previous data or initiating a new request.
   */
  resetGetAllCategory(): void {
    this.getAllByCategory$.set(State.Builder<Page<CardListing>>().forInit())
  }

  /**
   * Fetches a single listing by its public ID. The result is managed via a signal.
   * The method updates the state signal `getOneByPublicId$` based on the success or failure of the HTTP request.
   *
   * @param publicId - The public ID of the listing to fetch.
   */
  getOneByPublicId(publicId: string): void {
    const params = new HttpParams().set("publicId", publicId);
    this.http.get<Listing>(`${environment.API_URL}/tenant-listing/get-one`, {params})
      .subscribe({
        next: listing => this.getOneByPublicId$.set(State.Builder<Listing>().forSuccess(listing)),
        error: err => this.getOneByPublicId$.set(State.Builder<Listing>().forError(err)),
      });
  }


  /**
   * Resets the signal for fetching a listing by public ID to its initial state.
   * This is useful when clearing out the previous data or initiating a new request.
   */
  resetGetOneByPublicId(): void {
    this.getOneByPublicId$.set(State.Builder<Listing>().forInit())
  }

  searchListing(newSearch: Search, pageRequest: Pagination): void {
    const params = createPaginationOption(pageRequest);
    this.http.post<Page<CardListing>>(`${environment.API_URL}/tenant-listing/search`, newSearch, {params})
      .subscribe({
        next: displayListingCards => this.search$.next(State.Builder<Page<CardListing>>().forSuccess(displayListingCards)),
        error: err => this.search$.next(State.Builder<Page<CardListing>>().forError(err))
      })
  }
}
