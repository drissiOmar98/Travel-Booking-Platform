import {Component, inject, OnInit} from '@angular/core';
import {CategoryService} from "./category.service";
import {Category} from "./category.model";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {ActivatedRoute, Router} from "@angular/router";

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
    this.fetchCategories();
  }

  private fetchCategories() {
    this.categories = this.categoryService.getCategories();
  }

  onChangeCategory(category: Category) {

  }
}
