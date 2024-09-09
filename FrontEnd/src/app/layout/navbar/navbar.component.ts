import {Component, inject, OnInit} from '@angular/core';
import {ButtonModule} from "primeng/button";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {ToolbarModule} from "primeng/toolbar";
import {MenuModule} from "primeng/menu";
import {CategoryComponent} from "./category/category.component";
import {AvatarComponent} from "./avatar/avatar.component";
import {DynamicDialogRef} from "primeng/dynamicdialog";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ButtonModule,
    FontAwesomeModule,
    ToolbarModule,
    MenuModule,
    CategoryComponent,
    AvatarComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {

  location = "Anywhere";
  guests = "Add guests";
  dates = "Any week";

  activatedRoute = inject(ActivatedRoute);
  ref: DynamicDialogRef | undefined;

  ngOnInit(): void {
    this.fetchMenu()
  }


  private fetchMenu() {

  }
}
