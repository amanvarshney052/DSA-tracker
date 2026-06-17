package com.dsatracker.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.TypeAlias;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.util.Date;
import java.util.List;

@Document(collection = "problems")
@TypeAlias("Problem")
public class Problem {
    @Id
    @com.fasterxml.jackson.annotation.JsonProperty("_id")
    private String id;
    private String title;
    private String platform; // leetcode, codeforces, gfg, codechef, hackerrank, custom
    private String platformIcon = "";
    private String problemUrl;
    private String difficulty; // easy, medium, hard
    private List<String> topics;
    @Indexed
    @Field(targetType = FieldType.OBJECT_ID)
    private String sheetId;
    private int estimatedTime = 30;
    @Field(targetType = FieldType.OBJECT_ID)
    private String createdBy;
    @CreatedDate
    private Date createdAt = new Date();

    public Problem() {}

    public Problem(String id, String title, String platform, String platformIcon, String problemUrl, 
                   String difficulty, List<String> topics, String sheetId, int estimatedTime, 
                   String createdBy, Date createdAt) {
        this.id = id;
        this.title = title;
        this.platform = platform;
        if (platformIcon != null) this.platformIcon = platformIcon;
        this.problemUrl = problemUrl;
        this.difficulty = difficulty;
        this.topics = topics;
        this.sheetId = sheetId;
        this.estimatedTime = estimatedTime;
        this.createdBy = createdBy;
        if (createdAt != null) this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }
    public String getPlatformIcon() { return platformIcon; }
    public void setPlatformIcon(String platformIcon) { this.platformIcon = platformIcon; }
    public String getProblemUrl() { return problemUrl; }
    public void setProblemUrl(String problemUrl) { this.problemUrl = problemUrl; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public List<String> getTopics() { return topics; }
    public void setTopics(List<String> topics) { this.topics = topics; }
    public String getSheetId() { return sheetId; }
    public void setSheetId(String sheetId) { this.sheetId = sheetId; }
    public int getEstimatedTime() { return estimatedTime; }
    public void setEstimatedTime(int estimatedTime) { this.estimatedTime = estimatedTime; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public static ProblemBuilder builder() {
        return new ProblemBuilder();
    }

    public static class ProblemBuilder {
        private String id;
        private String title;
        private String platform;
        private String platformIcon;
        private String problemUrl;
        private String difficulty;
        private List<String> topics;
        private String sheetId;
        private int estimatedTime = 30;
        private String createdBy;
        private Date createdAt;

        public ProblemBuilder id(String id) { this.id = id; return this; }
        public ProblemBuilder title(String title) { this.title = title; return this; }
        public ProblemBuilder platform(String platform) { this.platform = platform; return this; }
        public ProblemBuilder platformIcon(String platformIcon) { this.platformIcon = platformIcon; return this; }
        public ProblemBuilder problemUrl(String problemUrl) { this.problemUrl = problemUrl; return this; }
        public ProblemBuilder difficulty(String difficulty) { this.difficulty = difficulty; return this; }
        public ProblemBuilder topics(List<String> topics) { this.topics = topics; return this; }
        public ProblemBuilder sheetId(String sheetId) { this.sheetId = sheetId; return this; }
        public ProblemBuilder estimatedTime(int estimatedTime) { this.estimatedTime = estimatedTime; return this; }
        public ProblemBuilder createdBy(String createdBy) { this.createdBy = createdBy; return this; }
        public ProblemBuilder createdAt(Date createdAt) { this.createdAt = createdAt; return this; }

        public Problem build() {
            return new Problem(id, title, platform, platformIcon, problemUrl, difficulty, topics, sheetId, estimatedTime, createdBy, createdAt);
        }
    }
}
