package com.hirelink.service;

import com.hirelink.dto.*;
import com.hirelink.entity.*;
import com.hirelink.enums.Enums.*;
import com.hirelink.exception.ResourceNotFoundException;
import com.hirelink.exception.BadRequestException;
import com.hirelink.repository.*;
import com.hirelink.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

// ============================================================================
// Authentication Service
// ============================================================================
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if user already exists
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new BadRequestException("Phone number already registered");
        }
        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        
        // Create user
        User user = User.builder()
            .name(request.getName())
            .phone(request.getPhone())
            .email(request.getEmail())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .userType(request.getUserType() != null ? request.getUserType() : UserType.CUSTOMER)
            .accountStatus(AccountStatus.ACTIVE) // For demo; in production use PENDING_VERIFICATION
            .isPhoneVerified(true) // For demo
            .build();
        
        user = userRepository.save(user);
        log.info("User registered successfully: {}", user.getPhone());
        
        return generateAuthResponse(user);
    }
    
    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getPhone(), request.getPassword())
        );
        
        User user = userRepository.findByPhone(request.getPhone())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Update last login
        user.setLastLoginAt(LocalDateTime.now());
        user.setFailedLoginAttempts(0);
        userRepository.save(user);
        
        log.info("User logged in: {}", user.getPhone());
        return generateAuthResponse(user);
    }
    
    private AuthResponse generateAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        
        return AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .expiresIn(jwtService.getAccessTokenExpiration())
            .user(mapToUserDTO(user))
            .build();
    }
    
    private UserDTO mapToUserDTO(User user) {
        return UserDTO.builder()
            .id(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .phone(user.getPhone())
            .profileImageUrl(user.getProfileImageUrl())
            .dateOfBirth(user.getDateOfBirth())
            .gender(user.getGender())
            .userType(user.getUserType())
            .accountStatus(user.getAccountStatus())
            .isEmailVerified(user.getIsEmailVerified())
            .isPhoneVerified(user.getIsPhoneVerified())
            .preferredLanguage(user.getPreferredLanguage())
            .createdAt(user.getCreatedAt())
            .build();
    }
}

// ============================================================================
// User Service
// ============================================================================
@Service
@RequiredArgsConstructor
@Slf4j
class UserService {
    
    private final UserRepository userRepository;
    
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToDTO(user);
    }
    
    public UserDTO getUserByPhone(String phone) {
        User user = userRepository.findByPhone(phone)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToDTO(user);
    }
    
    @Transactional
    public UserDTO updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (request.getName() != null) user.setName(request.getName());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getDateOfBirth() != null) user.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) user.setGender(request.getGender());
        if (request.getPreferredLanguage() != null) user.setPreferredLanguage(request.getPreferredLanguage());
        if (request.getProfileImageUrl() != null) user.setProfileImageUrl(request.getProfileImageUrl());
        
        user = userRepository.save(user);
        return mapToDTO(user);
    }
    
    private UserDTO mapToDTO(User user) {
        return UserDTO.builder()
            .id(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .phone(user.getPhone())
            .profileImageUrl(user.getProfileImageUrl())
            .dateOfBirth(user.getDateOfBirth())
            .gender(user.getGender())
            .userType(user.getUserType())
            .accountStatus(user.getAccountStatus())
            .isEmailVerified(user.getIsEmailVerified())
            .isPhoneVerified(user.getIsPhoneVerified())
            .preferredLanguage(user.getPreferredLanguage())
            .createdAt(user.getCreatedAt())
            .build();
    }
}

// ============================================================================
// Service Category Service
// ============================================================================
@Service
@RequiredArgsConstructor
@Slf4j
class CategoryService {
    
    private final ServiceCategoryRepository categoryRepository;
    
