package com.dsatracker.controller;

import com.dsatracker.dto.*;
import com.dsatracker.exception.BadRequestException;
import com.dsatracker.exception.ResourceNotFoundException;
import com.dsatracker.model.User;
import com.dsatracker.repository.UserRepository;
import com.dsatracker.security.JwtTokenProvider;
import com.dsatracker.service.EmailService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private EmailService emailService;

    @Value("${google.client.id:your_google_client_id}")
    private String googleClientId;

    @Value("${google.client.secret:your_google_client_secret}")
    private String googleClientSecret;

    @Value("${google.redirect.uri:http://localhost:5000/api/auth/google/callback}")
    private String googleRedirectUri;

    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;

    // Helper to get authenticated user
    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            String userId = ((UserDetails) principal).getUsername();
            return userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        }
        throw new BadRequestException("Unauthorized access");
    }

    private String hashOtp(String otp) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(otp.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing OTP", e);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "User already exists");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        User user = User.builder()
                .name(registerRequest.getName())
                .email(registerRequest.getEmail().toLowerCase())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .build();

        User savedUser = userRepository.save(user);

        String token = tokenProvider.generateToken(savedUser.getId());

        AuthResponse authResponse = AuthResponse.builder()
                .token(token)
                ._id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .streak(savedUser.getStreak())
                .activeSheet(savedUser.getActiveSheet())
                .hasOnboarded(savedUser.isHasOnboarded())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail().toLowerCase())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        if (user.isBlocked()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Your account has been blocked. Contact admin.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        // Update streak and last active date
        Calendar todayCal = Calendar.getInstance();
        todayCal.set(Calendar.HOUR_OF_DAY, 0);
        todayCal.set(Calendar.MINUTE, 0);
        todayCal.set(Calendar.SECOND, 0);
        todayCal.set(Calendar.MILLISECOND, 0);
        long today = todayCal.getTimeInMillis();

        Calendar activeCal = Calendar.getInstance();
        activeCal.setTime(user.getLastActiveDate());
        activeCal.set(Calendar.HOUR_OF_DAY, 0);
        activeCal.set(Calendar.MINUTE, 0);
        activeCal.set(Calendar.SECOND, 0);
        activeCal.set(Calendar.MILLISECOND, 0);
        long lastActive = activeCal.getTimeInMillis();

        long diffMs = today - lastActive;
        long daysDiff = diffMs / (1000 * 60 * 60 * 24);

        if (daysDiff == 1) {
            user.setStreak(user.getStreak() + 1);
        } else if (daysDiff > 1) {
            user.setStreak(1);
        }

        user.setLastActiveDate(new Date());
        userRepository.save(user);

        String token = tokenProvider.generateToken(user.getId());

        AuthResponse authResponse = AuthResponse.builder()
                .token(token)
                ._id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .streak(user.getStreak())
                .activeSheet(user.getActiveSheet())
                .hasOnboarded(user.isHasOnboarded())
                .build();

        return ResponseEntity.ok(authResponse);
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile() {
        User user = getAuthenticatedUser();
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("_id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        response.put("goal", user.getGoal());
        response.put("dailyGoal", user.getDailyGoal());
        response.put("streak", user.getStreak());
        response.put("preferredLanguage", user.getPreferredLanguage());
        response.put("xpPoints", user.getXpPoints());
        response.put("level", user.getLevel());
        response.put("activeSheet", user.getActiveSheet());
        response.put("hasOnboarded", user.isHasOnboarded());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateUserProfile(@RequestBody UpdateProfileRequest updateProfileRequest) {
        User user = getAuthenticatedUser();

        if (updateProfileRequest.getName() != null) user.setName(updateProfileRequest.getName());
        if (updateProfileRequest.getGoal() != null) user.setGoal(updateProfileRequest.getGoal());
        if (updateProfileRequest.getDailyGoal() != null) user.setDailyGoal(updateProfileRequest.getDailyGoal());
        if (updateProfileRequest.getPreferredLanguage() != null) user.setPreferredLanguage(updateProfileRequest.getPreferredLanguage());
        if (updateProfileRequest.getActiveSheet() != null) {
            String activeSheet = updateProfileRequest.getActiveSheet();
            if (!org.springframework.util.StringUtils.hasText(activeSheet) || "null".equalsIgnoreCase(activeSheet)) {
                user.setActiveSheet(null);
            } else {
                user.setActiveSheet(activeSheet);
            }
        }
        if (updateProfileRequest.getHasOnboarded() != null) user.setHasOnboarded(updateProfileRequest.getHasOnboarded());

        User updatedUser = userRepository.save(user);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("_id", updatedUser.getId());
        response.put("name", updatedUser.getName());
        response.put("email", updatedUser.getEmail());
        response.put("goal", updatedUser.getGoal());
        response.put("dailyGoal", updatedUser.getDailyGoal());
        response.put("preferredLanguage", updatedUser.getPreferredLanguage());
        response.put("activeSheet", updatedUser.getActiveSheet());
        response.put("hasOnboarded", updatedUser.isHasOnboarded());

        return ResponseEntity.ok(response);
    }



    @PutMapping("/updatepassword")
    public ResponseEntity<?> updatePassword(@RequestBody Map<String, String> body) {
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        if (!StringUtils.hasText(currentPassword) || !StringUtils.hasText(newPassword)) {
            throw new BadRequestException("Please provide current and new password");
        }

        User user = getAuthenticatedUser();

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadRequestException("Invalid current password");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password updated");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgotpassword")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (!StringUtils.hasText(email)) {
            throw new BadRequestException("Please provide email");
        }

        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Generate 6 digit OTP
        SecureRandom random = new SecureRandom();
        int otpCode = 100000 + random.nextInt(900000);
        String otp = String.valueOf(otpCode);

        // Save hashed OTP and expiration in User Document
        user.setResetPasswordToken(hashOtp(otp));
        // Expiration = 10 mins
        user.setResetPasswordExpire(new Date(System.currentTimeMillis() + 10 * 60 * 1000));
        userRepository.save(user);

        String emailText = "Your password reset OTP is: " + otp + 
                "\n\nIt is valid for 10 minutes. \n\nIf you didn't request this, please ignore this email.";

        emailService.sendEmail(user.getEmail(), "DSA Tracker - Password Reset OTP", emailText);

        Map<String, String> response = new HashMap<>();
        response.put("message", "OTP sent to email. Please check your spam folder too.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/resetpassword/verify")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest resetPasswordRequest) {
        User user = userRepository.findByEmail(resetPasswordRequest.getEmail().toLowerCase())
                .orElseThrow(() -> new BadRequestException("Invalid request"));

        String hashedOtp = hashOtp(resetPasswordRequest.getOtp());

        if (user.getResetPasswordToken() == null || 
            !user.getResetPasswordToken().equals(hashedOtp) || 
            user.getResetPasswordExpire() == null || 
            user.getResetPasswordExpire().before(new Date())) {
            throw new BadRequestException("Invalid or expired OTP");
        }

        user.setPassword(passwordEncoder.encode(resetPasswordRequest.getPassword()));
        user.setResetPasswordToken(null);
        user.setResetPasswordExpire(null);
        userRepository.save(user);

        String token = tokenProvider.generateToken(user.getId());

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset successful");
        response.put("token", token);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/google")
    public void googleLogin(HttpServletResponse response) throws IOException {
        String googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth" +
                "?client_id=" + googleClientId +
                "&redirect_uri=" + googleRedirectUri +
                "&response_type=code" +
                "&scope=profile%20email";
        response.sendRedirect(googleAuthUrl);
    }

    @GetMapping("/google/callback")
    public void googleCallback(@RequestParam("code") String code, HttpServletResponse response) throws IOException {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String tokenUrl = "https://oauth2.googleapis.com/token";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
            map.add("code", code);
            map.add("client_id", googleClientId);
            map.add("client_secret", googleClientSecret);
            map.add("redirect_uri", googleRedirectUri);
            map.add("grant_type", "authorization_code");

            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(map, headers);
            Map<String, Object> tokenResponse = restTemplate.postForObject(tokenUrl, requestEntity, Map.class);

            if (tokenResponse == null || !tokenResponse.containsKey("access_token")) {
                throw new BadRequestException("Failed to retrieve access token from Google");
            }

            String accessToken = (String) tokenResponse.get("access_token");

            String userInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo?access_token=" + accessToken;
            Map<String, Object> userInfo = restTemplate.getForObject(userInfoUrl, Map.class);

            if (userInfo == null || !userInfo.containsKey("email")) {
                throw new BadRequestException("Failed to retrieve user info from Google");
            }

            String googleId = (String) userInfo.get("sub");
            String email = ((String) userInfo.get("email")).toLowerCase();
            String name = (String) userInfo.get("name");

            User user = userRepository.findByGoogleId(googleId).orElse(null);

            if (user == null) {
                user = userRepository.findByEmail(email).orElse(null);
                if (user != null) {
                    user.setGoogleId(googleId);
                    userRepository.save(user);
                } else {
                    user = User.builder()
                            .name(name)
                            .email(email)
                            .googleId(googleId)
                            .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                            .build();
                    user = userRepository.save(user);
                }
            }

            String token = tokenProvider.generateToken(user.getId());
            response.sendRedirect(frontendUrl + "/oauth/callback?token=" + token);

        } catch (Exception e) {
            response.sendRedirect(frontendUrl + "/login?error=Google authentication failed: " + e.getMessage());
        }
    }
}
