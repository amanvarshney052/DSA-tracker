package com.dsatracker.controller;

import com.dsatracker.exception.BadRequestException;
import com.dsatracker.exception.ResourceNotFoundException;
import com.dsatracker.model.DailyChallenge;
import com.dsatracker.model.Problem;
import com.dsatracker.model.UserProgress;
import com.dsatracker.repository.DailyChallengeRepository;
import com.dsatracker.repository.ProblemRepository;
import com.dsatracker.repository.UserProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/daily")
public class DailyChallengeController {

    @Autowired
    private DailyChallengeRepository dailyChallengeRepository;

    @Autowired
    private ProblemRepository problemRepository;

    @Autowired
    private UserProgressRepository userProgressRepository;

    private String getAuthenticatedUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        }
        throw new BadRequestException("Unauthorized");
    }

    @GetMapping("/today")
    public ResponseEntity<?> getDailyChallenge() {
        String userId = getAuthenticatedUserId();

        LocalDate now = LocalDate.now();
        String todayDate = now.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

        DailyChallenge challenge = dailyChallengeRepository.findByDate(todayDate).orElse(null);

        // Fallback: If no challenge set for today, get the most recent one
        if (challenge == null) {
            List<DailyChallenge> allChallenges = dailyChallengeRepository.findAll(Sort.by(Sort.Direction.DESC, "date"));
            if (!allChallenges.isEmpty()) {
                challenge = allChallenges.get(0);
            }
        }

        if (challenge == null) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "No daily challenge available yet.");
            return ResponseEntity.ok(response);
        }

        Problem problem = problemRepository.findById(challenge.getProblemId()).orElse(null);

        boolean isSolved = false;
        if (problem != null) {
            Optional<UserProgress> progress = userProgressRepository.findByUserIdAndProblemId(userId, problem.getId());
            isSolved = progress.isPresent() && progress.get().isSolved();
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("date", challenge.getDate());
        response.put("problem", problem);
        response.put("message", challenge.getMessage());
        response.put("isSolved", isSolved);

        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createDailyChallenge(@RequestBody DailyChallenge reqChallenge) {
        if (reqChallenge.getDate() == null || reqChallenge.getProblemId() == null) {
            throw new BadRequestException("Date and Problem ID are required");
        }

        DailyChallenge challenge = dailyChallengeRepository.findByDate(reqChallenge.getDate()).orElse(null);
        if (challenge == null) {
            challenge = DailyChallenge.builder()
                    .date(reqChallenge.getDate())
                    .build();
        }
        challenge.setProblemId(reqChallenge.getProblemId());
        challenge.setMessage(reqChallenge.getMessage() != null ? reqChallenge.getMessage() : "");

        DailyChallenge saved = dailyChallengeRepository.save(challenge);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllChallenges() {
        List<DailyChallenge> challenges = dailyChallengeRepository.findAll(Sort.by(Sort.Direction.DESC, "date"));
        
        List<Map<String, Object>> populated = new ArrayList<>();
        for (DailyChallenge dc : challenges) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("_id", dc.getId());
            map.put("date", dc.getDate());
            map.put("message", dc.getMessage());
            map.put("createdAt", dc.getCreatedAt());

            Problem problem = problemRepository.findById(dc.getProblemId()).orElse(null);
            map.put("problemId", problem);

            populated.add(map);
        }

        return ResponseEntity.ok(populated);
    }
}
