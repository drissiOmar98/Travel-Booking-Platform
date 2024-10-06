import {Component, inject} from '@angular/core';
import {Step} from "../../landlord/properties-create/step.model";
import {Search} from "./search.model";
import {DynamicDialogRef} from "primeng/dynamicdialog";
import {Router} from "@angular/router";
import {BookedDatesDTOFromServer} from "../model/booking.model";
import {NewListingInfo} from "../../landlord/model/listing.model";
import dayjs from "dayjs";
import {FooterStepComponent} from "../../shared/footer-step/footer-step.component";
import {InfoStepComponent} from "../../landlord/properties-create/step/info-step/info-step.component";
import {
  LocationMapComponent
} from "../../landlord/properties-create/step/location-step/location-map/location-map.component";
import {SearchDateComponent} from "./search-date/search-date.component";

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    FooterStepComponent,
    InfoStepComponent,
    LocationMapComponent,
    SearchDateComponent
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {

  LOCATION = "location";
  DATES = "dates";
  GUESTS = "guests";

  // Define steps for the search process with IDs, navigation references, and validity flags
  steps: Step[] = [
    {
      id: this.LOCATION,
      idNext: this.DATES,
      idPrevious: null,
      isValid: false
    },
    {
      id: this.DATES,
      idNext: this.GUESTS,
      idPrevious: this.LOCATION,
      isValid: false
    },
    {
      id: this.GUESTS,
      idNext: null,
      idPrevious: this.DATES,
      isValid: false
    }
  ];

  currentStep = this.steps[0];

  newSearch: Search = {
    dates: {
      startDate: new Date(),
      endDate: new Date(),
    },
    infos: {
      guests: {value: 0},
      bedrooms: {value: 0},
      beds: {value: 0},
      baths: {value: 0}
    },
    location: ""
  };

  loadingSearch = false; // Indicates if a search is in progress

  dialogDynamicRef = inject(DynamicDialogRef);
  router = inject(Router);

  /**
   * Navigates to the next step in the search process, if available.
   */
  nextStep() {
    if (this.currentStep.idNext !== null) {
      this.currentStep = this.steps.filter((step: Step) => step.id === this.currentStep.idNext)[0];
    }
  }


  /**
   * Navigates to the previous step in the search process, if available.
   */
  previousStep() {
    if (this.currentStep.idPrevious !== null) {
      this.currentStep = this.steps.filter((step: Step) => step.id === this.currentStep.idPrevious)[0];
    }
  }


  /**
   * Checks if all steps are marked as valid, returning true if all steps are complete.
   * Used to control the enabling of the search button.
   */
  isAllStepsValid() {
    return this.steps.filter(step => step.isValid).length === this.steps.length;
  }


  /**
   * Updates the validity status of the current step based on user input.
   * @param validity - Boolean indicating whether the current step's input is valid.
   */
  onValidityChange(validity: boolean) {
    this.currentStep.isValid = validity;
  }


  /**
   * Sets a new location in the search criteria and marks the location step as valid.
   * @param newLocation - The location entered by the user.
   */
  onNewLocation(newLocation: string): void {
    this.currentStep.isValid = true;
    this.newSearch.location = newLocation;
  }


  /**
   * Sets new date range values for the search criteria.
   * @param newDates - Object containing the start and end dates for the search.
   */
  onNewDate(newDates: BookedDatesDTOFromServer) {
    this.newSearch.dates =  newDates
  }


  /**
   * Updates additional information for the search such as guest count, bedrooms, beds, and baths.
   * @param newInfo - Object containing the updated listing information.
   */
  onInfoChange(newInfo: NewListingInfo) {
    this.newSearch.infos = newInfo;
  }

  /**
   * Initiates a search based on the provided criteria. It sets the query parameters
   * and navigates to the results page. Closes the dialog afterward.
   */
  search() {
    this.loadingSearch = false;
    this.router.navigate(["/"],
      {
        queryParams: {
          location: this.newSearch.location,
          guests: this.newSearch.infos.guests.value,
          bedrooms: this.newSearch.infos.bedrooms.value,
          beds: this.newSearch.infos.beds.value,
          baths: this.newSearch.infos.baths.value,
          startDate: dayjs(this.newSearch.dates.startDate).format("YYYY-MM-DD"),
          endDate: dayjs(this.newSearch.dates.endDate).format("YYYY-MM-DD"),
        }
      });
    this.dialogDynamicRef.close();
  }



}
