package com.dsatracker.repository;

import com.dsatracker.model.Sheet;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SheetRepository extends MongoRepository<Sheet, String> {
    List<Sheet> findByIsPublicTrue();
    List<Sheet> findByCreatedBy(String userId);
}
