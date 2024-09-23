package com.omar.bookingappback.listing.dto.sub;

import com.omar.bookingappback.listing.dto.vo.DescriptionVO;
import com.omar.bookingappback.listing.dto.vo.TitleVO;
import jakarta.validation.constraints.NotNull;

public record DescriptionDTO(
        @NotNull TitleVO title,
        @NotNull DescriptionVO description
) {
}
