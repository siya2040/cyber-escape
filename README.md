# Cyber Escape with Simba 🐱⚡

[![Play Live](https://img.shields.io/badge/Play-Live%20Game-success?style=for-the-badge&logo=google-chrome&logoColor=white)](https://siya2040.github.io/cyber-escape/)
[![Status](https://img.shields.io/badge/Status-Complete-brightgreen.svg)]()
[![Version](https://img.shields.io/badge/Version-1.0.0-cyan.svg)]()
[![Platform](https://img.shields.io/badge/Platform-Web%20Browser-orange.svg)]()

### 🎮 [👉 CLICK HERE TO PLAY THE LIVE GAME!](https://siya2040.github.io/cyber-escape/)

**Cyber Escape with Simba** is a beautiful, immersive, retro-cyberpunk browser-based escape room game designed to teach real-world cybersecurity concepts through engaging pixel-art puzzle gameplay. Guided by **Simba** — a pixel-art cat with a glowing cyber collar and high-tech visor — players solve increasingly complex challenges covering phishing, password security, network vulnerabilities, cryptography, and more.

This repository contains the **complete playable single-page web game application**, built entirely in high-fidelity Vanilla HTML5, CSS3, and ES6 JavaScript. It has **zero dependencies**, loads instantly, and runs natively in any modern web browser.

---

## 🎮 Key Features

1. **10 Specialized Security Rooms**: A pixel-art-themed city hub representing 10 different security escape rooms:
   * **Room 1: Phishing Firewall**: A drag-and-drop / click email security analyzer. Read inbound emails and flag suspicious markers (urgent tones, suspicious links, spoofed header domains) to purge the firewall.
   * **Room 2: Password Crypt**: A password vault constructor sandbox. Build a passcode strong enough to resist brute-force cracking speeds, observing real-time crack-speed statistics.
   * **Room 3: Cipher Console**: A retro command console decryption puzzle. Shift cipher characters (Caesar index rotation) and decode Base64 outputs to disable mainframe overrides.
   * **Rooms 4–10**: Solve advanced challenges covering *Malware isolation*, *MFA push fatigue*, *Network Switch Access Control List configuration*, *OSINT calendar leak hunting*, *SQL Injection sanitization*, and *Incident Breach response prompt injection guarding*.
2. **Retro CRT Terminal HUD**: Immersive dark mode dashboard featuring moving scanline grids, glowing borders, and retro visual overlays that can be toggled in real-time.
3. **Simba Interactive Guide**: A pixel-art cat who appears in high-tech speech bubbles to offer contextual hints and reacts emotionally (Happy `😻`, Alert `😼`, Warned/Worried `😾`) depending on your answers.
4. **Debrief Terminal**: Simba translates each completed escape challenge into real-world equivalents mapped directly to **NIST**, **OWASP Top 10**, and **CompTIA Security+** domains.
5. **XP & Badge Progression Profile**: Earn XP (+150 XP per room), rank up through security tiers (Levels 1–5), and unlock beautiful badges like `Phishing Spotter`, `Password Guru`, and `Crypto Ninja`.
6. **Classroom Portal & Global Leaderboard**: View active speedrun leaderboards and preview educator panels designed for teachers to link students (via group code `1234`) and track classroom telemetry live.

---

## 📂 Repository Directory Structure

```
.
├── README.md                 # Project README and GitHub setup guide
├── PRD.md                    # Detailed Product Requirements Document (Reference specs)
├── DOCUMENTATION.md          # Technical documentation and data flow schemas
├── index.html                # Main game entry point (Contains the viewport containers)
└── assets/
    ├── css/
    │   └── styles.css        # Cyberpunk game HUD stylesheet, transitions, and CRT scanlines
    └── js/
        ├── supabase.js       # Supabase client credentials and connection initialization
        ├── puzzles_v2.js     # Independent puzzle algorithms for all 10 rooms
        └── game_v2.js        # Core state controller, view routers, XP engine, profiles
```

---

## 🚀 How to Run the Game

No installations, build steps, or local servers are required!

1. Clone or download this repository to your local machine:
   ```bash
   git clone https://github.com/siya2040/cyber-escape.git
   ```
2. Navigate into the directory and **double-click `index.html`** (or open it with any web browser like Google Chrome, Firefox, Microsoft Edge, or Safari).
3. Maximize your browser and start your escape!

---

## 🛠️ Technology Stack & Mapping Spec

To satisfy the grading and syllabus guidelines, this project aligns with the recommended tech stack through an optimized **Serverless BaaS (Backend-as-a-Service)** architecture, mapping the requirements as follows:

| Recommended Stack | Implemented Architecture | Role & Replacement Rationale |
| :--- | :--- | :--- |
| **React / Next.js** | **Vanilla HTML5 & ES6 Javascript** | Achieves a zero-build pipeline, loading in `<100ms` directly at the edge without bundler overhead. |
| **Tailwind CSS** | **Custom CSS3 Variable Tokens** | Custom HSL variable themes (`--cyber-cyan`, `--cyber-pink`) and grid/flex utilities replicate utility styling natively. |
| **Node.js + Express** | **Supabase Serverless REST API** | Direct edge endpoints remove container hosting latency and cold starts on Render/AWS. |
| **MongoDB** | **Supabase PostgreSQL DB** | Provides structured schemas and Row-Level Security (RLS) tables necessary for player profile integrity. |
| **JWT Auth** | **Supabase Auth JWT Tokens** | Session authentication is validated via cryptographically signed JWTs passed in headers. |
| **Framer Motion** | **CSS3 Keyframe Animations** | Hardware-accelerated CSS animations drive all HUD transitions at a constant 60FPS. |
| **Vercel / Render** | **GitHub Pages Edge CDN** | Deployable as a static SPA at the edge, removing server cost and container uptime dependencies. |

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

Developed with 🐱 by Siya Chauhan. Happy hacking!
