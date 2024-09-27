package com.omar.bookingappback.listing.repository;

import com.omar.bookingappback.listing.Listing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

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


    long deleteByPublicIdAndLandlordPublicId(UUID publicId, UUID landlordPublicId);

    Optional<Listing> findByPublicId(UUID publicId);

    Optional<Listing> findOneByPublicIdAndLandlordPublicId(UUID listingPublicId, UUID landlordPublicId);

    List<Listing> findAllByPublicIdIn(List<UUID> allListingPublicIDs);
}
