package com.emailassistant.controller;

import com.emailassistant.service.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final AiService aiService;

    public ChatController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/send")
    public ResponseEntity<Map<String, String>> sendChatMessage(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        String history = request.getOrDefault("history", "");

        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message cannot be empty"));
        }

        String response = aiService.generateChatResponse(message, history);
        return ResponseEntity.ok(Map.of("response", response));
    }
}
