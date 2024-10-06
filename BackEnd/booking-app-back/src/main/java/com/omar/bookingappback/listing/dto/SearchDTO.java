package com.omar.bookingappback.listing.dto;

import com.omar.bookingappback.booking.dto.BookedDateDTO;
import com.omar.bookingappback.listing.dto.sub.ListingInfoDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

public record SearchDTO(
        @Valid BookedDateDTO dates,
        @Valid ListingInfoDTO infos,
        @NotEmpty String location
) {
}
