package com.omar.bookingappback.listing.repository;

import com.omar.bookingappback.listing.ListingPicture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ListingPictureRepository extends JpaRepository<ListingPicture, Long> {
}
