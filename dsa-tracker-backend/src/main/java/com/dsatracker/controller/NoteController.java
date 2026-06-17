package com.dsatracker.controller;

import com.dsatracker.exception.BadRequestException;
import com.dsatracker.exception.ResourceNotFoundException;
import com.dsatracker.model.Note;
import com.dsatracker.repository.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    @Autowired
    private NoteRepository noteRepository;

    private String getAuthenticatedUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        }
        throw new BadRequestException("Unauthorized");
    }

    @GetMapping
    public ResponseEntity<List<Note>> getNotes(@RequestParam(value = "topic", required = false) String topic,
                                              @RequestParam(value = "tag", required = false) String tag) {
        String userId = getAuthenticatedUserId();

        // Fetch user's notes
        List<Note> notes = noteRepository.findByUserId(userId);

        // Filter in-memory for simpler query structures (suitable for typical student profiles)
        if (topic != null && !topic.isEmpty()) {
            notes.removeIf(n -> !topic.equalsIgnoreCase(n.getTopic()));
        }
        if (tag != null && !tag.isEmpty()) {
            notes.removeIf(n -> n.getTags() == null || !n.getTags().contains(tag));
        }

        // Sort by updatedAt desc
        notes.sort((a, b) -> {
            Date da = a.getUpdatedAt();
            Date db = b.getUpdatedAt();
            if (da == null && db == null) return 0;
            if (da == null) return 1;
            if (db == null) return -1;
            return db.compareTo(da);
        });

        return ResponseEntity.ok(notes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Note> getNoteById(@PathVariable("id") String id) {
        String userId = getAuthenticatedUserId();
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));

        if (!note.getUserId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to this note");
        }

        return ResponseEntity.ok(note);
    }

    @PostMapping
    public ResponseEntity<Note> createNote(@RequestBody java.util.Map<String, Object> noteData) {
        String userId = getAuthenticatedUserId();

        Note note = new Note();
        note.setUserId(userId);
        if (noteData.get("topic") != null) note.setTopic((String) noteData.get("topic"));
        if (noteData.get("title") != null) note.setTitle((String) noteData.get("title"));
        if (noteData.get("content") != null) note.setContent((String) noteData.get("content"));
        // Accept both codeTemplate (from frontend) and codeTemplates (Java field name)
        String codeTemplate = (String) noteData.getOrDefault("codeTemplate", noteData.get("codeTemplates"));
        if (codeTemplate != null) note.setCodeTemplates(codeTemplate);
        if (noteData.get("tags") != null) {
            @SuppressWarnings("unchecked")
            java.util.List<String> tags = (java.util.List<String>) noteData.get("tags");
            note.setTags(tags);
        }
        note.setCreatedAt(new Date());
        note.setUpdatedAt(new Date());

        Note savedNote = noteRepository.save(note);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedNote);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Note> updateNote(@PathVariable("id") String id, @RequestBody java.util.Map<String, Object> noteDetails) {
        String userId = getAuthenticatedUserId();
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));

        if (!note.getUserId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to this note");
        }

        if (noteDetails.get("topic") != null) note.setTopic((String) noteDetails.get("topic"));
        if (noteDetails.get("title") != null) note.setTitle((String) noteDetails.get("title"));
        if (noteDetails.get("content") != null) note.setContent((String) noteDetails.get("content"));
        // Accept both codeTemplate (from frontend) and codeTemplates (Java field name)
        String codeTemplate = (String) noteDetails.getOrDefault("codeTemplate", noteDetails.get("codeTemplates"));
        if (codeTemplate != null) note.setCodeTemplates(codeTemplate);
        if (noteDetails.get("tags") != null) {
            @SuppressWarnings("unchecked")
            java.util.List<String> tags = (java.util.List<String>) noteDetails.get("tags");
            note.setTags(tags);
        }
        note.setUpdatedAt(new Date());

        Note updatedNote = noteRepository.save(note);
        return ResponseEntity.ok(updatedNote);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNote(@PathVariable("id") String id) {
        String userId = getAuthenticatedUserId();
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));

        if (!note.getUserId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to this note");
        }

        noteRepository.delete(note);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Note removed");
        return ResponseEntity.ok(response);
    }
}
