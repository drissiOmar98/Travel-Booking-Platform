import {Component, inject, OnInit} from '@angular/core';
import {CategoryService} from "./category.service";
import {Category, CategoryName} from "./category.model";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {filter, map} from "rxjs";

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent  implements OnInit {

  categoryService = inject(CategoryService);

  categories: Category[] | undefined;

  currentActivateCategory = this.categoryService.getCategoryByDefault();
  isHome = false;
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    this.listenRouter();
    this.currentActivateCategory.activated = false;
    this.fetchCategories();
  }

  /**
   * Listens to the router events and query parameters for changes.
   * - If the user navigates to the home page, it sets the "ALL" category as the active category.
   * - If a query parameter with a category is found, it activates the corresponding category.
   */
  private listenRouter() {
    // Listen for router events, particularly when navigation ends.
    this.router.events.pipe(
      filter((evt): evt is NavigationEnd => evt instanceof NavigationEnd)
    ).subscribe({
      next: (evt: NavigationEnd) => {
        this.isHome = evt.url.split("?")[0] === "/"; // Check if the current route is the home page.
        if (this.isHome && evt.url.indexOf("?") === -1) { // If no query params, default to "ALL" category.
          const categoryByTechnicalName = this.categoryService.getCategoryByTechnicalName("ALL");
          this.categoryService.changeCategory(categoryByTechnicalName!); // Change to "ALL" category.
        }
      },
    });

    // Listen for changes in query parameters and update the active category accordingly.
    this.activatedRoute.queryParams
      .pipe(map(params => params["category"]))
      .subscribe({
        next: (categoryName: CategoryName) => {
          const category = this.categoryService.getCategoryByTechnicalName(categoryName);
          if (category) {
            this.activateCategory(category); // Activate the category from query params.
            this.categoryService.changeCategory(category); // Notify the service of the category change.
          }
        }
      });
  }

  /**
   * Activates the given category, deactivating the current one.
   *
   * @param category - The category to activate.
   */
  private activateCategory(category: Category) {
    this.currentActivateCategory.activated = false; // Deactivate the current category.
    this.currentActivateCategory = category; // Set the new category as active.
    this.currentActivateCategory.activated = true; // Mark it as activated.
  }
  private fetchCategories() {
    this.categories = this.categoryService.getCategories();
  }


  /**
   * Handles category change when the user selects a new category.
   * It activates the new category and updates the URL with the selected category as a query parameter.
   *
   * @param category - The selected category to change to.
   */
  onChangeCategory(category: Category) {
    this.activateCategory(category);
    this.router.navigate([], {
      queryParams: {"category": category.technicalName},
      relativeTo: this.activatedRoute
    })
  }
}
