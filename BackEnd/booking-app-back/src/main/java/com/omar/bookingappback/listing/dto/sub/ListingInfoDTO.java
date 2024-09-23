package com.omar.bookingappback.listing.dto.sub;

import com.omar.bookingappback.listing.dto.vo.BathsVO;
import com.omar.bookingappback.listing.dto.vo.BedroomsVO;
import com.omar.bookingappback.listing.dto.vo.BedsVO;
import com.omar.bookingappback.listing.dto.vo.GuestsVO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public record ListingInfoDTO(
        @NotNull @Valid GuestsVO guests,
        @NotNull @Valid BedroomsVO bedrooms,
        @NotNull @Valid BedsVO beds,
        @NotNull @Valid BathsVO baths
) {
}
