package com.omar.bookingappback.listing.repository;

import com.omar.bookingappback.listing.Listing;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ListingRepository extends JpaRepository<Listing, Long> {
}
