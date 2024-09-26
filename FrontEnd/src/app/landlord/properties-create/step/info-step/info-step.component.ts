import {Component, EventEmitter, input, Output} from '@angular/core';
import {NewListingInfo} from "../../../model/listing.model";
import {InfoStepControlComponent} from "./info-step-control/info-step-control.component";

/**
 * Enumeration-like type defining the possible controls available for the info step.
 * Each control represents a category of listing information such as guests, bedrooms, beds, and baths.
 */
export type Control = "GUESTS" | "BEDROOMS" | "BEDS" | "BATHS"
@Component({
  selector: 'app-info-step',
  standalone: true,
  imports: [
    InfoStepControlComponent
  ],
  templateUrl: './info-step.component.html',
  styleUrl: './info-step.component.scss'
})
export class InfoStepComponent {

  infos = input.required<NewListingInfo>();

  @Output()
  infoChange = new EventEmitter<NewListingInfo>();

  @Output()
  stepValidityChange = new EventEmitter<boolean>();


  /**
   * Handles changes in the listing information for specific controls (guests, bedrooms, beds, or baths).
   * Based on the type of control, the method updates the corresponding value in the `infos` object.
   *
   * @param newValue - The new value to be assigned to the control.
   * @param valueType - The type of control being updated (e.g., "GUESTS", "BEDROOMS", etc.).
   */
  onInfoChange(newValue: number, valueType: Control) {
    switch (valueType) {
      case "BATHS":
        this.infos().baths = {value: newValue}; // Update the baths count in the listing info.
        break;
      case "BEDROOMS":
        this.infos().bedrooms = {value: newValue}; // Update the bedrooms count in the listing info.
        break;
      case "BEDS":
        this.infos().beds = {value: newValue}; // Update the beds count in the listing info.
        break;
      case "GUESTS":
        this.infos().guests = {value: newValue}; // Update the guests count in the listing info.
        break;
    }

    // Emit the updated info and check for step validity.
    this.infoChange.emit(this.infos());
    this.stepValidityChange.emit(this.validationRules());
  }


  /**
   * Validation rules for determining whether the current step is valid.
   * For now, the rule ensures that the number of guests is at least 1.
   *
   * @returns A boolean indicating if the current step passes the validation check.
   */
  validationRules(): boolean {
    return this.infos().guests.value >= 1; // Step is valid if guests are 1 or more.
  }
}
