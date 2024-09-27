package com.omar.bookingappback.listing.mapper;

import com.omar.bookingappback.listing.Listing;
import com.omar.bookingappback.listing.dto.CreatedListingDTO;
import com.omar.bookingappback.listing.dto.DisplayCardListingDTO;
import com.omar.bookingappback.listing.dto.DisplayListingDTO;
import com.omar.bookingappback.listing.dto.SaveListingDTO;
import com.omar.bookingappback.listing.dto.vo.PriceVO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * Mapper interface for handling the conversion between Listing entities and DTOs.
 *
 * This interface leverages the MapStruct framework to generate the mapping logic at compile time.
 * It is primarily responsible for mapping between SaveListingDTO, Listing entities, and CreatedListingDTO.
 * It also integrates with the ListingPictureMapper for handling picture-related mappings.
 */
@Mapper(componentModel = "spring", uses = {ListingPictureMapper.class})
public interface ListingMapper {



    /**
     * Maps SaveListingDTO to a Listing entity.
     *
     * @param saveListingDTO The DTO containing listing data to be saved.
     * @return A Listing entity populated with data from the DTO.
     */
    @Mapping(target = "landlordPublicId", ignore = true)
    @Mapping(target = "publicId", ignore = true)
    @Mapping(target = "lastModifiedDate", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "pictures", ignore = true)
    @Mapping(target = "title", source = "description.title.value")
    @Mapping(target = "description", source = "description.description.value")
    @Mapping(target = "bedrooms", source = "infos.bedrooms.value")
    @Mapping(target = "guests", source = "infos.guests.value")
    @Mapping(target = "bookingCategory", source = "category")
    @Mapping(target = "beds", source = "infos.beds.value")
    @Mapping(target = "bathrooms", source = "infos.baths.value")
    @Mapping(target = "price", source = "price.value")
    Listing saveListingDTOToListing(SaveListingDTO saveListingDTO);


    /**
     * Maps a Listing entity to CreatedListingDTO.
     *
     * @param listing The Listing entity to be mapped.
     * @return A CreatedListingDTO populated with listing data.
     */
    CreatedListingDTO listingToCreatedListingDTO(Listing listing);


    /**
     * Converts a list of `Listing` entities to a list of `DisplayCardListingDTO` objects.
     * This mapping targets the "cover" field and retrieves the value from the "pictures" field.
     *
     * @param listings The list of `Listing` entities to convert.
     * @return A list of `DisplayCardListingDTO` objects.
     */
    @Mapping(target = "cover", source = "pictures")
    List<DisplayCardListingDTO> listingToDisplayCardListingDTOs(List<Listing> listings);


    /**
     * Converts a single `Listing` entity to a `DisplayCardListingDTO`.
     * This mapping also targets the "cover" field, sourcing it from the "pictures" field
     * and using a custom mapping logic identified by "extract-cover" to determine the cover picture.
     *
     * @param listing The `Listing` entity to convert.
     * @return The mapped `DisplayCardListingDTO` object.
     */
    @Mapping(target = "cover", source = "pictures", qualifiedByName = "extract-cover")
    DisplayCardListingDTO listingToDisplayCardListingDTO(Listing listing);

    /**
     * Maps an integer price to a `PriceVO` (Value Object).
     * This is a default method used to wrap the price value in a `PriceVO`.
     *
     * @param price The price value (integer) to convert.
     * @return A `PriceVO` object containing the price.
     */
    default PriceVO mapPriceToPriceVO(int price) {
        return new PriceVO(price);
    }


    /**
     * Converts a `Listing` entity into a `DisplayListingDTO`,
     * mapping various fields from the source `Listing` to the target DTO.
     *
     * - Ignores the "landlord" field in the DTO.
     * - Maps the title and description values to the `description.title.value` and
     *   `description.description.value` fields respectively.
     * - Maps the number of bedrooms, guests, beds, and bathrooms to the corresponding fields in the `infos` section.
     * - Maps the `bookingCategory` to the `category` field.
     * - Maps the price to the `price.value` field.
     *
     * @param listing The `Listing` entity to convert.
     * @return The `DisplayListingDTO` object containing mapped data from the listing.
     */
    @Mapping(target = "landlord", ignore = true)
    @Mapping(target = "description.title.value", source = "title")
    @Mapping(target = "description.description.value", source = "description")
    @Mapping(target = "infos.bedrooms.value", source = "bedrooms")
    @Mapping(target = "infos.guests.value", source = "guests")
    @Mapping(target = "infos.beds.value", source = "beds")
    @Mapping(target = "infos.baths.value", source = "bathrooms")
    @Mapping(target = "category", source = "bookingCategory")
    @Mapping(target = "price.value", source = "price")
    DisplayListingDTO listingToDisplayListingDTO(Listing listing);





}
