package com.omar.bookingappback.listing.service;


import com.omar.bookingappback.booking.service.BookingService;
import com.omar.bookingappback.listing.BookingCategory;
import com.omar.bookingappback.listing.Listing;
import com.omar.bookingappback.listing.dto.DisplayCardListingDTO;
import com.omar.bookingappback.listing.dto.DisplayListingDTO;
import com.omar.bookingappback.listing.dto.SearchDTO;
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

    private final BookingService bookingService;

    public TenantService(ListingRepository listingRepository, ListingMapper listingMapper, UserService userService, BookingService bookingService) {

        this.listingRepository = listingRepository;
        this.listingMapper = listingMapper;
        this.userService = userService;
        this.bookingService = bookingService;

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


    /**
     * Searches for listings based on specific criteria and filters out those that are already booked
     * within the specified date range.
     *
     * @param pageable   the pagination and sorting information
     * @param newSearch  the search criteria containing location, number of bathrooms, bedrooms, guests, beds, and booking dates
     * @return a paginated list of listings (DisplayCardListingDTO) that match the search criteria and are available for the specified dates
     */
    @Transactional(readOnly = true)
    public Page<DisplayCardListingDTO> search(Pageable pageable, SearchDTO newSearch) {

        // Retrieve listings that match the specified location and property details
        Page<Listing> allMatchedListings = listingRepository.findAllByLocationAndBathroomsAndBedroomsAndGuestsAndBeds(
                pageable,
                newSearch.location(),
                newSearch.infos().baths().value(),
                newSearch.infos().bedrooms().value(),
                newSearch.infos().guests().value(),
                newSearch.infos().beds().value()
        );

        // Extract public IDs from the listings that matched the initial search criteria
        List<UUID> listingUUIDs = allMatchedListings.stream()
                .map(Listing::getPublicId)
                .toList();

        // Get the IDs of listings that are already booked within the specified date range
        List<UUID> bookingUUIDs = bookingService.getBookingMatchByListingIdsAndBookedDate(
                listingUUIDs,
                newSearch.dates()
        );

        // Filter out booked listings, transform the remaining available listings to DTOs for display
        List<DisplayCardListingDTO> listingsNotBooked = allMatchedListings.stream()
                .filter(listing -> !bookingUUIDs.contains(listing.getPublicId()))
                .map(listingMapper::listingToDisplayCardListingDTO)
                .toList();

        // Return the filtered list as a paginated result
        return new PageImpl<>(listingsNotBooked, pageable, listingsNotBooked.size());
    }




}
