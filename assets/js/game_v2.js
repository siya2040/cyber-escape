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
      maxXp: 300,
      totalXp: 0,
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
    roomsConfig: [
      { room: 1, title: "Phishing Firewall", accent: "var(--cyber-cyan)", glow: "rgba(0, 255, 255, 0.15)", accentClass: "text-cyan", icon: "📧", requiredLevel: 1 },
      { room: 2, title: "Password Crypt", accent: "var(--cyber-amber)", glow: "rgba(255, 170, 0, 0.15)", accentClass: "text-amber", icon: "🔑", requiredLevel: 1 },
      { room: 3, title: "Cipher Console", accent: "var(--cyber-pink)", glow: "rgba(255, 0, 255, 0.15)", accentClass: "text-pink", icon: "💻", requiredLevel: 1 },
      { room: 4, title: "Malware Lab", accent: "var(--cyber-cyan)", glow: "rgba(0, 255, 255, 0.15)", accentClass: "text-cyan", icon: "🦠", requiredLevel: 2 },
      { room: 5, title: "MFA Database", accent: "var(--cyber-pink)", glow: "rgba(255, 0, 255, 0.15)", accentClass: "text-pink", icon: "🔐", requiredLevel: 2 },
      { room: 6, title: "Network Switch", accent: "var(--cyber-cyan)", glow: "rgba(0, 255, 255, 0.15)", accentClass: "text-cyan", icon: "📡", requiredLevel: 3 },
      { room: 7, title: "OSINT Intranet", accent: "var(--cyber-amber)", glow: "rgba(255, 170, 0, 0.15)", accentClass: "text-amber", icon: "🕵️", requiredLevel: 3 },
      { room: 8, title: "Dark Web Hub", accent: "var(--cyber-pink)", glow: "rgba(255, 0, 255, 0.15)", accentClass: "text-pink", icon: "🧅", requiredLevel: 4 },
      { room: 9, title: "System Metadata", accent: "var(--cyber-cyan)", glow: "rgba(0, 255, 255, 0.15)", accentClass: "text-cyan", icon: "📜", requiredLevel: 4 },
      { room: 10, title: "Breach Response", accent: "var(--cyber-pink)", glow: "rgba(255, 0, 255, 0.15)", accentClass: "text-pink", icon: "🚨", requiredLevel: 5 }
    ],

    badgeDefinitions: {
      1: { name: "Phishing Spotter", icon: "🎣", desc: "Audit incoming inboxes for social engineering and domain spoofing leaks." },
      2: { name: "Password Guru", icon: "🔑", desc: "Construct multi-entropy password barriers that bypass brute-force cracking speeds." },
      3: { name: "Crypto Specialist", icon: "🛡️", desc: "Bypass corporate ciphers using offset sliders and Caesar decryption matrices." },
      4: { name: "Malware Analyst", icon: "🦠", desc: "Isolate trojans and kill rogue ransomware processes in quarantine terminals." },
      5: { name: "MFA Administrator", icon: "🔐", desc: "Deny social engineering push fatigue and sync dynamic hardware OTP codes." },
      6: { name: "Network Engineer", icon: "📡", desc: "Configure Access Control Lists (ACLs) to block SSH and reverse shell packet exploits." },
      7: { name: "OSINT Investigator", icon: "🕵️", desc: "Harvest leaked metadata from calendars and public blogs to rebuild target verification files." },
      8: { name: "Database Defender", icon: "🧅", desc: "Classify and sanitise inbound SQL queries to neutralize web injection payloads." },
      9: { name: "Crypto Analyst", icon: "📜", desc: "Compute Diffie-Hellman mathematical modular shared secrets to verify secure key exchanges." },
      10: { name: "AI Sentinel", icon: "🚨", desc: "Isolate prompt injection attack vectors and enforce safe LLM chat boundaries to rescue Simba." }
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
    init: async function() {
      // Check for active session and restore
      const activeUser = this.getActiveSession();
      
      if (activeUser && activeUser !== "SPECIALIST_GUEST" && activeUser !== "GUEST_PLAYER") {
        try {
          const prof = await this.loadProfile(activeUser);
          if (prof) {
            this.state.username = activeUser;
            this.state.score = prof.score || 0;
            this.state.completedRooms = prof.completedrooms || [];
            console.log("Loaded:", this.state.completedRooms);
            this.state.badges = prof.badges || [];
            this.state.roomTimes = prof.roomtimes || {};
            this.state.classroomLinked = prof.classroomlinked || false;
            this.state.classroomCode = prof.classroomcode || "";

            // Recalculate level and XP dynamically from cumulative total XP
            this.state.totalXp = this.calculateTotalXpFromLevelAndXp(prof.level || 1, prof.xp || 0);
            const stats = this.calculateLevelFromXp(this.state.totalXp);
            this.state.level = stats.level;
            this.state.xp = stats.xp;
            this.state.maxXp = stats.maxXp;
            
            // Auto-route to map hub on active session restoration
            setTimeout(() => {
              this.switchView("map");
            }, 100);
          } else {
            this.clearActiveSession();
          }
        } catch (err) {
          console.error("Failed to restore session from Supabase:", err);
          this.clearActiveSession();
        }
      } else if (activeUser === "SPECIALIST_GUEST") {
        this.state.username = "SPECIALIST_GUEST";
        this.state.level = 1;
        this.state.xp = 0;
        this.state.maxXp = 300;
        this.state.totalXp = 0;
        this.state.score = 0;
        this.state.completedRooms = [];
        console.log("Loaded:", this.state.completedRooms);
        this.state.badges = [];
        this.state.roomTimes = {};
        this.state.classroomLinked = false;
        this.state.classroomCode = "";
        
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
      await this.renderLeaderboard();
      
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
      } else if (viewId === "classroom") {
        this.updateClassroomTab();
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
    getActiveSession: function() {
      return localStorage.getItem("cyber_escape_active_session");
    },

    setActiveSession: function(username) {
      localStorage.setItem("cyber_escape_active_session", username);
    },

    clearActiveSession: function() {
      localStorage.removeItem("cyber_escape_active_session");
    },

    /**
     * Helper to load a profile from Supabase by username
     * @param {string} username 
     * @returns {Promise<Object|null>}
     */
    loadProfile: async function(username) {
      try {
        const { data, error } = await window.supabaseClient
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();
        
        if (error) {
          if (error.code === 'PGRST116') {
            // Row not found
            return null;
          }
          throw error;
        }
        return data;
      } catch (err) {
        console.error(`Failed to load profile for ${username}:`, err);
        throw err;
      }
    },

    /**
     * Helper to save/update a profile in Supabase
     * @param {Object} profile 
     * @returns {Promise<Object>}
     */
    /**
     * Helper to save/update a profile in Supabase
     * @param {Object} profile 
     * @returns {Promise<Object>}
     */
    saveProfile: async function(profile) {
      try {
        const payload = {
          xp: profile.xp,
          level: profile.level,
          score: profile.score,
          maxxp: profile.maxXp || profile.maxxp,
          completedrooms: profile.completedRooms || profile.completedrooms,
          badges: profile.badges,
          roomtimes: profile.roomTimes || profile.roomtimes,
          classroomlinked: profile.classroomLinked || profile.classroomlinked,
          classroomcode: profile.classroomCode || profile.classroomcode
        };

        console.log("Supabase saveProfile: Executing update query for user:", profile.username, "with payload:", payload);

        const { data, error } = await window.supabaseClient
          .from('profiles')
          .update(payload)
          .eq('username', profile.username)
          .select();

        console.log("Supabase saveProfile result - Data:", data, "Error:", error);

        if (error) throw error;
        return data;
      } catch (err) {
        console.error(`Failed to save profile for ${profile.username}:`, err);
        throw err;
      }
    },

    /**
     * Helper to register a new profile in Supabase
     * @param {Object} profile 
     * @returns {Promise<Object>}
     */
    registerProfile: async function(profile) {
      try {
        const payload = {
          username: profile.username,
          passcode: profile.passcode,
          xp: profile.xp || 0,
          level: profile.level || 1,
          score: profile.score || 0,
          maxxp: profile.maxXp || profile.maxxp || 500,
          completedrooms: profile.completedRooms || profile.completedrooms || [],
          badges: profile.badges || [],
          roomtimes: profile.roomTimes || profile.roomtimes || {},
          classroomlinked: profile.classroomLinked || profile.classroomlinked || false,
          classroomcode: profile.classroomCode || profile.classroomcode || ""
        };

        const { data, error } = await window.supabaseClient
          .from('profiles')
          .insert([payload])
          .select();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error(`Failed to register profile for ${profile.username}:`, err);
        throw err;
      }
    },

    /**
     * Helper to authenticate a username and passcode against Supabase
     * @param {string} username 
     * @param {string} passcode 
     * @returns {Promise<Object>}
     */
    authenticateProfile: async function(username, passcode) {
      try {
        const profile = await this.loadProfile(username);
        if (!profile) {
          return { success: false, reason: "username_not_found" };
        }
        if (profile.passcode !== passcode) {
          return { success: false, reason: "invalid_passcode" };
        }
        return { success: true, profile: profile };
      } catch (err) {
        console.error(`Authentication error for ${username}:`, err);
        throw err;
      }
    },

    saveCurrentProgress: async function() {
      const username = this.state.username;
      if (!username || username === "GUEST_PLAYER" || username === "SPECIALIST_GUEST") {
        console.log("[Progression Flow] saveCurrentProgress skipped: user is Guest or undefined.");
        return;
      }
      
      console.log("[Progression Flow] Step 3 (Persisting): saveCurrentProgress initiated for user:", username);
      
      try {
        const payload = {
          username: username,
          level: this.state.level,
          xp: this.state.xp,
          maxXp: this.state.maxXp,
          score: this.state.score,
          completedRooms: this.state.completedRooms,
          badges: this.state.badges,
          roomTimes: this.state.roomTimes,
          classroomLinked: this.state.classroomLinked,
          classroomcode: this.state.classroomCode
        };
        console.log("[Progression Flow] Step 3a (Payload): Profile payload prepared for Supabase:", payload);
        
        await this.saveProfile(payload);
        console.log("[Progression Flow] Step 3b (Persisted): Supabase database update resolved successfully.");
      } catch (err) {
        console.error("[Progression Flow] ERROR: Failed to save progress to Supabase:", err);
      }
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
          loginBtn.addEventListener("click", async () => {
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

            try {
              if (window.CyberPuzzles && typeof window.CyberPuzzles.updateSimbaDialog === "function") {
                window.CyberPuzzles.updateSimbaDialog(`"Checking database credentials... Please wait."`, "normal");
              }

              const authResult = await this.authenticateProfile(userVal, passVal);

              if (!authResult.success) {
                let msg = "";
                if (authResult.reason === "username_not_found") {
                  msg = `"Authentication failure: Hacker codename not found in database!"`;
                } else if (authResult.reason === "invalid_passcode") {
                  msg = `"Authentication failure: Invalid decryption credentials!"`;
                } else {
                  msg = `"Authentication failure: Access denied."`;
                }
                if (window.CyberPuzzles && typeof window.CyberPuzzles.updateSimbaDialog === "function") {
                  window.CyberPuzzles.updateSimbaDialog(msg, "error");
                }
                const landingDialogue = document.getElementById("landingDialogue");
                if (landingDialogue) landingDialogue.innerHTML = msg;
                return;
              }

              const prof = authResult.profile;

              // Restore player progress states
              this.state.username = userVal;
              this.state.score = prof.score || 0;
              this.state.completedRooms = prof.completedrooms || [];
              console.log("After login:", this.state.completedRooms);
              this.state.badges = prof.badges || [];
              this.state.roomTimes = prof.roomtimes || {};
              this.state.classroomLinked = prof.classroomlinked || false;
              this.state.classroomCode = prof.classroomcode || "";

              // Recalculate level and XP dynamically from cumulative total XP
              this.state.totalXp = this.calculateTotalXpFromLevelAndXp(prof.level || 1, prof.xp || 0);
              const stats = this.calculateLevelFromXp(this.state.totalXp);
              this.state.level = stats.level;
              this.state.xp = stats.xp;
              this.state.maxXp = stats.maxXp;

              this.setActiveSession(userVal);
              await this.loginSuccess(false);
            } catch (err) {
              console.error("Sign in error:", err);
              const msg = `"Database link offline! Meow! Failed to connect to identity mainframe."`;
              if (window.CyberPuzzles && typeof window.CyberPuzzles.updateSimbaDialog === "function") {
                window.CyberPuzzles.updateSimbaDialog(msg, "error");
              }
              const landingDialogue = document.getElementById("landingDialogue");
              if (landingDialogue) landingDialogue.innerHTML = msg;
            }
          });
        }

        // REGISTER
        if (registerBtn) {
          registerBtn.addEventListener("click", async () => {
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

            try {
              if (window.CyberPuzzles && typeof window.CyberPuzzles.updateSimbaDialog === "function") {
                window.CyberPuzzles.updateSimbaDialog(`"Checking username availability... Please wait."`, "normal");
              }

              const existingProfile = await this.loadProfile(userVal);
              if (existingProfile) {
                const msg = `"Codename override detected! 😾 This hacker ID is already registered in our active database. Please sign in instead!"`;
                if (window.CyberPuzzles && typeof window.CyberPuzzles.updateSimbaDialog === "function") {
                  window.CyberPuzzles.updateSimbaDialog(msg, "alert");
                }
                const landingDialogue = document.getElementById("landingDialogue");
                if (landingDialogue) landingDialogue.innerHTML = msg;
                return;
              }

              // Create new hacker profile
              const newProfile = {
                username: userVal,
                passcode: passVal,
                level: 1,
                xp: 0,
                maxXp: 300,
                score: 0,
                completedRooms: [],
                badges: [],
                roomTimes: {},
                classroomLinked: false,
                classroomCode: ""
              };

              await this.registerProfile(newProfile);

              // Log in instantly
              this.state.username = userVal;
              this.state.level = 1;
              this.state.xp = 0;
              this.state.maxXp = 300;
              this.state.totalXp = 0;
              this.state.score = 0;
              this.state.completedRooms = [];
              this.state.badges = [];
              this.state.roomTimes = {};
              this.state.classroomLinked = false;
              this.state.classroomCode = "";

              this.setActiveSession(userVal);
              await this.loginSuccess(true);
            } catch (err) {
              console.error("Registration error:", err);
              const msg = `"Database link offline! Meow! Failed to write identity node to mainframe."`;
              if (window.CyberPuzzles && typeof window.CyberPuzzles.updateSimbaDialog === "function") {
                window.CyberPuzzles.updateSimbaDialog(msg, "error");
              }
              const landingDialogue = document.getElementById("landingDialogue");
              if (landingDialogue) landingDialogue.innerHTML = msg;
            }
          });
        }
      }

      if (guestBtn) {
        guestBtn.addEventListener("click", async () => {
          this.state.username = "SPECIALIST_GUEST";
          this.state.level = 1;
          this.state.xp = 0;
          this.state.maxXp = 300;
          this.state.totalXp = 0;
          this.state.score = 0;
          this.state.completedRooms = [];
          this.state.badges = [];
          this.state.roomTimes = {};
          this.state.classroomLinked = false;
          this.state.classroomCode = "";
          
          this.setActiveSession("SPECIALIST_GUEST");
          await this.loginSuccess(false);
        });
      }
    },

    bindLogoutEvent: function() {
      const logoutBtn = document.getElementById("navBtnLogout");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
          // Save current progress before logging out
          await this.saveCurrentProgress();

          // Wipe active session
          this.clearActiveSession();

          // Wipe state back to default guest parameters
          this.state.username = "GUEST_PLAYER";
          this.state.level = 1;
          this.state.xp = 0;
          this.state.maxXp = 300;
          this.state.totalXp = 0;
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
          await this.renderLeaderboard();

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

    loginSuccess: async function(isNewRegistration = false) {
      this.updateLandingAuthState();
      this.updateHud();
      await this.renderLeaderboard();
      
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

    calculateLevelFromXp: function(totalXp) {
      let lvl = 1;
      let tempXp = totalXp;
      
      const getLimit = (l) => {
        if (l === 1) return 300;
        if (l === 2 || l === 3 || l === 4) return 400;
        return 500;
      };
      
      let currentMaxXp = getLimit(lvl);
      while (tempXp >= currentMaxXp) {
        tempXp -= currentMaxXp;
        lvl += 1;
        currentMaxXp = getLimit(lvl);
      }
      
      return {
        level: lvl,
        xp: tempXp,
        maxXp: currentMaxXp
      };
    },

    calculateTotalXpFromLevelAndXp: function(level, levelXp) {
      let total = levelXp;
      const getLimit = (l) => {
        if (l === 1) return 300;
        if (l === 2 || l === 3 || l === 4) return 400;
        return 500;
      };
      
      for (let l = 1; l < level; l++) {
        total += getLimit(l);
      }
      return total;
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
    /**
     * Single shared function to verify if a room is unlocked/accessible.
     * Relying on the player state structure synced from Supabase.
     */
    canAccessRoom: function(roomId, player) {
      const p = player || this.state;
      const lvl = p.level || 1;
      const room = this.roomsConfig.find(r => r.room === roomId);
      if (!room) return false;
      return lvl >= room.requiredLevel;
    },

    updateMapStates: function() {
      console.log("[Progression Flow] Rendering map nodes...");
      const gridEl = document.getElementById("cityMapGrid");
      if (!gridEl) return;
      
      gridEl.innerHTML = "";
      
      this.roomsConfig.forEach(cfg => {
        const isUnlocked = this.canAccessRoom(cfg.room, this.state);
        const isCleared = this.state.completedRooms.includes(cfg.room);
        
        let statusText = "LOCKED";
        let statusColorClass = "text-red";
        let nodeClass = "node-locked";
        
        if (isUnlocked) {
          if (isCleared) {
            statusText = "COMPLETED";
            statusColorClass = "text-green";
            nodeClass = "node-active cleared";
          } else {
            statusText = "ACTIVE PREVIEW";
            statusColorClass = cfg.accentClass;
            nodeClass = "node-active";
          }
        } else {
          statusText = `LOCKED [LEVEL ${cfg.requiredLevel} Required]`;
        }
        
        const card = document.createElement("div");
        card.className = `map-node ${nodeClass}`;
        card.setAttribute("data-room", cfg.room);
        card.setAttribute("style", `--card-accent: ${cfg.accent}; --card-glow: ${cfg.glow};`);
        
        const numStr = String(cfg.room).padStart(2, "0");
        
        card.innerHTML = `
          <div class="node-accent-color ${isUnlocked ? cfg.accentClass : "text-muted"}">${numStr}</div>
          <div class="node-icon">${cfg.icon}</div>
          <div class="node-name">${cfg.title}</div>
          <div class="node-status ${statusColorClass}">${statusText}</div>
        `;
        
        // Click listener
        card.addEventListener("click", () => {
          if (this.canAccessRoom(cfg.room, this.state)) {
            this.enterRoom(cfg.room);
          } else {
            alert(`Mainframe Access Denied! 😾 This sector requires higher administrative ranks. Earn XP in playable rooms to level up!`);
          }
        });
        
        gridEl.appendChild(card);
      });
      console.log("After updateMapStates:", this.state.completedRooms);
    },

    enterRoom: function(roomNum) {
      this.state.currentActiveRoom = roomNum;
      
      // Update HUD Labels in room
      const roomNumLabel = document.getElementById("roomNumberLabel");
      const roomTitleLabel = document.getElementById("roomTitleLabel");
      
      const room = this.roomsConfig.find(r => r.room === roomNum);

      if (roomNumLabel) roomNumLabel.textContent = `ROOM 0${roomNum}`;
      if (roomTitleLabel) roomTitleLabel.textContent = room ? room.title : "Cyber Lock";
      
      this.switchView("room");
      
      // Start Interactive puzzle logic
      if (roomNum >= 1 && roomNum <= 10) {
        if (window.CyberPuzzles) {
          window.CyberPuzzles.startPuzzle(roomNum, () => {
            this.completeCurrentRoom();
          });
        }
        // Boot up running timer
        this.startRoomTimer();
      } else {
        this.stopRoomTimer();
        const timerEl = document.getElementById("gameTimer");
        if (timerEl) timerEl.textContent = "OFFLINE";
        
        // Hide puzzle views since there is no puzzle
        document.querySelectorAll(".puzzle-view").forEach(el => el.classList.remove("active"));
        
        // Set dialog in Simba
        const msg = `"Sector bypass successful! 😻 Room 0${roomNum} mainframe is unlocked, but the security curriculum compiler is currently offline for maintenance. Return to Map to practice!"`;
        if (window.CyberPuzzles && typeof window.CyberPuzzles.updateSimbaDialog === "function") {
          window.CyberPuzzles.updateSimbaDialog(msg, "happy");
        }
      }
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
      
      const isReplay = this.state.completedRooms.includes(activeRoom);
      
      if (!isReplay) {
        this.state.completedRooms.push(activeRoom);
      }
      console.log("After room complete:", this.state.completedRooms);
      
      const badgeObj = this.badgeDefinitions[activeRoom];
      if (badgeObj && !this.state.badges.includes(badgeObj.name)) {
        this.state.badges.push(badgeObj.name);
      }
      
      // Render debrief data
      const debriefTime = document.getElementById("debriefTime");
      const debriefBadge = document.getElementById("debriefBadgeName");
      const debriefEquiv = document.getElementById("debriefEquivalence");
      
      if (debriefTime) debriefTime.textContent = formattedTime;
      if (debriefBadge) {
        debriefBadge.textContent = badgeObj ? badgeObj.name : "None";
        if (isReplay) {
          debriefBadge.textContent += " (PRACTICED)";
        }
      }
      
      const equivTexts = {
        1: "Phishing emails target psychological response mechanisms rather than network protocols. Spotting domain mismatches, urgency triggers, and suspicious hyperlinks aligns with CompTIA Security+ Domain 1.1 (Threats, Attacks, & Vulnerabilities) and standard corporate defense audits!",
        2: "Brute-force password security relies heavily on character combinations and key entropy. Standard multi-character combinations scale password entropy exponentially, ensuring real-world protection aligned with NIST Special Publication 800-63B guidelines!",
        3: "Decryption offsets and substitution ciphers form the foundational basis of modern asymmetric cryptographic principles. Understanding how shift rotations alter plaintexts directly maps to Security+ Domain 2.8 (Cryptography Concepts) and historical cybersecurity models!",
        4: "Malware analysis requires isolating trojans and understanding process signatures. Identifying malicious file paths and quarantine procedures is key to malware incident response.",
        5: "Multi-Factor Authentication (MFA) push fatigue occurs when users approve spam prompt notifications. Time-based One-Time Passcodes (TOTP) eliminate push fatigue using synchronized time-based seeds.",
        6: "Network switches rely on Access Control Lists (ACLs) to filter traffic. Blocking unauthorized port-level commands like SSH and reverse shells secures network routing perimeters.",
        7: "Open Source Intelligence (OSINT) harvesting targets public metadata footprints. Rebuilding access logs from blog entries and leaked documents demonstrates social engineering vulnerability tracing.",
        8: "SQL Injection (SQLi) attacks occur when unsanitized user inputs are executed directly as database queries. Parameterized queries and statement shielding neutralize these injection points.",
        9: "The Diffie-Hellman protocol allows two parties to establish a shared cryptographic secret over an unsecure channel using modulo exponentiation, forming the foundation of TLS handshakes.",
        10: "Prompt injection manipulates Large Language Models (LLMs) to bypass safety rules. Deploying input validation and sanitization filters prevents malicious system instructions override."
      };
      
      if (debriefEquiv) debriefEquiv.textContent = equivTexts[activeRoom] || "";

      // Render the correct XP metric in the debrief page
      const xpMetricVal = document.querySelector("#view-debrief .completion-metrics .c-metric:nth-child(1) .value");
      if (xpMetricVal) {
        if (isReplay) {
          xpMetricVal.textContent = "+0 XP (PRACTICE)";
          xpMetricVal.className = "value text-muted";
        } else {
          let xpAwarded = 150;
          if (activeRoom === 1) xpAwarded = 200;
          if (activeRoom === 2) xpAwarded = 150;
          if (activeRoom === 3) xpAwarded = 200;
          if (activeRoom === 4) xpAwarded = 200;
          if (activeRoom === 5) xpAwarded = 200;
          if (activeRoom === 6) xpAwarded = 150;
          if (activeRoom === 7) xpAwarded = 150;
          if (activeRoom === 8) xpAwarded = 150;
          if (activeRoom === 9) xpAwarded = 150;
          if (activeRoom === 10) xpAwarded = 300;
          xpMetricVal.textContent = `+${xpAwarded} XP`;
          xpMetricVal.className = "value text-cyan";
        }
      }
      
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
      // If we are currently replaying a completed room, block score rewards (Practice mode)
      if (this.state.currentActiveRoom && this.state.completedRooms.includes(this.state.currentActiveRoom)) {
        console.log(`Practice mode: Score reward of ${points} points blocked for Room ${this.state.currentActiveRoom}`);
        return;
      }
      this.state.score = Math.max(0, this.state.score + points);
      this.updateHud();
      this.saveCurrentProgress();
    },

    addXp: function(amount) {
      console.log(`[Progression Flow] Step 1 (Awarding): addXp called. Amount: ${amount}. Active Room: ${this.state.currentActiveRoom}`);
      // If we are currently replaying a completed room, block XP rewards (Practice mode)
      if (this.state.currentActiveRoom && this.state.completedRooms.includes(this.state.currentActiveRoom)) {
        console.log(`[Progression Flow] Practice mode block: XP reward of ${amount} XP blocked for Room ${this.state.currentActiveRoom} because it is already completed.`);
        return;
      }
      
      if (typeof this.state.totalXp === "undefined" || this.state.totalXp === null) {
        this.state.totalXp = this.calculateTotalXpFromLevelAndXp(this.state.level || 1, this.state.xp || 0);
        console.log(`[Progression Flow] Initialized totalXp from database level-state: ${this.state.totalXp}`);
      }
      
      this.state.totalXp += amount;
      console.log(`[Progression Flow] Cumulative totalXp calculated: ${this.state.totalXp}`);
      
      const stats = this.calculateLevelFromXp(this.state.totalXp);
      const oldLevel = this.state.level;
      
      this.state.level = stats.level;
      this.state.xp = stats.xp;
      this.state.maxXp = stats.maxXp;
      console.log(`[Progression Flow] Step 2 (Recalculated): level: ${this.state.level}, xp: ${this.state.xp} / ${this.state.maxXp}`);
      
      if (this.state.level > oldLevel) {
        console.log(`[Progression Flow] Step 2a (Level Up): Promotion detected! Level ${oldLevel} -> ${stats.level}`);
        // Level up trigger dialog alert
        setTimeout(() => {
          alert(`LEVEL UP! 😻 Specialist ${this.state.username} has reached System Level ${this.state.level}! Locked sectors have been unlocked for decryption. Simba is proud of your progress!`);
          console.log(`[Progression Flow] Level Up alert shown. Re-triggering map states & save checks...`);
          this.updateHud();
          this.updateMapStates();
          this.saveCurrentProgress();
        }, 800);
      }
      
      console.log(`[Progression Flow] Step 4 (HUD & State Update): Updating HUD and rendering map states...`);
      this.updateHud();
      this.updateMapStates(); // Sync map immediately on gain of XP
      
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
      for (let roomNum = 1; roomNum <= 10; roomNum++) {
        const badgeCard = document.getElementById(`badgeItem${roomNum}`);
        if (badgeCard) {
          const isCleared = this.state.completedRooms.includes(roomNum);
          if (isCleared) {
            badgeCard.classList.remove("locked");
            const dateEl = badgeCard.querySelector(".badge-date");
            if (dateEl) {
              dateEl.textContent = `UNLOCKED: ${this.state.roomTimes[roomNum] || "PASSED"}`;
              dateEl.className = "badge-date text-green";
            }
          } else {
            badgeCard.classList.add("locked");
            const dateEl = badgeCard.querySelector(".badge-date");
            if (dateEl) {
              dateEl.textContent = "LOCKED";
              dateEl.className = "badge-date";
            }
          }
        }
      }
    },

    updateClassroomTab: function() {
      const statusEl = document.getElementById("activeClassStatus");
      if (!statusEl) return;
      if (this.state.classroomLinked && this.state.classroomCode) {
        statusEl.innerHTML = `Linked connection active: Connected to <strong class="text-green">${this.state.classroomCode}</strong>! Simba is issuing decryption telemetry files directly to your educator console!`;
        statusEl.className = "active-class-status text-green";
      } else {
        statusEl.innerHTML = `Not connected to an educator server node. Play as Guest or create custom speedrun trials!`;
        statusEl.className = "active-class-status";
      }
    },

    /* ==========================================================================
       MOCK LEADERBOARD ENGINE
       ========================================================================== */
    renderLeaderboard: async function() {
      const tbody = document.getElementById("leaderboardBody");
      if (!tbody) return;
      
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Loading mainframe rankings...</td></tr>`;
      
      try {
        const { data: profiles, error } = await window.supabaseClient
          .from('profiles')
          .select('*')
          .order('score', { ascending: false });

        if (error) throw error;

        tbody.innerHTML = "";
        
        // Build updated rankings list including player and other registered profiles
        let recordsList = [...this.leaderboardData];
        
        if (profiles) {
          profiles.forEach(prof => {
            // Skip current player since we add them separately with "(YOU)"
            if (prof.username === this.state.username) return;
            
            const completedRoomsArr = Array.isArray(prof.completedrooms) ? prof.completedrooms : [];
            const roomTimesObj = (prof.roomtimes && typeof prof.roomtimes === 'object') ? prof.roomtimes : {};
            
            if (prof.score > 0 || completedRoomsArr.length > 0) {
              recordsList.push({
                name: prof.username,
                lvl: prof.level || 1,
                cleared: `${completedRoomsArr.length} / 10`,
                time: Object.values(roomTimesObj)[0] || "--:--.--",
                score: prof.score || 0,
                isPlayer: false
              });
            }
          });
        }
        
        const playerRecord = {
          name: `${this.state.username} (YOU)`,
          lvl: this.state.level,
          cleared: `${this.state.completedRooms.length} / 10`,
          time: Object.values(this.state.roomTimes)[0] || "--:--.--",
          score: this.state.score,
          isPlayer: true
        };

        // Add player if they have completed a room or have points and are not guest
        if (this.state.username && this.state.username !== "GUEST_PLAYER" && (this.state.score > 0 || this.state.completedRooms.length > 0)) {
          const playerExistsInList = recordsList.some(r => r.isPlayer || r.name.replace(" (YOU)", "") === this.state.username);
          if (!playerExistsInList) {
            recordsList.push(playerRecord);
          }
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
      } catch (err) {
        console.error("Leaderboard fetch error:", err);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-red">Failed to load rankings: ${err.message}</td></tr>`;
      }
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
