import {Component, EventEmitter, input, Output} from '@angular/core';
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {NewListingPicture} from "../../../model/picture.model";

@Component({
  selector: 'app-picture-step',
  standalone: true,
  imports: [
    FaIconComponent
  ],
  templateUrl: './picture-step.component.html',
  styleUrl: './picture-step.component.scss'
})

/**
 * A component that handles picture uploads and displays for a listing.
 * It manages a list of pictures, allowing users to upload new pictures,
 * delete existing ones, and validate the number of pictures uploaded.
 */
export class PictureStepComponent {

  pictures = input.required<Array<NewListingPicture>>();

  @Output()
  picturesChange = new EventEmitter<Array<NewListingPicture>>();

  @Output()
  stepValidityChange = new EventEmitter<boolean>();

  /**
   * Extracts files from the provided event target.
   *
   * @param target - The event target, expected to be an HTMLInputElement.
   * @returns A FileList containing the selected files or null if no files are selected.
   */
  extractFileFromTarget(target: EventTarget | null) {
    const htmlInputTarget = target as HTMLInputElement;
    if (target === null || htmlInputTarget.files === null) {
      return null;
    }
    return htmlInputTarget.files;
  }

  /**
   * Handles the upload of new pictures.
   * Extracts files from the target and updates the pictures array with new display pictures.
   * Emits the updated pictures list and validates the current step.
   *
   * @param target - The event target from which to extract files (e.g., an <input> element).
   */
  onUploadNewPicture(target: EventTarget | null) {
    const picturesFileList = this.extractFileFromTarget(target);
    if(picturesFileList !== null) {
      for(let i = 0 ; i < picturesFileList.length; i++) {
        const picture = picturesFileList.item(i);
        if (picture !== null) {
          const displayPicture: NewListingPicture = {
            file: picture,
            urlDisplay: URL.createObjectURL(picture)
          }
          this.pictures().push(displayPicture);
        }
      }
      this.picturesChange.emit(this.pictures());
      this.validatePictures();
    }
  }

  /**
   * Validates the number of uploaded pictures.
   * Emits a validity status based on whether the number of pictures is at least 5.
   */
  private validatePictures() {
    if (this.pictures().length >= 5) {
      this.stepValidityChange.emit(true);
    } else {
      this.stepValidityChange.emit(false);
    }
  }

  /**
   * Deletes a specified picture from the uploaded pictures list.
   * Validates the pictures after deletion.
   *
   * @param pictureToDelete - The picture object to be deleted from the list.
   */
  onTrashPicture(pictureToDelete: NewListingPicture) {
    const indexToDelete = this.pictures().findIndex(picture => picture.file.name === pictureToDelete.file.name);
    this.pictures().splice(indexToDelete, 1);
    this.validatePictures();
  }

}
