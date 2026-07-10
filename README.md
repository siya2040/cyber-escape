# Cyber Escape with Simba 🐱⚡

[![Play Live](https://img.shields.io/badge/Play-Live%20Game-success?style=for-the-badge&logo=google-chrome&logoColor=white)](https://siya2040.github.io/cyber-escape/)
[![Status](https://img.shields.io/badge/Status-Complete-brightgreen.svg)]()
[![Version](https://img.shields.io/badge/Version-1.0.0-cyan.svg)]()
[![Platform](https://img.shields.io/badge/Platform-Web%20Browser-orange.svg)]()

### 🎮 [👉 CLICK HERE TO PLAY THE LIVE GAME!](https://siya2040.github.io/cyber-escape/)

**Cyber Escape with Simba** is an immersive, interactive, retro-cyberpunk cybersecurity educational game. Guided by **Simba** — a cyber-cat guide with a high-tech communication visor — players decrypt mainframes, configure security policies, analyze threat scripts, and complete 10 specialized security rooms to restore the system.

Built with high-performance vanilla web technologies, the application loads instantly, persists player stats automatically using a cloud database, and features a live multi-user classroom scoreboard.

---

## 🎮 Key Features

1. **10 Specialized Security Rooms**: Fully playable security rooms teaching concepts ranging from Phishing and Strong Passwords to Encryption, Malware analysis, Multi-Factor Authentication, OSINT, and Incident Response.
2. **Retro CRT HUD Interface**: Immersive cyber dashboard featuring moving scanline overlays, glowing outlines, and a toggleable retro phosphor filter.
3. **Interactive Dialogue Engine**: Simba appears dynamically to offer context-based hints and shifts expression (Happy `😻`, Alert `😼`, Warned `😾`) depending on player actions.
4. **Persistent Progression & Leveling**: Tracks XP (+150 XP per room), levels (Levels 1–5), score, and time-completed records saved permanently.
5. **Acquirable Badges**: 10 collectable security badges (e.g., `Phishing Spotter`, `Password Guru`, `Crypto Ninja`) earned upon completing respective rooms.
6. **Classroom Telemetry Network**: Students can input an educator code (e.g., `1234`) to link their session, instantly receiving an XP bonus and populating a real-time classroom ranking table.
7. **Brave Shield / Adblocker Guard**: Built-in connection detection that handles blocked database scripts gracefully, advising players how to whitelist or switch to Guest Play.
8. **Offline Guest Mode**: Runs entirely in local memory using `localStorage` if database networks are unavailable.

---

## 📂 Repository Structure

```
.
├── README.md                 # Project information and setup guide
├── PRD.md                    # Product Requirements Document
├── index.html                # Main application viewport and interface wrappers
└── assets/
    ├── css/
    │   └── styles.css        # Dashboard styling, keyframe animations, and CRT scanlines
    └── js/
        ├── supabase.js       # Supabase client credentials and connection initialization
        ├── puzzles_v2.js     # Algorithms and logic for all 10 security rooms
        └── game_v2.js        # Core state manager, view router, and UI telemetry controllers
```

---

## 🚀 How to Run the Game

No builds, compilers, or local web servers are required!

1. Clone this repository:
   ```bash
   git clone https://github.com/siya2040/cyber-escape.git
   ```
2. Open the project folder and **double-click `index.html`** to run the game natively in your preferred web browser.

---

## 🛠️ Technology Stack

* **Frontend**: HTML5, ES6 JavaScript, and CSS3 Variable Design System (Grid, Flexbox, custom keyframes).
* **Database & Auth**: Supabase Cloud BaaS (PostgreSQL database for real-time ranking tables and session profiles).
* **Deployment**: GitHub Pages Edge CDN.
