package com.dsatracker.dto;

import java.util.List;

public class ProblemStatusUpdateDTO {
    private String problemId;
    private Integer timeTaken;
    private String notes;
    private String approach;
    private String code;
    private Boolean markedForRevision;
    private List<Integer> revisionDays;

    public ProblemStatusUpdateDTO() {}

    public String getProblemId() { return problemId; }
    public void setProblemId(String problemId) { this.problemId = problemId; }

    public Integer getTimeTaken() { return timeTaken; }
    public void setTimeTaken(Integer timeTaken) { this.timeTaken = timeTaken; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getApproach() { return approach; }
    public void setApproach(String approach) { this.approach = approach; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public Boolean getMarkedForRevision() { return markedForRevision; }
    public void setMarkedForRevision(Boolean markedForRevision) { this.markedForRevision = markedForRevision; }

    public List<Integer> getRevisionDays() { return revisionDays; }
    public void setRevisionDays(List<Integer> revisionDays) { this.revisionDays = revisionDays; }
}
