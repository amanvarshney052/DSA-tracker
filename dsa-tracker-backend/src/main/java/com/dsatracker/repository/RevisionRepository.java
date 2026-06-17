package com.dsatracker.repository;

import com.dsatracker.model.Revision;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface RevisionRepository extends MongoRepository<Revision, String> {

    @Query("{ 'userId': { $in: [?0, { $oid: ?0 }] } }")
    List<Revision> findByUserId(String userId);

    @Query("{ 'userId': { $in: [?0, { $oid: ?0 }] }, 'completed': false }")
    List<Revision> findByUserIdAndCompletedFalse(String userId);

    @Query("{ 'userId': { $in: [?0, { $oid: ?0 }] }, 'scheduledDate': { $lt: ?1 } }")
    List<Revision> findByUserIdAndScheduledDateBefore(String userId, Date date);
}
