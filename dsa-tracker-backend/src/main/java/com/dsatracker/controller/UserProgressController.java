package com.dsatracker.controller;

import com.dsatracker.dto.ProblemStatusUpdateDTO;
import com.dsatracker.exception.BadRequestException;
import com.dsatracker.exception.ResourceNotFoundException;
import com.dsatracker.model.Problem;
import com.dsatracker.model.Revision;
import com.dsatracker.model.User;
import com.dsatracker.model.UserProgress;
import com.dsatracker.repository.ProblemRepository;
import com.dsatracker.repository.RevisionRepository;
import com.dsatracker.repository.UserProgressRepository;
import com.dsatracker.repository.UserRepository;
import com.dsatracker.repository.SheetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/progress")
public class UserProgressController {

    @Autowired
    private UserProgressRepository userProgressRepository;

    @Autowired
    private ProblemRepository problemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RevisionRepository revisionRepository;

    @Autowired
    private SheetRepository sheetRepository;

    private String getAuthenticatedUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        }
        throw new BadRequestException("Unauthorized");
    }

    @GetMapping
    public ResponseEntity<?> getUserProgress() {
        String userId = getAuthenticatedUserId();
        List<UserProgress> progress = userProgressRepository.findByUserId(userId);
        
        // Populate problems manually since Spring Data Mongo doesn't automatically populate DBRefs unless specified
        // We will return a list of maps with problem populated to match the frontend expectations
        List<Map<String, Object>> response = new ArrayList<>();
        for (UserProgress p : progress) {
            Map<String, Object> pMap = new LinkedHashMap<>();
            pMap.put("_id", p.getId());
            pMap.put("userId", p.getUserId());
            pMap.put("solved", p.isSolved());
            pMap.put("solvedAt", p.getSolvedAt());
            pMap.put("timeTaken", p.getTimeTaken());
            pMap.put("notes", p.getNotes());
            pMap.put("approach", p.getApproach());
            pMap.put("code", p.getCode());
            pMap.put("markedForRevision", p.isMarkedForRevision());
            pMap.put("revisionDates", p.getRevisionDates());
            pMap.put("nextRevisionDate", p.getNextRevisionDate());
            pMap.put("revisionCount", p.getRevisionCount());
            pMap.put("createdAt", p.getCreatedAt());
            pMap.put("updatedAt", p.getUpdatedAt());

            Problem problem = problemRepository.findById(p.getProblemId()).orElse(null);
            pMap.put("problemId", problem); // Nest the full problem details in problemId field to match frontend populate()

            response.add(pMap);
        }

        // Sort by updatedAt desc
        response.sort((a, b) -> {
            Date da = (Date) a.get("updatedAt");
            Date db = (Date) b.get("updatedAt");
            if (da == null && db == null) return 0;
            if (da == null) return 1;
            if (db == null) return -1;
            return db.compareTo(da);
        });

        return ResponseEntity.ok(response);
    }

    @PostMapping("/solve")
    public ResponseEntity<?> markProblemSolved(@RequestBody ProblemStatusUpdateDTO solveRequest) {
        String userId = getAuthenticatedUserId();
        String problemId = solveRequest.getProblemId();

        if (problemId == null || problemId.isEmpty()) {
            throw new BadRequestException("Problem ID is required");
        }

        UserProgress progress = userProgressRepository.findByUserIdAndProblemId(userId, problemId)
                .orElse(null);

        boolean isNew = false;
        if (progress == null) {
            isNew = true;
            progress = UserProgress.builder()
                    .userId(userId)
                    .problemId(problemId)
                    .createdAt(new Date())
                    .build();
        }

        progress.setSolved(true);
        progress.setSolvedAt(new Date());
        if (solveRequest.getTimeTaken() != null) progress.setTimeTaken(solveRequest.getTimeTaken());
        if (solveRequest.getNotes() != null) progress.setNotes(solveRequest.getNotes());
        if (solveRequest.getApproach() != null) progress.setApproach(solveRequest.getApproach());
        if (solveRequest.getCode() != null) progress.setCode(solveRequest.getCode());
        if (solveRequest.getMarkedForRevision() != null) progress.setMarkedForRevision(solveRequest.getMarkedForRevision());
        progress.setUpdatedAt(new Date());

        UserProgress savedProgress = userProgressRepository.save(progress);

        // Schedule revisions if marked
        if (savedProgress.isMarkedForRevision()) {
            List<Integer> daysToSchedule = (solveRequest.getRevisionDays() != null && !solveRequest.getRevisionDays().isEmpty())
                    ? solveRequest.getRevisionDays()
                    : Arrays.asList(1, 7, 30);

            Date today = new Date();
            for (int i = 0; i < daysToSchedule.size(); i++) {
                Calendar cal = Calendar.getInstance();
                cal.setTime(today);
                cal.add(Calendar.DAY_OF_YEAR, daysToSchedule.get(i));

                Revision revision = Revision.builder()
                        .userId(userId)
                        .problemId(problemId)
                        .scheduledDate(cal.getTime())
                        .revisionNumber(i + 1)
                        .build();

                revisionRepository.save(revision);
            }

            Calendar cal = Calendar.getInstance();
            cal.setTime(today);
            int minDays = Collections.min(daysToSchedule);
            cal.add(Calendar.DAY_OF_YEAR, minDays);
            savedProgress.setNextRevisionDate(cal.getTime());
            userProgressRepository.save(savedProgress);
        }

        // Grant XP and Level Up User
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (isNew) {
            user.setXpPoints(user.getXpPoints() + 10); // 10 XP per new problem solved
            // Level = 0.1 * sqrt(XP) + 1
            user.setLevel((int) (Math.sqrt(user.getXpPoints()) * 0.1) + 1);
            userRepository.save(user);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(savedProgress);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserProgress> updateProgress(@PathVariable("id") String id, @RequestBody ProblemStatusUpdateDTO details) {
        String userId = getAuthenticatedUserId();
        UserProgress progress = userProgressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Progress details not found"));

        if (!progress.getUserId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to progress record");
        }

        if (details.getTimeTaken() != null) progress.setTimeTaken(details.getTimeTaken());
        if (details.getNotes() != null) progress.setNotes(details.getNotes());
        if (details.getApproach() != null) progress.setApproach(details.getApproach());
        if (details.getCode() != null) progress.setCode(details.getCode());
        if (details.getMarkedForRevision() != null) progress.setMarkedForRevision(details.getMarkedForRevision());
        progress.setUpdatedAt(new Date());

        UserProgress updated = userProgressRepository.save(progress);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getUserStats(@RequestParam(value = "sheetId", required = false) String sheetId) {
        String userId = getAuthenticatedUserId();

        // 1. Get total problem counts in scope
        List<Problem> scopedProblems;
        if (sheetId != null && !sheetId.isEmpty() && !"null".equalsIgnoreCase(sheetId)) {
            com.dsatracker.model.Sheet sheet = sheetRepository.findById(sheetId).orElse(null);
            scopedProblems = new ArrayList<>();
            if (sheet != null && sheet.getProblems() != null && !sheet.getProblems().isEmpty()) {
                scopedProblems = problemRepository.findAllById(sheet.getProblems());
            }
        } else {
            scopedProblems = problemRepository.findAll();
        }

        int totalProblems = scopedProblems.size();
        int totalEasy = 0;
        int totalMedium = 0;
        int totalHard = 0;
        for (Problem p : scopedProblems) {
            if ("easy".equalsIgnoreCase(p.getDifficulty())) totalEasy++;
            else if ("medium".equalsIgnoreCase(p.getDifficulty())) totalMedium++;
            else if ("hard".equalsIgnoreCase(p.getDifficulty())) totalHard++;
        }

        // 2. Fetch User progress
        List<UserProgress> progress = userProgressRepository.findByUserIdAndSolvedTrue(userId);
        
        // Filter progress if sheetId is provided
        Set<String> scopedProblemIds = scopedProblems.stream().map(Problem::getId).collect(Collectors.toSet());
        List<UserProgress> filteredProgress = progress.stream()
                .filter(p -> scopedProblemIds.contains(p.getProblemId()))
                .collect(Collectors.toList());

        int totalSolved = filteredProgress.size();
        int easySolved = 0;
        int mediumSolved = 0;
        int hardSolved = 0;

        Map<String, Integer> topicWise = new HashMap<>();
        Map<String, Integer> platformWise = new HashMap<>();
        int solvedToday = 0;

        Map<Long, Integer> submissionCalendar = new HashMap<>();
        List<Date> submissionDates = new ArrayList<>();

        LocalDate todayLocal = LocalDate.now();
        
        for (UserProgress p : filteredProgress) {
            if (p.getSolvedAt() != null) {
                submissionDates.add(p.getSolvedAt());

                // Calendar representation
                LocalDate solveDate = p.getSolvedAt().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                if (solveDate.equals(todayLocal)) {
                    solvedToday++;
                }

                // Midnight timestamp in seconds
                Date midnight = Date.from(solveDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
                long timestampSec = midnight.getTime() / 1000;
                submissionCalendar.put(timestampSec, submissionCalendar.getOrDefault(timestampSec, 0) + 1);
            }

            Problem problem = problemRepository.findById(p.getProblemId()).orElse(null);
            if (problem != null) {
                if ("easy".equalsIgnoreCase(problem.getDifficulty())) easySolved++;
                else if ("medium".equalsIgnoreCase(problem.getDifficulty())) mediumSolved++;
                else if ("hard".equalsIgnoreCase(problem.getDifficulty())) hardSolved++;

                if (problem.getTopics() != null) {
                    for (String topic : problem.getTopics()) {
                        topicWise.put(topic, topicWise.getOrDefault(topic, 0) + 1);
                    }
                }

                if (problem.getPlatform() != null) {
                    platformWise.put(problem.getPlatform(), platformWise.getOrDefault(problem.getPlatform(), 0) + 1);
                }
            }
        }

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalSolved", totalSolved);
        stats.put("easy", easySolved);
        stats.put("medium", mediumSolved);
        stats.put("hard", hardSolved);
        stats.put("totalProblems", totalProblems);
        stats.put("totalEasy", totalEasy);
        stats.put("totalMedium", totalMedium);
        stats.put("totalHard", totalHard);
        stats.put("topicWise", topicWise);
        stats.put("platformWise", platformWise);
        stats.put("solvedToday", solvedToday);
        stats.put("submissionCalendar", submissionCalendar);
        stats.put("submissionDates", submissionDates);

        return ResponseEntity.ok(stats);
    }
}
