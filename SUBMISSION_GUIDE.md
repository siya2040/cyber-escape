# Cyberspace Learning Game - Project Submission Guide 🚀

This document compiles all the required assets, links, and content for your final project submission. You can copy sections of this document directly into your submission forms, reports, or presentation slides.

---

## 🔗 1. Live Deployment & Repository Links

* **Live Deployed Application**: [https://siya2040.github.io/cyber-escape/](https://siya2040.github.io/cyber-escape/)
* **Final GitHub Repository**: [https://github.com/siya2040/cyber-escape](https://github.com/siya2040/cyber-escape)

---

## 📽️ 2. Demo Walkthrough Video - 3-Minute Recording Script

Use this step-by-step guide to record your walkthrough screen-recording. (Tools like Loom, OBS, or Windows Game Bar `Win + Alt + R` work great for this!).

### **Scene 1: Introduction & Landing Page (0:00 - 0:45)**
* **Visual**: Show the landing page with the dark checkerboard grid background and the login card.
* **Action**: Type in a test username (e.g., `SIYA_TEST`) and passcode, then click **Sign In**.
* **What to Say**: 
  > *"Welcome to Cyber Escape with Simba, an interactive cybersecurity learning game. The game runs natively in the browser and connects securely to a Supabase database. To keep user accounts safe, all passcodes are encrypted client-side using SHA-256 cryptographic hashing before being sent to the database. We also built in an adblocker detection layer to warn players if their Brave Shields block the database CDN."*

### **Scene 2: Map Selector & Gameplay (0:45 - 1:45)**
* **Visual**: Switch to the **City Escape Map**. Click on **Room 1: Phishing Firewall** or **Room 2: Password Crypt** to show the puzzle interface.
* **Action**: Drag-and-drop or click elements to solve a quick challenge, showing Simba offering a hint and changing collar/visor animations.
* **What to Say**: 
  > *"Once logged in, the player is presented with a 10-room map selector. Each room represents a cybersecurity domain—from Phishing and Password strength to Network configuration and Breach response. In the challenges, players interact with simulated terminals while Simba, our cyber-cat guide, reacts dynamically with hints and facial expressions depending on the player's inputs."*

### **Scene 3: Gamification & Debrief (1:45 - 2:30)**
* **Visual**: Complete a room, show the **Debrief Terminal** screen, and then navigate to the **Player Profile** tab.
* **Action**: Show the acquired badges and level progression bar.
* **What to Say**: 
  > *"When a room is solved, the player receives a Debrief outlining how this puzzle connects to real-world frameworks like CompTIA Security+, NIST, and OWASP. Solving rooms awards XP and increases player level, which dynamically unlocks advanced rooms on the map. Earned badges are displayed in the Player Profile badge gallery."*

### **Scene 4: Classroom Telemetry & Leaderboard (2:30 - 3:00)**
* **Visual**: Navigate to the **Classroom Portal** tab, show the live telemetry listing, and then the **Leaderboard** tab.
* **What to Say**: 
  > *"Finally, we implemented a Classroom Portal. Students can input an educator group code (like 1234) to link their session, awarding them an XP bonus and immediately syncing their scores, levels, and completed rooms to a real-time Classroom Leaderboard. This turns the game into a scalable classroom tool for teachers."*

---

## 🏆 3. Gamification Feature Showcase

Copy these bullet points directly into your submission report to showcase the gamification mechanics:

* **Level Progression Engine**: Earn XP (+150 XP to +300 XP depending on difficulty) to level up from Level 1 to Level 5. Tighter room entry requirements restrict advanced rooms until players level up.
* **Dynamic Scoring**: Score multipliers awarded based on speed of completion and accuracy (correct answers on first try).
* **Interactive Badge Gallery**: 10 distinct security badges (e.g., *Phishing Spotter*, *Password Guru*, *Crypto Specialist*, *AI Sentinel*) unlocked dynamically upon room completion.
* **Live Global Leaderboard**: Real-time high-score ranking querying the database, allowing players to view where they stand compared to global speedrunners.
* **Classroom Telemetry Table**: Real-time classmate ranking table that updates live when players link to the same classroom code.

---

## 📄 4. Final Project Documentation Reference

All technical specifications, data schemas, architectures, and instructions are fully updated inside your repository:
* **README.md**: Main user setup guide, folder structure directory, live play badges, and technology stack definitions.
* **PRD.md**: Full Product Requirements Document detailing objectives, target audience metrics, user stories, security/compliance parameters, and mapping specs.
