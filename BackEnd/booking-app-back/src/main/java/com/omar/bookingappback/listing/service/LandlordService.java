package com.omar.bookingappback.listing.service;

import com.omar.bookingappback.listing.Listing;
import com.omar.bookingappback.listing.dto.CreatedListingDTO;
import com.omar.bookingappback.listing.dto.DisplayCardListingDTO;
import com.omar.bookingappback.listing.dto.SaveListingDTO;
import com.omar.bookingappback.listing.mapper.ListingMapper;
import com.omar.bookingappback.listing.repository.ListingRepository;
import com.omar.bookingappback.shared.state.State;
import com.omar.bookingappback.user.dto.ReadUserDTO;
import com.omar.bookingappback.user.service.Auth0Service;
import com.omar.bookingappback.user.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

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

    /**
     * Retrieves all properties (listings) associated with a specific landlord and maps them to
     * `DisplayCardListingDTO` objects. The cover picture for each listing is eagerly fetched.
     *
     * This method uses a transactional read-only context to ensure that the operation
     * does not alter the database state and is optimized for performance.
     *
     * @param landlord A `ReadUserDTO` object representing the landlord, containing their public ID.
     * @return A list of `DisplayCardListingDTO` objects, each representing a property with its cover picture.
     */
    @Transactional(readOnly = true)
    public List<DisplayCardListingDTO> getAllProperties(ReadUserDTO landlord) {
        List<Listing> properties = listingRepository.findAllByLandlordPublicIdFetchCoverPicture(landlord.publicId());
        return listingMapper.listingToDisplayCardListingDTOs(properties);
    }


    /**
     * Deletes a listing by its public ID and the landlord's public ID.
     * If the deletion is successful, the method returns a successful state with the listing's public ID.
     * If not, it returns an unauthorized state indicating the user is not authorized to delete the listing.
     *
     * This method is transactional to ensure that the delete operation is atomic and consistent.
     *
     * @param publicId The public ID of the listing to be deleted.
     * @param landlord The `ReadUserDTO` object containing the landlord's public ID.
     * @return A `State` object containing the listing's public ID if successfully deleted, or an error message if not.
     */
    @Transactional
    public State<UUID, String> delete(UUID publicId, ReadUserDTO landlord) {
        long deletedSuccessfuly = listingRepository.deleteByPublicIdAndLandlordPublicId(publicId, landlord.publicId());
        if (deletedSuccessfuly > 0) {
            return State.<UUID, String>builder().forSuccess(publicId);
        } else {
            return State.<UUID, String>builder().forUnauthorized("User not authorized to delete this listing");
        }
    }

    /**
     * Retrieves a list of `DisplayCardListingDTO` objects by a list of listing public IDs.
     *
     * This method fetches all listings that match the given public IDs, maps each listing
     * to a `DisplayCardListingDTO`, and returns the result as a list of DTOs.
     *
     * @param allListingPublicIDs A list of public UUIDs representing the listings to be retrieved.
     * @return A list of `DisplayCardListingDTO` objects representing the listings with the provided public IDs.
     */
    public List<DisplayCardListingDTO> getCardDisplayByListingPublicId(List<UUID> allListingPublicIDs) {
        return listingRepository.findAllByPublicIdIn(allListingPublicIDs)
                .stream()
                .map(listingMapper::listingToDisplayCardListingDTO)
                .toList();
    }


    /**
     * Retrieves a `DisplayCardListingDTO` based on the listing's public ID and landlord's public ID.
     *
     * This method finds a listing matching the given listing public ID and landlord public ID,
     * and maps the found listing to a `DisplayCardListingDTO`.
     *
     * @param listingPublicId  The public UUID of the listing to be retrieved.
     * @param landlordPublicId The public UUID of the landlord who owns the listing.
     * @return An `Optional<DisplayCardListingDTO>` containing the listing's data if found, or an empty `Optional` if not.
     */
    @Transactional(readOnly = true)
    public Optional<DisplayCardListingDTO> getByPublicIdAndLandlordPublicId(UUID listingPublicId, UUID landlordPublicId) {
        return listingRepository.findOneByPublicIdAndLandlordPublicId(listingPublicId, landlordPublicId)
                .map(listingMapper::listingToDisplayCardListingDTO);
    }







}
