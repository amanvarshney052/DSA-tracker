package com.dsatracker.controller;

import com.dsatracker.exception.BadRequestException;
import com.dsatracker.exception.ResourceNotFoundException;
import com.dsatracker.model.User;
import com.dsatracker.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')") // Restrict to admins
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SheetRepository sheetRepository;

    @Autowired
    private ProblemRepository problemRepository;

    @Autowired
    private UserProgressRepository userProgressRepository;

    @Autowired
    private RevisionRepository revisionRepository;

    @GetMapping("/stats")
    public ResponseEntity<?> getSystemStats() {
        long totalUsers = userRepository.count();
        long totalSheets = sheetRepository.count();
        long totalProblems = problemRepository.count();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("totalUsers", totalUsers);
        response.put("totalSheets", totalSheets);
        response.put("totalProblems", totalProblems);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();
        // Remove password hash from response objects
        users.forEach(u -> u.setPassword(null));
        // Sort by createdAt desc
        users.sort((a, b) -> {
            if (a.getCreatedAt() == null && b.getCreatedAt() == null) return 0;
            if (a.getCreatedAt() == null) return 1;
            if (b.getCreatedAt() == null) return -1;
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable("id") String id, @RequestBody Map<String, String> body) {
        String role = body.get("role");
        if (role == null || role.isEmpty()) {
            throw new BadRequestException("Role is required");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setRole(role.toLowerCase());
        User updated = userRepository.save(user);
        updated.setPassword(null);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/users/{id}/block")
    public ResponseEntity<?> toggleUserBlock(@PathVariable("id") String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setBlocked(!user.isBlocked());
        User updated = userRepository.save(user);
        updated.setPassword(null);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/users/{id}/reset-progress")
    public ResponseEntity<?> resetUserProgress(@PathVariable("id") String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Delete all progress and revision schedules
        userProgressRepository.deleteAll(userProgressRepository.findByUserId(id));
        revisionRepository.deleteAll(revisionRepository.findByUserId(id));

        user.setXpPoints(0);
        user.setLevel(1);
        user.setStreak(0);
        user.setActiveSheet(null);
        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "User progress reset successfully");
        return ResponseEntity.ok(response);
    }
}
