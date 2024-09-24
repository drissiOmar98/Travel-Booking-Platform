import {Component, effect, inject, OnDestroy} from '@angular/core';
import {DynamicDialogRef} from "primeng/dynamicdialog";
import {LandlordListingService} from "../landlordListing.service";
import {AuthService} from "../../core/auth/auth.service";
import {Router} from "@angular/router";
import {ToastService} from "../../layout/toast.service";
import {Step} from "./step.model";
import {CreatedListing, Description, NewListing, NewListingInfo} from "../model/listing.model";
import {NewListingPicture} from "../model/picture.model";
import {State} from "../../core/model/state.model";
import {CategoryName} from "../../layout/navbar/category/category.model";
import {PriceVO} from "../model/listing-vo.model";

@Component({
  selector: 'app-properties-create',
  standalone: true,
  imports: [],
  templateUrl: './properties-create.component.html',
  styleUrl: './properties-create.component.scss'
})
export class PropertiesCreateComponent implements OnDestroy  {
  CATEGORY = "category";
  LOCATION = "location";
  INFO = "info";
  PHOTOS = "photos";
  DESCRIPTION = "description";
  PRICE = "price";


  dialogDynamicRef = inject(DynamicDialogRef);
  listingService = inject(LandlordListingService);
  toastService = inject(ToastService);
  userService = inject(AuthService);
  router = inject(Router);

  steps: Step[] = [
    {
      id: this.CATEGORY,
      idNext: this.LOCATION,
      idPrevious: null,
      isValid: false
    },
    {
      id: this.LOCATION,
      idNext: this.INFO,
      idPrevious: this.CATEGORY,
      isValid: false
    },
    {
      id: this.INFO,
      idNext: this.PHOTOS,
      idPrevious: this.LOCATION,
      isValid: false
    },
    {
      id: this.PHOTOS,
      idNext: this.DESCRIPTION,
      idPrevious: this.INFO,
      isValid: false
    },
    {
      id: this.DESCRIPTION,
      idNext: this.PRICE,
      idPrevious: this.PHOTOS,
      isValid: false
    },
    {
      id: this.PRICE,
      idNext: null,
      idPrevious: this.DESCRIPTION,
      isValid: false
    }
  ];

  currentStep = this.steps[0];

  newListing: NewListing = {
    category: "AMAZING_VIEWS",
    infos: {
      guests: {value: 0},
      bedrooms: {value: 0},
      beds: {value: 0},
      baths: {value: 0}
    },
    location: "",
    pictures: new Array<NewListingPicture>(),
    description: {
      title: {value: ""},
      description: {value: ""}
    },
    price: {value: 0}
  };


  /* Flag to track whether the listing creation is in progress */
  loadingCreation = false;

  constructor() {
    this.listenFetchUser();
    this.listenListingCreation();
  }

  /**
   * Initiates the process of creating a new listing by calling the listing service.
   * Sets the `loadingCreation` flag to true while the process is in progress.
   */
  createListing(): void {
    this.loadingCreation = true;
    this.listingService.create(this.newListing);
  }

  /**
   * Cleans up resources or subscriptions when the component is destroyed.
   * Resets the listing creation state by calling the `resetListingCreation` method of the listing service.
   */
  ngOnDestroy(): void {
    this.listingService.resetListingCreation();
  }

  /**
   * Listens for changes in the user fetch status and listing creation status.
   * If both are successful, navigates to the landlord's properties page.
   */
  listenFetchUser() {
    effect(() => {
      if (this.userService.fetchUser().status === "OK"
        && this.listingService.createSig().status === "OK") {
        this.router.navigate(["landlord", "properties"]);
      }
    });
  }


