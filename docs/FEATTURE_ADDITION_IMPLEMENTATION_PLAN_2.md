# HireLink Application - Implementation Plan for Cursor IDE
## For Claude Opus 4.5

---

## 📋 PROJECT CONTEXT

**Application:** HireLink Booking System  
**Stack:** Spring Boot 3.x (Backend) + React 18.x (Frontend) + MySQL 8.0  
**Current State:** Basic CRUD operations for bookings implemented  
**Goal:** Implement new features and fix existing bugs

---

## 🎯 IMPLEMENTATION TASKS

### TASK 1: User Verification System (OTP + Gmail OAuth)
### TASK 2: Light Theme Color Scheme
### TASK 3: Search Functionality
### TASK 4: Location-Based Features
### BUG FIX 1: Header Display Issue After Login

---

# TASK 1: USER VERIFICATION SYSTEM

## 1.1 Overview
Implement dual verification: Email OTP AND Google OAuth login options.

## 1.2 Backend Implementation

### Step 1: Add Dependencies to pom.xml
```xml
<!-- Add these dependencies to backend/pom.xml -->

<!-- Spring Security -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- OAuth2 Client for Google Login -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-client</artifactId>
</dependency>

<!-- JWT for token-based auth -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>

<!-- Email sending -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

### Step 2: Create OTP Entity
```java
// Create file: backend/src/main/java/com/hirelink/entity/OtpVerification.java

package com.hirelink.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "otp_verifications")
@Data
public class OtpVerification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String email;
    
    @Column(nullable = false, length = 6)
    private String otpCode;
    
    @Column(nullable = false)
    private LocalDateTime expiresAt;
    
    @Column(nullable = false)
    private Boolean isUsed = false;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        // OTP expires in 10 minutes
        this.expiresAt = LocalDateTime.now().plusMinutes(10);
    }
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiresAt);
    }
}
```

### Step 3: Update User Entity for Auth
```java
// Modify: backend/src/main/java/com/hirelink/entity/User.java
// ADD these fields to existing User entity:

@Column(name = "password_hash")
private String passwordHash;

@Column(name = "is_verified")
private Boolean isVerified = false;

@Column(name = "auth_provider")
@Enumerated(EnumType.STRING)
private AuthProvider authProvider = AuthProvider.LOCAL;

@Column(name = "google_id")
private String googleId;

public enum AuthProvider {
    LOCAL,    // Email + OTP verification
    GOOGLE    // Google OAuth
}
```

### Step 4: Create OTP Repository
```java
// Create file: backend/src/main/java/com/hirelink/repository/OtpRepository.java

package com.hirelink.repository;

import com.hirelink.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<OtpVerification, Long> {
    Optional<OtpVerification> findByEmailAndOtpCodeAndIsUsedFalse(String email, String otpCode);
    void deleteByEmail(String email);
}
```

### Step 5: Create Email Service
```java
// Create file: backend/src/main/java/com/hirelink/service/EmailService.java

package com.hirelink.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    public void sendOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("HireLink - Your Verification Code");
        message.setText(
            "Your OTP verification code is: " + otp + "\n\n" +
            "This code will expire in 10 minutes.\n\n" +
            "If you didn't request this code, please ignore this email."
        );
        mailSender.send(message);
    }
}
```

### Step 6: Create Auth Service
```java
// Create file: backend/src/main/java/com/hirelink/service/AuthService.java

package com.hirelink.service;

