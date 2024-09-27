package com.omar.bookingappback.listing.dto;

import com.omar.bookingappback.listing.BookingCategory;
import com.omar.bookingappback.listing.dto.sub.PictureDTO;
import com.omar.bookingappback.listing.dto.vo.PriceVO;

import java.util.UUID;

public record DisplayCardListingDTO(
        PriceVO price,
        String location,
        PictureDTO cover,
        BookingCategory bookingCategory,
        UUID publicId
) {
}
