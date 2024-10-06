import {Component, effect, EventEmitter, input, Output} from '@angular/core';
import {CalendarModule} from "primeng/calendar";
import {BookedDatesDTOFromServer} from "../../model/booking.model";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-search-date',
  standalone: true,
  imports: [
    CalendarModule,
    FormsModule
  ],
  templateUrl: './search-date.component.html',
  styleUrl: './search-date.component.scss'
})
export class SearchDateComponent {


  // Input dates required from the parent component
  dates = input.required<BookedDatesDTOFromServer>();

  // Holds the raw date values selected by the user
  searchDateRaw = new Array<Date>();

  // Minimum date allowed for the date picker, initialized to the current date
  minDate = new Date();

  // Output events to notify parent component about date changes and step validity
  @Output()
  datesChange = new EventEmitter<BookedDatesDTOFromServer>();

  @Output()
  stepValidityChange = new EventEmitter<boolean>();


  /**
   * Handles changes in the date selection. Validates the selected dates and emits events
   * if they are valid. Updates `searchDateRaw` with the new date values.
   * @param newBookingDate - Array containing the start and end dates selected by the user.
   */
  onDateChange(newBookingDate: Date[]): void {
    this.searchDateRaw = newBookingDate;
    const isDateValid = this.validateDateSearch();
    this.stepValidityChange.emit(isDateValid); // Emit validity status to parent component

    if (isDateValid) {
      const searchDate: BookedDatesDTOFromServer = {
        startDate: this.searchDateRaw[0],
        endDate: this.searchDateRaw[1]
      };
      this.datesChange.emit(searchDate); // Emit valid dates to parent component
    }
  }

  /**
   * Validates the selected date range. Ensures two dates are selected, both dates are non-null,
   * and that the start and end dates are different.
   * @returns Boolean indicating whether the date selection is valid.
   */
  private validateDateSearch() {
    return this.searchDateRaw.length === 2
      && this.searchDateRaw[0] !== null
      && this.searchDateRaw[1] !== null
      && this.searchDateRaw[0].getDate() !== this.searchDateRaw[1].getDate()
  }


  constructor() {
    this.restorePreviousDate();
  }


  /**
   * Restores previous date selection, if available. If `dates` has values, they are assigned
   * to `searchDateRaw` to initialize the component with existing date data.
   */
  private restorePreviousDate() {
    effect(() => {
      if(this.dates()) {
        this.searchDateRaw[0] = this.dates().startDate;
        this.searchDateRaw[1] = this.dates().endDate;
      }
    });
  }


}
