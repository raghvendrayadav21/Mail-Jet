package com.emailassistant.repository;

import com.emailassistant.model.EmailTransaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EmailTransactionRepository extends MongoRepository<EmailTransaction, String> {
    List<EmailTransaction> findByUserIdOrderByTimestampDesc(String userId);
    List<EmailTransaction> findByUserIdAndTimestampAfter(String userId, LocalDateTime after);
    long countByUserId(String userId);
}
