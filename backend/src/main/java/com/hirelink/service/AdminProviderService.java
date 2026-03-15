package com.hirelink.service;

import com.hirelink.entity.AdminAuditLog;
import com.hirelink.entity.ServiceProvider;
import com.hirelink.entity.ServiceProvider.KycStatus;
import com.hirelink.entity.User;
import com.hirelink.entity.UserRole;
import com.hirelink.repository.AdminAuditLogRepository;
import com.hirelink.repository.ServiceProviderRepository;
import com.hirelink.repository.UserRepository;
import com.hirelink.repository.UserRoleRepository;
import com.hirelink.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminProviderService {

    private final ServiceProviderRepository providerRepository;
    private final AdminAuditLogRepository auditLogRepository;
    private final UserRoleRepository userRoleRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;

    public List<ServiceProvider> getPendingProviders() {
        return providerRepository.findByKycStatus(KycStatus.PENDING);
    }

    public List<ServiceProvider> getAllProviders() {
        return providerRepository.findAllWithUser();
    }

    @Transactional
    public void approveProvider(Long providerId, Long adminUserId) {
        ServiceProvider provider = providerRepository.findByIdWithDetails(providerId)
                .orElseThrow(() -> new RuntimeException("Provider not found"));
        provider.setKycStatus(KycStatus.VERIFIED);
        provider.setKycVerifiedAt(LocalDateTime.now());
        providerRepository.save(provider);

        // Auto-create a default service for newly approved providers
        // so that they appear in customer category listings immediately.
        if (provider.getPrimaryCategory() != null &&
                (provider.getServices() == null || provider.getServices().isEmpty()) &&
                serviceRepository.findByProviderProviderId(provider.getProviderId()).isEmpty()) {

            BigDecimal basePrice = provider.getPrimaryCategory().getMinBasePrice();
            if (basePrice == null) {
                basePrice = BigDecimal.valueOf(500); // sensible default
            }

            String categoryName = provider.getPrimaryCategory().getCategoryName();
            String businessName = provider.getBusinessName() != null && !provider.getBusinessName().isEmpty()
                    ? provider.getBusinessName()
                    : provider.getUser().getName();

            com.hirelink.entity.Service defaultService = com.hirelink.entity.Service.builder()
                    .provider(provider)
                    .category(provider.getPrimaryCategory())
                    .serviceName(categoryName + " Service by " + businessName)
                    .serviceDescription("Standard " + categoryName.toLowerCase() +
                            " service offered by " + businessName + ".")
                    .basePrice(basePrice)
                    .isActive(true)
                    .build();

            serviceRepository.save(defaultService);
        }

        User user = provider.getUser();
        if (!userRoleRepository.existsByUserUserIdAndRole(user.getUserId(), "PROVIDER")) {
            userRoleRepository.save(UserRole.builder()
                    .user(user)
                    .role("PROVIDER")
                    .build());
            user.setUserType(User.UserType.PROVIDER);
            userRepository.save(user);
        }

        auditLogRepository.save(AdminAuditLog.builder()
                .adminUserId(adminUserId)
                .actionType("KYC_APPROVED")
                .actionDescription("Approved KYC for provider: " + provider.getBusinessName())
                .targetType("PROVIDER")
                .targetId(providerId)
                .build());
    }

    @Transactional
    public void rejectProvider(Long providerId, String reason, Long adminUserId) {
        ServiceProvider provider = providerRepository.findByIdWithDetails(providerId)
                .orElseThrow(() -> new RuntimeException("Provider not found"));
        provider.setKycStatus(KycStatus.REJECTED);
        provider.setKycRejectionReason(reason);
        providerRepository.save(provider);

        auditLogRepository.save(AdminAuditLog.builder()
                .adminUserId(adminUserId)
                .actionType("KYC_REJECTED")
                .actionDescription("Rejected KYC for provider: " + provider.getBusinessName() + " - Reason: " + reason)
                .targetType("PROVIDER")
                .targetId(providerId)
                .build());
    }
}
