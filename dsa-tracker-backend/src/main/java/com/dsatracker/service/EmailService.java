package com.dsatracker.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    public boolean sendEmail(String to, String subject, String body) {
        boolean isPlaceholder = fromEmail == null || fromEmail.isBlank() 
                || fromEmail.contains("your_email") 
                || mailPassword == null || mailPassword.isBlank() 
                || mailPassword.contains("your_app_password");

        if (isPlaceholder || mailSender == null) {
            log.info("SMTP not configured with real credentials. Outputting email to console.");
            printConsoleEmail(to, subject, body);
            return false;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email successfully sent to {}", to);
            return true;
        } catch (Exception e) {
            log.error("Failed to send email via SMTP to {}: {}. Falling back to console output.", to, e.getMessage());
            printConsoleEmail(to, subject, body);
            return false;
        }
    }

    private void printConsoleEmail(String to, String subject, String body) {
        System.out.println("\n========================================================");
        System.out.println(" [DSA TRACKER EMAIL SERVICE]");
        System.out.println(" TO:      " + to);
        System.out.println(" SUBJECT: " + subject);
        System.out.println(" --------------------------------------------------------");
        System.out.println(body);
        System.out.println("========================================================\n");
    }
}

