package com.omar.bookingappback.listing.service;

import com.omar.bookingappback.listing.Listing;
import com.omar.bookingappback.listing.ListingPicture;
import com.omar.bookingappback.listing.dto.sub.PictureDTO;
import com.omar.bookingappback.listing.mapper.ListingPictureMapper;
import com.omar.bookingappback.listing.repository.ListingPictureRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

/**
 * Service class for managing and saving pictures associated with listings.
 *
 * This service handles the conversion of PictureDTOs to ListingPicture entities and persists them
 * in the database. It also ensures that the first picture is marked as the cover picture.
 */
@Service
public class PictureService {

    private final ListingPictureRepository listingPictureRepository;

    private final ListingPictureMapper listingPictureMapper;

    /**
     * Constructor for PictureService.
     *
     * @param listingPictureRepository Repository for performing database operations on ListingPicture entities.
     * @param listingPictureMapper Mapper for converting between PictureDTO and ListingPicture entities.
     */
    public PictureService(ListingPictureRepository listingPictureRepository, ListingPictureMapper listingPictureMapper) {
        this.listingPictureRepository = listingPictureRepository;
        this.listingPictureMapper = listingPictureMapper;
    }


    /**
     * Saves all pictures associated with a listing and marks the first picture as the cover.
     *
     * @param pictures List of PictureDTO objects to be converted and saved.
     * @param listing The listing associated with the pictures.
     * @return List of PictureDTO objects after saving them as ListingPicture entities.
     */
    public List<PictureDTO> saveAll(List<PictureDTO> pictures, Listing listing) {
        Set<ListingPicture> listingPictures = listingPictureMapper.pictureDTOsToListingPictures(pictures);

        boolean isFirst = true;

        for (ListingPicture listingPicture : listingPictures) {
            listingPicture.setCover(isFirst);
            listingPicture.setListing(listing);
            isFirst = false;
        }

        listingPictureRepository.saveAll(listingPictures);
        return listingPictureMapper.listingPictureToPictureDTO(listingPictures.stream().toList());
    }
}
