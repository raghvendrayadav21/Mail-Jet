package com.emailassistant.repository;

import com.emailassistant.model.Template;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TemplateRepository extends MongoRepository<Template, String> {
    List<Template> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<Template> findByIdAndUserId(String id, String userId);
}
