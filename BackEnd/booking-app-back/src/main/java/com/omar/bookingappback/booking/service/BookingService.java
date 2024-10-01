package com.omar.bookingappback.booking.service;

import com.omar.bookingappback.booking.Booking;
import com.omar.bookingappback.booking.BookingRepository;
import com.omar.bookingappback.booking.dto.BookedDateDTO;
import com.omar.bookingappback.booking.dto.NewBookingDTO;
import com.omar.bookingappback.booking.mapper.BookingMapper;
import com.omar.bookingappback.listing.dto.ListingCreateBookingDTO;
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


}
