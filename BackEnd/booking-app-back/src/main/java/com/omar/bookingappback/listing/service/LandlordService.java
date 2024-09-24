package com.omar.bookingappback.listing.service;

import com.omar.bookingappback.listing.Listing;
import com.omar.bookingappback.listing.dto.CreatedListingDTO;
import com.omar.bookingappback.listing.dto.SaveListingDTO;
import com.omar.bookingappback.listing.mapper.ListingMapper;
import com.omar.bookingappback.listing.repository.ListingRepository;
import com.omar.bookingappback.user.dto.ReadUserDTO;
import com.omar.bookingappback.user.service.Auth0Service;
import com.omar.bookingappback.user.service.UserService;
import org.springframework.stereotype.Service;

@Service
public class LandlordService {

    private final ListingRepository listingRepository;

    private final ListingMapper listingMapper;
    private final UserService userService;
    private final Auth0Service auth0Service;
    private final PictureService pictureService;

    /**
     * Constructor for LandlordService.
     *
     * @param listingRepository Repository for performing database operations on Listing entities.
     * @param listingMapper Mapper for converting between DTOs and Listing entities.
     * @param userService Service responsible for managing user-related operations.
     * @param auth0Service Service responsible for interacting with Auth0 for role management.
     * @param pictureService Service for managing the pictures associated with listings.
     */
    public LandlordService(ListingRepository listingRepository, ListingMapper listingMapper, UserService userService, Auth0Service auth0Service, PictureService pictureService) {
        this.listingRepository = listingRepository;
        this.listingMapper = listingMapper;
        this.userService = userService;
        this.auth0Service = auth0Service;
        this.pictureService = pictureService;
    }


    /**
     * Creates a new listing for a landlord, saves pictures, and assigns the landlord role to the user.
     *
     * This method first maps the SaveListingDTO to a Listing entity, sets the landlord's public ID,
     * and saves the listing in the repository. It also saves the associated pictures using the PictureService,
     * and assigns the landlord role to the authenticated user via the Auth0Service.
     *
     * @param saveListingDTO The DTO containing the details of the listing to be created.
     * @return A CreatedListingDTO containing the details of the newly created listing.
     */
    public CreatedListingDTO create(SaveListingDTO saveListingDTO) {
        Listing newListing = listingMapper.saveListingDTOToListing(saveListingDTO);

        ReadUserDTO userConnected = userService.getAuthenticatedUserFromSecurityContext();
        newListing.setLandlordPublicId(userConnected.publicId());

        Listing savedListing = listingRepository.saveAndFlush(newListing);

        pictureService.saveAll(saveListingDTO.getPictures(), savedListing);

        auth0Service.addLandlordRoleToUser(userConnected);

        return listingMapper.listingToCreatedListingDTO(savedListing);
    }



}
