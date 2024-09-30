import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {authorityRouteAccess} from "./core/auth/authority-route-access";
import {PropertiesComponent} from "./landlord/properties/properties.component";
import {HomeComponent} from "./home/home.component";
import {DisplayListingComponent} from "./tenant/display-listing/display-listing.component";


export const routes: Routes = [
  {
    path: 'landlord/properties',
    component: PropertiesComponent,
    canActivate: [authorityRouteAccess],
    data: {
      authorities: ["ROLE_LANDLORD"]
    }
  },
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'listing',
    component: DisplayListingComponent
  },


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