import com.hirelink.dto.AuthDTO.*;
import com.hirelink.entity.OtpVerification;
import com.hirelink.entity.User;
import com.hirelink.repository.OtpRepository;
import com.hirelink.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final OtpRepository otpRepository;
    private final EmailService emailService;
    private final JwtService jwtService;
    
    // Generate 6-digit OTP
    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
    
    @Transactional
    public void sendOtp(String email) {
        // Delete any existing OTPs for this email
        otpRepository.deleteByEmail(email);
        
        // Generate new OTP
        String otpCode = generateOtp();
        
        // Save OTP to database
        OtpVerification otp = new OtpVerification();
        otp.setEmail(email);
        otp.setOtpCode(otpCode);
        otpRepository.save(otp);
        
        // Send email
        emailService.sendOtpEmail(email, otpCode);
    }
    
    @Transactional
    public AuthResponse verifyOtpAndLogin(String email, String otpCode) {
        // Find valid OTP
        OtpVerification otp = otpRepository
            .findByEmailAndOtpCodeAndIsUsedFalse(email, otpCode)
            .orElseThrow(() -> new RuntimeException("Invalid OTP"));
        
        // Check expiration
        if (otp.isExpired()) {
            throw new RuntimeException("OTP has expired");
        }
        
        // Mark OTP as used
        otp.setIsUsed(true);
        otpRepository.save(otp);
        
        // Find or create user
        User user = userRepository.findByEmail(email)
            .orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setName(email.split("@")[0]); // Default name from email
                newUser.setPhone("0000000000"); // Placeholder
                newUser.setIsVerified(true);
                newUser.setAuthProvider(User.AuthProvider.LOCAL);
                return userRepository.save(newUser);
            });
        
        // Update verification status
        if (!user.getIsVerified()) {
            user.setIsVerified(true);
            userRepository.save(user);
        }
        
        // Generate JWT token
        String token = jwtService.generateToken(user);
        
        return AuthResponse.builder()
            .token(token)
            .userId(user.getId())
            .email(user.getEmail())
            .name(user.getName())
            .build();
    }
    
    @Transactional
    public AuthResponse googleLogin(GoogleLoginRequest request) {
        // Verify Google token (implement Google token verification)
        // For now, trust the frontend Google response
        
        User user = userRepository.findByEmail(request.getEmail())
            .orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(request.getEmail());
                newUser.setName(request.getName());
                newUser.setPhone("0000000000");
                newUser.setIsVerified(true);
                newUser.setAuthProvider(User.AuthProvider.GOOGLE);
                newUser.setGoogleId(request.getGoogleId());
                return userRepository.save(newUser);
            });
        
        String token = jwtService.generateToken(user);
        
        return AuthResponse.builder()
            .token(token)
            .userId(user.getId())
            .email(user.getEmail())
            .name(user.getName())
            .build();
    }
}
```

### Step 7: Create JWT Service
```java
// Create file: backend/src/main/java/com/hirelink/service/JwtService.java

package com.hirelink.service;

