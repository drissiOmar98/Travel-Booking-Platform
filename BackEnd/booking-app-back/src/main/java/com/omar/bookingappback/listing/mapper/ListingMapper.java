package com.omar.bookingappback.listing.mapper;

import com.omar.bookingappback.listing.Listing;
import com.omar.bookingappback.listing.dto.CreatedListingDTO;
import com.omar.bookingappback.listing.dto.SaveListingDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

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





}
