package com.omar.bookingappback.listing.mapper;


import com.omar.bookingappback.listing.ListingPicture;
import com.omar.bookingappback.listing.dto.sub.PictureDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;
import java.util.Set;


/**
 * Mapper interface for handling the mapping between ListingPicture entities and PictureDTOs.
 *
 * This interface uses the MapStruct framework to generate the mapping implementation at compile time.
 * It provides methods for converting between PictureDTO objects and ListingPicture entities, as well
 * as handling lists and sets of these objects.
 */
@Mapper(componentModel = "spring")
public interface ListingPictureMapper {

    /**
     * Maps a list of PictureDTO objects to a set of ListingPicture entities.
     *
     * @param pictureDTOs The list of PictureDTOs to be mapped.
     * @return A set of ListingPicture entities.
     */
    Set<ListingPicture> pictureDTOsToListingPictures(List<PictureDTO> pictureDTOs);


    /**
     * Maps a single PictureDTO to a ListingPicture entity, ignoring certain fields.
     *
     * @param pictureDTO The PictureDTO to be mapped.
     * @return A ListingPicture entity populated with the data from the DTO.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "listing", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "lastModifiedDate", ignore = true)
    @Mapping(target = "cover", source = "isCover")
    ListingPicture pictureDTOToListingPicture(PictureDTO pictureDTO);


    /**
     * Maps a list of ListingPicture entities to a list of PictureDTOs.
     *
     * @param listingPictures The list of ListingPicture entities to be mapped.
     * @return A list of PictureDTOs.
     */
    List<PictureDTO> listingPictureToPictureDTO(List<ListingPicture> listingPictures);



    /**
     * Maps a single ListingPicture entity to a PictureDTO, with a specific mapping for the 'cover' field.
     *
     * @param listingPicture The ListingPicture entity to be mapped.
     * @return A PictureDTO populated with the data from the ListingPicture entity.
     */
    @Mapping(target = "isCover", source = "cover")
    PictureDTO convertToPictureDTO(ListingPicture listingPicture);


    /**
     * Extracts the cover picture from a set of ListingPicture entities and converts it to a PictureDTO.
     *
     * @param pictures The set of ListingPicture entities.
     * @return The PictureDTO representing the cover picture.
     */
    @Named("extract-cover")
    default PictureDTO extractCover(Set<ListingPicture> pictures) {
        return pictures.stream().findFirst().map(this::convertToPictureDTO).orElseThrow();
    }





}