import com.hirelink.entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {
    
    @Value("${jwt.secret:your-256-bit-secret-key-here-make-it-long}")
    private String jwtSecret;
    
    @Value("${jwt.expiration:86400000}") // 24 hours
    private long jwtExpiration;
    
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }
    
    public String generateToken(User user) {
        return Jwts.builder()
            .subject(user.getEmail())
            .claim("userId", user.getId())
            .claim("name", user.getName())
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
            .signWith(getSigningKey())
            .compact();
    }
    
    public String extractEmail(String token) {
        return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload()
            .getSubject();
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
```

### Step 8: Create Auth DTOs
```java
// Create file: backend/src/main/java/com/hirelink/dto/AuthDTO.java

package com.hirelink.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

public class AuthDTO {
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SendOtpRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VerifyOtpRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;
        
        @NotBlank(message = "OTP is required")
        private String otp;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GoogleLoginRequest {
        private String googleId;
        private String email;
        private String name;
        private String imageUrl;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthResponse {
        private String token;
        private Long userId;
        private String email;
        private String name;
    }
}
```

### Step 9: Create Auth Controller
```java
// Create file: backend/src/main/java/com/hirelink/controller/AuthController.java

package com.hirelink.controller;

import com.hirelink.dto.ApiResponse;
import com.hirelink.dto.AuthDTO.*;
import com.hirelink.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    /**
     * Send OTP to email
     * POST /api/auth/send-otp
     */
    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<String>> sendOtp(
            @Valid @RequestBody SendOtpRequest request) {
        authService.sendOtp(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success("OTP sent to " + request.getEmail()));
    }
    
    /**
     * Verify OTP and login
     * POST /api/auth/verify-otp
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request) {
        AuthResponse response = authService.verifyOtpAndLogin(request.getEmail(), request.getOtp());
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
    
    /**
     * Google OAuth login
     * POST /api/auth/google
     */
    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(
            @RequestBody GoogleLoginRequest request) {
        AuthResponse response = authService.googleLogin(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
}
```

### Step 10: Update application.properties
```properties
# Add to backend/src/main/resources/application.properties

# Email Configuration (Gmail SMTP)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# JWT Configuration
jwt.secret=your-very-long-256-bit-secret-key-for-jwt-signing-minimum-32-chars
jwt.expiration=86400000

# Google OAuth (optional - for server-side verification)
spring.security.oauth2.client.registration.google.client-id=YOUR_GOOGLE_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_GOOGLE_CLIENT_SECRET
```

## 1.3 Frontend Implementation

### Step 1: Install Dependencies
```bash
cd frontend
npm install @react-oauth/google axios
```

### Step 2: Create Auth Context
```jsx
// Create file: frontend/src/context/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (authResponse) => {
    localStorage.setItem('token', authResponse.token);
    localStorage.setItem('user', JSON.stringify({
      id: authResponse.userId,
      email: authResponse.email,
      name: authResponse.name
    }));
    setToken(authResponse.token);
    setUser({
      id: authResponse.userId,
      email: authResponse.email,
      name: authResponse.name
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### Step 3: Create Login Component
```jsx
// Create file: frontend/src/components/Login.jsx

import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/auth/send-otp', { email });
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      login(response.data.data);
      onLoginSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    
    try {
      // Decode Google JWT to get user info
      const decoded = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      
      const response = await api.post('/auth/google', {
        googleId: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        imageUrl: decoded.picture
      });
      
      login(response.data.data);
      onLoginSuccess?.();
    } catch (err) {
      setError('Google login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome to HireLink</h2>
        <p style={styles.subtitle}>Sign in to continue</p>
        
        {error && <div style={styles.error}>{error}</div>}
        
        {step === 'email' ? (
          <form onSubmit={handleSendOtp}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                placeholder="Enter your email"
                required
              />
            </div>
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <p style={styles.otpInfo}>OTP sent to {email}</p>
            <div style={styles.formGroup}>
              <label style={styles.label}>Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={styles.input}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                required
              />
            </div>
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
            <button 
              type="button" 
              onClick={() => setStep('email')}
              style={styles.linkButton}
            >
              Change email
            </button>
          </form>
        )}
        
        <div style={styles.divider}>
          <span>OR</span>
        </div>
        
        <div style={styles.googleButton}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google login failed')}
            theme="outline"
            size="large"
            width="100%"
          />
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#f5f5f5',
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    textAlign: 'center',
    color: '#1e3a5f',
    marginBottom: '8px',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '30px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#333',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
  },
  button: {
    width: '100%',
    padding: '14px',
    background: '#1e3a5f',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#4a90a4',
    cursor: 'pointer',
    marginTop: '10px',
  },
  error: {
    background: '#fee',
    color: '#c00',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  otpInfo: {
    color: '#28a745',
    marginBottom: '20px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '25px 0',
    color: '#999',
  },
  googleButton: {
    display: 'flex',
    justifyContent: 'center',
  },
};

export default Login;
```

### Step 4: Update main.jsx with Google Provider
```jsx
// Modify: frontend/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import App from './App';

const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
```

---

# TASK 2: LIGHT THEME COLOR SCHEME

## 2.1 Define New Color Palette

Replace dark colors with light, professional theme:

```javascript
// Create file: frontend/src/styles/theme.js

export const lightTheme = {
  // Primary colors
  primary: '#2563eb',        // Blue
  primaryLight: '#3b82f6',
  primaryDark: '#1d4ed8',
  
  // Secondary colors
  secondary: '#64748b',      // Slate gray
  secondaryLight: '#94a3b8',
  
  // Accent
  accent: '#f59e0b',         // Amber
  accentLight: '#fbbf24',
  
  // Background colors
  background: '#ffffff',
  backgroundSecondary: '#f8fafc',
  backgroundTertiary: '#f1f5f9',
  
  // Text colors
  textPrimary: '#1e293b',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  
  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Borders
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  
  // Shadows
  shadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  shadowMedium: '0 4px 6px rgba(0, 0, 0, 0.1)',
  shadowLarge: '0 10px 25px rgba(0, 0, 0, 0.1)',
};
```

## 2.2 Updated Styles for App.jsx

```javascript
// Replace styles object in frontend/src/App.jsx

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
  },
  header: {
    background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
    color: 'white',
    padding: '30px',
    borderRadius: '12px',
    marginBottom: '30px',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(37, 99, 235, 0.2)',
  },
  title: {
    margin: 0,
    fontSize: '2rem',
    fontWeight: '600',
  },
  subtitle: {
    opacity: 0.9,
    marginTop: '10px',
    fontSize: '1rem',
  },
  section: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#1e293b',
    borderBottom: '2px solid #2563eb',
    paddingBottom: '12px',
  },
  form: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    marginBottom: '6px',
    color: '#475569',
  },
  input: {
    padding: '12px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    outline: 'none',
  },
  inputFocus: {
    borderColor: '#2563eb',
    boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
  },
  select: {
    padding: '12px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer',
  },
  textarea: {
    padding: '12px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    minHeight: '100px',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  button: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    color: 'white',
  },
  primaryButtonHover: {
    backgroundColor: '#1d4ed8',
  },
  successButton: {
    backgroundColor: '#10b981',
    color: 'white',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  th: {
    backgroundColor: '#f8fafc',
    color: '#1e293b',
    padding: '14px 16px',
    textAlign: 'left',
    fontWeight: '600',
    borderBottom: '2px solid #e2e8f0',
  },
  td: {
    padding: '14px 16px',
    borderBottom: '1px solid #f1f5f9',
    color: '#475569',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500',
  },
  badgePending: { backgroundColor: '#fef3c7', color: '#92400e' },
  badgeConfirmed: { backgroundColor: '#dbeafe', color: '#1e40af' },
  badgeInProgress: { backgroundColor: '#e0e7ff', color: '#3730a3' },
  badgeCompleted: { backgroundColor: '#d1fae5', color: '#065f46' },
  badgeCancelled: { backgroundColor: '#fee2e2', color: '#991b1b' },
  alert: {
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  alertSuccess: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    border: '1px solid #a7f3d0',
  },
  alertError: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fecaca',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
  smallButton: {
    padding: '8px 12px',
    fontSize: '12px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
  },
};
```

---

# TASK 3: SEARCH FUNCTIONALITY

## 3.1 Backend Search Endpoint (Already exists)

The BookingRepository already has:
```java
@Query("SELECT b FROM Booking b " +
       "WHERE LOWER(b.customer.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
       "OR LOWER(b.service.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
List<Booking> searchBookings(@Param("keyword") String keyword);
```

The BookingController already has:
```java
@GetMapping("/search")
public ResponseEntity<ApiResponse<List<BookingDTO.BookingResponse>>> searchBookings(
        @RequestParam String keyword) {
    List<BookingDTO.BookingResponse> bookings = bookingService.searchBookings(keyword);
    return ResponseEntity.ok(ApiResponse.success(bookings));
}
```

## 3.2 Frontend Search Component

```jsx
// Add to App.jsx - Create SearchBar component

const SearchBar = ({ onSearch, onClear }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm, searchType);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    onClear();
  };

  return (
    <div style={searchStyles.container}>
      <form onSubmit={handleSearch} style={searchStyles.form}>
        <div style={searchStyles.inputWrapper}>
          <span style={searchStyles.searchIcon}>🔍</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, service, booking number..."
            style={searchStyles.input}
          />
          {searchTerm && (
            <button type="button" onClick={handleClear} style={searchStyles.clearButton}>
              ✕
            </button>
          )}
        </div>
        
        <select 
          value={searchType} 
          onChange={(e) => setSearchType(e.target.value)}
          style={searchStyles.select}
        >
          <option value="all">All Fields</option>
          <option value="customer">Customer Name</option>
          <option value="service">Service Name</option>
          <option value="status">Status</option>
          <option value="date">Date</option>
        </select>
        
        <button type="submit" style={searchStyles.button}>
          Search
        </button>
      </form>
    </div>
  );
};

const searchStyles = {
  container: {
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  inputWrapper: {
    position: 'relative',
    flex: '1',
    minWidth: '250px',
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '16px',
  },
  input: {
    width: '100%',
    padding: '12px 40px 12px 42px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
  },
  clearButton: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    fontSize: '16px',
  },
  select: {
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'white',
    minWidth: '150px',
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
  },
};
```

## 3.3 Add Search to Main App

```jsx
// Add these functions to App component

const handleSearch = async (keyword, type) => {
  try {
    setLoading(true);
    const response = await bookingApi.search(keyword);
    if (response.success) {
      setBookings(response.data);
      showMessage(`Found ${response.data.length} results`, 'success');
    }
  } catch (error) {
    showMessage('Search failed', 'error');
  } finally {
    setLoading(false);
  }
};

const handleClearSearch = () => {
  fetchBookings(); // Reset to full list
};

// Add SearchBar to JSX
<SearchBar onSearch={handleSearch} onClear={handleClearSearch} />
```

---

# TASK 4: LOCATION-BASED FEATURES

## 4.1 Backend - Add Location Fields

### Update Booking Entity
```java
// Add to Booking.java entity

@Column(name = "latitude")
private Double latitude;

@Column(name = "longitude")
private Double longitude;

@Column(name = "city")
private String city;

@Column(name = "state")
private String state;
```

### Add Location Repository Methods
```java
// Add to BookingRepository.java

// Find bookings within radius (using Haversine formula approximation)
@Query("SELECT b FROM Booking b WHERE " +
       "b.latitude BETWEEN :minLat AND :maxLat AND " +
       "b.longitude BETWEEN :minLng AND :maxLng")
List<Booking> findBookingsInArea(
    @Param("minLat") Double minLat,
    @Param("maxLat") Double maxLat,
    @Param("minLng") Double minLng,
    @Param("maxLng") Double maxLng
);

List<Booking> findByCity(String city);
List<Booking> findByCityAndStatus(String city, Booking.BookingStatus status);
```

### Add Location Service
```java
// Create file: backend/src/main/java/com/hirelink/service/LocationService.java

package com.hirelink.service;

import org.springframework.stereotype.Service;

@Service
public class LocationService {
    
    private static final double EARTH_RADIUS_KM = 6371;
    
    /**
     * Calculate distance between two coordinates using Haversine formula
     */
    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return EARTH_RADIUS_KM * c;
    }
    
    /**
     * Get bounding box for a radius around a point
     */
    public BoundingBox getBoundingBox(double lat, double lon, double radiusKm) {
        double latDelta = radiusKm / 111.0; // ~111km per degree latitude
        double lonDelta = radiusKm / (111.0 * Math.cos(Math.toRadians(lat)));
        
        return new BoundingBox(
            lat - latDelta,
            lat + latDelta,
            lon - lonDelta,
            lon + lonDelta
        );
    }
    
    public record BoundingBox(double minLat, double maxLat, double minLon, double maxLon) {}
}
```

## 4.2 Frontend Location Component

```jsx
// Create file: frontend/src/components/LocationPicker.jsx

import { useState, useEffect } from 'react';

const LocationPicker = ({ onLocationSelect, initialLocation }) => {
  const [location, setLocation] = useState(initialLocation || null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get current location
  const getCurrentLocation = () => {
    setLoading(true);
    setError('');
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        
        // Reverse geocode to get address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          setAddress(data.display_name);
          
          onLocationSelect({
            latitude,
            longitude,
            address: data.display_name,
            city: data.address?.city || data.address?.town || data.address?.village,
            state: data.address?.state,
            pincode: data.address?.postcode
          });
        } catch (err) {
          console.error('Geocoding error:', err);
        }
        
        setLoading(false);
      },
      (error) => {
        setError('Unable to get your location. Please enter address manually.');
        setLoading(false);
      }
    );
  };

  // Search address
  const searchAddress = async (searchText) => {
    if (searchText.length < 3) return;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchText)}&format=json&limit=5`
      );
      const results = await response.json();
      return results;
    } catch (err) {
      console.error('Address search error:', err);
      return [];
    }
  };

  return (
    <div style={locationStyles.container}>
      <div style={locationStyles.header}>
        <span>📍 Service Location</span>
        <button 
          type="button"
          onClick={getCurrentLocation}
          style={locationStyles.detectButton}
          disabled={loading}
        >
          {loading ? 'Detecting...' : '📌 Use Current Location'}
        </button>
      </div>
      
      {error && <p style={locationStyles.error}>{error}</p>}
      
      {location && (
        <div style={locationStyles.locationInfo}>
          <p><strong>Selected Location:</strong></p>
          <p style={locationStyles.address}>{address}</p>
          <p style={locationStyles.coords}>
            Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
          </p>
        </div>
      )}
      
      <div style={locationStyles.manualInput}>
        <label style={locationStyles.label}>Or enter address manually:</label>
        <input
          type="text"
          placeholder="Search for address..."
          onChange={(e) => setAddress(e.target.value)}
          style={locationStyles.input}
        />
      </div>
    </div>
  );
};

const locationStyles = {
  container: {
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
    backgroundColor: '#f8fafc',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  detectButton: {
    padding: '8px 16px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  error: {
    color: '#ef4444',
    fontSize: '14px',
    marginBottom: '12px',
  },
  locationInfo: {
    backgroundColor: 'white',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '12px',
  },
  address: {
    color: '#475569',
    fontSize: '14px',
  },
  coords: {
    color: '#94a3b8',
    fontSize: '12px',
    marginTop: '4px',
  },
  manualInput: {
    marginTop: '12px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    color: '#475569',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
  },
};

export default LocationPicker;
```

---

# BUG FIX 1: HEADER DISPLAY ISSUE AFTER LOGIN

## Problem Analysis
The header is cut off after login, likely due to:
1. CSS overflow issues
2. Fixed/sticky positioning conflicts
3. Viewport height calculations
4. Missing padding/margin adjustments

## Solution

### Fix 1: Update Header CSS
```jsx
// In App.jsx, update header styles

header: {
  background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
  color: 'white',
  padding: '30px',
  borderRadius: '12px',
  marginBottom: '30px',
  textAlign: 'center',
  boxShadow: '0 4px 15px rgba(37, 99, 235, 0.2)',
  // ADD THESE:
  position: 'relative',
  zIndex: 10,
  width: '100%',
  minHeight: 'auto',
  overflow: 'visible',
},
```

### Fix 2: Update Container CSS
```jsx
// Update container styles

container: {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '20px',
  backgroundColor: '#f8fafc',
  minHeight: '100vh',
  // ADD THESE:
  paddingTop: '20px',
  boxSizing: 'border-box',
},
```

### Fix 3: Check for Auth Header Interference
```jsx
// If you have a navbar that appears after login, ensure proper spacing

// In App.jsx, add conditional padding when logged in
const containerStyle = {
  ...styles.container,
  paddingTop: user ? '80px' : '20px', // Add space for nav if logged in
};
```

### Fix 4: Add Global CSS Reset
```html
<!-- In index.html, add to <style> -->
<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  html, body {
    width: 100%;
    overflow-x: hidden;
  }
  body {
    min-height: 100vh;
    padding-top: 0 !important;
  }
  #root {
    min-height: 100vh;
  }
</style>
```

### Fix 5: If Using Navbar Component
```jsx
// Create proper layout wrapper

const Layout = ({ children }) => {
  const { user } = useAuth();
  
  return (
    <div style={{ 
      minHeight: '100vh',
      paddingTop: user ? '0' : '0', // Adjust based on navbar height
    }}>
      {user && <Navbar />}
      <main style={{ 
        paddingTop: user ? '70px' : '0', // Space for fixed navbar
      }}>
        {children}
      </main>
    </div>
  );
};
```

---

# IMPLEMENTATION ORDER

## Phase 1: Bug Fix (Do First)
1. Fix header display issue
2. Test on different screen sizes

## Phase 2: Theme Update
1. Create theme.js file
2. Update all style objects
3. Test all components

## Phase 3: Search Feature
1. Add SearchBar component
2. Connect to existing API
3. Add filter options

## Phase 4: Authentication
1. Add backend dependencies
2. Create OTP entity and repository
3. Create auth services
4. Create auth controller
5. Add frontend auth context
6. Create login component
7. Set up Google OAuth
8. Test both login methods

## Phase 5: Location Features
1. Update entity with location fields
2. Add location repository methods
3. Create LocationPicker component
4. Integrate with booking form

---

# TESTING CHECKLIST

- [ ] Header displays correctly after login
- [ ] Light theme applied consistently
- [ ] Search returns correct results
- [ ] OTP sends and verifies correctly
- [ ] Google login works
- [ ] Location detection works
- [ ] All existing CRUD operations still work
- [ ] Mobile responsive design works

---

# NOTES FOR CURSOR/OPUS 4.5

1. **Work incrementally** - Implement one task at a time
2. **Test after each change** - Run `mvn spring-boot:run` and `npm run dev`
3. **Preserve existing code** - Don't remove working features
4. **Follow existing patterns** - Match the code style already in use
5. **Handle errors gracefully** - Add try-catch and user feedback
6. **Keep it simple** - This is a learning project for beginners

---

*Generated for HireLink Academic Project*
