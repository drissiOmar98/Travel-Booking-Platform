package com.omar.bookingappback.booking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    /**
     * Checks if there are any bookings that overlap with the specified time interval
     * for a given listing.
     *
     * @param startDate the start date of the interval to check
     * @param endDate   the end date of the interval to check
     * @param fkListing the public ID of the listing to check against
     * @return true if there are overlapping bookings, false otherwise
     */
    @Query("SELECT case when count(booking) > 0 then true else false end" +
            " from Booking  booking WHERE NOT (booking.endDate <= :startDate or booking.startDate >= :endDate)" +
            " AND booking.fkListing = :fkListing")
    boolean bookingExistsAtInterval(OffsetDateTime startDate, OffsetDateTime endDate, UUID fkListing);

    /**
     * Retrieves all bookings associated with a specific listing.
     *
     * @param fkListing the public ID of the listing
     * @return a list of bookings for the given listing
     */
    List<Booking> findAllByFkListing(UUID fkListing);

    /**
     * Retrieves all bookings associated with a specific tenant.
     *
     * @param fkTenant the public ID of the tenant
     * @return a list of bookings for the given tenant
     */
    List<Booking> findAllByFkTenant(UUID fkTenant);

    /**
     * Retrieves all bookings for listings matching the specified public IDs.
     *
     * @param allPropertyPublicIds a list of public IDs of the properties
     * @return a list of bookings for the specified properties
     */
    List<Booking> findAllByFkListingIn(List<UUID> allPropertyPublicIds);

    /**
     * Deletes a booking associated with a specific tenant and booking public ID.
     *
     * @param tenantPublicId  the public ID of the tenant
     * @param bookingPublicId the public ID of the booking to delete
     * @return the number of bookings deleted
     */
    int deleteBookingByFkTenantAndPublicId(UUID tenantPublicId, UUID bookingPublicId);


    /**
     * Deletes a booking associated with a specific booking public ID and listing.
     *
     * @param bookingPublicId the public ID of the booking to delete
     * @param listingPublicId the public ID of the listing associated with the booking
     * @return the number of bookings deleted
     */
    int deleteBookingByPublicIdAndFkListing(UUID bookingPublicId, UUID listingPublicId);


    /**
     * Finds all bookings that match the specified date range for a list of listings.
     *
     * @param fkListings a list of public IDs for the listings to check
     * @param startDate  the start date of the interval to check
     * @param endDate    the end date of the interval to check
     * @return a list of bookings that match the date range for the specified listings
     */
    @Query("SELECT booking FROM Booking booking WHERE " +
            "NOT (booking.endDate <= :startDate or booking.startDate >= :endDate) " +
            "AND booking.fkListing IN :fkListings")
    List<Booking> findAllMatchWithDate(List<UUID> fkListings, OffsetDateTime startDate, OffsetDateTime endDate);


}
