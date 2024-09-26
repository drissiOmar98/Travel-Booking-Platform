import {Component, EventEmitter, input, Output} from '@angular/core';
import {FaIconComponent} from "@fortawesome/angular-fontawesome";

@Component({
  selector: 'app-info-step-control',
  standalone: true,
  imports: [
    FaIconComponent
  ],
  templateUrl: './info-step-control.component.html',
  styleUrl: './info-step-control.component.scss'
})

/**
 * A component that controls and emits changes to a numeric value, allowing for increment and decrement actions.
 * It includes customizable options like minimum value, separator display, and a title.
 */
export class InfoStepControlComponent {

  title = input.required<string>();
  value = input.required<number>();
  minValue = input<number>(0);

  @Output()
  valueChange = new EventEmitter<number>();

  separator = input<boolean>(true);

  onIncrement() {
    this.valueChange.emit(this.value() + 1);
  }

  onDecrement() {
    this.valueChange.emit(this.value() - 1);
  }

}