    public List<ServiceCategoryDTO> getAllCategories() {
        return categoryRepository.findByParentCategoryIsNullAndIsActiveTrue()
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    public ServiceCategoryDTO getCategoryById(Long id) {
        ServiceCategory category = categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        return mapToDTO(category);
    }
    
    public ServiceCategoryDTO getCategoryBySlug(String slug) {
        ServiceCategory category = categoryRepository.findByCategorySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        return mapToDTO(category);
    }
    
    public List<ServiceCategoryDTO> getFeaturedCategories() {
        return categoryRepository.findByIsFeaturedTrueAndIsActiveTrue()
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    public List<ServiceCategoryDTO> getSubCategories(Long parentId) {
        return categoryRepository.findByParentCategoryIdAndIsActiveTrue(parentId)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    private ServiceCategoryDTO mapToDTO(ServiceCategory category) {
        List<ServiceCategoryDTO> subCategories = category.getSubCategories() != null 
            ? category.getSubCategories().stream()
                .filter(ServiceCategory::getIsActive)
                .map(this::mapToDTO)
                .collect(Collectors.toList())
            : new ArrayList<>();
        
        return ServiceCategoryDTO.builder()
            .id(category.getId())
            .categoryName(category.getCategoryName())
            .categorySlug(category.getCategorySlug())
            .categoryDescription(category.getCategoryDescription())
            .categoryIcon(category.getCategoryIcon())
            .categoryImageUrl(category.getCategoryImageUrl())
            .parentCategoryId(category.getParentCategory() != null ? category.getParentCategory().getId() : null)
            .categoryLevel(category.getCategoryLevel())
            .displayOrder(category.getDisplayOrder())
            .minBasePrice(category.getMinBasePrice())
            .maxBasePrice(category.getMaxBasePrice())
            .priceUnit(category.getPriceUnit())
            .isActive(category.getIsActive())
            .isFeatured(category.getIsFeatured())
            .subCategories(subCategories)
            .build();
    }
}

// ============================================================================
// Provider Service
// ============================================================================
@Service
@RequiredArgsConstructor
@Slf4j
class ProviderService {
    
    private final ServiceProviderRepository providerRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    
    public ServiceProviderDTO getProviderById(Long id) {
        ServiceProvider provider = providerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));
        return mapToDTO(provider);
    }
    
    public ServiceProviderDTO getProviderByUserId(Long userId) {
        ServiceProvider provider = providerRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));
        return mapToDTO(provider);
    }
    
    @Transactional
    public ServiceProviderDTO registerProvider(Long userId, ProviderRegisterRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (providerRepository.findByUserId(userId).isPresent()) {
            throw new BadRequestException("User is already registered as a provider");
        }
        
        // Update user type
        user.setUserType(UserType.PROVIDER);
        userRepository.save(user);
        
        // Create provider profile
        ServiceProvider provider = ServiceProvider.builder()
            .user(user)
            .businessName(request.getBusinessName())
            .businessDescription(request.getBusinessDescription())
            .tagline(request.getTagline())
            .experienceYears(request.getExperienceYears())
            .baseLatitude(request.getBaseLatitude())
            .baseLongitude(request.getBaseLongitude())
            .basePincode(request.getBasePincode())
            .serviceRadiusKm(request.getServiceRadiusKm())
            .build();
        
        if (request.getSpecializations() != null) {
            provider.setSpecializations(String.join(",", request.getSpecializations()));
        }
        
        provider = providerRepository.save(provider);
        log.info("Provider registered: {}", provider.getId());
        
        return mapToDTO(provider);
    }
    
    public PageResponse<ServiceProviderDTO> searchProviders(ProviderSearchRequest request) {
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());
        
        // For simplicity, using basic query. In production, use Specification or QueryDSL
        Page<ServiceProvider> providers;
        if (request.getLatitude() != null && request.getLongitude() != null) {
            List<ServiceProvider> nearbyProviders = providerRepository.findNearbyProviders(
                request.getLatitude(), request.getLongitude(), request.getRadiusKm()
            );
            int start = (int) pageable.getOffset();
            int end = Math.min(start + pageable.getPageSize(), nearbyProviders.size());
            providers = new PageImpl<>(nearbyProviders.subList(start, end), pageable, nearbyProviders.size());
        } else {
            providers = providerRepository.findAll(pageable);
        }
        
        return PageResponse.<ServiceProviderDTO>builder()
            .content(providers.getContent().stream().map(this::mapToDTO).collect(Collectors.toList()))
            .page(providers.getNumber())
            .size(providers.getSize())
            .totalElements(providers.getTotalElements())
            .totalPages(providers.getTotalPages())
            .first(providers.isFirst())
            .last(providers.isLast())
            .build();
    }
    
    public PageResponse<ServiceProviderDTO> getFeaturedProviders(int page, int size) {
        Page<ServiceProvider> providers = providerRepository.findByIsFeaturedTrue(PageRequest.of(page, size));
        
        return PageResponse.<ServiceProviderDTO>builder()
            .content(providers.getContent().stream().map(this::mapToDTO).collect(Collectors.toList()))
            .page(providers.getNumber())
            .size(providers.getSize())
            .totalElements(providers.getTotalElements())
            .totalPages(providers.getTotalPages())
            .first(providers.isFirst())
            .last(providers.isLast())
            .build();
    }
    
    private ServiceProviderDTO mapToDTO(ServiceProvider provider) {
        User user = provider.getUser();
        List<String> specializations = provider.getSpecializations() != null 
            ? Arrays.asList(provider.getSpecializations().split(","))
            : new ArrayList<>();
        
        return ServiceProviderDTO.builder()
            .id(provider.getId())
            .userId(user.getId())
            .name(user.getName())
            .phone(user.getPhone())
            .profileImageUrl(user.getProfileImageUrl())
            .businessName(provider.getBusinessName())
            .businessDescription(provider.getBusinessDescription())
            .tagline(provider.getTagline())
            .experienceYears(provider.getExperienceYears())
            .specializations(specializations)
            .baseLatitude(provider.getBaseLatitude())
            .baseLongitude(provider.getBaseLongitude())
            .basePincode(provider.getBasePincode())
            .serviceRadiusKm(provider.getServiceRadiusKm())
            .kycStatus(provider.getKycStatus())
            .averageRating(provider.getAverageRating())
            .totalReviews(provider.getTotalReviews())
            .totalBookings(provider.getTotalBookings())
            .completedBookings(provider.getCompletedBookings())
            .completionRate(provider.getCompletionRate())
            .isAvailable(provider.getIsAvailable())
            .availabilityStatus(provider.getAvailabilityStatus())
            .isFeatured(provider.getIsFeatured())
            .build();
    }
}

