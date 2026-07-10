package com.example.demo.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;

@Entity
@Table(name = "profiles")
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String passcode;

    private int xp = 0;
    private int level = 1;
    private int score = 0;
    private int maxxp = 300;

    private boolean classroomlinked = false;
    private String classroomcode = "";

    @Lob
    @Column(columnDefinition = "TEXT")
    @JsonIgnore
    private String completedroomsJson = "[]";

    @Lob
    @Column(columnDefinition = "TEXT")
    @JsonIgnore
    private String badgesJson = "[]";

    @Lob
    @Column(columnDefinition = "TEXT")
    @JsonIgnore
    private String roomtimesJson = "{}";

    private static final ObjectMapper objectMapper = new ObjectMapper();

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPasscode() { return passcode; }
    public void setPasscode(String passcode) { this.passcode = passcode; }

    public int getXp() { return xp; }
    public void setXp(int xp) { this.xp = xp; }

    public int getLevel() { return level; }
    public void setLevel(int level) { this.level = level; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public int getMaxxp() { return maxxp; }
    public void setMaxxp(int maxxp) { this.maxxp = maxxp; }

    public boolean isClassroomlinked() { return classroomlinked; }
    public void setClassroomlinked(boolean classroomlinked) { this.classroomlinked = classroomlinked; }

    public String getClassroomcode() { return classroomcode; }
    public void setClassroomcode(String classroomcode) { this.classroomcode = classroomcode; }

    // completedroomsJson backing field getter/setter
    public String getCompletedroomsJson() { return completedroomsJson; }
    public void setCompletedroomsJson(String completedroomsJson) { this.completedroomsJson = completedroomsJson; }

    // badgesJson backing field getter/setter
    public String getBadgesJson() { return badgesJson; }
    public void setBadgesJson(String badgesJson) { this.badgesJson = badgesJson; }

    // roomtimesJson backing field getter/setter
    public String getRoomtimesJson() { return roomtimesJson; }
    public void setRoomtimesJson(String roomtimesJson) { this.roomtimesJson = roomtimesJson; }

    // Get completedrooms as List
    @Transient
    public List<Integer> getCompletedrooms() {
        try {
            return objectMapper.readValue(completedroomsJson, new TypeReference<List<Integer>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    @Transient
    public void setCompletedrooms(List<Integer> completedrooms) {
        try {
            this.completedroomsJson = objectMapper.writeValueAsString(completedrooms);
        } catch (Exception e) {
            this.completedroomsJson = "[]";
        }
    }

    // Get badges as List
    @Transient
    public List<String> getBadges() {
        try {
            return objectMapper.readValue(badgesJson, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    @Transient
    public void setBadges(List<String> badges) {
        try {
            this.badgesJson = objectMapper.writeValueAsString(badges);
        } catch (Exception e) {
            this.badgesJson = "[]";
        }
    }

    // Get roomtimes as Map
    @Transient
    public Map<String, String> getRoomtimes() {
        try {
            return objectMapper.readValue(roomtimesJson, new TypeReference<Map<String, String>>() {});
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    @Transient
    public void setRoomtimes(Map<String, String> roomtimes) {
        try {
            this.roomtimesJson = objectMapper.writeValueAsString(roomtimes);
        } catch (Exception e) {
            this.roomtimesJson = "{}";
        }
    }
}
