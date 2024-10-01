package com.omar.bookingappback.booking.mapper;

import com.omar.bookingappback.booking.Booking;
import com.omar.bookingappback.booking.dto.BookedDateDTO;
import com.omar.bookingappback.booking.dto.NewBookingDTO;
import org.mapstruct.Mapper;

/**
 * Mapper interface for converting between Booking entities and DTOs.
 * This interface uses MapStruct to generate implementations for mapping
 * between NewBookingDTO and Booking, as well as between Booking and BookedDateDTO.
 */
@Mapper(componentModel = "spring")
public interface BookingMapper {

    /**
     * Converts a NewBookingDTO to a Booking entity.
     *
     * @param newBookingDTO the DTO containing booking information
     * @return the corresponding Booking entity
     */
    Booking newBookingToBooking(NewBookingDTO newBookingDTO);

    /**
     * Converts a Booking entity to a BookedDateDTO for availability checks.
     *
     * @param booking the Booking entity to convert
     * @return a BookedDateDTO containing the relevant date information
     */
    BookedDateDTO bookingToCheckAvailability(Booking booking);

}
