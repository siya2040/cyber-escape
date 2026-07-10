package com.example.demo.controller;

import com.example.demo.model.Profile;
import com.example.demo.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/profiles")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.OPTIONS})
public class ProfileController {

    @Autowired
    private ProfileRepository profileRepository;

    // 1. Get all profiles ordered by score desc (Leaderboard)
    @GetMapping
    public List<Profile> getLeaderboard() {
        return profileRepository.findAllByOrderByScoreDesc();
    }

    // 2. Load profile by username
    @GetMapping("/{username}")
    public ResponseEntity<Profile> getProfile(@PathVariable String username) {
        String normalizedUsername = username.trim().toUpperCase();
        Optional<Profile> profileOpt = profileRepository.findByUsername(normalizedUsername);
        if (profileOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(profileOpt.get());
    }

    // 3. Register a new profile
    @PostMapping
    public ResponseEntity<?> registerProfile(@RequestBody Profile newProfile) {
        String normalizedUsername = newProfile.getUsername().trim().toUpperCase();
        
        Optional<Profile> existing = profileRepository.findByUsername(normalizedUsername);
        if (existing.isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "reason", "username_already_registered"));
        }

        // Setup normalized credentials and transient collections
        Profile profile = new Profile();
        profile.setUsername(normalizedUsername);
        profile.setPasscode(newProfile.getPasscode());
        profile.setXp(newProfile.getXp());
        profile.setLevel(newProfile.getLevel());
        profile.setScore(newProfile.getScore());
        profile.setMaxxp(newProfile.getMaxxp());
        profile.setClassroomlinked(newProfile.isClassroomlinked());
        profile.setClassroomcode(newProfile.getClassroomcode());
        
        // Use standard getters/setters which convert back to backing JSON fields
        profile.setCompletedrooms(newProfile.getCompletedrooms());
        profile.setBadges(newProfile.getBadges());
        profile.setRoomtimes(newProfile.getRoomtimes());

        Profile saved = profileRepository.save(profile);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // 4. Update an existing profile
    @PutMapping("/{username}")
    public ResponseEntity<?> updateProfile(@PathVariable String username, @RequestBody Profile updatedProfile) {
        String normalizedUsername = username.trim().toUpperCase();
        Optional<Profile> existingOpt = profileRepository.findByUsername(normalizedUsername);
        
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Profile existing = existingOpt.get();
        existing.setXp(updatedProfile.getXp());
        existing.setLevel(updatedProfile.getLevel());
        existing.setScore(updatedProfile.getScore());
        existing.setMaxxp(updatedProfile.getMaxxp());
        existing.setClassroomlinked(updatedProfile.isClassroomlinked());
        existing.setClassroomcode(updatedProfile.getClassroomcode());
        
        // Sync transient collections back to JSON backing fields
        existing.setCompletedrooms(updatedProfile.getCompletedrooms());
        existing.setBadges(updatedProfile.getBadges());
        existing.setRoomtimes(updatedProfile.getRoomtimes());

        Profile saved = profileRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    // 5. Authenticate a profile
    @PostMapping("/auth")
    public ResponseEntity<?> authenticate(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String passcode = credentials.get("passcode");

        if (username == null || passcode == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "reason", "missing_credentials"));
        }

        String normalizedUsername = username.trim().toUpperCase();
        Optional<Profile> profileOpt = profileRepository.findByUsername(normalizedUsername);
        
        if (profileOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "reason", "username_not_found"));
        }

        Profile profile = profileOpt.get();
        if (!profile.getPasscode().equals(passcode)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "reason", "invalid_passcode"));
        }

        return ResponseEntity.ok(profile);
    }
}
