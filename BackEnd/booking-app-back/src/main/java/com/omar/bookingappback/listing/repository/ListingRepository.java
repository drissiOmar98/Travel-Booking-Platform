package com.omar.bookingappback.listing.repository;

import com.omar.bookingappback.listing.BookingCategory;
import com.omar.bookingappback.listing.Listing;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for performing CRUD operations on `Listing` entities.
 * It extends `JpaRepository`, providing several database interaction methods
 * for `Listing` entities, such as querying, deleting, and paginated retrieval.
 */
@Repository
public interface ListingRepository extends JpaRepository<Listing, Long> {

    /**
     * Retrieves a list of `Listing` entities for a specific landlord, fetching only the cover picture.
     * This query performs a left join on the `pictures` collection to load the related pictures
     * and filters the result to include only the picture marked as the cover.
     *
     * - `LEFT JOIN FETCH` is used to eagerly fetch the `pictures` associated with the listing.
     * - The query ensures that only the picture with `isCover = true` is retrieved for each listing.
     *
     * @param landlordPublicId The UUID representing the landlord's public ID.
     * @return A list of `Listing` entities with only their cover picture loaded.
     */
    @Query("SELECT listing FROM Listing listing LEFT JOIN FETCH listing.pictures picture" +
            " WHERE listing.landlordPublicId = :landlordPublicId AND picture.isCover = true")
    List<Listing> findAllByLandlordPublicIdFetchCoverPicture(UUID landlordPublicId);


    /**
     * Deletes a listing by its public ID and the landlord's public ID.
     * This ensures that only the landlord who owns the listing can delete it.
     *
     * @param publicId The public UUID of the listing to be deleted.
     * @param landlordPublicId The UUID of the landlord who owns the listing.
     * @return The number of entities deleted (1 if successful, 0 if not).
     */
    long deleteByPublicIdAndLandlordPublicId(UUID publicId, UUID landlordPublicId);


    /**
     * Finds a listing by its public ID.
     *
     * @param publicId The UUID of the listing.
     * @return An `Optional<Listing>` that contains the listing if found, or empty if not.
     */
    Optional<Listing> findByPublicId(UUID publicId);

    /**
     * Retrieves a listing by its public ID and landlord's public ID.
     * Ensures that the listing belongs to the given landlord.
     *
     * @param listingPublicId  The UUID of the listing's public ID.
     * @param landlordPublicId The UUID of the landlord's public ID.
     * @return An `Optional<Listing>` containing the listing if found, or empty if not.
     */
    Optional<Listing> findOneByPublicIdAndLandlordPublicId(UUID listingPublicId, UUID landlordPublicId);

    /**
     * Retrieves all listings by a list of public IDs.
     *
     * @param allListingPublicIDs A list of public UUIDs representing the listings to retrieve.
     * @return A list of `Listing` entities with the provided public IDs.
     */
    List<Listing> findAllByPublicIdIn(List<UUID> allListingPublicIDs);


    /**
     * Retrieves a paginated list of listings by booking category, fetching only the cover picture.
     *
     * This query performs a left join fetch to load the associated cover picture for each listing
     * and filters the results based on the specified booking category.
     *
     * @param pageable A `Pageable` object representing pagination information.
     * @param bookingCategory The `BookingCategory` to filter listings by.
     * @return A paginated list of `Listing` entities with only the cover picture loaded.
     */
    @Query("SELECT listing from Listing listing LEFT JOIN FETCH listing.pictures picture" +
            " WHERE picture.isCover = true AND listing.bookingCategory = :bookingCategory")
    Page<Listing> findAllByBookingCategoryWithCoverOnly(Pageable pageable, BookingCategory bookingCategory);


    /**
     * Retrieves a paginated list of listings, fetching only the cover picture.
     *
     * This query performs a left join fetch to load only the cover picture for each listing.
     *
     * @param pageable A `Pageable` object representing pagination information.
     * @return A paginated list of `Listing` entities with only their cover picture loaded.
     */
    @Query("SELECT listing from Listing listing LEFT JOIN FETCH listing.pictures picture" +
            " WHERE picture.isCover = true")
    Page<Listing> findAllWithCoverOnly(Pageable pageable);


    /**
     * Finds listings by specific attributes: location, number of bathrooms, bedrooms, guests, and beds.
     *
     * @param pageable A `Pageable` object representing pagination information.
     * @param location The location of the listing.
     * @param bathrooms The number of bathrooms in the listing.
     * @param bedrooms The number of bedrooms in the listing.
     * @param guests The maximum number of guests the listing can accommodate.
     * @param beds The number of beds in the listing.
     * @return A paginated list of listings matching the given criteria.
     */
    Page<Listing> findAllByLocationAndBathroomsAndBedroomsAndGuestsAndBeds(
            Pageable pageable, String location, int bathrooms, int bedrooms, int guests, int beds
    );
}
