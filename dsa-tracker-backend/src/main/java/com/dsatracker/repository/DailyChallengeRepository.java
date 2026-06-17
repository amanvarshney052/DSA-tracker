package com.dsatracker.repository;

import com.dsatracker.model.DailyChallenge;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DailyChallengeRepository extends MongoRepository<DailyChallenge, String> {
    Optional<DailyChallenge> findByDate(String date);
}
