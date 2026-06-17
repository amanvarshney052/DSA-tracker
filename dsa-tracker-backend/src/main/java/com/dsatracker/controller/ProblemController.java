package com.dsatracker.controller;

import com.dsatracker.exception.BadRequestException;
import com.dsatracker.exception.ResourceNotFoundException;
import com.dsatracker.model.Problem;
import com.dsatracker.model.Sheet;
import com.dsatracker.repository.ProblemRepository;
import com.dsatracker.repository.SheetRepository;
import com.dsatracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/problems")
public class ProblemController {

    @Autowired
    private ProblemRepository problemRepository;

    @Autowired
    private SheetRepository sheetRepository;

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
    public ResponseEntity<List<Problem>> getProblems(@RequestParam(value = "sheetId", required = false) String sheetId) {
        if (sheetId != null && !sheetId.isEmpty() && !"null".equalsIgnoreCase(sheetId)) {
            return ResponseEntity.ok(problemRepository.findBySheetId(sheetId));
        }
        return ResponseEntity.ok(problemRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Problem> createProblem(@RequestBody Problem problem) {
        String userId = getAuthenticatedUserId();
        problem.setCreatedBy(userId);

        if (problem.getSheetId() == null || problem.getSheetId().isEmpty()) {
            throw new BadRequestException("Sheet ID is required");
        }

        Sheet sheet = sheetRepository.findById(problem.getSheetId())
                .orElseThrow(() -> new ResourceNotFoundException("Associated DSA Sheet not found"));

        Problem savedProblem = problemRepository.save(problem);

        // Add problem reference to the sheet
        if (sheet.getProblems() == null) {
            sheet.setProblems(new java.util.ArrayList<>());
        }
        sheet.getProblems().add(savedProblem.getId());
        sheet.setTotalProblems(sheet.getProblems().size());
        sheetRepository.save(sheet);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedProblem);
    }

    @PostMapping("/bulk-import")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> bulkImportProblems(@RequestBody BulkImportRequest importRequest) {
        String userId = getAuthenticatedUserId();
        String sheetId = importRequest.getSheetId();

        if (importRequest.getProblems() == null || importRequest.getProblems().isEmpty()) {
            throw new BadRequestException("No problems provided");
        }

        if (sheetId == null || sheetId.isEmpty()) {
            throw new BadRequestException("Sheet ID is required");
        }

        Sheet sheet = sheetRepository.findById(sheetId)
                .orElseThrow(() -> new ResourceNotFoundException("Sheet not found"));

        List<Problem> problemsToSave = new java.util.ArrayList<>();
        for (ImportProblemDTO p : importRequest.getProblems()) {
            if (p.getTitle() == null || p.getUrl() == null || p.getPlatform() == null) {
                continue;
            }

            String platform = normalizePlatform(p.getPlatform());
            List<String> topicList = new java.util.ArrayList<>();
            if (p.getTopics() != null && !p.getTopics().isEmpty()) {
                for (String t : p.getTopics().split("[,;]")) {
                    String trimmed = t.trim();
                    if (!trimmed.isEmpty()) {
                        topicList.add(trimmed);
                    }
                }
            }

            int estTime = p.getEstimatedTime() != null ? p.getEstimatedTime() : 30;

            Problem problem = Problem.builder()
                    .title(p.getTitle())
                    .platform(platform)
                    .problemUrl(p.getUrl())
                    .difficulty(p.getDifficulty() != null ? p.getDifficulty().toLowerCase() : "medium")
                    .topics(topicList)
                    .sheetId(sheetId)
                    .estimatedTime(estTime)
                    .createdBy(userId)
                    .build();

            problemsToSave.add(problem);
        }

        if (problemsToSave.isEmpty()) {
            throw new BadRequestException("No valid problems found to import");
        }

        List<Problem> savedProblems = problemRepository.saveAll(problemsToSave);

        // Update Sheet
        if (sheet.getProblems() == null) {
            sheet.setProblems(new java.util.ArrayList<>());
        }
        for (Problem p : savedProblems) {
            sheet.getProblems().add(p.getId());
        }
        sheet.setTotalProblems(sheet.getProblems().size());
        sheetRepository.save(sheet);

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("message", "Successfully imported " + savedProblems.size() + " problems");
        response.put("count", savedProblems.size());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    private String normalizePlatform(String platform) {
        if (platform == null) return "custom";
        String lower = platform.toLowerCase().trim();
        if ("geeksforgeeks".equals(lower) || "gfg".equals(lower)) return "gfg";
        if ("leetcode".equals(lower)) return "leetcode";
        if ("codeforces".equals(lower)) return "codeforces";
        if ("codechef".equals(lower)) return "codechef";
        if ("hackerrank".equals(lower)) return "hackerrank";
        return "custom";
    }

    public static class BulkImportRequest {
        private String sheetId;
        private List<ImportProblemDTO> problems;

        public String getSheetId() { return sheetId; }
        public void setSheetId(String sheetId) { this.sheetId = sheetId; }

        public List<ImportProblemDTO> getProblems() { return problems; }
        public void setProblems(List<ImportProblemDTO> problems) { this.problems = problems; }
    }

    public static class ImportProblemDTO {
        private String title;
        private String platform;
        private String url;
        private String difficulty;
        private String topics;
        private Integer estimatedTime;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getPlatform() { return platform; }
        public void setPlatform(String platform) { this.platform = platform; }

        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }

        public String getDifficulty() { return difficulty; }
        public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

        public String getTopics() { return topics; }
        public void setTopics(String topics) { this.topics = topics; }

        public Integer getEstimatedTime() { return estimatedTime; }
        public void setEstimatedTime(Integer estimatedTime) { this.estimatedTime = estimatedTime; }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Problem> getProblemById(@PathVariable("id") String id) {
        Problem problem = problemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));
        return ResponseEntity.ok(problem);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Problem> updateProblem(@PathVariable("id") String id, @RequestBody Problem problemDetails) {
        Problem problem = problemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));

        problem.setTitle(problemDetails.getTitle() != null ? problemDetails.getTitle() : problem.getTitle());
        problem.setPlatform(problemDetails.getPlatform() != null ? problemDetails.getPlatform() : problem.getPlatform());
        problem.setPlatformIcon(problemDetails.getPlatformIcon() != null ? problemDetails.getPlatformIcon() : problem.getPlatformIcon());
        problem.setProblemUrl(problemDetails.getProblemUrl() != null ? problemDetails.getProblemUrl() : problem.getProblemUrl());
        problem.setDifficulty(problemDetails.getDifficulty() != null ? problemDetails.getDifficulty() : problem.getDifficulty());
        problem.setTopics(problemDetails.getTopics() != null ? problemDetails.getTopics() : problem.getTopics());
        problem.setEstimatedTime(problemDetails.getEstimatedTime() > 0 ? problemDetails.getEstimatedTime() : problem.getEstimatedTime());

        Problem updatedProblem = problemRepository.save(problem);
        return ResponseEntity.ok(updatedProblem);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProblem(@PathVariable("id") String id) {
        Problem problem = problemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));

        Sheet sheet = sheetRepository.findById(problem.getSheetId()).orElse(null);
        if (sheet != null && sheet.getProblems() != null) {
            sheet.getProblems().remove(id);
            sheet.setTotalProblems(sheet.getProblems().size());
            sheetRepository.save(sheet);
        }

        problemRepository.delete(problem);
        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("message", "Problem deleted successfully");
        return ResponseEntity.ok(response);
    }
}
