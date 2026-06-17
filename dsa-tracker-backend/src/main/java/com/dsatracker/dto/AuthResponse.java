package com.dsatracker.dto;

public class AuthResponse {
    private String token;
    private String _id;
    private String name;
    private String email;
    private String role;
    private int streak;
    private String activeSheet;
    private boolean hasOnboarded;

    public AuthResponse() {}

    public AuthResponse(String token, String _id, String name, String email, String role, int streak, String activeSheet, boolean hasOnboarded) {
        this.token = token;
        this._id = _id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.streak = streak;
        this.activeSheet = activeSheet;
        this.hasOnboarded = hasOnboarded;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String get_id() { return _id; }
    public void set_id(String _id) { this._id = _id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public int getStreak() { return streak; }
    public void setStreak(int streak) { this.streak = streak; }

    public String getActiveSheet() { return activeSheet; }
    public void setActiveSheet(String activeSheet) { this.activeSheet = activeSheet; }

    public boolean isHasOnboarded() { return hasOnboarded; }
    public void setHasOnboarded(boolean hasOnboarded) { this.hasOnboarded = hasOnboarded; }

    public static AuthResponseBuilder builder() {
        return new AuthResponseBuilder();
    }

    public static class AuthResponseBuilder {
        private String token;
        private String _id;
        private String name;
        private String email;
        private String role;
        private int streak;
        private String activeSheet;
        private boolean hasOnboarded;

        public AuthResponseBuilder token(String token) { this.token = token; return this; }
        public AuthResponseBuilder _id(String _id) { this._id = _id; return this; }
        public AuthResponseBuilder name(String name) { this.name = name; return this; }
        public AuthResponseBuilder email(String email) { this.email = email; return this; }
        public AuthResponseBuilder role(String role) { this.role = role; return this; }
        public AuthResponseBuilder streak(int streak) { this.streak = streak; return this; }
        public AuthResponseBuilder activeSheet(String activeSheet) { this.activeSheet = activeSheet; return this; }
        public AuthResponseBuilder hasOnboarded(boolean hasOnboarded) { this.hasOnboarded = hasOnboarded; return this; }

        public AuthResponse build() {
            return new AuthResponse(token, _id, name, email, role, streak, activeSheet, hasOnboarded);
        }
    }
}
