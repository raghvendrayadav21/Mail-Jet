package com.emailassistant.controller;

import com.emailassistant.model.Template;
import com.emailassistant.model.User;
import com.emailassistant.repository.TemplateRepository;
import com.emailassistant.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/templates")
public class TemplateController {

    private final TemplateRepository templateRepository;
    private final UserRepository userRepository;

    public TemplateController(TemplateRepository templateRepository, UserRepository userRepository) {
        this.templateRepository = templateRepository;
        this.userRepository = userRepository;
    }

    private Optional<User> getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email);
    }

    @GetMapping
    public ResponseEntity<List<Template>> getTemplates() {
        Optional<User> userOpt = getCurrentUser();
        if (userOpt.isEmpty()) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(templateRepository.findByUserIdOrderByCreatedAtDesc(userOpt.get().getId()));
    }

    @PostMapping
    public ResponseEntity<Template> createTemplate(@RequestBody Map<String, String> request) {
        Optional<User> userOpt = getCurrentUser();
        if (userOpt.isEmpty()) return ResponseEntity.status(401).build();

        String name = request.get("name");
        String content = request.get("content");
        if (name == null || name.trim().isEmpty() || content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Template template = new Template(userOpt.get().getId(), name.trim(), content.trim(), LocalDateTime.now());
        return ResponseEntity.ok(templateRepository.save(template));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable String id) {
        Optional<User> userOpt = getCurrentUser();
        if (userOpt.isEmpty()) return ResponseEntity.status(401).build();

        Optional<Template> templateOpt = templateRepository.findByIdAndUserId(id, userOpt.get().getId());
        if (templateOpt.isEmpty()) return ResponseEntity.notFound().build();

        templateRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
