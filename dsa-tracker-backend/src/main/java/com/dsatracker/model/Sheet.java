package com.dsatracker.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.TypeAlias;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Document(collection = "sheets")
@TypeAlias("Sheet")
public class Sheet {
    @Id
    @com.fasterxml.jackson.annotation.JsonProperty("_id")
    private String id;
    private String name;
    private String description = "";
    private int totalProblems = 0;
    private String difficulty = "mixed"; // beginner, intermediate, advanced, mixed
    private boolean isPublic = true;
    @Field(targetType = FieldType.OBJECT_ID)
    private String createdBy;
    private List<String> problems = new ArrayList<>(); // List of Problem IDs
    @CreatedDate
    private Date createdAt = new Date();
    @LastModifiedDate
    private Date updatedAt = new Date();

    public Sheet() {}

    public Sheet(String id, String name, String description, int totalProblems, String difficulty, 
                 boolean isPublic, String createdBy, List<String> problems, Date createdAt, Date updatedAt) {
        this.id = id;
        this.name = name;
        if (description != null) this.description = description;
        this.totalProblems = totalProblems;
        if (difficulty != null) this.difficulty = difficulty;
        this.isPublic = isPublic;
        this.createdBy = createdBy;
        if (problems != null) this.problems = problems;
        if (createdAt != null) this.createdAt = createdAt;
        if (updatedAt != null) this.updatedAt = updatedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public int getTotalProblems() { return totalProblems; }
    public void setTotalProblems(int totalProblems) { this.totalProblems = totalProblems; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public boolean isPublic() { return isPublic; }
    public void setPublic(boolean isPublic) { this.isPublic = isPublic; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public List<String> getProblems() { return problems; }
    public void setProblems(List<String> problems) { this.problems = problems; }
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }

    public static SheetBuilder builder() {
        return new SheetBuilder();
    }

    public static class SheetBuilder {
        private String id;
        private String name;
        private String description;
        private int totalProblems = 0;
        private String difficulty;
        private boolean isPublic = true;
        private String createdBy;
        private List<String> problems;
        private Date createdAt;
        private Date updatedAt;

        public SheetBuilder id(String id) { this.id = id; return this; }
        public SheetBuilder name(String name) { this.name = name; return this; }
        public SheetBuilder description(String description) { this.description = description; return this; }
        public SheetBuilder totalProblems(int totalProblems) { this.totalProblems = totalProblems; return this; }
        public SheetBuilder difficulty(String difficulty) { this.difficulty = difficulty; return this; }
        public SheetBuilder isPublic(boolean isPublic) { this.isPublic = isPublic; return this; }
        public SheetBuilder createdBy(String createdBy) { this.createdBy = createdBy; return this; }
        public SheetBuilder problems(List<String> problems) { this.problems = problems; return this; }
        public SheetBuilder createdAt(Date createdAt) { this.createdAt = createdAt; return this; }
        public SheetBuilder updatedAt(Date updatedAt) { this.updatedAt = updatedAt; return this; }

        public Sheet build() {
            return new Sheet(id, name, description, totalProblems, difficulty, isPublic, createdBy, problems, createdAt, updatedAt);
        }
    }
}
