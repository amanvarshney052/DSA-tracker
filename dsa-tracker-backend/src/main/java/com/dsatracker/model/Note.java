package com.dsatracker.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.TypeAlias;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Document(collection = "notes")
@TypeAlias("Note")
public class Note {
    @Id
    @com.fasterxml.jackson.annotation.JsonProperty("_id")
    private String id;
    @Indexed
    @Field(targetType = FieldType.OBJECT_ID)
    private String userId;
    private String topic;
    private String title;
    private String content;
    @com.fasterxml.jackson.annotation.JsonProperty("codeTemplate")
    @com.fasterxml.jackson.annotation.JsonAlias({"codeTemplates", "codeTemplate"})
    private String codeTemplates = "";
    private List<String> tags = new ArrayList<>();
    @CreatedDate
    private Date createdAt = new Date();
    @LastModifiedDate
    private Date updatedAt = new Date();

    public Note() {}

    public Note(String id, String userId, String topic, String title, String content, String codeTemplates, 
                List<String> tags, Date createdAt, Date updatedAt) {
        this.id = id;
        this.userId = userId;
        this.topic = topic;
        this.title = title;
        this.content = content;
        if (codeTemplates != null) this.codeTemplates = codeTemplates;
        if (tags != null) this.tags = tags;
        if (createdAt != null) this.createdAt = createdAt;
        if (updatedAt != null) this.updatedAt = updatedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    @com.fasterxml.jackson.annotation.JsonProperty("codeTemplate")
    public String getCodeTemplates() { return codeTemplates; }
    public void setCodeTemplates(String codeTemplates) { this.codeTemplates = codeTemplates; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }

    public static NoteBuilder builder() {
        return new NoteBuilder();
    }

    public static class NoteBuilder {
        private String id;
        private String userId;
        private String topic;
        private String title;
        private String content;
        private String codeTemplates;
        private List<String> tags;
        private Date createdAt;
        private Date updatedAt;

        public NoteBuilder id(String id) { this.id = id; return this; }
        public NoteBuilder userId(String userId) { this.userId = userId; return this; }
        public NoteBuilder topic(String topic) { this.topic = topic; return this; }
        public NoteBuilder title(String title) { this.title = title; return this; }
        public NoteBuilder content(String content) { this.content = content; return this; }
        public NoteBuilder codeTemplates(String codeTemplates) { this.codeTemplates = codeTemplates; return this; }
        public NoteBuilder tags(List<String> tags) { this.tags = tags; return this; }
        public NoteBuilder createdAt(Date createdAt) { this.createdAt = createdAt; return this; }
        public NoteBuilder updatedAt(Date updatedAt) { this.updatedAt = updatedAt; return this; }

        public Note build() {
            return new Note(id, userId, topic, title, content, codeTemplates, tags, createdAt, updatedAt);
        }
    }
}
