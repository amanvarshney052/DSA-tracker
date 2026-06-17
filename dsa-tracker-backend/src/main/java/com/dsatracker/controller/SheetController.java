package com.dsatracker.controller;

import com.dsatracker.exception.BadRequestException;
import com.dsatracker.exception.ResourceNotFoundException;
import com.dsatracker.model.Problem;
import com.dsatracker.model.Sheet;
import com.dsatracker.model.UserProgress;
import com.dsatracker.repository.ProblemRepository;
import com.dsatracker.repository.SheetRepository;
import com.dsatracker.repository.UserProgressRepository;
import com.dsatracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sheets")
public class SheetController {

    @Autowired
    private SheetRepository sheetRepository;

    @Autowired
    private ProblemRepository problemRepository;

    @Autowired
    private UserProgressRepository userProgressRepository;

    @Autowired
    private UserRepository userRepository;

    private String getAuthenticatedUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        }
        throw new BadRequestException("Unauthorized");
    }

    @GetMapping
    public ResponseEntity<?> getSheets() {
        String userId = getAuthenticatedUserId();
        List<Sheet> sheets = sheetRepository.findByIsPublicTrue();

        // Fetch solved problems for user
        List<UserProgress> userProgressList = userProgressRepository.findByUserIdAndSolvedTrue(userId);
        Set<String> solvedProblemIds = userProgressList.stream()
                .map(UserProgress::getProblemId)
                .collect(Collectors.toSet());

        List<Map<String, Object>> sheetsWithProgress = new ArrayList<>();
        for (Sheet sheet : sheets) {
            Map<String, Object> sheetMap = new LinkedHashMap<>();
            sheetMap.put("_id", sheet.getId());
            sheetMap.put("name", sheet.getName());
            sheetMap.put("description", sheet.getDescription());
            sheetMap.put("difficulty", sheet.getDifficulty());
            sheetMap.put("isPublic", sheet.isPublic());
            sheetMap.put("createdBy", sheet.getCreatedBy());
            sheetMap.put("problems", sheet.getProblems());
            sheetMap.put("createdAt", sheet.getCreatedAt());
            sheetMap.put("updatedAt", sheet.getUpdatedAt());

            int solvedCount = 0;
            if (sheet.getProblems() != null) {
                for (String pId : sheet.getProblems()) {
                    if (solvedProblemIds.contains(pId)) {
                        solvedCount++;
                    }
                }
                sheetMap.put("solvedProblems", solvedCount);
                sheetMap.put("totalProblems", sheet.getProblems().size());
            } else {
                sheetMap.put("solvedProblems", 0);
                sheetMap.put("totalProblems", 0);
            }
            sheetsWithProgress.add(sheetMap);
        }

        return ResponseEntity.ok(sheetsWithProgress);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSheetById(@PathVariable("id") String id) {
        String userId = getAuthenticatedUserId();
        Sheet sheet = sheetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sheet not found"));

        // Load all problem entities for this sheet using their IDs to avoid MongoDB ObjectId vs String type mismatches
        List<Problem> problems = new ArrayList<>();
        if (sheet.getProblems() != null && !sheet.getProblems().isEmpty()) {
            Map<String, Problem> problemMap = problemRepository.findAllById(sheet.getProblems()).stream()
                    .collect(Collectors.toMap(Problem::getId, p -> p));
            for (String pId : sheet.getProblems()) {
                Problem p = problemMap.get(pId);
                if (p != null) {
                    problems.add(p);
                }
            }
        }

        // Fetch progress details for these problems
        List<UserProgress> userProgressList = userProgressRepository.findByUserId(userId);
        Map<String, UserProgress> progressMap = userProgressList.stream()
                .collect(Collectors.toMap(UserProgress::getProblemId, p -> p, (a, b) -> a));

        List<Map<String, Object>> problemsWithProgress = new ArrayList<>();
        for (Problem problem : problems) {
            Map<String, Object> pMap = new LinkedHashMap<>();
            pMap.put("_id", problem.getId());
            pMap.put("title", problem.getTitle());
            pMap.put("platform", problem.getPlatform());
            pMap.put("platformIcon", problem.getPlatformIcon());
            pMap.put("problemUrl", problem.getProblemUrl());
            pMap.put("difficulty", problem.getDifficulty());
            pMap.put("topics", problem.getTopics());
            pMap.put("sheetId", problem.getSheetId());
            pMap.put("estimatedTime", problem.getEstimatedTime());
            pMap.put("createdBy", problem.getCreatedBy());
            pMap.put("createdAt", problem.getCreatedAt());

            pMap.put("userProgress", progressMap.getOrDefault(problem.getId(), null));
            problemsWithProgress.add(pMap);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("_id", sheet.getId());
        response.put("name", sheet.getName());
        response.put("description", sheet.getDescription());
        response.put("difficulty", sheet.getDifficulty());
        response.put("isPublic", sheet.isPublic());
        response.put("createdBy", sheet.getCreatedBy());
        response.put("problems", problemsWithProgress);
        response.put("createdAt", sheet.getCreatedAt());
        response.put("updatedAt", sheet.getUpdatedAt());

        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Sheet> createSheet(@RequestBody Sheet sheet) {
        String userId = getAuthenticatedUserId();
        sheet.setCreatedBy(userId);
        Sheet savedSheet = sheetRepository.save(sheet);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedSheet);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Sheet> updateSheet(@PathVariable("id") String id, @RequestBody Sheet sheetDetails) {
        Sheet sheet = sheetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sheet not found"));

        sheet.setName(sheetDetails.getName() != null ? sheetDetails.getName() : sheet.getName());
        sheet.setDescription(sheetDetails.getDescription() != null ? sheetDetails.getDescription() : sheet.getDescription());
        sheet.setDifficulty(sheetDetails.getDifficulty() != null ? sheetDetails.getDifficulty() : sheet.getDifficulty());
        sheet.setPublic(sheetDetails.isPublic());
        sheet.setUpdatedAt(new Date());

        Sheet updatedSheet = sheetRepository.save(sheet);
        return ResponseEntity.ok(updatedSheet);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteSheet(@PathVariable("id") String id) {
        Sheet sheet = sheetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sheet not found"));

        // Delete associated problems
        if (sheet.getProblems() != null && !sheet.getProblems().isEmpty()) {
            List<Problem> problems = problemRepository.findAllById(sheet.getProblems());
            problemRepository.deleteAll(problems);
        }

        sheetRepository.delete(sheet);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Sheet and associated problems removed");
        return ResponseEntity.ok(response);
    }
}
