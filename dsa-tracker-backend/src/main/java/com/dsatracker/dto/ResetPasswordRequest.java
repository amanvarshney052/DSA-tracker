package com.dsatracker.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ResetPasswordRequest {
    @NotBlank(message = "Please provide email")
    @Email(message = "Please provide a valid email")
    private String email;

    @NotBlank(message = "Please provide OTP")
    private String otp;

    @NotBlank(message = "Please provide a new password")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    public ResetPasswordRequest() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
