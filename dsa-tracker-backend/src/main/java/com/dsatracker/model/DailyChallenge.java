package com.dsatracker.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.TypeAlias;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.util.Date;

@Document(collection = "daily_challenges")
@TypeAlias("DailyChallenge")
public class DailyChallenge {
    @Id
    @com.fasterxml.jackson.annotation.JsonProperty("_id")
    private String id;
    @Indexed(unique = true)
    private String date; // Format: YYYY-MM-DD
    @Field(targetType = FieldType.OBJECT_ID)
    private String problemId;
    private String message = "";
    @CreatedDate
    private Date createdAt = new Date();

    public DailyChallenge() {}

    public DailyChallenge(String id, String date, String problemId, String message, Date createdAt) {
        this.id = id;
        this.date = date;
        this.problemId = problemId;
        if (message != null) this.message = message;
        if (createdAt != null) this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getProblemId() { return problemId; }
    public void setProblemId(String problemId) { this.problemId = problemId; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public static DailyChallengeBuilder builder() {
        return new DailyChallengeBuilder();
    }

    public static class DailyChallengeBuilder {
        private String id;
        private String date;
        private String problemId;
        private String message;
        private Date createdAt;

        public DailyChallengeBuilder id(String id) { this.id = id; return this; }
        public DailyChallengeBuilder date(String date) { this.date = date; return this; }
        public DailyChallengeBuilder problemId(String problemId) { this.problemId = problemId; return this; }
        public DailyChallengeBuilder message(String message) { this.message = message; return this; }
        public DailyChallengeBuilder createdAt(Date createdAt) { this.createdAt = createdAt; return this; }

        public DailyChallenge build() {
            return new DailyChallenge(id, date, problemId, message, createdAt);
        }
    }
}
