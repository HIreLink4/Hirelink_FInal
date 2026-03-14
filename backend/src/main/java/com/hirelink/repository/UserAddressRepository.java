package com.hirelink.repository;

import com.hirelink.entity.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {
    
    List<UserAddress> findByUserUserIdAndIsActiveTrue(Long userId);
    
    Optional<UserAddress> findByAddressIdAndUserUserId(Long addressId, Long userId);
    
    Optional<UserAddress> findByUserUserIdAndIsDefaultTrue(Long userId);
    
    @Modifying
    @Query("UPDATE UserAddress a SET a.isDefault = false WHERE a.user.userId = :userId")
    void resetDefaultAddresses(@Param("userId") Long userId);
    
    Long countByUserUserIdAndIsActiveTrue(Long userId);
}
