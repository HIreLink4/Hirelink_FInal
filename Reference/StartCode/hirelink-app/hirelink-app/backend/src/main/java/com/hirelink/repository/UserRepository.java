package com.hirelink.repository;

import com.hirelink.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByPhone(String phone);

    Optional<User> findByEmail(String email);

    Optional<User> findByPhoneOrEmail(String phone, String email);

    boolean existsByPhone(String phone);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.deletedAt IS NULL AND u.userType = :userType")
    Page<User> findAllByUserType(@Param("userType") User.UserType userType, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.deletedAt IS NULL AND u.accountStatus = :status")
    Page<User> findAllByAccountStatus(@Param("status") User.AccountStatus status, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.deletedAt IS NULL AND " +
           "(LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "u.phone LIKE CONCAT('%', :search, '%') OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<User> searchUsers(@Param("search") String search, Pageable pageable);
}
