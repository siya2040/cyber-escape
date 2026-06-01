/* ==========================================================================
   CYBER ESCAPE - CORE GAME CONTROLLER & STATE ENGINE
   Manages player progress, SPA routing, timers, badges, and highscores.
   ========================================================================== */

(function() {
  // Main Game State Manager
  const CyberGame = {
    // Player Profile Data
    state: {
      username: "GUEST_PLAYER",
      level: 1,
      xp: 0,
      maxXp: 500,
      score: 0,
      completedRooms: [],
      badges: [],
      roomTimes: {},
      currentActiveRoom: null,
      
      // Timer states
      timerActive: false,
      startTime: 0,
      elapsedTime: 0,
      timerIntervalId: null,
      
      // Classroom linkage
      classroomLinked: false,
      classroomCode: ""
    },

    // Badges definitions
    badgeDefinitions: {
      1: { name: "Phishing Spotter", icon: "🎣", desc: "Audit incoming inboxes for social engineering and domain spoofing leaks." },
      2: { name: "Password Guru", icon: "🔑", desc: "Construct multi-entropy password barriers that bypass brute-force cracking speeds." },
      3: { name: "Crypto Specialist", icon: "🛡️", desc: "Bypass corporate ciphers using offset sliders and Caesar decryption matrices." }
    },

    // Seed data for the global highscore leaderboards
    leaderboardData: [
      { rank: 1, name: "NeoHacker", lvl: 4, cleared: "3 / 10", time: "01:22.45", score: 2450 },
      { rank: 2, name: "CipherQueen", lvl: 3, cleared: "3 / 10", time: "01:45.10", score: 1980 },
      { rank: 3, name: "RootAccess", lvl: 2, cleared: "2 / 10", time: "02:12.30", score: 1540 },
      { rank: 4, name: "SimbaSentry", lvl: 2, cleared: "2 / 10", time: "02:40.85", score: 1350 },
      { rank: 5, name: "BufferBuster", lvl: 1, cleared: "1 / 10", time: "00:54.12", score: 850 }
    ],

    /**
     * Boot up the game engines and hook navigation clicks
     */
    init: function() {
      // Check for active session and restore
      const activeUser = this.getActiveSession();
      const profiles = this.loadProfiles();
      
      if (activeUser && profiles[activeUser]) {
        const prof = profiles[activeUser];
        this.state.username = activeUser;
        this.state.level = prof.level || 1;
        this.state.xp = prof.xp || 0;
        this.state.maxXp = prof.maxXp || 500;
        this.state.score = prof.score || 0;
        this.state.completedRooms = prof.completedRooms || [];
        this.state.badges = prof.badges || [];
        this.state.roomTimes = prof.roomTimes || {};
        this.state.classroomLinked = prof.classroomLinked || false;
        this.state.classroomCode = prof.classroomCode || "";
        
        // Auto-route to map hub on active session restoration
        setTimeout(() => {
          this.switchView("map");
        }, 100);
      }

      // 1. Core Event Listeners & Buttons
      this.bindNavigation();
      this.bindAuthEvents();
      this.bindLogoutEvent();
      this.bindCrtToggle();
      this.bindMobileDrawer();
      this.bindClassroomEvents();
      this.bindDebriefEvents();

      // 2. Initialize Sub-modules
      if (window.CyberPuzzles) {
        window.CyberPuzzles.init();
      }

      // Hook the request hint button to the active puzzle hint
      const hintBtn = document.getElementById("requestHintBtn");
      if (hintBtn) {
        hintBtn.addEventListener("click", () => {
          if (window.CyberPuzzles) {
            window.CyberPuzzles.triggerHint();
          }
        });
      }

      // 3. Render base components
      this.updateLandingAuthState();
      this.updateHud();
      this.renderLeaderboard();
      
      // Auto-toggle Scanline overlays on bootup
      document.body.classList.add("scanlines-active");
    },

    /* ==========================================================================
       ROUTING & NAV CHUNKS
       ========================================================================== */
    switchView: function(viewId) {
      // Hide all panels, activate targeted ID
      const views = document.querySelectorAll(".game-view");
      views.forEach(view => {
        view.classList.remove("active");
        if (view.id === `view-${viewId}`) {
          view.classList.add("active");
        }
      });

      // Update sidebar nav active tags
      const navButtons = document.querySelectorAll(".nav-btn");
      navButtons.forEach(btn => {
        if (btn.getAttribute("data-view") === viewId) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });

      // Force close mobile drawer if open
      document.body.classList.remove("menu-open");

      // Handle custom panel load triggers
      if (viewId === "profile") {
        this.updateProfileTab();
      } else if (viewId === "leaderboard") {
        this.renderLeaderboard();
      } else if (viewId === "map") {
        this.updateMapStates();
      } else if (viewId === "landing") {
        this.updateLandingAuthState();
      }
    },

    bindNavigation: function() {
      const navButtons = document.querySelectorAll(".nav-btn");
      navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
          const targetView = btn.getAttribute("data-view");
          if (!targetView) return; // Prevent navigation on buttons without defined view target (e.g. Logout)
          
          // Block room access from direct clicks unless selected via map
          if (targetView === "room" && !this.state.currentActiveRoom) {
            this.switchView("map");
            return;
          }
          
          this.switchView(targetView);
        });
      });
    },

    bindMobileDrawer: function() {
      const menuToggle = document.getElementById("menuToggle");
      const backdrop = document.getElementById("sidebarBackdrop");

      if (menuToggle && backdrop) {
        menuToggle.addEventListener("click", () => {
          document.body.classList.toggle("menu-open");
        });

        backdrop.addEventListener("click", () => {
          document.body.classList.remove("menu-open");
        });
      }
    },

    bindCrtToggle: function() {
      const crtBtn = document.getElementById("crtToggleBtn");
      if (crtBtn) {
        crtBtn.addEventListener("click", () => {
          const active = document.body.classList.toggle("scanlines-active");
          if (active) {
            crtBtn.classList.remove("inactive");
          } else {
            crtBtn.classList.add("inactive");
          }
        });
      }
    },

    /* ==========================================================================
       LOGIN & PROFILE STATES
       ========================================================================== */
    /* ==========================================================================
       LOCALSTORAGE PERSISTENCE HELPERS
       ========================================================================== */
    loadProfiles: function() {
      try {
        const data = localStorage.getItem("cyber_escape_profiles");
        return data ? JSON.parse(data) : {};
      } catch (e) {
        console.error("Failed to parse local cyber escape profiles:", e);
        return {};
      }
    },

    saveProfiles: function(profiles) {
      try {
        localStorage.setItem("cyber_escape_profiles", JSON.stringify(profiles));
      } catch (e) {
        console.error("Failed to save local cyber escape profiles:", e);
      }
    },

    getActiveSession: function() {
      return localStorage.getItem("cyber_escape_active_session");
    },

    setActiveSession: function(username) {
      localStorage.setItem("cyber_escape_active_session", username);
    },

    clearActiveSession: function() {
      localStorage.removeItem("cyber_escape_active_session");
    },

    saveCurrentProgress: function() {
      const username = this.state.username;
      if (!username || username === "GUEST_PLAYER" || username === "SPECIALIST_GUEST") {
        return; // Don't persist guest progress
      }
      
      const profiles = this.loadProfiles();
      if (!profiles[username]) {
        profiles[username] = {};
      }
      
      profiles[username].level = this.state.level;
      profiles[username].xp = this.state.xp;
      profiles[username].maxXp = this.state.maxXp;
      profiles[username].score = this.state.score;
      profiles[username].completedRooms = this.state.completedRooms;
      profiles[username].badges = this.state.badges;
      profiles[username].roomTimes = this.state.roomTimes;
      profiles[username].classroomLinked = this.state.classroomLinked;
      profiles[username].classroomCode = this.state.classroomCode;
      
      this.saveProfiles(profiles);
    },

    /* ==========================================================================
       LOGIN, REGISTRATION, & LOGOUT ACTIONS
       ========================================================================== */
    bindAuthEvents: function() {
      const loginBtn = document.getElementById("loginBtn");
      const registerBtn = document.getElementById("registerBtn");
      const guestBtn = document.getElementById("guestPlayBtn");
      const usernameInput = document.getElementById("usernameInput");
      const passwordInput = document.getElementById("passwordInput");

      if (usernameInput && passwordInput) {
        // SIGN IN
        if (loginBtn) {
          loginBtn.addEventListener("click", () => {
            const userVal = usernameInput.value.trim().toUpperCase();
            const passVal = passwordInput.value.trim();

            if (userVal.length === 0 || passVal.length === 0) {
              const msg = `"Access Denied! Meow! Both a hacker codename and secure passcode are required to initialize your identity node."`;
              if (window.CyberPuzzles && typeof window.CyberPuzzles.updateSimbaDialog === "function") {
                window.CyberPuzzles.updateSimbaDialog(msg, "warn");
              }
              const landingDialogue = document.getElementById("landingDialogue");
              if (landingDialogue) landingDialogue.innerHTML = msg;
              return;
            }

            const profiles = this.loadProfiles();
            const prof = profiles[userVal];

            if (!prof) {
              const msg = `"Authentication failure: Hacker codename not found in database!"`;
              if (window.CyberPuzzles && typeof window.CyberPuzzles.updateSimbaDialog === "function") {
                window.CyberPuzzles.updateSimbaDialog(msg, "error");
              }
              const landingDialogue = document.getElementById("landingDialogue");
              if (landingDialogue) landingDialogue.innerHTML = msg;
              return;
            }

            if (prof.passcode !== passVal) {
              const msg = `"Authentication failure: Invalid decryption credentials!"`;
              if (window.CyberPuzzles && typeof window.CyberPuzzles.updateSimbaDialog === "function") {
                window.CyberPuzzles.updateSimbaDialog(msg, "error");
              }
              const landingDialogue = document.getElementById("landingDialogue");
              if (landingDialogue) landingDialogue.innerHTML = msg;
              return;
            }

            // Restore player progress states
            this.state.username = userVal;
            this.state.level = prof.level || 1;
            this.state.xp = prof.xp || 0;
            this.state.maxXp = prof.maxXp || 500;
            this.state.score = prof.score || 0;
            this.state.completedRooms = prof.completedRooms || [];
            this.state.badges = prof.badges || [];
            this.state.roomTimes = prof.roomTimes || {};
            this.state.classroomLinked = prof.classroomLinked || false;
            this.state.classroomCode = prof.classroomCode || "";

            this.setActiveSession(userVal);
            this.loginSuccess(false);
          });
        }

        // REGISTER
        if (registerBtn) {
          registerBtn.addEventListener("click", () => {
            const userVal = usernameInput.value.trim().toUpperCase();
            const passVal = passwordInput.value.trim();

            if (userVal.length === 0 || passVal.length === 0) {
              const msg = `"Access Denied! Meow! Both a hacker codename and secure passcode are required to initialize your identity node."`;
              if (window.CyberPuzzles && typeof window.CyberPuzzles.updateSimbaDialog === "function") {
                window.CyberPuzzles.updateSimbaDialog(msg, "warn");
              }
              const landingDialogue = document.getElementById("landingDialogue");
              if (landingDialogue) landingDialogue.innerHTML = msg;
              return;
            }

            if (userVal === "GUEST_PLAYER" || userVal === "SPECIALIST_GUEST") {
              const msg = `"Access Denied! 😾 Codename is reserved for guest sessions. Please choose another unique codename!"`;
              if (window.CyberPuzzles && typeof window.CyberPuzzles.updateSimbaDialog === "function") {
                window.CyberPuzzles.updateSimbaDialog(msg, "error");
              }
              const landingDialogue = document.getElementById("landingDialogue");
              if (landingDialogue) landingDialogue.innerHTML = msg;
              return;
            }

            const profiles = this.loadProfiles();
            if (profiles[userVal]) {
              const msg = `"Codename override detected! 😾 This hacker ID is already registered in our active database. Please sign in instead!"`;
              if (window.CyberPuzzles && typeof window.CyberPuzzles.updateSimbaDialog === "function") {
                window.CyberPuzzles.updateSimbaDialog(msg, "alert");
              }
              const landingDialogue = document.getElementById("landingDialogue");
              if (landingDialogue) landingDialogue.innerHTML = msg;
              return;
            }

            // Create new hacker profile
            profiles[userVal] = {
              passcode: passVal,
              level: 1,
              xp: 0,
              maxXp: 500,
              score: 0,
              completedRooms: [],
              badges: [],
              roomTimes: {},
              classroomLinked: false,
              classroomCode: ""
            };

            this.saveProfiles(profiles);

            // Log in instantly
            this.state.username = userVal;
            this.state.level = 1;
            this.state.xp = 0;
            this.state.maxXp = 500;
            this.state.score = 0;
            this.state.completedRooms = [];
            this.state.badges = [];
            this.state.roomTimes = {};
            this.state.classroomLinked = false;
            this.state.classroomCode = "";

            this.setActiveSession(userVal);
            this.loginSuccess(true);
          });
        }
      }

      if (guestBtn) {
        guestBtn.addEventListener("click", () => {
          this.state.username = "SPECIALIST_GUEST";
          this.state.level = 1;
          this.state.xp = 0;
          this.state.maxXp = 500;
          this.state.score = 0;
          this.state.completedRooms = [];
          this.state.badges = [];
          this.state.roomTimes = {};
          this.state.classroomLinked = false;
          this.state.classroomCode = "";
          
          this.loginSuccess(false);
        });
      }
    },

    bindLogoutEvent: function() {
      const logoutBtn = document.getElementById("navBtnLogout");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          // Save current progress before logging out
          this.saveCurrentProgress();

          // Wipe active session
          this.clearActiveSession();

          // Wipe state back to default guest parameters
          this.state.username = "GUEST_PLAYER";
          this.state.level = 1;
          this.state.xp = 0;
          this.state.maxXp = 500;
          this.state.score = 0;
          this.state.completedRooms = [];
          this.state.badges = [];
          this.state.roomTimes = {};
          this.state.classroomLinked = false;
          this.state.classroomCode = "";

          // Clear auth inputs
          const usernameInput = document.getElementById("usernameInput");
          const passwordInput = document.getElementById("passwordInput");
          if (usernameInput) usernameInput.value = "";
          if (passwordInput) passwordInput.value = "";

          // Render updates
          this.updateHud();
          this.renderLeaderboard();

          // Switch to landing splash view
          this.switchView("landing");

          // Reset dialogue
          const landingDialogue = document.getElementById("landingDialogue");
          if (landingDialogue) {
            landingDialogue.innerHTML = `"Initializing firewall overrides... System bypass offline. Meow! I need a cyber specialist to help me patch these mainframe locks. Will you start your escape?"`;
          }

          // Reset Simba's visor color back to normal (cyan)
          if (window.CyberPuzzles && typeof window.CyberPuzzles.updateSimbaDialog === "function") {
            window.CyberPuzzles.updateSimbaDialog("", "normal");
          }

          alert("Session disconnected. Progress saved successfully!");
        });
      }
    },

    loginSuccess: function(isNewRegistration = false) {
      this.updateLandingAuthState();
      this.updateHud();
      this.renderLeaderboard();
      
      // Update dialogue greeting
      const landingDialogue = document.getElementById("landingDialogue");
      const msg = isNewRegistration
        ? `"Identity node successfully registered! 😻 Welcome to the team, specialist ${this.state.username}. Establishing connection protocols..."`
        : `"Identity node compiled successfully! Meow! Specialist ${this.state.username} linked to escape servers. Loading City Map Hub..."`;
      
      if (landingDialogue) {
        landingDialogue.innerHTML = msg;
      }

      if (window.CyberPuzzles && typeof window.CyberPuzzles.updateSimbaDialog === "function") {
        window.CyberPuzzles.updateSimbaDialog(msg, "happy");
      }
      
      setTimeout(() => {
        this.switchView("map");
      }, 1200);
    },

    updateLandingAuthState: function() {
      const authCard = document.getElementById("landingAuthCard");
      if (!authCard) return;
      
      const username = this.state.username;
      
      if (username && username !== "GUEST_PLAYER" && username !== "SPECIALIST_GUEST") {
        // Logged in mode - show access granted & dynamic navigation/logout buttons
        authCard.innerHTML = `
          <h3 class="font-heading text-pink" style="margin-bottom:12px; text-align:center;">SESSION ACCESS GRANTED</h3>
          <p class="text-green text-center font-heading" style="font-size:14px; margin-bottom:16px; letter-spacing: 1px;">&gt;_ SPECIALIST ${username} ONLINE</p>
          <button class="cyber-btn border-cyan glow-cyan" style="width:100%; margin-bottom:12px;" id="landingGoToMapBtn">PROCEED TO MAP HUB</button>
          <button class="cyber-btn border-red glow-red" style="width:100%;" id="landingLogoutBtn">TERMINATE SESSION</button>
        `;
        
        // Bind events for these dynamic buttons
        const goToMapBtn = document.getElementById("landingGoToMapBtn");
        if (goToMapBtn) {
          goToMapBtn.addEventListener("click", () => {
            this.switchView("map");
          });
        }
        
        const logoutBtn = document.getElementById("landingLogoutBtn");
        if (logoutBtn) {
          logoutBtn.addEventListener("click", () => {
            const sidebarLogout = document.getElementById("navBtnLogout");
            if (sidebarLogout) {
              sidebarLogout.click(); // Trigger the standard logout flow
            }
          });
        }
      } else {
        // Logged out / guest mode: restore original auth inputs
        authCard.innerHTML = `
          <h3 class="font-heading text-pink" style="margin-bottom:12px; text-align:center;">INITIATE IDENTITY NODE</h3>
          
          <div class="form-group" style="margin-bottom:12px; text-align:left;">
            <label class="terminal-label" for="usernameInput">HACKER CODENAME:</label>
            <input type="text" id="usernameInput" class="custom-input" placeholder="Enter codename (e.g. NEO)..." maxlength="12" />
          </div>
          
          <div class="form-group" style="margin-bottom:16px; text-align:left;">
            <label class="terminal-label" for="passwordInput">SECURITY PASSCODE:</label>
            <input type="password" id="passwordInput" class="custom-input" placeholder="Enter password passcode..." maxlength="16" />
          </div>
          
          <div class="flex-row" style="margin-bottom:12px; width: 100%;">
            <button class="cyber-btn border-green glow-green flex-1" id="loginBtn">SIGN IN</button>
            <button class="cyber-btn border-pink glow-pink flex-1" id="registerBtn">REGISTER</button>
          </div>
          
          <div class="divider" style="margin: 8px 0 12px;"></div>
          <button class="cyber-btn border-cyan" style="width:100%;" id="guestPlayBtn">PLAY AS GUEST</button>
        `;
        
        // Re-bind the auth event listeners since the nodes were recreated
        this.bindAuthEvents();
      }
    },

    updateHud: function() {
      // Sidebar Text
      document.getElementById("sidebarUsername").textContent = this.state.username;
      
      // Sidebar Rank label
      let rank = "CYBER_CADET";
      if (this.state.level >= 2) rank = "SECURITY_SPECIALIST";
      if (this.state.level >= 3) rank = "MAINFRAME_CRACKER";
      document.getElementById("sidebarRank").textContent = rank;
      document.getElementById("sidebarRank").className = `badge ${this.state.level >= 3 ? "tag-pink" : (this.state.level >= 2 ? "tag-amber" : "tag-cyan")}`;

      // HUD Stats
      document.getElementById("hudLevelVal").textContent = this.state.level;
      document.getElementById("hudScoreVal").textContent = String(this.state.score).padStart(5, '0');
      document.getElementById("hudXpVal").textContent = `${this.state.xp} / ${this.state.maxXp} XP`;
      
      const xpPercent = Math.min((this.state.xp / this.state.maxXp) * 100, 100);
      document.getElementById("hudXpBar").style.width = `${xpPercent}%`;
    },

    /* ==========================================================================
       MAP STATES & ROOM TRIGGERS
       ========================================================================== */
    updateMapStates: function() {
      const nodes = document.querySelectorAll(".map-node");
      nodes.forEach(node => {
        const roomNum = parseInt(node.getAttribute("data-room"));
        if (!roomNum) return; // Locked dummy nodes

        const isCleared = this.state.completedRooms.includes(roomNum);
        const statusEl = node.querySelector(".node-status");
        
        if (isCleared) {
          node.className = "map-node node-active cleared";
          if (statusEl) {
            statusEl.textContent = "COMPLETED";
            statusEl.className = "node-status text-green";
          }
        }
      });

      // Update mock locked nodes based on Level
      const lockedNode4 = document.getElementById("roomNode4");
      const lockedNode5 = document.getElementById("roomNode5");
      
      if (this.state.level >= 2) {
        if (lockedNode4) {
          lockedNode4.className = "map-node node-locked-ready";
          lockedNode4.querySelector(".node-status").textContent = "LEVEL 2 PASS - DECRYPTING SECTOR...";
          lockedNode4.querySelector(".node-status").className = "node-status text-amber";
        }
        if (lockedNode5) {
          lockedNode5.className = "map-node node-locked-ready";
          lockedNode5.querySelector(".node-status").textContent = "LEVEL 2 PASS - DECRYPTING SECTOR...";
          lockedNode5.querySelector(".node-status").className = "node-status text-amber";
        }
      }
      
      // Bind Room launch events to active nodes
      const playableNodes = document.querySelectorAll(".node-active");
      playableNodes.forEach(node => {
        node.replaceWith(node.cloneNode(true)); // Wipe old bindings
      });

      // Re-query and bind clicks
      document.querySelectorAll(".node-active").forEach(node => {
        node.addEventListener("click", () => {
          const room = parseInt(node.getAttribute("data-room"));
          this.enterRoom(room);
        });
      });
      
      // Bind warning displays to locked elements
      document.querySelectorAll(".node-locked").forEach(node => {
        node.addEventListener("click", () => {
          alert(`Mainframe Access Denied! 😾 This sector requires higher administrative ranks. Earn XP in playable rooms to level up!`);
        });
      });
    },

    enterRoom: function(roomNum) {
      this.state.currentActiveRoom = roomNum;
      
      // Update HUD Labels in room
      const roomNumLabel = document.getElementById("roomNumberLabel");
      const roomTitleLabel = document.getElementById("roomTitleLabel");
      
      let titles = {
        1: "Phishing Firewall",
        2: "Password Crypt",
        3: "Cipher Console"
      };

      if (roomNumLabel) roomNumLabel.textContent = `ROOM 0${roomNum}`;
      if (roomTitleLabel) roomTitleLabel.textContent = titles[roomNum] || "Cyber Lock";
      
      this.switchView("room");
      
      // Start Interactive puzzle logic
      if (window.CyberPuzzles) {
        window.CyberPuzzles.startPuzzle(roomNum, () => {
          this.completeCurrentRoom();
        });
      }
      
      // Boot up running timer
      this.startRoomTimer();
    },

    /* ==========================================================================
       ROOM TIMER ACTIONS
       ========================================================================== */
    startRoomTimer: function() {
      this.stopRoomTimer();
      
      this.state.startTime = Date.now();
      this.state.elapsedTime = 0;
      this.state.timerActive = true;
      
      const timerEl = document.getElementById("gameTimer");
      if (timerEl) timerEl.textContent = "00:00.00";
      
      this.state.timerIntervalId = setInterval(() => {
        this.state.elapsedTime = Date.now() - this.state.startTime;
        this.updateTimerDisplay();
      }, 50);
    },

    stopRoomTimer: function() {
      if (this.state.timerIntervalId) {
        clearInterval(this.state.timerIntervalId);
        this.state.timerIntervalId = null;
      }
      this.state.timerActive = false;
    },

    updateTimerDisplay: function() {
      const timerEl = document.getElementById("gameTimer");
      if (!timerEl) return;
      
      timerEl.textContent = this.formatTime(this.state.elapsedTime);
    },

    formatTime: function(ms) {
      let totalSeconds = Math.floor(ms / 1000);
      let minutes = Math.floor(totalSeconds / 60);
      let seconds = totalSeconds % 60;
      let centiseconds = Math.floor((ms % 1000) / 10);
      
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
    },

    /* ==========================================================================
       ROOM COMPLETION OVERLAYS
       ========================================================================== */
    completeCurrentRoom: function() {
      this.stopRoomTimer();
      const activeRoom = this.state.currentActiveRoom;
      
      // Record states
      const formattedTime = this.formatTime(this.state.elapsedTime);
      this.state.roomTimes[activeRoom] = formattedTime;
      
      if (!this.state.completedRooms.includes(activeRoom)) {
        this.state.completedRooms.push(activeRoom);
      }
      
      const badgeObj = this.badgeDefinitions[activeRoom];
      if (badgeObj && !this.state.badges.includes(badgeObj.name)) {
        this.state.badges.push(badgeObj.name);
      }
      
      // Render debrief data
      const debriefTime = document.getElementById("debriefTime");
      const debriefBadge = document.getElementById("debriefBadgeName");
      const debriefEquiv = document.getElementById("debriefEquivalence");
      
      if (debriefTime) debriefTime.textContent = formattedTime;
      if (debriefBadge) debriefBadge.textContent = badgeObj ? badgeObj.name : "None";
      
      const equivTexts = {
        1: "Phishing emails target psychological response mechanisms rather than network protocols. Spotting domain mismatches, urgency triggers, and suspicious hyperlinks aligns with CompTIA Security+ Domain 1.1 (Threats, Attacks, & Vulnerabilities) and standard corporate defense audits!",
        2: "Brute-force password security relies heavily on character combinations and key entropy. Standard multi-character combinations scale password entropy exponentially, ensuring real-world protection aligned with NIST Special Publication 800-63B guidelines!",
        3: "Decryption offsets and substitution ciphers form the foundational basis of modern asymmetric cryptographic principles. Understanding how shift rotations alter plaintexts directly maps to Security+ Domain 2.8 (Cryptography Concepts) and historical cybersecurity models!"
      };
      
      if (debriefEquiv) debriefEquiv.textContent = equivTexts[activeRoom] || "";
      
      // Save stats to update XP/HUD and persist progress locally
      this.updateHud();
      this.saveCurrentProgress();
      
      // Transition to Debrief Card
      this.switchView("debrief");
    },

    bindDebriefEvents: function() {
      const returnMapBtn = document.getElementById("debriefReturnMapBtn");
      const downloadCertBtn = document.getElementById("debriefShareBadgeBtn");
      
      if (returnMapBtn) {
        returnMapBtn.addEventListener("click", () => {
          this.state.currentActiveRoom = null;
          this.switchView("map");
        });
      }
      
      if (downloadCertBtn) {
        downloadCertBtn.addEventListener("click", () => {
          const room = this.state.currentActiveRoom;
          const badge = this.badgeDefinitions[room];
          
          if (badge) {
            alert(`--- CYBER ESCAPE COMPLETION NODE ---
Hacker Codename: ${this.state.username}
Badge Conferred: ${badge.name} (${badge.icon})
Cleared Time: ${this.state.roomTimes[room] || "00:00.00"}
System Level: Level ${this.state.level}
Status: 100% SECURED BY SIMBA THE CAT! 😻
---------------------------------------`);
          }
        });
      }
    },

    /* ==========================================================================
       XP PROGRESSION CALCULATORS
       ========================================================================== */
    addScore: function(points) {
      this.state.score = Math.max(0, this.state.score + points);
      this.updateHud();
      this.saveCurrentProgress();
    },

    addXp: function(amount) {
      this.state.xp += amount;
      
      // Level Up checks
      if (this.state.xp >= this.state.maxXp) {
        this.state.xp -= this.state.maxXp;
        this.state.level += 1;
        this.state.maxXp += 250; // Scaling complexity
        
        // Level up trigger dialog alert
        setTimeout(() => {
          alert(`LEVEL UP! 😻 Specialist ${this.state.username} has reached System Level ${this.state.level}! Locked sectors 04 & 05 have been unlocked for decryption. Simba is proud of your progress!`);
          this.updateHud();
          this.saveCurrentProgress();
        }, 800);
      }
      this.updateHud();
      this.saveCurrentProgress();
    },

    /* ==========================================================================
       PROFILE & ACHIEVEMENTS PORTALS
       ========================================================================== */
    updateProfileTab: function() {
      // 1. Text elements
      document.getElementById("profileUsername").textContent = this.state.username;
      
      let rank = "CYBER_CADET";
      if (this.state.level >= 2) rank = "SECURITY_SPECIALIST";
      if (this.state.level >= 3) rank = "MAINFRAME_CRACKER";
      document.getElementById("profileRank").textContent = rank;
      
      document.getElementById("profileTotalXp").textContent = `${this.state.xp} / ${this.state.maxXp} XP (Level ${this.state.level})`;
      document.getElementById("profileCompletedCount").textContent = `${this.state.completedRooms.length} / 10 Escape Rooms`;
      document.getElementById("profileHighscore").textContent = String(this.state.score).padStart(5, '0');

      // 2. Badges unlocks
      this.state.completedRooms.forEach(roomNum => {
        const badgeCard = document.getElementById(`badgeItem${roomNum}`);
        if (badgeCard) {
          badgeCard.classList.remove("locked");
          const dateEl = badgeCard.querySelector(".badge-date");
          if (dateEl && dateEl.textContent === "LOCKED") {
            dateEl.textContent = `UNLOCKED: ${this.state.roomTimes[roomNum] || "PASSED"}`;
            dateEl.className = "badge-date text-green";
          }
        }
      });
    },

    /* ==========================================================================
       MOCK LEADERBOARD ENGINE
       ========================================================================== */
    renderLeaderboard: function() {
      const tbody = document.getElementById("leaderboardBody");
      if (!tbody) return;
      
      tbody.innerHTML = "";
      
      // Build updated rankings list including player and other registered profiles
      let recordsList = [...this.leaderboardData];
      
      // Load all other registered profiles
      const profiles = this.loadProfiles();
      Object.keys(profiles).forEach(user => {
        // Skip current player since we add them separately with "(YOU)"
        if (user === this.state.username) return;
        
        const prof = profiles[user];
        if (prof.score > 0 || prof.completedRooms.length > 0) {
          recordsList.push({
            name: user,
            lvl: prof.level || 1,
            cleared: `${(prof.completedRooms || []).length} / 10`,
            time: Object.values(prof.roomTimes || {})[0] || "--:--.--",
            score: prof.score || 0,
            isPlayer: false
          });
        }
      });
      
      const playerRecord = {
        name: `${this.state.username} (YOU)`,
        lvl: this.state.level,
        cleared: `${this.state.completedRooms.length} / 10`,
        time: Object.values(this.state.roomTimes)[0] || "--:--.--",
        score: this.state.score,
        isPlayer: true
      };

      // Add player if they have completed a room or have points
      if (this.state.score > 0 || this.state.completedRooms.length > 0) {
        recordsList.push(playerRecord);
      }

      // Sort by score (descending)
      recordsList.sort((a, b) => b.score - a.score);
      
      // Render
      recordsList.forEach((entry, idx) => {
        const row = document.createElement("tr");
        if (entry.isPlayer) {
          row.className = "highlighted";
        }
        
        row.innerHTML = `
          <td class="font-heading ${idx < 3 ? 'text-pink' : ''}">${idx + 1}</td>
          <td class="${entry.isPlayer ? 'text-cyan' : 'text-white'}">${entry.name}</td>
          <td>${entry.lvl}</td>
          <td>${entry.cleared}</td>
          <td class="font-heading text-amber">${entry.time}</td>
          <td class="font-heading text-green">${entry.score}</td>
        `;
        
        tbody.appendChild(row);
      });
    },

    /* ==========================================================================
       MOCK CLASSROOM SYLLABUS LINKS
       ========================================================================== */
    bindClassroomEvents: function() {
      const joinBtn = document.getElementById("joinClassBtn");
      const codeInput = document.getElementById("classCodeInput");
      const statusEl = document.getElementById("activeClassStatus");
      
      if (joinBtn && codeInput && statusEl) {
        joinBtn.addEventListener("click", () => {
          const val = codeInput.value.trim().toUpperCase();
          if (val.length > 0) {
            this.state.classroomLinked = true;
            this.state.classroomCode = val;
            
            statusEl.innerHTML = `Linked connection active: Connected to <strong class="text-green">${val}</strong>! Simba is issuing decryption telemetry files directly to your educator console!`;
            statusEl.className = "active-class-status text-green";
            
            // Give a join bonus
            this.addXp(100);
            this.addScore(250);
            
            alert(`Syllabus Link Established! 😻 Connected directly to instructor group '${val}'. Decryption telemetry pipelines activated! Received +100 XP and +250 XP bonus!`);
            codeInput.value = "";
          } else {
            alert("Security error: Educator node code is invalid!");
          }
        });
      }
    }
  };

  // Register on window object
  window.CyberGame = CyberGame;

  // Boot up when browser has finished drawing indices
  document.addEventListener("DOMContentLoaded", () => {
    CyberGame.init();
  });
})();
