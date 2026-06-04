package com.emailassistant.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "email_transactions")
public class EmailTransaction {

    @Id
    private String id;
    private String userId;
    private String incomingEmail;
    private String generatedResponse;
    private LocalDateTime timestamp;
    private String sentiment;
    private String urgency;

    public EmailTransaction() {
    }

    public EmailTransaction(String incomingEmail, String generatedResponse, LocalDateTime timestamp) {
        this.incomingEmail = incomingEmail;
        this.generatedResponse = generatedResponse;
        this.timestamp = timestamp;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getIncomingEmail() { return incomingEmail; }
    public void setIncomingEmail(String incomingEmail) { this.incomingEmail = incomingEmail; }

    public String getGeneratedResponse() { return generatedResponse; }
    public void setGeneratedResponse(String generatedResponse) { this.generatedResponse = generatedResponse; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getSentiment() { return sentiment; }
    public void setSentiment(String sentiment) { this.sentiment = sentiment; }

    public String getUrgency() { return urgency; }
    public void setUrgency(String urgency) { this.urgency = urgency; }
}
