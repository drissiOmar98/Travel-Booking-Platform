import {Component, EventEmitter, input, Output, ViewChild} from '@angular/core';
import {Description} from "../../../model/listing.model";
import {FormsModule, NgForm} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {InputTextareaModule} from "primeng/inputtextarea";

@Component({
  selector: 'app-description-step',
  standalone: true,
  imports: [InputTextModule, FormsModule, InputTextModule, InputTextareaModule],
  templateUrl: './description-step.component.html',
  styleUrl: './description-step.component.scss'
})
/**
 * A component responsible for handling the description step of a form.
 * It manages the input and validation for the title and description fields.
 */
export class DescriptionStepComponent {

  description = input.required<Description>();

  @Output()
  descriptionChange = new EventEmitter<Description>();

  @Output()
  stepValidityChange = new EventEmitter<boolean>();

  /**
   * A reference to the form element in the template.
   * This is used to track and validate the form's state.
   */
  @ViewChild("formDescription")
  formDescription: NgForm | undefined;

  /**
   * Handles changes to the title field. Updates the description object
   * and emits the changes and the validity of the step.
   *
   * @param newTitle - The new title value to be updated in the description.
   */
  onTitleChange(newTitle: string) {
    this.description().title = {value: newTitle};
    this.descriptionChange.emit(this.description());
    this.stepValidityChange.emit(this.validateForm());
  }

  /**
   * Handles changes to the description field. Updates the description object
   * and emits the changes and the validity of the step.
   *
   * @param newDescription - The new description value to be updated.
   */
  onDescriptionChange(newDescription: string) {
    this.description().description = {value: newDescription};
    this.descriptionChange.emit(this.description());
    this.stepValidityChange.emit(this.validateForm());
  }

  /**
   * Validates the form by checking its validity state.
   * If the form is present, it returns the validity status.
   * If the form is not available, it defaults to false.
   *
   * @returns true if the form is valid, otherwise false.
   */
  private validateForm(): boolean {
    if (this.formDescription) {
      return this.formDescription?.valid!;
    } else {
      return false;
    }
  }

}
