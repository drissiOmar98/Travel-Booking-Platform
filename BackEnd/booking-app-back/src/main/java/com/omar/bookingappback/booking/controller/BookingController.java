package com.omar.bookingappback.booking.controller;


import com.omar.bookingappback.booking.dto.BookedDateDTO;
import com.omar.bookingappback.booking.dto.BookedListingDTO;
import com.omar.bookingappback.booking.dto.NewBookingDTO;
import com.omar.bookingappback.booking.service.BookingService;
import com.omar.bookingappback.config.SecurityUtils;
import com.omar.bookingappback.shared.state.State;
import com.omar.bookingappback.shared.state.StatusNotification;
import jakarta.validation.Valid;
import org.springframework.http.ProblemDetail;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller for handling booking-related API requests.
 * This class exposes endpoints for creating bookings, checking availability,
 * retrieving booked listings, canceling bookings, and retrieving booked listings
 * specific to landlords.
 */
@RestController
@RequestMapping("/api/booking")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    /**
     * Creates a new booking based on the provided booking details.
     *
     * @param newBookingDTO The DTO containing details for the new booking.
     * @return A ResponseEntity containing a Boolean indicating the success of the operation.
     *         If an error occurs during creation, a BAD_REQUEST status and error details are returned.
     */
    @PostMapping("create")
    public ResponseEntity<Boolean> create(@Valid @RequestBody NewBookingDTO newBookingDTO) {
        State<Void, String> createState = bookingService.create(newBookingDTO);
        if (createState.getStatus().equals(StatusNotification.ERROR)) {
            ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, createState.getError());
            return ResponseEntity.of(problemDetail).build();
        } else {
            return ResponseEntity.ok(true);
        }
    }

    /**
     * Checks the availability of dates for a specific listing.
     *
     * @param listingPublicId The public ID of the listing to check availability for.
     * @return A ResponseEntity containing a list of booked dates for the specified listing.
     */
    @GetMapping("check-availability")
    public ResponseEntity<List<BookedDateDTO>> checkAvailability(@RequestParam UUID listingPublicId) {
        return ResponseEntity.ok(bookingService.checkAvailability(listingPublicId));
    }

    /**
     * Retrieves the list of booked listings for the authenticated user.
     *
     * @return A ResponseEntity containing a list of BookedListingDTOs.
     */
    @GetMapping("get-booked-listing")
    public ResponseEntity<List<BookedListingDTO>> getBookedListing() {
        return ResponseEntity.ok(bookingService.getBookedListing());
    }

    /**
     * Cancels a booking based on the provided booking ID and listing ID.
     *
     * @param bookingPublicId The public ID of the booking to cancel.
     * @param listingPublicId The public ID of the listing associated with the booking.
     * @param byLandlord Indicates whether the cancellation request is made by the landlord.
     * @return A ResponseEntity containing the public ID of the canceled booking.
     *         If an error occurs during cancellation, a BAD_REQUEST status and error details are returned.
     */
    @DeleteMapping("cancel")
    public ResponseEntity<UUID> cancel(@RequestParam UUID bookingPublicId,
                                       @RequestParam UUID listingPublicId,
                                       @RequestParam boolean byLandlord) {
        State<UUID, String> cancelState = bookingService.cancel(bookingPublicId, listingPublicId, byLandlord);
        if (cancelState.getStatus().equals(StatusNotification.ERROR)) {
            ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, cancelState.getError());
            return ResponseEntity.of(problemDetail).build();
        } else {
            return ResponseEntity.ok(bookingPublicId);
        }
    }

    /**
     * Retrieves the list of booked listings for landlords.
     *
     * @return A ResponseEntity containing a list of BookedListingDTOs specific to landlords.
     *         Access to this endpoint is restricted to users with the landlord role.
     */
    @GetMapping("get-booked-listing-for-landlord")
    @PreAuthorize("hasAnyRole('" + SecurityUtils.ROLE_LANDLORD + "')")
    public ResponseEntity<List<BookedListingDTO>> getBookedListingForLandlord() {
        return ResponseEntity.ok(bookingService.getBookedListingForLandlord());
    }





}
