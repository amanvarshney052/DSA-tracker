package com.dsatracker.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.TypeAlias;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.util.Date;

@Document(collection = "revisions")
@TypeAlias("Revision")
@CompoundIndex(name = "user_scheduled_idx", def = "{'userId': 1, 'scheduledDate': 1}")
public class Revision {
    @Id
    @com.fasterxml.jackson.annotation.JsonProperty("_id")
    private String id;
    @Indexed
    @Field(targetType = FieldType.OBJECT_ID)
    private String userId;
    @Field(targetType = FieldType.OBJECT_ID)
    private String problemId;
    private Date scheduledDate;
    private boolean completed = false;
    private Date completedAt;
    private int revisionNumber;
    @CreatedDate
    private Date createdAt = new Date();

    public Revision() {}

    public Revision(String id, String userId, String problemId, Date scheduledDate, boolean completed, 
                    Date completedAt, int revisionNumber, Date createdAt) {
        this.id = id;
        this.userId = userId;
        this.problemId = problemId;
        this.scheduledDate = scheduledDate;
        this.completed = completed;
        this.completedAt = completedAt;
        this.revisionNumber = revisionNumber;
        if (createdAt != null) this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getProblemId() { return problemId; }
    public void setProblemId(String problemId) { this.problemId = problemId; }
    public Date getScheduledDate() { return scheduledDate; }
    public void setScheduledDate(Date scheduledDate) { this.scheduledDate = scheduledDate; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    public Date getCompletedAt() { return completedAt; }
    public void setCompletedAt(Date completedAt) { this.completedAt = completedAt; }
    public int getRevisionNumber() { return revisionNumber; }
    public void setRevisionNumber(int revisionNumber) { this.revisionNumber = revisionNumber; }
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public static RevisionBuilder builder() {
        return new RevisionBuilder();
    }

    public static class RevisionBuilder {
        private String id;
        private String userId;
        private String problemId;
        private Date scheduledDate;
        private boolean completed = false;
        private Date completedAt;
        private int revisionNumber;
        private Date createdAt;

        public RevisionBuilder id(String id) { this.id = id; return this; }
        public RevisionBuilder userId(String userId) { this.userId = userId; return this; }
        public RevisionBuilder problemId(String problemId) { this.problemId = problemId; return this; }
        public RevisionBuilder scheduledDate(Date scheduledDate) { this.scheduledDate = scheduledDate; return this; }
        public RevisionBuilder completed(boolean completed) { this.completed = completed; return this; }
        public RevisionBuilder completedAt(Date completedAt) { this.completedAt = completedAt; return this; }
        public RevisionBuilder revisionNumber(int revisionNumber) { this.revisionNumber = revisionNumber; return this; }
        public RevisionBuilder createdAt(Date createdAt) { this.createdAt = createdAt; return this; }

        public Revision build() {
            return new Revision(id, userId, problemId, scheduledDate, completed, completedAt, revisionNumber, createdAt);
        }
    }
}
