import {HttpErrorResponse} from '@angular/common/http'; // Import HttpErrorResponse

// Define the possible status notifications as a union type
export type StatusNotification = 'OK' | 'ERROR' | 'INIT';

// This class represents the state of a request, with a value (data), error, and status
export class State<T, V = HttpErrorResponse> {
  value?: T;  // The value or data returned from the request (optional)
  error?: V | HttpErrorResponse; // Allow error to be V or HttpErrorResponse
  status: StatusNotification; // The status of the request ('OK', 'ERROR', 'INIT')

  // Constructor to initialize the state with status, value, and error
  constructor(status: StatusNotification, value?: T, error?: V | HttpErrorResponse) {
    this.value = value;  // Set the value if provided
    this.error = error;  // Set the error if provided
    this.status = status; // Set the request status
  }
  // A static method to initiate the StateBuilder, useful for chaining methods
  static Builder<T = any, V = HttpErrorResponse>() {
    return new StateBuilder<T, V>();
  }
}
// Builder class to help create different states (success, error, or init)
class StateBuilder<T, V = HttpErrorResponse> {
  private status: StatusNotification = 'INIT';
  private value?: T;
  private error?: V | HttpErrorResponse; // Allow error to be V or HttpErrorResponse

  // Method to create a success state with a value
  public forSuccess(value: T): State<T, V> {
    this.value = value;
    return new State<T, V>('OK', this.value, this.error);
  }
  // Method to create an error state, accepting an error and an optional value
  public forError(error: V | HttpErrorResponse = new HttpErrorResponse({ error: 'Unknown Error' }), value?: T): State<T, V> {
    this.value = value;
    this.error = error;
    return new State<T, V>('ERROR', this.value, this.error);
  }
  // Method to create an initial state (without value or error)
  public forInit(): State<T, V> {
    return new State<T, V>('INIT', this.value, this.error);
  }
}
