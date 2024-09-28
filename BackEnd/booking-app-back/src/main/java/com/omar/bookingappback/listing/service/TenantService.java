package com.omar.bookingappback.listing.service;


import com.omar.bookingappback.listing.BookingCategory;
import com.omar.bookingappback.listing.Listing;
import com.omar.bookingappback.listing.dto.DisplayCardListingDTO;
import com.omar.bookingappback.listing.dto.DisplayListingDTO;
import com.omar.bookingappback.listing.dto.sub.LandlordListingDTO;
import com.omar.bookingappback.listing.mapper.ListingMapper;
import com.omar.bookingappback.listing.repository.ListingRepository;
import com.omar.bookingappback.shared.state.State;
import com.omar.bookingappback.user.dto.ReadUserDTO;
import com.omar.bookingappback.user.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class TenantService {

    private final ListingRepository listingRepository;

    private final ListingMapper listingMapper;

    private final UserService userService;

    public TenantService(ListingRepository listingRepository, ListingMapper listingMapper, UserService userService) {
        this.listingRepository = listingRepository;
        this.listingMapper = listingMapper;
        this.userService = userService;

    }

    /**
     * Retrieves a paginated list of listings filtered by booking category.
     * If the category is `ALL`, all listings are retrieved with only the cover picture loaded.
     * Otherwise, the listings for the specified category are returned with their cover picture.
     *
     * @param pageable The `Pageable` object representing pagination information.
     * @param category The `BookingCategory` to filter listings by.
     * @return A paginated list of `DisplayCardListingDTO` objects representing the listings.
     */
    public Page<DisplayCardListingDTO> getAllByCategory(Pageable pageable, BookingCategory category) {
        Page<Listing> allOrBookingCategory;
        if (category == BookingCategory.ALL) {
            allOrBookingCategory = listingRepository.findAllWithCoverOnly(pageable);
        } else {
            allOrBookingCategory = listingRepository.findAllByBookingCategoryWithCoverOnly(pageable, category);
        }

        return allOrBookingCategory.map(listingMapper::listingToDisplayCardListingDTO);
    }

    /**
     * Retrieves detailed information for a specific listing based on its public ID.
     * The method returns a success state with a `DisplayListingDTO` if the listing exists,
     * or an error state if the listing is not found.
     *
     * This method also fetches the landlord's information and adds it to the `DisplayListingDTO`.
     *
     * @param publicId The UUID representing the listing's public ID.
     * @return A `State<DisplayListingDTO, String>` containing the listing details on success,
     *         or an error message if the listing does not exist.
     */
    @Transactional(readOnly = true)
    public State<DisplayListingDTO, String> getOne(UUID publicId) {
        Optional<Listing> listingByPublicIdOpt = listingRepository.findByPublicId(publicId);

        if (listingByPublicIdOpt.isEmpty()) {
            return State.<DisplayListingDTO, String>builder()
                    .forError(String.format("Listing doesn't exist for publicId: %s", publicId));
        }

        DisplayListingDTO displayListingDTO = listingMapper.listingToDisplayListingDTO(listingByPublicIdOpt.get());

        ReadUserDTO readUserDTO = userService.getByPublicId(listingByPublicIdOpt.get().getLandlordPublicId()).orElseThrow();
        LandlordListingDTO landlordListingDTO = new LandlordListingDTO(readUserDTO.firstName(), readUserDTO.imageUrl());
        displayListingDTO.setLandlord(landlordListingDTO);

        return State.<DisplayListingDTO, String>builder().forSuccess(displayListingDTO);
    }





}
