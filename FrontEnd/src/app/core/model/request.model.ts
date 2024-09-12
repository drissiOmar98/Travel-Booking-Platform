import { HttpParams } from "@angular/common/http"; // Import HttpParams to handle query parameters for HTTP requests

// Interface representing the pagination options sent with a request
export interface Pagination {
  page: number;  // The current page number (0-based)
  size: number;  // The size of the page (number of items per page)
  sort: string[];  // Array of sorting criteria (e.g., ["field,asc", "field,desc"])
}

// Interface for Pageable, representing the pagination information in the response
export interface Pageable {
  pageNumber: number; // The current page number (0-based)
  pageSize: number;   // The size of the page (number of items per page)
  sort: Sort;         // Sorting information
  offset: number;     // Offset for the first item (used for calculation)
  paged: boolean;     // Flag indicating if the request is paged
  unpaged: boolean;   // Flag indicating if the request is unpaged
}

// Interface for Sort, describing sorting behavior in the response
export interface Sort {
  empty: boolean;   // Whether the sort information is empty
  sorted: boolean;  // Whether the data is sorted
  unsorted: boolean; // Whether the data is unsorted
}

// Interface for Page, representing a paginated response with generic type T for content
export interface Page<T> {
  content: T[];           // The actual content of the current page
  pageable: Pageable;      // Pageable details for the current page
  last: boolean;           // Indicates if this is the last page
  totalElements: number;   // Total number of elements across all pages
  totalPages: number;      // Total number of pages
  sort: Sort;              // Sorting information
  number: number;          // The page number (0-based)
  size: number;            // The size of the current page
  first: boolean;          // Indicates if this is the first page
  numberOfElements: number; // Number of elements on the current page
  empty: boolean;          // Whether the page is empty
}

// Helper function to create query parameters for pagination
export const createPaginationOption = (req: Pagination): HttpParams => {
  let params = new HttpParams(); // Initialize HttpParams to handle query parameters
  // Add the "page" and "size" parameters to the query
  params = params.append("page", req.page).append("size", req.size);

  // Add each sorting criterion to the query parameters
  req.sort.forEach(value => {
    params = params.append("sort", value);
  });

  return params; // Return the populated HttpParams object
};
