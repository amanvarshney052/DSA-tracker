package com.dsatracker.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.TypeAlias;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.util.Date;

@Document(collection = "users")
@TypeAlias("User")
public class User {
    @Id
    @com.fasterxml.jackson.annotation.JsonProperty("_id")
    private String id;
    private String name;
    private String goal = "SDE / Backend / Placements 2026";
    @Indexed(unique = true)
    private String email;
    private String password;
    @Indexed(unique = true, sparse = true)
    private String googleId;
    private String role = "user"; // "user" or "admin"
    private int dailyGoal = 3;
    private int streak = 0;
    private Date lastActiveDate = new Date();
    private String preferredLanguage = "javascript";
    @Field(targetType = FieldType.OBJECT_ID)
    private String activeSheet; // Reference to Sheet ID
    private boolean hasOnboarded = false;
    private int xpPoints = 0;
    private int level = 1;
    private boolean isBlocked = false;
    @CreatedDate
    private Date createdAt = new Date();
    @LastModifiedDate
    private Date updatedAt = new Date();
    private String resetPasswordToken;
    private Date resetPasswordExpire;

    public User() {}

    public User(String id, String name, String goal, String email, String password, String googleId, String role, 
                int dailyGoal, int streak, Date lastActiveDate, String preferredLanguage, String activeSheet, 
                boolean hasOnboarded, int xpPoints, int level, boolean isBlocked, Date createdAt, Date updatedAt, 
                String resetPasswordToken, Date resetPasswordExpire) {
        this.id = id;
        this.name = name;
        if (goal != null) this.goal = goal;
        this.email = email;
        this.password = password;
        this.googleId = googleId;
        if (role != null) this.role = role;
        this.dailyGoal = dailyGoal;
        this.streak = streak;
        if (lastActiveDate != null) this.lastActiveDate = lastActiveDate;
        if (preferredLanguage != null) this.preferredLanguage = preferredLanguage;
        this.activeSheet = activeSheet;
        this.hasOnboarded = hasOnboarded;
        this.xpPoints = xpPoints;
        this.level = level;
        this.isBlocked = isBlocked;
        if (createdAt != null) this.createdAt = createdAt;
        if (updatedAt != null) this.updatedAt = updatedAt;
        this.resetPasswordToken = resetPasswordToken;
        this.resetPasswordExpire = resetPasswordExpire;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getGoal() { return goal; }
    public void setGoal(String goal) { this.goal = goal; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getGoogleId() { return googleId; }
    public void setGoogleId(String googleId) { this.googleId = googleId; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public int getDailyGoal() { return dailyGoal; }
    public void setDailyGoal(int dailyGoal) { this.dailyGoal = dailyGoal; }
    public int getStreak() { return streak; }
    public void setStreak(int streak) { this.streak = streak; }
    public Date getLastActiveDate() { return lastActiveDate; }
    public void setLastActiveDate(Date lastActiveDate) { this.lastActiveDate = lastActiveDate; }
    public String getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }
    public String getActiveSheet() { return activeSheet; }
    public void setActiveSheet(String activeSheet) { this.activeSheet = activeSheet; }
    public boolean isHasOnboarded() { return hasOnboarded; }
    public void setHasOnboarded(boolean hasOnboarded) { this.hasOnboarded = hasOnboarded; }
    public int getXpPoints() { return xpPoints; }
    public void setXpPoints(int xpPoints) { this.xpPoints = xpPoints; }
    public int getLevel() { return level; }
    public void setLevel(int level) { this.level = level; }
    public boolean isBlocked() { return isBlocked; }
    public void setBlocked(boolean blocked) { isBlocked = blocked; }
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }
    public String getResetPasswordToken() { return resetPasswordToken; }
    public void setResetPasswordToken(String resetPasswordToken) { this.resetPasswordToken = resetPasswordToken; }
    public Date getResetPasswordExpire() { return resetPasswordExpire; }
    public void setResetPasswordExpire(Date resetPasswordExpire) { this.resetPasswordExpire = resetPasswordExpire; }

    public static UserBuilder builder() {
        return new UserBuilder();
    }

    public static class UserBuilder {
        private String id;
        private String name;
        private String goal;
        private String email;
        private String password;
        private String googleId;
        private String role;
        private int dailyGoal = 3;
        private int streak = 0;
        private Date lastActiveDate;
        private String preferredLanguage;
        private String activeSheet;
        private boolean hasOnboarded = false;
        private int xpPoints = 0;
        private int level = 1;
        private boolean isBlocked = false;
        private Date createdAt;
        private Date updatedAt;
        private String resetPasswordToken;
        private Date resetPasswordExpire;

        public UserBuilder id(String id) { this.id = id; return this; }
        public UserBuilder name(String name) { this.name = name; return this; }
        public UserBuilder goal(String goal) { this.goal = goal; return this; }
        public UserBuilder email(String email) { this.email = email; return this; }
        public UserBuilder password(String password) { this.password = password; return this; }
        public UserBuilder googleId(String googleId) { this.googleId = googleId; return this; }
        public UserBuilder role(String role) { this.role = role; return this; }
        public UserBuilder dailyGoal(int dailyGoal) { this.dailyGoal = dailyGoal; return this; }
        public UserBuilder streak(int streak) { this.streak = streak; return this; }
        public UserBuilder lastActiveDate(Date lastActiveDate) { this.lastActiveDate = lastActiveDate; return this; }
        public UserBuilder preferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; return this; }
        public UserBuilder activeSheet(String activeSheet) { this.activeSheet = activeSheet; return this; }
        public UserBuilder hasOnboarded(boolean hasOnboarded) { this.hasOnboarded = hasOnboarded; return this; }
        public UserBuilder xpPoints(int xpPoints) { this.xpPoints = xpPoints; return this; }
        public UserBuilder level(int level) { this.level = level; return this; }
        public UserBuilder isBlocked(boolean isBlocked) { this.isBlocked = isBlocked; return this; }
        public UserBuilder createdAt(Date createdAt) { this.createdAt = createdAt; return this; }
        public UserBuilder updatedAt(Date updatedAt) { this.updatedAt = updatedAt; return this; }
        public UserBuilder resetPasswordToken(String resetPasswordToken) { this.resetPasswordToken = resetPasswordToken; return this; }
        public UserBuilder resetPasswordExpire(Date resetPasswordExpire) { this.resetPasswordExpire = resetPasswordExpire; return this; }

        public User build() {
            return new User(id, name, goal, email, password, googleId, role, dailyGoal, streak, lastActiveDate, 
                    preferredLanguage, activeSheet, hasOnboarded, xpPoints, level, isBlocked, createdAt, updatedAt, 
                    resetPasswordToken, resetPasswordExpire);
        }
    }
}
