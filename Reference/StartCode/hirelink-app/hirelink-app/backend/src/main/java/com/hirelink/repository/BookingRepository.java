package com.hirelink.repository;

import com.hirelink.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingNumber(String bookingNumber);

    Page<Booking> findByUser_UserId(Long userId, Pageable pageable);

    Page<Booking> findByProvider_ProviderId(Long providerId, Pageable pageable);

    @Query("SELECT b FROM Booking b WHERE b.user.userId = :userId AND b.bookingStatus = :status")
    Page<Booking> findByUserIdAndStatus(@Param("userId") Long userId, 
                                        @Param("status") Booking.BookingStatus status, 
                                        Pageable pageable);

    @Query("SELECT b FROM Booking b WHERE b.provider.providerId = :providerId AND b.bookingStatus = :status")
    Page<Booking> findByProviderIdAndStatus(@Param("providerId") Long providerId, 
                                            @Param("status") Booking.BookingStatus status, 
                                            Pageable pageable);

    @Query("SELECT b FROM Booking b WHERE b.provider.providerId = :providerId AND b.scheduledDate = :date")
    List<Booking> findByProviderIdAndDate(@Param("providerId") Long providerId, 
                                          @Param("date") LocalDate date);

    @Query("SELECT b FROM Booking b WHERE b.scheduledDate = :date AND b.bookingStatus IN ('ACCEPTED', 'CONFIRMED')")
    List<Booking> findUpcomingBookingsForDate(@Param("date") LocalDate date);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.provider.providerId = :providerId AND b.bookingStatus = 'COMPLETED'")
    Long countCompletedBookings(@Param("providerId") Long providerId);

    @Query("SELECT b FROM Booking b WHERE b.bookingStatus = :status ORDER BY b.createdAt DESC")
    Page<Booking> findByStatus(@Param("status") Booking.BookingStatus status, Pageable pageable);

    @Query("SELECT b FROM Booking b WHERE b.scheduledDate BETWEEN :startDate AND :endDate")
    List<Booking> findBookingsBetweenDates(@Param("startDate") LocalDate startDate, 
                                           @Param("endDate") LocalDate endDate);
}
