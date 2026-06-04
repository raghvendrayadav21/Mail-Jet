package com.emailassistant.controller;

import com.emailassistant.model.User;
import com.emailassistant.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api/gmail")
public class GmailController {

    @Value("${google.client.id:}")
    private String defaultClientId;

    @Value("${google.client.secret:}")
    private String defaultClientSecret;

    @Value("${google.redirect.uri:http://localhost:5173/oauth2/callback}")
    private String defaultRedirectUri;

    private final UserRepository userRepository;
    private final WebClient webClient;

    public GmailController(UserRepository userRepository, WebClient.Builder webClientBuilder) {
        this.userRepository = userRepository;
        this.webClient = webClientBuilder.build();
    }

    // Dynamic functional interface to execute WebClient requests with safety
    private interface WebClientCall<T> {
        T execute(String token) throws WebClientResponseException.Unauthorized;
    }

    // Helper to URL encode form parameters
    private String buildUrlEncodedForm(Map<String, String> params) {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (sb.length() > 0) {
                sb.append("&");
            }
            sb.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8))
              .append("=")
              .append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
        }
        return sb.toString();
    }

    // Retrieve headers from Gmail details message map
    @SuppressWarnings("unchecked")
    private String getHeaderValue(Map<String, Object> messageResponse, String headerName) {
        try {
            Map<String, Object> payload = (Map<String, Object>) messageResponse.get("payload");
            if (payload != null) {
                List<Map<String, Object>> headers = (List<Map<String, Object>>) payload.get("headers");
                if (headers != null) {
                    for (Map<String, Object> header : headers) {
                        if (headerName.equalsIgnoreCase((String) header.get("name"))) {
                            return (String) header.get("value");
                        }
                    }
                }
            }
        } catch (Exception e) {
            // Ignore
        }
        return "";
    }

    // Refresh access token synchronously using the refresh token
    private synchronized String refreshAccessToken(User user) {
        String clientId = user.getGmailClientId();
        if (clientId == null || clientId.trim().isEmpty()) {
            clientId = defaultClientId;
        }
        String clientSecret = user.getGmailClientSecret();
        if (clientSecret == null || clientSecret.trim().isEmpty()) {
            clientSecret = defaultClientSecret;
        }

        if (clientId == null || clientId.trim().isEmpty() || clientSecret == null || clientSecret.trim().isEmpty()) {
            throw new RuntimeException("Google OAuth Client ID or Client Secret not configured.");
        }

        try {
            Map<String, String> tokenRequest = new HashMap<>();
            tokenRequest.put("client_id", clientId);
            tokenRequest.put("client_secret", clientSecret);
            tokenRequest.put("refresh_token", user.getGmailRefreshToken());
            tokenRequest.put("grant_type", "refresh_token");

            Map<?, ?> response = webClient.post()
                    .uri("https://oauth2.googleapis.com/token")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .bodyValue(buildUrlEncodedForm(tokenRequest))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null && response.containsKey("access_token")) {
                String newAccessToken = (String) response.get("access_token");
                user.setGmailAccessToken(newAccessToken);
                userRepository.save(user);
                return newAccessToken;
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to refresh Gmail access token: " + e.getMessage(), e);
        }
        throw new RuntimeException("Google did not return an access token during refresh.");
    }

    // Wrapper to perform Google API request with automatic 401 token refresh handling
    private <T> T executeGmailCall(User user, WebClientCall<T> call) {
        try {
            return call.execute(user.getGmailAccessToken());
        } catch (WebClientResponseException.Unauthorized e) {
            if (user.getGmailRefreshToken() != null && !user.getGmailRefreshToken().isEmpty()) {
                try {
                    String newAccessToken = refreshAccessToken(user);
                    return call.execute(newAccessToken);
                } catch (Exception ex) {
                    user.setGmailConnected(false);
                    userRepository.save(user);
                    throw new RuntimeException("Gmail session expired. Please reconnect.", ex);
                }
            } else {
                user.setGmailConnected(false);
                userRepository.save(user);
                throw new RuntimeException("Gmail authorization expired. Please connect again.");
            }
        }
    }

    @PostMapping("/connect-mock")
    public ResponseEntity<?> connectMock() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setGmailConnected(true);
        user.setGmailAccessToken("mock-access-token-12345");
        user.setGmailRefreshToken("mock-refresh-token-67890");
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Gmail connected successfully in Simulator Mode!",
                "gmailConnected", true
        ));
    }

    @PostMapping("/disconnect")
    public ResponseEntity<?> disconnect() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setGmailConnected(false);
        user.setGmailAccessToken(null);
        user.setGmailRefreshToken(null);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Gmail disconnected successfully.",
                "gmailConnected", false
        ));
    }

    @PostMapping("/save-credentials")
    public ResponseEntity<?> saveCredentials(@RequestBody Map<String, String> body) {
        String clientId = body.get("clientId");
        String clientSecret = body.get("clientSecret");

        if (clientId == null || clientId.trim().isEmpty() || clientSecret == null || clientSecret.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Client ID and Client Secret cannot be empty."));
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setGmailClientId(clientId.trim());
        user.setGmailClientSecret(clientSecret.trim());
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Developer Google Credentials saved successfully!",
                "isConfigured", true
        ));
    }

    @GetMapping("/config-status")
    public ResponseEntity<?> getConfigStatus() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean hasUserCreds = user.getGmailClientId() != null && !user.getGmailClientId().isEmpty()
                && user.getGmailClientSecret() != null && !user.getGmailClientSecret().isEmpty();

        boolean hasGlobalCreds = defaultClientId != null && !defaultClientId.isEmpty()
                && defaultClientSecret != null && !defaultClientSecret.isEmpty();

        return ResponseEntity.ok(Map.of(
                "isConfigured", hasUserCreds || hasGlobalCreds,
                "usingGlobalConfig", hasGlobalCreds,
                "gmailConnected", user.isGmailConnected()
        ));
    }

    @GetMapping("/auth-url")
    public ResponseEntity<?> getAuthUrl() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String clientId = user.getGmailClientId();
        if (clientId == null || clientId.trim().isEmpty()) {
            clientId = defaultClientId;
        }

        if (clientId == null || clientId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Google Client ID is not configured. Please save credentials first."
            ));
        }

        try {
            String authUrl = "https://accounts.google.com/o/oauth2/v2/auth"
                    + "?client_id=" + URLEncoder.encode(clientId, StandardCharsets.UTF_8.toString())
                    + "&redirect_uri=" + URLEncoder.encode(defaultRedirectUri, StandardCharsets.UTF_8.toString())
                    + "&response_type=code"
                    + "&scope=" + URLEncoder.encode("https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send", StandardCharsets.UTF_8.toString())
                    + "&access_type=offline"
                    + "&prompt=consent";

            return ResponseEntity.ok(Map.of("authUrl", authUrl));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Error generating auth URL: " + e.getMessage()));
        }
    }

    @PostMapping("/callback")
    public ResponseEntity<?> handleCallback(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        if (code == null || code.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Authorization code is missing."));
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String clientId = user.getGmailClientId();
        if (clientId == null || clientId.trim().isEmpty()) {
            clientId = defaultClientId;
        }
        String clientSecret = user.getGmailClientSecret();
        if (clientSecret == null || clientSecret.trim().isEmpty()) {
            clientSecret = defaultClientSecret;
        }

        if (clientId == null || clientId.trim().isEmpty() || clientSecret == null || clientSecret.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Google OAuth Client ID or Client Secret not configured. Please save credentials first."
            ));
        }

        try {
            Map<String, String> tokenRequest = new HashMap<>();
            tokenRequest.put("code", code);
            tokenRequest.put("client_id", clientId);
            tokenRequest.put("client_secret", clientSecret);
            tokenRequest.put("redirect_uri", defaultRedirectUri);
            tokenRequest.put("grant_type", "authorization_code");

            Map<?, ?> response = webClient.post()
                    .uri("https://oauth2.googleapis.com/token")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .bodyValue(buildUrlEncodedForm(tokenRequest))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null && response.containsKey("access_token")) {
                user.setGmailConnected(true);
                user.setGmailAccessToken((String) response.get("access_token"));
                if (response.containsKey("refresh_token")) {
                    user.setGmailRefreshToken((String) response.get("refresh_token"));
                }
                userRepository.save(user);

                return ResponseEntity.ok(Map.of(
                        "message", "Gmail connected successfully!",
                        "gmailConnected", true
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "Failed to retrieve access token from Google."));
            }
        } catch (WebClientResponseException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Google OAuth error: " + e.getResponseBodyAsString()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "message", "Failed to exchange authorization code: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/feed")
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> getFeed() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isGmailConnected()) {
            return ResponseEntity.ok(Map.of("gmailConnected", false, "emails", List.of()));
        }

        // Check if we are running in simulator mode (mock token)
        if ("mock-access-token-12345".equals(user.getGmailAccessToken())) {
            return getMockFeed();
        }

        try {
            List<Map<String, Object>> emailList = executeGmailCall(user, token -> {
                // 1. List unread messages
                Map<?, ?> messagesResponse = webClient.get()
                        .uri("https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread&maxResults=10")
                        .header("Authorization", "Bearer " + token)
                        .retrieve()
                        .bodyToMono(Map.class)
                        .block();

                List<Map<String, Object>> result = new ArrayList<>();
                if (messagesResponse == null || !messagesResponse.containsKey("messages")) {
                    return result;
                }

                List<Map<String, Object>> messages = (List<Map<String, Object>>) messagesResponse.get("messages");
                if (messages == null) {
                    return result;
                }

                // 2. Fetch details for each message
                for (Map<String, Object> msg : messages) {
                    String id = (String) msg.get("id");
                    try {
                        Map<String, Object> detail = webClient.get()
                                .uri("https://gmail.googleapis.com/gmail/v1/users/me/messages/" + id + "?format=full")
                                .header("Authorization", "Bearer " + token)
                                .retrieve()
                                .bodyToMono(Map.class)
                                .block();

                        if (detail != null) {
                            String from = getHeaderValue(detail, "From");
                            String subject = getHeaderValue(detail, "Subject");
                            String date = getHeaderValue(detail, "Date");
                            String snippet = (String) detail.get("snippet");

                            String sender = from;
                            String senderName = "";
                            if (from.contains("<") && from.contains(">")) {
                                int openIdx = from.indexOf("<");
                                int closeIdx = from.indexOf(">");
                                senderName = from.substring(0, openIdx).trim().replace("\"", "");
                                sender = from.substring(openIdx + 1, closeIdx).trim();
                            } else {
                                sender = from.trim();
                                if (sender.contains("@")) {
                                    senderName = sender.substring(0, sender.indexOf("@"));
                                } else {
                                    senderName = sender;
                                }
                            }

                            // Clean up date string slightly
                            String cleanDate = date;
                            if (date.contains("+")) {
                                cleanDate = date.substring(0, date.indexOf("+")).trim();
                            } else if (date.contains("-")) {
                                cleanDate = date.substring(0, date.lastIndexOf("-")).trim();
                            }

                            result.add(Map.of(
                                    "id", id,
                                    "sender", sender,
                                    "senderName", senderName.isEmpty() ? sender : senderName,
                                    "subject", subject.isEmpty() ? "(No Subject)" : subject,
                                    "snippet", snippet == null ? "" : snippet,
                                    "receivedAt", cleanDate,
                                    "sentiment", "Neutral",
                                    "urgency", "Medium",
                                    "isReplied", false
                            ));
                        }
                    } catch (Exception e) {
                        System.err.println("Failed to fetch detail for email " + id + ": " + e.getMessage());
                    }
                }
                return result;
            });

            return ResponseEntity.ok(Map.of(
                    "gmailConnected", true,
                    "emails", emailList
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                    "gmailConnected", false,
                    "emails", List.of(),
                    "error", "Gmail API error: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/send-reply")
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> sendReply(@RequestBody Map<String, String> request) {
        String emailId = request.get("emailId");
        String replyText = request.get("replyText");

        if (emailId == null || replyText == null || replyText.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid reply request data."));
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isGmailConnected()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Gmail is not connected."));
        }

        // Check if we are running in simulator mode (mock token)
        if ("mock-access-token-12345".equals(user.getGmailAccessToken())) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Reply sent successfully via Gmail API (Simulated)!"
            ));
        }

        try {
            boolean success = executeGmailCall(user, token -> {
                // 1. Retrieve the original message to get sender, subject, and Message-ID for thread headers
                Map<String, Object> originalMsg = webClient.get()
                        .uri("https://gmail.googleapis.com/gmail/v1/users/me/messages/" + emailId + "?format=full")
                        .header("Authorization", "Bearer " + token)
                        .retrieve()
                        .bodyToMono(Map.class)
                        .block();

                if (originalMsg == null) {
                    throw new RuntimeException("Could not retrieve original email from Gmail.");
                }

                String recipient = getHeaderValue(originalMsg, "From");
                String subject = getHeaderValue(originalMsg, "Subject");
                String messageId = getHeaderValue(originalMsg, "Message-ID");
                String threadId = (String) originalMsg.get("threadId");

                if (recipient == null || recipient.isEmpty()) {
                    throw new RuntimeException("Original sender email could not be found.");
                }

                if (!subject.toLowerCase().startsWith("re:")) {
                    subject = "Re: " + subject;
                }

                // 2. Construct raw RFC 822 email format
                StringBuilder rawEmail = new StringBuilder();
                rawEmail.append("To: ").append(recipient).append("\n");
                rawEmail.append("Subject: ").append(subject).append("\n");
                
                if (messageId != null && !messageId.isEmpty()) {
                    rawEmail.append("In-Reply-To: ").append(messageId).append("\n");
                    rawEmail.append("References: ").append(messageId).append("\n");
                }
                
                rawEmail.append("Content-Type: text/plain; charset=utf-8\n\n");
                rawEmail.append(replyText);

                // Base64URL encode without padding
                String encodedEmail = Base64.getUrlEncoder().withoutPadding().encodeToString(rawEmail.toString().getBytes(StandardCharsets.UTF_8));

                // 3. Send via Gmail API
                Map<String, Object> body = new HashMap<>();
                body.put("raw", encodedEmail);
                if (threadId != null) {
                    body.put("threadId", threadId);
                }

                webClient.post()
                        .uri("https://gmail.googleapis.com/gmail/v1/users/me/messages/send")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .bodyValue(body)
                        .retrieve()
                        .bodyToMono(Map.class)
                        .block();

                return true;
            });

            if (success) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Reply sent successfully via Google Gmail API!"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "Failed to send reply."));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "message", "Failed to send email reply: " + e.getMessage()
            ));
        }
    }

    private ResponseEntity<?> getMockFeed() {
        List<Map<String, Object>> mockEmails = new ArrayList<>();
        mockEmails.add(Map.of(
                "id", "msg-101",
                "sender", "jack.willham@corporate.com",
                "senderName", "Jack Willham",
                "subject", "Urgent: Laptop freezing and running very slow",
                "snippet", "Hey, my work laptop is running extremely slow today—apps like Photoshop and Chrome are taking forever to open and freezing constantly. It's slowing down my work. Can someone from IT take a look remotely or diagnose the issue?",
                "receivedAt", "10 mins ago",
                "sentiment", "Urgent",
                "urgency", "High",
                "isReplied", false
        ));

        mockEmails.add(Map.of(
                "id", "msg-102",
                "sender", "sarah.parker@retailstore.com",
                "senderName", "Sarah Parker",
                "subject", "Delayed shipment query - Order #4092",
                "snippet", "Hey there! I ordered the custom roasted coffee beans (order #4092) last Wednesday and paid for expedited shipping. The package hasn't arrived yet and the tracking link says 'Pending'. Can you please look into this and let me know when to expect it? Thanks!",
                "receivedAt", "2 hours ago",
                "sentiment", "Disappointment",
                "urgency", "Medium",
                "isReplied", false
        ));

        mockEmails.add(Map.of(
                "id", "msg-103",
                "sender", "dr.darcy@darcyclinic.com",
                "senderName", "Dr. William Darcy",
                "subject", "Appointment reschedule Thursday at 3 PM",
                "snippet", "Hi there, I have an appointment with Dr. William Darcy this Thursday at 3 PM, but I need to reschedule due to a work conflict. Do you have any availability early next week?",
                "receivedAt", "1 day ago",
                "sentiment", "Appreciation",
                "urgency", "Low",
                "isReplied", false
        ));

        mockEmails.add(Map.of(
                "id", "msg-104",
                "sender", "billing-support@portal.com",
                "senderName", "Billing Portal Support",
                "subject", "Password reset code validation issue",
                "snippet", "Hi support team, I'm trying to reset my password on the billing portal but I never receive the verification code in my inbox. I've checked my spam folder as well. Can you please assist me manually or reset it from your end? Appreciate the quick help!",
                "receivedAt", "2 days ago",
                "sentiment", "Neutral",
                "urgency", "Low",
                "isReplied", false
        ));

        return ResponseEntity.ok(Map.of(
                "gmailConnected", true,
                "emails", mockEmails
        ));
    }
}