// ============================================================================
// Booking Service
// ============================================================================
@Service
@RequiredArgsConstructor
@Slf4j
class BookingService {
    
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ServiceProviderRepository providerRepository;
    private final ServiceRepository serviceRepository;
    
    @Transactional
    public BookingDTO createBooking(Long userId, BookingCreateRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        ServiceProvider provider = providerRepository.findById(request.getProviderId())
            .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));
        
        com.hirelink.entity.Service service = serviceRepository.findById(request.getServiceId())
            .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
        
        // Validate provider availability
        int activeBookings = bookingRepository.countActiveBookingsByProvider(provider.getId());
        if (activeBookings >= provider.getMaxConcurrentBookings()) {
            throw new BadRequestException("Provider has reached maximum concurrent bookings");
        }
        
        Booking booking = Booking.builder()
            .user(user)
            .provider(provider)
            .service(service)
            .scheduledDate(request.getScheduledDate())
            .scheduledTime(request.getScheduledTime())
            .serviceAddress(request.getServiceAddress())
            .serviceLandmark(request.getServiceLandmark())
            .servicePincode(request.getServicePincode())
            .serviceLatitude(request.getServiceLatitude())
            .serviceLongitude(request.getServiceLongitude())
            .issueTitle(request.getIssueTitle())
            .issueDescription(request.getIssueDescription())
            .urgencyLevel(request.getUrgencyLevel())
            .estimatedAmount(service.getBasePrice())
            .bookingStatus(BookingStatus.PENDING)
            .build();
        
        booking = bookingRepository.save(booking);
        log.info("Booking created: {}", booking.getBookingNumber());
        
        return mapToDTO(booking);
    }
    
    public BookingDTO getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        return mapToDTO(booking);
    }
    
    public BookingDTO getBookingByNumber(String bookingNumber) {
        Booking booking = bookingRepository.findByBookingNumber(bookingNumber)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        return mapToDTO(booking);
    }
    
    public PageResponse<BookingDTO> getUserBookings(Long userId, int page, int size) {
        Page<Booking> bookings = bookingRepository.findByUserId(userId, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return mapToPageResponse(bookings);
    }
    
    public PageResponse<BookingDTO> getProviderBookings(Long providerId, int page, int size) {
        Page<Booking> bookings = bookingRepository.findByProviderId(providerId, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return mapToPageResponse(bookings);
    }
    
    @Transactional
    public BookingDTO updateBookingStatus(Long id, BookingUpdateRequest request, Long userId) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        
        if (request.getBookingStatus() != null) {
            booking.setBookingStatus(request.getBookingStatus());
            
            if (request.getBookingStatus() == BookingStatus.CANCELLED) {
                booking.setCancelledAt(LocalDateTime.now());
                booking.setCancellationReason(request.getCancellationReason());
            }
        }
        
        if (request.getProviderNotes() != null) booking.setProviderNotes(request.getProviderNotes());
        if (request.getMaterialCost() != null) booking.setMaterialCost(request.getMaterialCost());
        if (request.getLaborCost() != null) booking.setLaborCost(request.getLaborCost());
        if (request.getFinalAmount() != null) booking.setFinalAmount(request.getFinalAmount());
        if (request.getWorkSummary() != null) booking.setWorkSummary(request.getWorkSummary());
        
        booking = bookingRepository.save(booking);
        log.info("Booking {} status updated to {}", booking.getBookingNumber(), booking.getBookingStatus());
        
        return mapToDTO(booking);
    }
    
    private BookingDTO mapToDTO(Booking booking) {
        return BookingDTO.builder()
            .id(booking.getId())
            .bookingNumber(booking.getBookingNumber())
            .userId(booking.getUser().getId())
            .userName(booking.getUser().getName())
            .userPhone(booking.getUser().getPhone())
            .providerId(booking.getProvider().getId())
            .providerName(booking.getProvider().getUser().getName())
            .providerPhone(booking.getProvider().getUser().getPhone())
            .businessName(booking.getProvider().getBusinessName())
            .serviceId(booking.getService().getId())
            .serviceName(booking.getService().getServiceName())
            .categoryName(booking.getService().getCategory().getCategoryName())
            .scheduledDate(booking.getScheduledDate())
            .scheduledTime(booking.getScheduledTime())
            .serviceAddress(booking.getServiceAddress())
            .servicePincode(booking.getServicePincode())
            .serviceLatitude(booking.getServiceLatitude())
            .serviceLongitude(booking.getServiceLongitude())
            .issueTitle(booking.getIssueTitle())
            .issueDescription(booking.getIssueDescription())
            .urgencyLevel(booking.getUrgencyLevel())
            .estimatedAmount(booking.getEstimatedAmount())
            .materialCost(booking.getMaterialCost())
            .laborCost(booking.getLaborCost())
            .finalAmount(booking.getFinalAmount())
            .bookingStatus(booking.getBookingStatus())
            .workSummary(booking.getWorkSummary())
            .userRating(booking.getUserRating())
            .createdAt(booking.getCreatedAt())
            .build();
    }
    
    private PageResponse<BookingDTO> mapToPageResponse(Page<Booking> bookings) {
        return PageResponse.<BookingDTO>builder()
            .content(bookings.getContent().stream().map(this::mapToDTO).collect(Collectors.toList()))
            .page(bookings.getNumber())
            .size(bookings.getSize())
            .totalElements(bookings.getTotalElements())
            .totalPages(bookings.getTotalPages())
            .first(bookings.isFirst())
            .last(bookings.isLast())
            .build();
    }
}
