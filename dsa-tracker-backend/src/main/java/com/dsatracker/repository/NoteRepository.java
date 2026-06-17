package com.dsatracker.repository;

import com.dsatracker.model.Note;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends MongoRepository<Note, String> {

    @Query("{ 'userId': { $in: [?0, { $oid: ?0 }] } }")
    List<Note> findByUserId(String userId);

    @Query("{ 'userId': { $in: [?0, { $oid: ?0 }] }, 'topic': ?1 }")
    List<Note> findByUserIdAndTopic(String userId, String topic);
}
