import {Component, EventEmitter, inject, input, OnInit, Output} from '@angular/core';
import {Category, CategoryName} from "../../../../layout/navbar/category/category.model";
import {CategoryService} from "../../../../layout/navbar/category/category.service";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";

@Component({
  selector: 'app-category-step',
  standalone: true,
  imports: [
    FaIconComponent
  ],
  templateUrl: './category-step.component.html',
  styleUrl: './category-step.component.scss'
})
export class CategoryStepComponent implements OnInit{

  categoryName = input.required<CategoryName>();

  // Output event emitter that will emit the selected category when changed
  @Output()
  categoryChange = new EventEmitter<CategoryName>();

  // Output event emitter that will emit a boolean indicating the step's validity status
  @Output()
  stepValidityChange = new EventEmitter<boolean>();

  categoryService = inject(CategoryService);

  // Variable to hold the list of available categories
  categories: Category[] | undefined;


  /**
   * Lifecycle hook that runs when the component is initialized.
   * Fetches the available categories from the service.
   */
  ngOnInit(): void {
    // Fetch categories from the service and assign them to the local 'categories' variable
    this.categories = this.categoryService.getCategories();
  }

  /**
   * Method that handles selecting a category.
   * Emits the selected category and indicates the step is valid.
   *
   * @param newCategory - The new selected category of type CategoryName.
   */
  onSelectCategory(newCategory: CategoryName): void {
    // Emit the selected category using the categoryChange event emitter
    this.categoryChange.emit(newCategory);
    // Emit a 'true' value to indicate the step is valid using the stepValidityChange event emitter
    this.stepValidityChange.emit(true);
  }


}
