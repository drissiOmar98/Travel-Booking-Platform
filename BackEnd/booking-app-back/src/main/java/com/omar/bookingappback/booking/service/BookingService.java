package com.omar.bookingappback.booking.service;

import com.omar.bookingappback.booking.Booking;
import com.omar.bookingappback.booking.BookingRepository;
import com.omar.bookingappback.booking.dto.BookedDateDTO;
import com.omar.bookingappback.booking.dto.BookedListingDTO;
import com.omar.bookingappback.booking.dto.NewBookingDTO;
import com.omar.bookingappback.booking.mapper.BookingMapper;
import com.omar.bookingappback.config.SecurityUtils;
import com.omar.bookingappback.listing.dto.DisplayCardListingDTO;
import com.omar.bookingappback.listing.dto.ListingCreateBookingDTO;
import com.omar.bookingappback.listing.dto.vo.PriceVO;
import com.omar.bookingappback.listing.service.LandlordService;
import com.omar.bookingappback.shared.state.State;
import com.omar.bookingappback.user.dto.ReadUserDTO;
import com.omar.bookingappback.user.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service class for handling booking-related operations.
 *
 * This service provides methods to create new bookings and manage booking logic,
 * including validation and persistence of booking data.
 */
@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingMapper bookingMapper;
    private final UserService userService;
    private final LandlordService landlordService;

    /**
     * Constructs a BookingService with the required dependencies.
     *
     * @param bookingRepository the repository for managing bookings
     * @param bookingMapper the mapper for converting between Booking entities and DTOs
     * @param userService the service for managing user-related operations
     * @param landlordService the service for managing landlord-related operations
     */
    public BookingService(BookingRepository bookingRepository, BookingMapper bookingMapper,
                          UserService userService, LandlordService landlordService) {
        this.bookingRepository = bookingRepository;
        this.bookingMapper = bookingMapper;
        this.userService = userService;
        this.landlordService = landlordService;
    }

    /**
     * Creates a new booking based on the provided NewBookingDTO.
     *
     * This method performs the following steps:
     * 1. Maps the NewBookingDTO to a Booking entity.
     * 2. Retrieves the corresponding listing to ensure it exists.
     * 3. Checks if there are already existing bookings for the specified date range.
     * 4. Sets the necessary properties on the Booking entity (including total price).
     * 5. Saves the Booking entity to the repository.
     *
     * @param newBookingDTO the DTO containing booking details
     * @return a State indicating the success or failure of the operation, along with any relevant messages
     */
    @Transactional
    public State<Void, String> create(NewBookingDTO newBookingDTO) {

        Booking booking = bookingMapper.newBookingToBooking(newBookingDTO);

        Optional<ListingCreateBookingDTO> listingOpt = landlordService.getByListingPublicId(newBookingDTO.listingPublicId());

        if (listingOpt.isEmpty()) {
            return State.<Void, String>builder().forError("Landlord public id not found");
        }

        boolean alreadyBooked = bookingRepository.bookingExistsAtInterval(newBookingDTO.startDate(), newBookingDTO.endDate(), newBookingDTO.listingPublicId());

        if (alreadyBooked) {
            return State.<Void, String>builder().forError("One booking already exists");
        }

        ListingCreateBookingDTO listingCreateBookingDTO = listingOpt.get();

        booking.setFkListing(listingCreateBookingDTO.listingPublicId());
        ReadUserDTO connectedUser = userService.getAuthenticatedUserFromSecurityContext();
        booking.setFkTenant(connectedUser.publicId());
        booking.setNumberOfTravelers(1);
        long numberOfNights = ChronoUnit.DAYS.between(booking.getStartDate(), booking.getEndDate());
        booking.setTotalPrice((int) (numberOfNights * listingCreateBookingDTO.price().value()));

        bookingRepository.save(booking);

        return State.<Void, String>builder().forSuccess();

    }

    /**
     * Checks the availability of bookings for a specific listing.
     *
     * This method retrieves all bookings associated with the given listing public ID
     * and maps them to a list of BookedDateDTO objects, which represent the dates
     * that are booked for the listing.
     *
     * @param publicId the public ID of the listing to check for availability
     * @return a list of BookedDateDTO representing the booked dates for the specified listing
     */
    @Transactional(readOnly = true)
    public List<BookedDateDTO> checkAvailability(UUID publicId) {
        return bookingRepository.findAllByFkListing(publicId)
                .stream().map(bookingMapper::bookingToCheckAvailability).toList();
    }


    /**
     * Retrieves a list of booked listings for the currently authenticated user.
     * This method gathers the user's bookings and the corresponding listing details
     * to return a comprehensive view of their booked listings.
     *
     * @return List of BookedListingDTO containing information about each booked listing.
     */
    @Transactional(readOnly = true)
    public List<BookedListingDTO> getBookedListing() {
        // Fetch the currently authenticated user from the security context
        ReadUserDTO connectedUser = userService.getAuthenticatedUserFromSecurityContext();

        // Retrieve all bookings associated with the authenticated user (tenant)
        List<Booking> allBookings = bookingRepository.findAllByFkTenant(connectedUser.publicId());

        // Extract all listing public IDs from the bookings
        List<UUID> allListingPublicIDs = allBookings.stream().map(Booking::getFkListing).toList();

        // Fetch detailed display information (such as cover image, location) for each listing
        List<DisplayCardListingDTO> allListings = landlordService.getCardDisplayByListingPublicId(allListingPublicIDs);

        // Map bookings and corresponding listing details to BookedListingDTO objects
        return mapBookingToBookedListing(allBookings, allListings);
    }

    /**
     * Maps the list of bookings and listings to a list of BookedListingDTO objects.
     * Combines the booking information with the corresponding listing details such as cover image,
     * location, booked dates, and total price.
     *
     * @param allBookings List of bookings made by the user.
     * @param allListings List of listings corresponding to the bookings, containing display information.
     * @return List of BookedListingDTO containing comprehensive details for each booked listing.
     */
    private List<BookedListingDTO> mapBookingToBookedListing(List<Booking> allBookings, List<DisplayCardListingDTO> allListings) {
        // Map each booking to a BookedListingDTO, matching each booking with its corresponding listing
        return allBookings.stream().map(booking -> {
            // Find the corresponding listing display details based on listing public ID
            DisplayCardListingDTO displayCardListingDTO = allListings
                    .stream()
                    .filter(listing -> listing.publicId().equals(booking.getFkListing()))
                    .findFirst()
                    .orElseThrow(); // Throws an exception if no matching listing is found

            // Convert the booking dates to BookedDateDTO using a mapper
            BookedDateDTO dates = bookingMapper.bookingToCheckAvailability(booking);

            // Create a new BookedListingDTO with relevant details like cover, location, booked dates, price, etc.
            return new BookedListingDTO(
                    displayCardListingDTO.cover(),       // Listing cover image
                    displayCardListingDTO.location(),    // Listing location
                    dates,                               // Booked dates (start and end dates)
                    new PriceVO(booking.getTotalPrice()),// Total price of the booking
                    booking.getPublicId(),               // Public ID of the booking
                    displayCardListingDTO.publicId()     // Public ID of the listing
            );
        }).toList();
    }


    /**
     * Cancels a booking based on the booking's public ID and the listing's public ID.
     * The method handles cancellation requests either from a landlord or a tenant.
     * If the booking is successfully deleted, the method returns a success state.
     * Otherwise, it returns an error state.
     *
     * @param bookingPublicId  The public ID of the booking to be canceled.
     * @param listingPublicId  The public ID of the listing associated with the booking.
     * @param byLandlord       Indicates whether the cancellation is initiated by the landlord.
     * @return State containing the booking public ID on success, or an error message on failure.
     */
    @Transactional
    public State<UUID, String> cancel(UUID bookingPublicId, UUID listingPublicId, boolean byLandlord) {
        // Retrieve the currently authenticated user
        ReadUserDTO connectedUser = userService.getAuthenticatedUserFromSecurityContext();
        int deleteSuccess = 0;

        // If the current user has the 'ROLE_LANDLORD' authority and the cancellation is by the landlord
        if (SecurityUtils.hasCurrentUserAnyOfAuthorities(SecurityUtils.ROLE_LANDLORD)
                && byLandlord) {
            // Handle booking deletion for the landlord
            deleteSuccess = handleDeletionForLandlord(bookingPublicId, listingPublicId, connectedUser, deleteSuccess);
        } else {
            // Handle booking deletion for the tenant (by the tenant)
            deleteSuccess = bookingRepository.deleteBookingByFkTenantAndPublicId(connectedUser.publicId(), bookingPublicId);
        }
        // Return success if the deletion was successful, otherwise return an error state
        if (deleteSuccess >= 1) {
            return State.<UUID, String>builder().forSuccess(bookingPublicId);
        } else {
            return State.<UUID, String>builder().forError("Booking not found");
        }

    }


    /**
     * Handles the deletion of a booking when the request comes from a landlord.
     * Verifies that the listing belongs to the landlord before proceeding with the deletion.
     *
     * @param bookingPublicId   The public ID of the booking to be deleted.
     * @param listingPublicId   The public ID of the listing associated with the booking.
     * @param connectedUser     The authenticated user making the deletion request (landlord).
     * @param deleteSuccess     An integer representing the result of the deletion operation.
     * @return An integer indicating the success of the deletion (1 or more for success, 0 for failure).
     */
    private int handleDeletionForLandlord(UUID bookingPublicId,
                                          UUID listingPublicId,
                                          ReadUserDTO connectedUser,
                                          int deleteSuccess)
    {
        // Verify if the listing exists and belongs to the currently authenticated landlord
        Optional<DisplayCardListingDTO> listingVerificationOpt = landlordService.getByPublicIdAndLandlordPublicId(listingPublicId, connectedUser.publicId());
        // If the listing exists, proceed to delete the booking associated with the listing
        if (listingVerificationOpt.isPresent()) {
            deleteSuccess = bookingRepository.deleteBookingByPublicIdAndFkListing(bookingPublicId, listingVerificationOpt.get().publicId());
        }
        return deleteSuccess;
    }

    /**
     * Retrieves all booked listings for the currently authenticated landlord.
     * This method finds all properties owned by the landlord and fetches all bookings
     * associated with these properties.
     *
     * @return A list of booked listings (`BookedListingDTO`) associated with the landlord's properties.
     */
    @Transactional(readOnly = true)
    public List<BookedListingDTO> getBookedListingForLandlord() {
        // Retrieve the currently authenticated landlord
        ReadUserDTO connectedUser = userService.getAuthenticatedUserFromSecurityContext();
        // Get all properties owned by the landlord
        List<DisplayCardListingDTO> allProperties = landlordService.getAllProperties(connectedUser);
        // Extract the public IDs of all properties
        List<UUID> allPropertyPublicIds = allProperties
                .stream()
                .map(DisplayCardListingDTO::publicId)
                .toList();
        // Fetch all bookings associated with the landlord's properties
        List<Booking> allBookings = bookingRepository.findAllByFkListingIn(allPropertyPublicIds);
        // Map the bookings to booked listings and return them
        return mapBookingToBookedListing(allBookings, allProperties);
    }

    /**
     * Gets the IDs of bookings that match the specified listings and booked date range.
     *
     * This method utilizes the `findAllMatchWithDate` repository method to find all
     * bookings that overlap with the provided booked date range and maps the results
     * to their corresponding listing IDs.
     *
     * @param listingsId The list of listing IDs to check for overlapping bookings.
     * @param bookedDateDTO The booked date range containing start and end dates.
     * @return A list of listing IDs that have bookings overlapping with the specified date range.
     */
    public List<UUID> getBookingMatchByListingIdsAndBookedDate(List<UUID> listingsId, BookedDateDTO bookedDateDTO) {
        return bookingRepository.findAllMatchWithDate(listingsId, bookedDateDTO.startDate(), bookedDateDTO.endDate())
                .stream()
                .map(Booking::getFkListing)
                .toList();
    }

}
