package com.emailassistant.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "users")
public class User {

    @Id
    private String id;
    private String fullName;
    
    @Indexed(unique = true)
    private String email;
    
    private String password;
    private String accountType; // "Personal Use", "Business Use", "Other"
    private LocalDateTime createdAt;
    private String gmailAccessToken;
    private String gmailRefreshToken;
    private boolean gmailConnected;
    private String gmailClientId;
    private String gmailClientSecret;

    public User() {
    }

    public User(String fullName, String email, String password, String accountType, LocalDateTime createdAt) {
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.accountType = accountType;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getGmailAccessToken() {
        return gmailAccessToken;
    }

    public void setGmailAccessToken(String gmailAccessToken) {
        this.gmailAccessToken = gmailAccessToken;
    }

    public String getGmailRefreshToken() {
        return gmailRefreshToken;
    }

    public void setGmailRefreshToken(String gmailRefreshToken) {
        this.gmailRefreshToken = gmailRefreshToken;
    }

    public boolean isGmailConnected() {
        return gmailConnected;
    }

    public void setGmailConnected(boolean gmailConnected) {
        this.gmailConnected = gmailConnected;
    }

    public String getGmailClientId() {
        return gmailClientId;
    }

    public void setGmailClientId(String gmailClientId) {
        this.gmailClientId = gmailClientId;
    }

    public String getGmailClientSecret() {
        return gmailClientSecret;
    }

    public void setGmailClientSecret(String gmailClientSecret) {
        this.gmailClientSecret = gmailClientSecret;
    }
}