  /**
   * Listens for changes in the listing creation process.
   * Calls the appropriate handler method based on whether the creation was successful or resulted in an error.
   */
  listenListingCreation() {

    // Start a reactive effect. This will run automatically whenever the reactive signals it depends on (in this case, createSig) change.
    effect(() => {

      // Get the current state of the listing creation process by accessing the createSig signal.
      let createdListingState = this.listingService.createSig();

      // Check if the status of the listing creation process is "OK" (meaning the creation was successful).
      if (createdListingState.status === "OK") {

        // If the creation is successful, call the onCreateOk handler to handle the success scenario.
        this.onCreateOk(createdListingState);

        // Check if the status of the listing creation process is "ERROR" (meaning the creation failed).
      } else if (createdListingState.status === "ERROR") {

        // If there was an error during the creation process, call the onCreateError handler to handle the error scenario.
        this.onCreateError();
      }
    });
  }


  /**
   * Handles successful creation of a property listing.
   * Displays a success toast notification, closes the dialog, and refreshes user data.
   *
   * @param createdListingState - The state object containing details about the created listing.
   */
  onCreateOk(createdListingState: State<CreatedListing>) {
    this.loadingCreation = false;
    this.toastService.send({
      severity: "success", summary: "Success", detail: "Listing created successfully.",
    });
    this.dialogDynamicRef.close(createdListingState.value?.publicId);
    this.userService.fetch(true);
  }

  /**
   * Handles errors that occur during the listing creation process.
   * Displays an error toast notification.
   */
  private onCreateError() {
    this.loadingCreation = false;
    this.toastService.send({
      severity: "error", summary: "Error", detail: "Couldn't create your listing, please try again.",
    });
  }

  /**
   * Advances to the next step in the property creation wizard.
   * If there is a next step, updates the `currentStep` to the corresponding step.
   */
  nextStep(): void {
    if (this.currentStep.idNext !== null) {
      this.currentStep = this.steps.filter((step: Step) => step.id === this.currentStep.idNext)[0];
    }
  }

  /**
   * Moves to the previous step in the property creation wizard.
   * If there is a previous step, updates the `currentStep` to the corresponding step.
   */
  previousStep(): void {
    if (this.currentStep.idPrevious !== null) {
      this.currentStep = this.steps.filter((step: Step) => step.id === this.currentStep.idPrevious)[0];
    }
  }

  /**
   * Checks if all steps in the wizard are valid.
   *
   * @returns `true` if all steps have `isValid` set to `true`; otherwise `false`.
   */
  isAllStepsValid(): boolean {
    return this.steps.filter(step => step.isValid).length === this.steps.length;
  }

  /**
   * Updates the `category` of the new listing when the category is changed in the UI.
   *
   * @param newCategory - The new category selected for the listing.
   */
  onCategoryChange(newCategory: CategoryName): void {
    this.newListing.category = newCategory;
  }

  /**
   * Updates the validity status of the current step.
   *
   * @param validity - Boolean value indicating whether the current step is valid or not.
   */
  onValidityChange(validity: boolean) {
    this.currentStep.isValid = validity;
  }

  /**
   * Updates the `location` of the new listing when the location is changed in the UI.
   *
   * @param newLocation - The new location selected for the listing.
   */
  onLocationChange(newLocation: string) {
    this.newListing.location = newLocation;
  }

  /**
   * Updates the `infos` of the new listing when the listing information is changed in the UI.
   *
   * @param newInfo - The new listing information object.
   */
  onInfoChange(newInfo: NewListingInfo) {
    this.newListing.infos = newInfo;
  }

  /**
   * Updates the `pictures` of the new listing when new pictures are added or removed.
   *
   * @param newPictures - The array of updated pictures for the listing.
   */
  onPictureChange(newPictures: NewListingPicture[]) {
    this.newListing.pictures = newPictures;
  }

  /**
   * Updates the `description` of the new listing when the description is changed in the UI.
   *
   * @param newDescription - The updated description for the listing.
   */
  onDescriptionChange(newDescription: Description) {
    this.newListing.description = newDescription;
  }

  /**
   * Updates the `price` of the new listing when the price is changed in the UI.
   *
   * @param newPrice - The updated price value object for the listing.
   */
  onPriceChange(newPrice: PriceVO) {
    this.newListing.price = newPrice;
  }




}
