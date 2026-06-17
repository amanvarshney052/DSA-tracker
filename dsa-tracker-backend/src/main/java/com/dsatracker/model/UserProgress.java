package com.dsatracker.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.TypeAlias;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Document(collection = "user_progress")
@TypeAlias("UserProgress")
@CompoundIndexes({
    @CompoundIndex(name = "user_problem_idx", def = "{'userId': 1, 'problemId': 1}", unique = true),
    @CompoundIndex(name = "user_solved_idx", def = "{'userId': 1, 'solved': 1}")
})
public class UserProgress {
    @Id
    @com.fasterxml.jackson.annotation.JsonProperty("_id")
    private String id;
    @Indexed
    @Field(targetType = FieldType.OBJECT_ID)
    private String userId;
    @Indexed
    @Field(targetType = FieldType.OBJECT_ID)
    private String problemId;
    private boolean solved = false;
    private Date solvedAt;
    private int timeTaken = 0;
    private String notes = "";
    private String approach = "";
    private String code = "";
    private boolean markedForRevision = false;
    private List<Date> revisionDates = new ArrayList<>();
    private Date nextRevisionDate;
    private int revisionCount = 0;
    @CreatedDate
    private Date createdAt = new Date();
    @LastModifiedDate
    private Date updatedAt = new Date();

    public UserProgress() {}

    public UserProgress(String id, String userId, String problemId, boolean solved, Date solvedAt, int timeTaken, 
                        String notes, String approach, String code, boolean markedForRevision, 
                        List<Date> revisionDates, Date nextRevisionDate, int revisionCount, Date createdAt, Date updatedAt) {
        this.id = id;
        this.userId = userId;
        this.problemId = problemId;
        this.solved = solved;
        this.solvedAt = solvedAt;
        this.timeTaken = timeTaken;
        if (notes != null) this.notes = notes;
        if (approach != null) this.approach = approach;
        if (code != null) this.code = code;
        this.markedForRevision = markedForRevision;
        if (revisionDates != null) this.revisionDates = revisionDates;
        this.nextRevisionDate = nextRevisionDate;
        this.revisionCount = revisionCount;
        if (createdAt != null) this.createdAt = createdAt;
        if (updatedAt != null) this.updatedAt = updatedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getProblemId() { return problemId; }
    public void setProblemId(String problemId) { this.problemId = problemId; }
    public boolean isSolved() { return solved; }
    public void setSolved(boolean solved) { this.solved = solved; }
    public Date getSolvedAt() { return solvedAt; }
    public void setSolvedAt(Date solvedAt) { this.solvedAt = solvedAt; }
    public int getTimeTaken() { return timeTaken; }
    public void setTimeTaken(int timeTaken) { this.timeTaken = timeTaken; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getApproach() { return approach; }
    public void setApproach(String approach) { this.approach = approach; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public boolean isMarkedForRevision() { return markedForRevision; }
    public void setMarkedForRevision(boolean markedForRevision) { this.markedForRevision = markedForRevision; }
    public List<Date> getRevisionDates() { return revisionDates; }
    public void setRevisionDates(List<Date> revisionDates) { this.revisionDates = revisionDates; }
    public Date getNextRevisionDate() { return nextRevisionDate; }
    public void setNextRevisionDate(Date nextRevisionDate) { this.nextRevisionDate = nextRevisionDate; }
    public int getRevisionCount() { return revisionCount; }
    public void setRevisionCount(int revisionCount) { this.revisionCount = revisionCount; }
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }

    public static UserProgressBuilder builder() {
        return new UserProgressBuilder();
    }

    public static class UserProgressBuilder {
        private String id;
        private String userId;
        private String problemId;
        private boolean solved = false;
        private Date solvedAt;
        private int timeTaken = 0;
        private String notes;
        private String approach;
        private String code;
        private boolean markedForRevision = false;
        private List<Date> revisionDates;
        private Date nextRevisionDate;
        private int revisionCount = 0;
        private Date createdAt;
        private Date updatedAt;

        public UserProgressBuilder id(String id) { this.id = id; return this; }
        public UserProgressBuilder userId(String userId) { this.userId = userId; return this; }
        public UserProgressBuilder problemId(String problemId) { this.problemId = problemId; return this; }
        public UserProgressBuilder solved(boolean solved) { this.solved = solved; return this; }
        public UserProgressBuilder solvedAt(Date solvedAt) { this.solvedAt = solvedAt; return this; }
        public UserProgressBuilder timeTaken(int timeTaken) { this.timeTaken = timeTaken; return this; }
        public UserProgressBuilder notes(String notes) { this.notes = notes; return this; }
        public UserProgressBuilder approach(String approach) { this.approach = approach; return this; }
        public UserProgressBuilder code(String code) { this.code = code; return this; }
        public UserProgressBuilder markedForRevision(boolean markedForRevision) { this.markedForRevision = markedForRevision; return this; }
        public UserProgressBuilder revisionDates(List<Date> revisionDates) { this.revisionDates = revisionDates; return this; }
        public UserProgressBuilder nextRevisionDate(Date nextRevisionDate) { this.nextRevisionDate = nextRevisionDate; return this; }
        public UserProgressBuilder revisionCount(int revisionCount) { this.revisionCount = revisionCount; return this; }
        public UserProgressBuilder createdAt(Date createdAt) { this.createdAt = createdAt; return this; }
        public UserProgressBuilder updatedAt(Date updatedAt) { this.updatedAt = updatedAt; return this; }

        public UserProgress build() {
            return new UserProgress(id, userId, problemId, solved, solvedAt, timeTaken, notes, approach, code, 
                    markedForRevision, revisionDates, nextRevisionDate, revisionCount, createdAt, updatedAt);
        }
    }
}
