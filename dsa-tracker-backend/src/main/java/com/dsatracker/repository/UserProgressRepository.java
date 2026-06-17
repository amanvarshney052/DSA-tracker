package com.dsatracker.repository;

import com.dsatracker.model.UserProgress;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserProgressRepository extends MongoRepository<UserProgress, String> {

    @Query("{ 'userId': { $in: [?0, { $oid: ?0 }] }, 'problemId': { $in: [?1, { $oid: ?1 }] } }")
    Optional<UserProgress> findByUserIdAndProblemId(String userId, String problemId);

    @Query("{ 'userId': { $in: [?0, { $oid: ?0 }] } }")
    List<UserProgress> findByUserId(String userId);

    @Query("{ 'userId': { $in: [?0, { $oid: ?0 }] }, 'solved': true }")
    List<UserProgress> findByUserIdAndSolvedTrue(String userId);

    @Query(value = "{ 'userId': { $in: [?0, { $oid: ?0 }] }, 'solved': true }", count = true)
    long countByUserIdAndSolvedTrue(String userId);
}
