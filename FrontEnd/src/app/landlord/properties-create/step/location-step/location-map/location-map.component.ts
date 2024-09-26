import {Component, effect, EventEmitter, inject, input, Output} from '@angular/core';
import {AutoCompleteCompleteEvent, AutoCompleteModule, AutoCompleteSelectEvent} from "primeng/autocomplete";
import {FormsModule} from "@angular/forms";
import {LeafletModule} from "@asymmetrik/ngx-leaflet";
import {CountryService} from "../country.service";
import {ToastService} from "../../../../../layout/toast.service";
import {OpenStreetMapProvider} from "leaflet-geosearch";
import {Country} from "../country.model";
import L, {circle, latLng, polygon, tileLayer} from "leaflet";


// Fix for missing marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
/**
 * Component for displaying a map and allowing users to select their location.
 * Integrates with OpenStreetMap and supports location changes and autocomplete functionality.
 */
@Component({
  selector: 'app-location-map',
  standalone: true,
  imports: [
    LeafletModule,
    FormsModule,
    AutoCompleteModule
  ],
  templateUrl: './location-map.component.html',
  styleUrl: './location-map.component.scss'
})
export class LocationMapComponent {

  countryService = inject(CountryService);
  toastService = inject(ToastService);

  private map: L.Map | undefined;
  private provider: OpenStreetMapProvider | undefined;

  /** Input signal representing the currently selected location (country code). */
  location = input.required<string>();

  /** Placeholder text for location input. */
  placeholder = input<string>("Select your home country");

  currentLocation: Country | undefined;


  // Event emitter to notify when the location changes.
  @Output()
  locationChange = new EventEmitter<string>();

  /**
   * Formats the label for each country in the dropdown list.
   * @param country - The country object to format.
   * @returns A formatted string combining the country's flag and common name.
   */
  //formatLabel = (country: Country) => country.flag + "   " + country.name.common;
  formatLabel = (country: Country) => {
    return country.name.common; // We will handle the flag rendering in the template
  };


  // Map options including layers, zoom level, and center coordinates
  options = {
    layers: [
      tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {maxZoom: 18, attribution: "..."}),
    ],
    zoom: 5,
    center: latLng(46.87996, -121.726909)
  }

  // Layer controls with base layers and overlay options
  layersControl = {
    baseLayers: {
      "Open Street Map": tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "..."
      }),
    },
    overlays: {
      "Big Circle": circle([46.95, -122], {radius: 5000}),
      "Big square": polygon([[46.8, -121.55], [46.8, -121.55], [46.8, -121.55], [46.8, -121.55]])
    }
  }

  countries: Array<Country> = [];
  filteredCountries: Array<Country> = [];


  constructor() {
    this.listenToLocation();
  }

  /**
   * Event handler for when the map is ready. Initializes the search control.
   * @param map - The Leaflet map instance.
   */
  onMapReady(map: L.Map) {
    this.map = map;
    this.configSearchControl();
  }


  /**
   * Configures the search control provider using OpenStreetMap.
   */
  private configSearchControl() {
    this.provider = new OpenStreetMapProvider();
  }

  /**
   * Event handler for location changes in the autocomplete dropdown.
   * Emits the new country code when the user selects a different country.
   * @param newEvent - The event containing the newly selected country.
   */
  onLocationChange(newEvent: AutoCompleteSelectEvent) {
    const newCountry = newEvent.value as Country;
    this.locationChange.emit(newCountry.cca3);
  }

  /**
   * Listens for location changes and fetches the list of countries from the country service.
   * If the country data is successfully loaded, it updates the country list and map location.
   */
  private listenToLocation() {
    effect(() => {
      const countriesState = this.countryService.countries();
      if (countriesState.status === "OK" && countriesState.value) {
        this.countries = countriesState.value;
        this.filteredCountries = countriesState.value;
        this.changeMapLocation(this.location())
      } else if (countriesState.status === "ERROR") {
        this.toastService.send({
          severity: "error", summary: "Error",
          detail: "Something went wrong when loading countries on change location"
        });
      }
    });
  }

  /**
   * Changes the map location based on the selected country.
   * Searches for the country's location and updates the map view accordingly.
   * @param term - The country code of the selected country.
   */
  private changeMapLocation(term: string) {
    this.currentLocation = this.countries.find(country => country.cca3 === term);
    if (this.currentLocation) {
      this.provider!.search({query: this.currentLocation.name.common})
        .then((results) => {
          if (results && results.length > 0) {
            const firstResult = results[0];
            this.map!.setView(new L.LatLng(firstResult.y, firstResult.x), 13);
            L.marker([firstResult.y, firstResult.x])
              .addTo(this.map!)
              .bindPopup(firstResult.label)
              .openPopup();
          }
        })
    }
  }

  /**
   * Filters the list of countries for the autocomplete input based on user input.
   * @param newCompleteEvent - The event containing the user's input for filtering.
   */
  search(newCompleteEvent: AutoCompleteCompleteEvent): void {
    this.filteredCountries =
      this.countries.filter(country => country.name.common.toLowerCase().startsWith(newCompleteEvent.query))
  }

  //protected readonly filter = filter;



}
