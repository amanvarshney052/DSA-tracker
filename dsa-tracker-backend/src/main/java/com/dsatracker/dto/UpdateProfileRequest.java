package com.dsatracker.dto;

public class UpdateProfileRequest {
    private String name;
    private String goal;
    private Integer dailyGoal;
    private String preferredLanguage;
    private String activeSheet;
    private Boolean hasOnboarded;

    public UpdateProfileRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getGoal() { return goal; }
    public void setGoal(String goal) { this.goal = goal; }

    public Integer getDailyGoal() { return dailyGoal; }
    public void setDailyGoal(Integer dailyGoal) { this.dailyGoal = dailyGoal; }

    public String getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }

    public String getActiveSheet() { return activeSheet; }
    public void setActiveSheet(String activeSheet) { this.activeSheet = activeSheet; }

    public Boolean getHasOnboarded() { return hasOnboarded; }
    public void setHasOnboarded(Boolean hasOnboarded) { this.hasOnboarded = hasOnboarded; }
}
