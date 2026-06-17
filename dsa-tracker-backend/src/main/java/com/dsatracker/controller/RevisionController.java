package com.dsatracker.controller;

import com.dsatracker.exception.BadRequestException;
import com.dsatracker.exception.ResourceNotFoundException;
import com.dsatracker.model.Problem;
import com.dsatracker.model.Revision;
import com.dsatracker.model.UserProgress;
import com.dsatracker.repository.ProblemRepository;
import com.dsatracker.repository.RevisionRepository;
import com.dsatracker.repository.UserProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/revision")
public class RevisionController {

    @Autowired
    private RevisionRepository revisionRepository;

    @Autowired
    private UserProgressRepository userProgressRepository;

    @Autowired
    private ProblemRepository problemRepository;

    private String getAuthenticatedUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        }
        throw new BadRequestException("Unauthorized");
    }

    @GetMapping
    public ResponseEntity<?> getRevisionSchedule(@RequestParam(value = "status", required = false) String status) {
        String userId = getAuthenticatedUserId();

        List<Revision> revisions = revisionRepository.findByUserId(userId);

        LocalDate today = LocalDate.now();
        Date todayDate = Date.from(today.atStartOfDay(ZoneId.systemDefault()).toInstant());

        // Filter based on status
        if ("completed".equalsIgnoreCase(status)) {
            revisions.removeIf(r -> !r.isCompleted());
        } else if ("pending".equalsIgnoreCase(status)) {
            revisions.removeIf(Revision::isCompleted);
        } else if ("overdue".equalsIgnoreCase(status)) {
            revisions.removeIf(r -> r.isCompleted() || !r.getScheduledDate().before(todayDate));
        }

        // Sort by scheduled date ascending
        revisions.sort(Comparator.comparing(Revision::getScheduledDate));

        // Populate problemId in output response objects
        List<Map<String, Object>> populated = new ArrayList<>();
        for (Revision r : revisions) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("_id", r.getId());
            map.put("userId", r.getUserId());
            map.put("scheduledDate", r.getScheduledDate());
            map.put("completed", r.isCompleted());
            map.put("completedAt", r.getCompletedAt());
            map.put("revisionNumber", r.getRevisionNumber());
            map.put("createdAt", r.getCreatedAt());

            Problem p = problemRepository.findById(r.getProblemId()).orElse(null);
            map.put("problemId", p); // Nest full problem info inside problemId key to match populate() on frontend

            populated.add(map);
        }

        return ResponseEntity.ok(populated);
    }

    @GetMapping("/overdue")
    public ResponseEntity<?> getOverdueRevisions() {
        String userId = getAuthenticatedUserId();
        LocalDate today = LocalDate.now();
        Date todayDate = Date.from(today.atStartOfDay(ZoneId.systemDefault()).toInstant());

        List<Revision> revisions = revisionRepository.findByUserIdAndCompletedFalse(userId);
        revisions.removeIf(r -> !r.getScheduledDate().before(todayDate));
        revisions.sort(Comparator.comparing(Revision::getScheduledDate));

        List<Map<String, Object>> populated = new ArrayList<>();
        for (Revision r : revisions) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("_id", r.getId());
            map.put("userId", r.getUserId());
            map.put("scheduledDate", r.getScheduledDate());
            map.put("completed", r.isCompleted());
            map.put("completedAt", r.getCompletedAt());
            map.put("revisionNumber", r.getRevisionNumber());
            map.put("createdAt", r.getCreatedAt());

            Problem p = problemRepository.findById(r.getProblemId()).orElse(null);
            map.put("problemId", p);

            populated.add(map);
        }

        return ResponseEntity.ok(populated);
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<?> markRevisionComplete(@PathVariable("id") String id) {
        String userId = getAuthenticatedUserId();
        Revision revision = revisionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Revision not found"));

        if (!revision.getUserId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to this revision");
        }

        revision.setCompleted(true);
        revision.setCompletedAt(new Date());
        revisionRepository.save(revision);

        // Update UserProgress revision metadata
        UserProgress progress = userProgressRepository.findByUserIdAndProblemId(userId, revision.getProblemId())
                .orElse(null);

        if (progress != null) {
            progress.setRevisionCount(progress.getRevisionCount() + 1);
            if (progress.getRevisionDates() == null) {
                progress.setRevisionDates(new ArrayList<>());
            }
            progress.getRevisionDates().add(new Date());

            // Schedule next revision (number 2 -> 3, etc. with days 1, 7, 30)
            if (revision.getRevisionNumber() < 3) {
                int[] revisionDays = {1, 7, 30};
                int nextDay = revisionDays[revision.getRevisionNumber()]; // revisionNumber is 1-indexed, so 1 -> 7 days, 2 -> 30 days
                Calendar cal = Calendar.getInstance();
                cal.add(Calendar.DAY_OF_YEAR, nextDay);
                progress.setNextRevisionDate(cal.getTime());
            } else {
                progress.setNextRevisionDate(null);
            }

            userProgressRepository.save(progress);
        }

        return ResponseEntity.ok(revision);
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getRevisionStats() {
        String userId = getAuthenticatedUserId();

        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);
        Date dToday = Date.from(today.atStartOfDay(ZoneId.systemDefault()).toInstant());
        Date dTomorrow = Date.from(tomorrow.atStartOfDay(ZoneId.systemDefault()).toInstant());

        List<Revision> allUserPendingRevisions = revisionRepository.findByUserIdAndCompletedFalse(userId);

        int dueToday = 0;
        int overdue = 0;
        for (Revision r : allUserPendingRevisions) {
            Date sDate = r.getScheduledDate();
            if (sDate.before(dToday)) {
                overdue++;
            } else if (sDate.after(dToday) && sDate.before(dTomorrow) || sDate.equals(dToday)) {
                dueToday++;
            }
        }

        int totalPending = allUserPendingRevisions.size();

        // Weak Topics Calculation: group in-memory based on progress marked for revision
        List<UserProgress> userProgressList = userProgressRepository.findByUserId(userId);
        userProgressList.removeIf(p -> !p.isMarkedForRevision());

        Map<String, Integer> topicCounts = new HashMap<>();
        for (UserProgress up : userProgressList) {
            Problem p = problemRepository.findById(up.getProblemId()).orElse(null);
            if (p != null && p.getTopics() != null) {
                for (String t : p.getTopics()) {
                    topicCounts.put(t, topicCounts.getOrDefault(t, 0) + 1);
                }
            }
        }

        List<Map<String, Object>> weakTopics = topicCounts.entrySet().stream()
                .sorted((entry1, entry2) -> entry2.getValue().compareTo(entry1.getValue()))
                .limit(3)
                .map(entry -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("topic", entry.getKey());
                    map.put("count", entry.getValue());
                    return map;
                })
                .collect(Collectors.toList());

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("dueToday", dueToday);
        stats.put("overdue", overdue);
        stats.put("totalPending", totalPending);
        stats.put("weakTopics", weakTopics);

        return ResponseEntity.ok(stats);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRevision(@PathVariable("id") String id) {
        String userId = getAuthenticatedUserId();
        Revision revision = revisionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Revision not found"));

        if (!revision.getUserId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to this revision");
        }

        UserProgress progress = userProgressRepository.findByUserIdAndProblemId(userId, revision.getProblemId())
                .orElse(null);

        if (progress != null) {
            progress.setMarkedForRevision(false);
            progress.setNextRevisionDate(null);
            userProgressRepository.save(progress);
        }

        revisionRepository.delete(revision);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Revision removed");
        return ResponseEntity.ok(response);
    }
}
