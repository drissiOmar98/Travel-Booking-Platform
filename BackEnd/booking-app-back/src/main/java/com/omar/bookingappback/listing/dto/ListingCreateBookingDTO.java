package com.omar.bookingappback.listing.dto;

import com.omar.bookingappback.listing.dto.vo.PriceVO;

import java.util.UUID;

public record ListingCreateBookingDTO(
        UUID listingPublicId, PriceVO price
) {
}
