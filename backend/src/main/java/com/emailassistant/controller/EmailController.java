package com.emailassistant.controller;

import com.emailassistant.model.EmailTransaction;
import com.emailassistant.model.User;
import com.emailassistant.repository.EmailTransactionRepository;
import com.emailassistant.repository.UserRepository;
import com.emailassistant.service.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/emails")
public class EmailController {

    private final AiService aiService;
    private final EmailTransactionRepository repository;
    private final UserRepository userRepository;

    public EmailController(AiService aiService, EmailTransactionRepository repository, UserRepository userRepository) {
        this.aiService = aiService;
        this.repository = repository;
        this.userRepository = userRepository;
    }

    // Helper: get current logged-in user
    private Optional<User> getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email);
    }

    @PostMapping("/generate")
    public ResponseEntity<EmailTransaction> generateEmailResponse(@RequestBody Map<String, String> request) {
        String incomingEmail = request.get("emailContent");
        String userName = request.get("userName");

        if (incomingEmail == null || incomingEmail.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Map<String, String> analysis = aiService.generateEmailAnalysis(incomingEmail, userName);
        String generatedResponse = analysis.get("generatedResponse");
        String sentiment = analysis.get("sentiment");
        String urgency = analysis.get("urgency");

        EmailTransaction transaction = new EmailTransaction(incomingEmail, generatedResponse, LocalDateTime.now());
        transaction.setSentiment(sentiment);
        transaction.setUrgency(urgency);

        // Link to current user
        getCurrentUser().ifPresent(u -> transaction.setUserId(u.getId()));

        EmailTransaction savedTransaction = repository.save(transaction);
        return ResponseEntity.ok(savedTransaction);
    }

    @GetMapping("/history")
    public ResponseEntity<List<EmailTransaction>> getHistory() {
        Optional<User> userOpt = getCurrentUser();
        if (userOpt.isEmpty()) return ResponseEntity.status(401).build();

        List<EmailTransaction> history = repository.findByUserIdOrderByTimestampDesc(userOpt.get().getId());
        return ResponseEntity.ok(history);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Optional<User> userOpt = getCurrentUser();
        if (userOpt.isEmpty()) return ResponseEntity.status(401).build();

        String userId = userOpt.get().getId();
        List<EmailTransaction> all = repository.findByUserIdOrderByTimestampDesc(userId);

        long total = all.size();
        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        long thisMonth = all.stream().filter(t -> t.getTimestamp() != null && t.getTimestamp().isAfter(monthStart)).count();

        Map<String, Long> sentimentBreakdown = new HashMap<>();
        sentimentBreakdown.put("Urgent", 0L);
        sentimentBreakdown.put("Neutral", 0L);
        sentimentBreakdown.put("Appreciation", 0L);
        sentimentBreakdown.put("Disappointment", 0L);

        for (EmailTransaction t : all) {
            String s = t.getSentiment();
            if (s != null && sentimentBreakdown.containsKey(s)) {
                sentimentBreakdown.put(s, sentimentBreakdown.get(s) + 1);
            }
        }

        // Last 7 days daily counts
        Map<String, Long> dailyCounts = new java.util.LinkedHashMap<>();
        for (int i = 6; i >= 0; i--) {
            LocalDateTime dayStart = LocalDateTime.now().minusDays(i).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime dayEnd = dayStart.plusDays(1);
            String label = dayStart.toLocalDate().toString();
            long count = all.stream().filter(t -> t.getTimestamp() != null &&
                    t.getTimestamp().isAfter(dayStart) && t.getTimestamp().isBefore(dayEnd)).count();
            dailyCounts.put(label, count);
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("total", total);
        stats.put("thisMonth", thisMonth);
        stats.put("sentimentBreakdown", sentimentBreakdown);
        stats.put("dailyCounts", dailyCounts);

        return ResponseEntity.ok(stats);
    }
}
