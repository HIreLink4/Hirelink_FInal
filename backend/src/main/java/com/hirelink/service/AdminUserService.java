package com.hirelink.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirelink.dto.AdminUserDTO.*;
import com.hirelink.entity.AdminAuditLog;
import com.hirelink.entity.User;
import com.hirelink.entity.UserRole;
import com.hirelink.repository.AdminAuditLogRepository;
import com.hirelink.repository.BookingRepository;
import com.hirelink.repository.ServiceProviderRepository;
import com.hirelink.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminUserService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final ServiceProviderRepository providerRepository;
    private final AdminAuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<UserListItem> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toListItem)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserListItem> getUsersByType(String userType) {
        return userRepository.findByUserType(User.UserType.valueOf(userType)).stream()
                .map(this::toListItem)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserListItem> searchUsers(String keyword) {
        return userRepository.searchUsers(keyword).stream()
                .map(this::toListItem)
                .collect(Collectors.toList());
    }

    public UserDetail getUserDetail(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        long bookingCount = bookingRepository.countByUserUserId(id);
        boolean hasProvider = providerRepository.findByUserUserId(id).isPresent();

        return UserDetail.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .userType(user.getUserType().name())
                .accountStatus(user.getAccountStatus().name())
                .roles(getRoleNames(user))
                .authProvider(user.getAuthProvider() != null ? user.getAuthProvider().name() : "LOCAL")
                .isPhoneVerified(user.getIsPhoneVerified())
                .isEmailVerified(user.getIsEmailVerified())
                .bannedReason(user.getBannedReason())
                .profileImageUrl(user.getProfileImageUrl())
                .totalBookings(bookingCount)
                .hasProviderProfile(hasProvider)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }

    @Transactional
    public UserDetail updateUser(Long id, UpdateUserRequest request, Long adminUserId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String oldValues = String.format("{\"name\":\"%s\",\"phone\":\"%s\"}", user.getName(), user.getPhone());

        if (request.getName() != null) user.setName(request.getName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getUserType() != null) user.setUserType(User.UserType.valueOf(request.getUserType()));

        userRepository.save(user);

        auditLogRepository.save(AdminAuditLog.builder()
                .adminUserId(adminUserId)
                .actionType("USER_UPDATED")
                .actionDescription("Updated user profile for: " + user.getEmail())
                .targetType("USER")
                .targetId(id)
                .oldValues(oldValues)
                .newValues(String.format("{\"name\":\"%s\",\"phone\":\"%s\"}", user.getName(), user.getPhone()))
                .build());

        return getUserDetail(id);
    }

    @Transactional
    public void banUser(Long id, BanUserRequest request, Long adminUserId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getDeletedAt() != null) {
            throw new RuntimeException("User is already banned/deactivated");
        }

        String originalEmail = user.getEmail();
        String originalPhone = user.getPhone();

        user.setAccountStatus(User.AccountStatus.BANNED);
        user.setBannedReason(request.getReason());
        // We keep DeletedAt as a marker that the account is "deactivated" from normal lists
        user.setDeletedAt(LocalDateTime.now());
        
        // We do NOT nullify email/phone anymore so login can find the user and show the banned message.
        // This also prevents reuse of the same email/phone by a new account.
        
        userRepository.save(user);

        try {
            String oldValues = objectMapper.writeValueAsString(Map.of(
                    "email", originalEmail != null ? originalEmail : "null",
                    "phone", originalPhone != null ? originalPhone : "null"
            ));

            auditLogRepository.save(AdminAuditLog.builder()
                    .adminUserId(adminUserId)
                    .actionType("USER_BANNED")
                    .actionDescription("Banned user: " + (originalEmail != null ? originalEmail : originalPhone) + " - Reason: " + request.getReason())
                    .targetType("USER")
                    .targetId(id)
                    .oldValues(oldValues)
                    .build());
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize old values for ban audit log", e);
        }
    }

    @Transactional
    public void unbanUser(Long id, Long adminUserId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getDeletedAt() == null && user.getAccountStatus() != User.AccountStatus.BANNED) {
            return; // Already active
        }

        // Restore contact info only if missing (for older banned users who were nullified)
        if (user.getEmail() == null && user.getPhone() == null) {
            restoreContactInfo(user, id, "USER_BANNED");
        }

        user.setAccountStatus(User.AccountStatus.ACTIVE);
        user.setDeletedAt(null);
        user.setBannedReason(null);
        userRepository.save(user);

        auditLogRepository.save(AdminAuditLog.builder()
                .adminUserId(adminUserId)
                .actionType("USER_UNBANNED")
                .actionDescription("Unbanned user: " + (user.getEmail() != null ? user.getEmail() : user.getPhone()))
                .targetType("USER")
                .targetId(id)
                .build());
    }

    @Transactional
    public void deleteUser(Long id, Long adminUserId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getUserType() == User.UserType.ADMIN || user.getUserType() == User.UserType.SUPER_ADMIN) {
            throw new RuntimeException("Cannot delete admin users");
        }

        String identifier = user.getEmail() != null ? user.getEmail() : user.getPhone();
        if (identifier == null) {
            // Might be already soft-deleted/banned, try to get from log for auditing
            identifier = "User ID: " + id;
        }

        userRepository.delete(user);

        auditLogRepository.save(AdminAuditLog.builder()
                .adminUserId(adminUserId)
                .actionType("USER_PERMANENTLY_DELETED")
                .actionDescription("Permanently deleted user: " + identifier)
                .targetType("USER")
                .targetId(id)
                .build());
    }

    @Transactional
    public void restoreUser(Long id, Long adminUserId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getDeletedAt() == null) {
            throw new RuntimeException("User is not deactivated");
        }

        // Only restore from log if identifiers are missing
        if (user.getEmail() == null && user.getPhone() == null) {
            boolean restored = restoreContactInfo(user, id, "USER_BANNED");
            if (!restored) {
                restoreContactInfo(user, id, "USER_DELETED");
            }
        }

        user.setDeletedAt(null);
        user.setAccountStatus(User.AccountStatus.ACTIVE);
        user.setBannedReason(null);
        userRepository.save(user);

        auditLogRepository.save(AdminAuditLog.builder()
                .adminUserId(adminUserId)
                .actionType("USER_RESTORED")
                .actionDescription("Restored user: " + (user.getEmail() != null ? user.getEmail() : user.getPhone()))
                .targetType("USER")
                .targetId(id)
                .build());
    }

    private boolean restoreContactInfo(User user, Long id, String actionType) {
        AdminAuditLog logEntry = auditLogRepository
                .findByTargetTypeAndTargetIdOrderByPerformedAtDesc("USER", id)
                .stream()
                .filter(l -> actionType.equals(l.getActionType()) && l.getOldValues() != null)
                .findFirst()
                .orElse(null);

        if (logEntry != null && logEntry.getOldValues() != null) {
            try {
                JsonNode nodes = objectMapper.readTree(logEntry.getOldValues());
                String email = nodes.has("email") ? nodes.get("email").asText() : null;
                String phone = nodes.has("phone") ? nodes.get("phone").asText() : null;

                boolean changed = false;
                if (email != null && !"null".equals(email) && !email.isEmpty()) {
                    user.setEmail(email);
                    changed = true;
                }
                if (phone != null && !"null".equals(phone) && !phone.isEmpty()) {
                    user.setPhone(phone);
                    changed = true;
                }
                
                log.info("Restored contact info for user {}: email={}, phone={}", id, email, phone);
                return changed;
            } catch (JsonProcessingException e) {
                log.error("Failed to parse old values for user restore: {}", logEntry.getOldValues(), e);
            }
        } else {
            log.warn("No audit log found to restore contact info for user {} with action {}", id, actionType);
        }
        return false;
    }

    private UserListItem toListItem(User u) {
        boolean deleted = u.getDeletedAt() != null;
        return UserListItem.builder()
                .userId(u.getUserId())
                .name(u.getName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .userType(u.getUserType().name())
                .accountStatus(u.getAccountStatus().name())
                .roles(getRoleNames(u))
                .authProvider(u.getAuthProvider() != null ? u.getAuthProvider().name() : "LOCAL")
                .isPhoneVerified(u.getIsPhoneVerified())
                .isEmailVerified(u.getIsEmailVerified())
                .isDeleted(deleted)
                .createdAt(u.getCreatedAt())
                .lastLoginAt(u.getLastLoginAt())
                .build();
    }

    private List<String> getRoleNames(User user) {
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            return user.getRoles().stream()
                    .map(UserRole::getRole)
                    .collect(Collectors.toList());
        }
        return List.of(user.getUserType().name());
    }
}
