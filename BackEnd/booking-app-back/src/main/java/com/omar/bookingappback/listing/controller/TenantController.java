package com.omar.bookingappback.listing.controller;

import com.omar.bookingappback.listing.BookingCategory;
import com.omar.bookingappback.listing.dto.DisplayCardListingDTO;
import com.omar.bookingappback.listing.dto.DisplayListingDTO;
import com.omar.bookingappback.listing.dto.SearchDTO;
import com.omar.bookingappback.listing.service.TenantService;
import com.omar.bookingappback.shared.state.State;
import com.omar.bookingappback.shared.state.StatusNotification;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/tenant-listing")
public class TenantController {

    private final TenantService tenantService;


    public TenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    /**
     * Endpoint to retrieve all listings filtered by the specified booking category.
     * If the `BookingCategory` is `ALL`, it fetches all available listings with only their cover picture.
     * Otherwise, it returns the listings for the specified category with their cover picture.
     *
     * This method supports pagination to handle large datasets.
     *
     * @param pageable The `Pageable` object representing pagination information.
     * @param category The `BookingCategory` used to filter listings.
     * @return A `ResponseEntity` containing a paginated list of `DisplayCardListingDTO`.
     */
    @GetMapping("/get-all-by-category")
    public ResponseEntity<Page<DisplayCardListingDTO>> findAllByBookingCategory(Pageable pageable,
                                                                                @RequestParam BookingCategory category) {
        return ResponseEntity.ok(tenantService.getAllByCategory(pageable, category));
    }



    /**
     * Endpoint to retrieve detailed information for a specific listing identified by its public ID.
     * The response contains the listing's details if found, or a `ProblemDetail` if the listing doesn't exist.
     *
     * @param publicId The UUID representing the public ID of the listing.
     * @return A `ResponseEntity` containing the `DisplayListingDTO` with the listing's details,
     *         or a `ProblemDetail` if the listing is not found.
     */
    @GetMapping("/get-one")
    public ResponseEntity<DisplayListingDTO> getOne(@RequestParam UUID publicId) {
        State<DisplayListingDTO, String> displayListingState = tenantService.getOne(publicId);
        if (displayListingState.getStatus().equals(StatusNotification.OK)) {
            return ResponseEntity.ok(displayListingState.getValue());
        } else {
            ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, displayListingState.getError());
            return ResponseEntity.of(problemDetail).build();
        }
    }



    /**
     * Handles search requests for listings based on various search criteria provided by the tenant.
     * This endpoint allows clients to search for listings using filters like location, price, and more,
     * and returns a paginated list of matching listings.
     *
     * @param pageable  The pagination information, such as page number, size, and sorting options.
     *                  This parameter controls how the search results are paginated.
     * @param searchDTO The search criteria provided by the client, encapsulated in a SearchDTO object.
     *                  This object contains filters like location, price range, number of rooms, etc.
     *
     * @return A paginated response entity containing a page of DisplayCardListingDTO objects that match
     *         the search criteria. Each DTO represents a listing card with relevant display information.
     */
    @PostMapping("/search")
    public ResponseEntity<Page<DisplayCardListingDTO>> search(Pageable pageable,
                                                              @Valid @RequestBody SearchDTO searchDTO) {
        return ResponseEntity.ok(tenantService.search(pageable, searchDTO));
    }
}
