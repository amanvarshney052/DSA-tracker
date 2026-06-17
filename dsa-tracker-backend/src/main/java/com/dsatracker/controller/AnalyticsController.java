package com.dsatracker.controller;

import com.dsatracker.exception.BadRequestException;
import com.dsatracker.model.Problem;
import com.dsatracker.model.Revision;
import com.dsatracker.model.UserProgress;
import com.dsatracker.repository.ProblemRepository;
import com.dsatracker.repository.RevisionRepository;
import com.dsatracker.repository.UserProgressRepository;
import com.dsatracker.repository.SheetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private UserProgressRepository userProgressRepository;

    @Autowired
    private ProblemRepository problemRepository;

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

    @GetMapping("/topic-strength")
    public ResponseEntity<?> getTopicStrength(@RequestParam(value = "sheetId", required = false) String sheetId) {
        String userId = getAuthenticatedUserId();

        List<UserProgress> solvedProgress = userProgressRepository.findByUserIdAndSolvedTrue(userId);
        Set<String> solvedProblemIds = solvedProgress.stream()
                .map(UserProgress::getProblemId)
                .collect(Collectors.toSet());

        Map<String, Map<String, Object>> topicData = new LinkedHashMap<>();
        Map<String, Integer> difficultyWeight = new HashMap<>();
        difficultyWeight.put("easy", 1);
        difficultyWeight.put("medium", 2);
        difficultyWeight.put("hard", 3);

        if (sheetId != null && !sheetId.isEmpty() && !"null".equalsIgnoreCase(sheetId)) {
            com.dsatracker.model.Sheet sheet = sheetRepository.findById(sheetId).orElse(null);
            List<Problem> sheetProblems = new ArrayList<>();
            if (sheet != null && sheet.getProblems() != null && !sheet.getProblems().isEmpty()) {
                sheetProblems = problemRepository.findAllById(sheet.getProblems());
            }
            
            for (Problem p : sheetProblems) {
                if (p.getTopics() == null) continue;
                boolean isSolved = solvedProblemIds.contains(p.getId());

                for (String topic : p.getTopics()) {
                    topicData.computeIfAbsent(topic, k -> {
                        Map<String, Object> map = new LinkedHashMap<>();
                        map.put("total", 0);
                        map.put("totalAvailable", 0);
                        map.put("easy", 0);
                        map.put("medium", 0);
                        map.put("hard", 0);
                        map.put("recommendation", null);
                        return map;
                    });

                    Map<String, Object> stats = topicData.get(topic);
                    stats.put("totalAvailable", (int) stats.get("totalAvailable") + 1);

                    if (isSolved) {
                        stats.put("total", (int) stats.get("total") + 1);
                        String diff = p.getDifficulty().toLowerCase();
                        if (stats.containsKey(diff)) {
                            stats.put(diff, (int) stats.get(diff) + 1);
                        }
                    } else {
                        // Difficulty-Aware Recommendation Strategy
                        Map<String, Object> currentRec = (Map<String, Object>) stats.get("recommendation");
                        int newWeight = difficultyWeight.getOrDefault(p.getDifficulty().toLowerCase(), 2);

                        boolean shouldReplace = false;
                        if (currentRec == null) {
                            shouldReplace = true;
                        } else {
                            int currentWeight = difficultyWeight.getOrDefault(((String) currentRec.get("difficulty")).toLowerCase(), 2);
                            if (newWeight < currentWeight) {
                                shouldReplace = true;
                            }
                        }

                        if (shouldReplace) {
                            Map<String, Object> recMap = new LinkedHashMap<>();
                            recMap.put("_id", p.getId());
                            recMap.put("title", p.getTitle());
                            recMap.put("url", p.getProblemUrl());
                            recMap.put("difficulty", p.getDifficulty());
                            recMap.put("platform", p.getPlatform());
                            stats.put("recommendation", recMap);
                        }
                    }
                }
            }
        } else {
            // Global View
            for (UserProgress up : solvedProgress) {
                Problem problem = problemRepository.findById(up.getProblemId()).orElse(null);
                if (problem != null && problem.getTopics() != null) {
                    for (String topic : problem.getTopics()) {
                        topicData.computeIfAbsent(topic, k -> {
                            Map<String, Object> map = new LinkedHashMap<>();
                            map.put("total", 0);
                            map.put("totalAvailable", 0);
                            map.put("easy", 0);
                            map.put("medium", 0);
                            map.put("hard", 0);
                            return map;
                        });

                        Map<String, Object> stats = topicData.get(topic);
                        stats.put("total", (int) stats.get("total") + 1);
                        String diff = problem.getDifficulty().toLowerCase();
                        if (stats.containsKey(diff)) {
                            stats.put(diff, (int) stats.get(diff) + 1);
                        }
                    }
                }
            }
        }

        return ResponseEntity.ok(topicData);
    }

    @GetMapping("/time-distribution")
    public ResponseEntity<?> getTimeDistribution() {
        String userId = getAuthenticatedUserId();
        List<UserProgress> progress = userProgressRepository.findByUserIdAndSolvedTrue(userId);

        List<Integer> easyTimes = new ArrayList<>();
        List<Integer> mediumTimes = new ArrayList<>();
        List<Integer> hardTimes = new ArrayList<>();

        for (UserProgress p : progress) {
            if (p.getTimeTaken() > 0) {
                Problem problem = problemRepository.findById(p.getProblemId()).orElse(null);
                if (problem != null) {
                    String diff = problem.getDifficulty().toLowerCase();
                    if ("easy".equals(diff)) easyTimes.add(p.getTimeTaken());
                    else if ("medium".equals(diff)) mediumTimes.add(p.getTimeTaken());
                    else if ("hard".equals(diff)) hardTimes.add(p.getTimeTaken());
                }
            }
        }

        Map<String, Double> response = new LinkedHashMap<>();
        response.put("easy", calculateAvg(easyTimes));
        response.put("medium", calculateAvg(mediumTimes));
        response.put("hard", calculateAvg(hardTimes));

        return ResponseEntity.ok(response);
    }

    private double calculateAvg(List<Integer> list) {
        if (list == null || list.isEmpty()) return 0.0;
        double sum = 0;
        for (int val : list) sum += val;
        return sum / list.size();
    }

    @GetMapping("/consistency")
    public ResponseEntity<?> getConsistencyData(@RequestParam(value = "sheetId", required = false) String sheetId) {
        String userId = getAuthenticatedUserId();

        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        Date cutoffDate = Date.from(thirtyDaysAgo.atStartOfDay(ZoneId.systemDefault()).toInstant());

        List<UserProgress> progress = userProgressRepository.findByUserIdAndSolvedTrue(userId);
        progress.removeIf(p -> p.getSolvedAt() == null || p.getSolvedAt().before(cutoffDate));

        if (sheetId != null && !sheetId.isEmpty() && !"null".equalsIgnoreCase(sheetId)) {
            com.dsatracker.model.Sheet sheet = sheetRepository.findById(sheetId).orElse(null);
            List<Problem> sheetProblems = new ArrayList<>();
            if (sheet != null && sheet.getProblems() != null && !sheet.getProblems().isEmpty()) {
                sheetProblems = problemRepository.findAllById(sheet.getProblems());
            }
            Set<String> sheetProblemIds = sheetProblems.stream().map(Problem::getId).collect(Collectors.toSet());
            progress.removeIf(p -> !sheetProblemIds.contains(p.getProblemId()));
        }

        Map<String, Integer> dailyCount = new HashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (UserProgress p : progress) {
            LocalDate localDate = p.getSolvedAt().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
            String dateKey = localDate.format(formatter);
            dailyCount.put(dateKey, dailyCount.getOrDefault(dateKey, 0) + 1);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 30; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            String dateKey = date.format(formatter);

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("date", dateKey);
            item.put("count", dailyCount.getOrDefault(dateKey, 0));
            result.add(item);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/platform-stats")
    public ResponseEntity<?> getPlatformStats() {
        String userId = getAuthenticatedUserId();
        List<UserProgress> progress = userProgressRepository.findByUserIdAndSolvedTrue(userId);

        Map<String, Integer> platformStats = new LinkedHashMap<>();
        for (UserProgress p : progress) {
            Problem problem = problemRepository.findById(p.getProblemId()).orElse(null);
            if (problem != null && problem.getPlatform() != null) {
                String platform = problem.getPlatform().toLowerCase();
                platformStats.put(platform, platformStats.getOrDefault(platform, 0) + 1);
            }
        }

        return ResponseEntity.ok(platformStats);
    }

    @GetMapping("/insights")
    public ResponseEntity<?> getInsights(@RequestParam(value = "sheetId", required = false) String sheetId) {
        String userId = getAuthenticatedUserId();

        List<Problem> scopedProblems = null;
        Set<String> scopedProblemIds = null;
        if (sheetId != null && !sheetId.isEmpty() && !"null".equalsIgnoreCase(sheetId)) {
            com.dsatracker.model.Sheet sheet = sheetRepository.findById(sheetId).orElse(null);
            scopedProblems = new ArrayList<>();
            if (sheet != null && sheet.getProblems() != null && !sheet.getProblems().isEmpty()) {
                scopedProblems = problemRepository.findAllById(sheet.getProblems());
            }
            scopedProblemIds = scopedProblems.stream().map(Problem::getId).collect(Collectors.toSet());
        }

        // --- Insight 1: Weakest Topic ---
        List<UserProgress> solvedProgress = userProgressRepository.findByUserIdAndSolvedTrue(userId);
        if (scopedProblemIds != null) {
            final Set<String> ids = scopedProblemIds;
            solvedProgress.removeIf(p -> !ids.contains(p.getProblemId()));
        }

        Map<String, Map<String, Integer>> topicStats = new HashMap<>();

        if (sheetId != null && !sheetId.isEmpty() && !"null".equalsIgnoreCase(sheetId)) {
            for (Problem p : scopedProblems) {
                if (p.getTopics() != null) {
                    for (String t : p.getTopics()) {
                        topicStats.computeIfAbsent(t, k -> {
                            Map<String, Integer> map = new HashMap<>();
                            map.put("solved", 0);
                            map.put("total", 0);
                            return map;
                        });
                        Map<String, Integer> counts = topicStats.get(t);
                        counts.put("total", counts.get("total") + 1);
                    }
                }
            }
        }

        for (UserProgress up : solvedProgress) {
            Problem problem = problemRepository.findById(up.getProblemId()).orElse(null);
            if (problem != null && problem.getTopics() != null) {
                for (String t : problem.getTopics()) {
                    topicStats.computeIfAbsent(t, k -> {
                        Map<String, Integer> map = new HashMap<>();
                        map.put("solved", 0);
                        map.put("total", 0);
                        return map;
                    });
                    Map<String, Integer> counts = topicStats.get(t);
                    counts.put("solved", counts.get("solved") + 1);
                    if (sheetId == null) {
                        counts.put("total", counts.get("total") + 1);
                    }
                }
            }
        }

        Map<String, Object> weakestTopic = null;
        double lowestRatio = 1.1;

        for (Map.Entry<String, Map<String, Integer>> entry : topicStats.entrySet()) {
            String topic = entry.getKey();
            Map<String, Integer> counts = entry.getValue();
            int total = counts.get("total");
            int solved = counts.get("solved");

            if (total > 0) {
                double ratio = (double) solved / total;
                if (ratio < lowestRatio) {
                    lowestRatio = ratio;
                    weakestTopic = new LinkedHashMap<>();
                    weakestTopic.put("topic", topic);
                    weakestTopic.put("ratio", ratio);
                    weakestTopic.put("solved", solved);
                    weakestTopic.put("total", total);
                }
            }
        }

        if (weakestTopic == null) {
            weakestTopic = new LinkedHashMap<>();
            weakestTopic.put("topic", "None");
            weakestTopic.put("ratio", 0.0);
            weakestTopic.put("solved", 0);
            weakestTopic.put("total", 0);
        }

        // --- Insight 2: Fastest Difficulty ---
        List<UserProgress> timedProgress = userProgressRepository.findByUserIdAndSolvedTrue(userId);
        timedProgress.removeIf(p -> p.getTimeTaken() <= 0);
        if (scopedProblemIds != null) {
            final Set<String> ids = scopedProblemIds;
            timedProgress.removeIf(p -> !ids.contains(p.getProblemId()));
        }

        Map<String, List<Integer>> timeStats = new HashMap<>();
        timeStats.put("easy", new ArrayList<>());
        timeStats.put("medium", new ArrayList<>());
        timeStats.put("hard", new ArrayList<>());

        for (UserProgress p : timedProgress) {
            Problem problem = problemRepository.findById(p.getProblemId()).orElse(null);
            if (problem != null && problem.getDifficulty() != null) {
                String diff = problem.getDifficulty().toLowerCase();
                if (timeStats.containsKey(diff)) {
                    timeStats.get(diff).add(p.getTimeTaken());
                }
            }
        }

        Map<String, Object> fastestDiff = null;
        double minAvgTime = Double.MAX_VALUE;

        for (Map.Entry<String, List<Integer>> entry : timeStats.entrySet()) {
            String diff = entry.getKey();
            List<Integer> times = entry.getValue();
            if (!times.isEmpty()) {
                double avg = calculateAvg(times);
                if (avg < minAvgTime) {
                    minAvgTime = avg;
                    fastestDiff = new LinkedHashMap<>();
                    fastestDiff.put("difficulty", diff);
                    fastestDiff.put("avgTime", (int) Math.round(avg));
                }
            }
        }

        if (fastestDiff == null) {
            fastestDiff = new LinkedHashMap<>();
            fastestDiff.put("difficulty", "None");
            fastestDiff.put("avgTime", 0);
        }

        // --- Insight 3: Revision Success Rate ---
        List<Revision> revisions = revisionRepository.findByUserId(userId);
        LocalDate today = LocalDate.now();
        Date dToday = Date.from(today.atStartOfDay(ZoneId.systemDefault()).toInstant());
        revisions.removeIf(r -> r.getScheduledDate().after(dToday));

        if (scopedProblemIds != null) {
            final Set<String> ids = scopedProblemIds;
            revisions.removeIf(r -> !ids.contains(r.getProblemId()));
        }

        int totalRevisions = revisions.size();
        long completedRevisions = revisions.stream().filter(Revision::isCompleted).count();
        int revisionRate = totalRevisions > 0 ? (int) Math.round(((double) completedRevisions / totalRevisions) * 100) : 0;

        // --- Insight 4: Total Time Spent ---
        int totalTimeSpent = timedProgress.stream().mapToInt(UserProgress::getTimeTaken).sum();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("weakestTopic", weakestTopic);
        response.put("fastestDiff", fastestDiff);
        response.put("revisionRate", revisionRate);
        response.put("totalRevisions", totalRevisions);
        response.put("totalTimeSpent", totalTimeSpent);

        return ResponseEntity.ok(response);
    }
}
