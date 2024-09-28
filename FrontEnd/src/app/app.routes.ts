import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {authorityRouteAccess} from "./core/auth/authority-route-access";
import {PropertiesComponent} from "./landlord/properties/properties.component";


export const routes: Routes = [
  {
    path: 'landlord/properties',
    component: PropertiesComponent,
    canActivate: [authorityRouteAccess],
    data: {
      authorities: ["ROLE_LANDLORD"]
    }
  },


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
