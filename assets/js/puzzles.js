/* ==========================================================================
   CYBER ESCAPE - PUZZLE INTERACTIVE ENGINES
   Implements game rules, event bindings, and evaluation logic for Rooms 1, 2, and 3.
   ========================================================================== */

(function() {
  // Global Puzzle Controller Object
  const CyberPuzzles = {
    currentRoom: null,
    onCompleteCallback: null,
    
    // Room 1: Phishing Firewall State
    phishingState: {
      emails: [
        {
          id: 1,
          sender: "accounts-secure@netflx-support.com",
          subject: "⚠️ ALERT: Account lock detected! ACT NOW!",
          body: "Dear Netflix Customer,\n\nWe detected suspicious login activities on your account node from IP 184.22.9.11. To secure your account, click the link below to verify your details within 24 hours. Failure to do so will result in permanent account termination.\n\nhttp://netflx-support-portal.info/login/secure",
          isPhishing: true,
          audited: false,
          hint: "Check the sender's domain closely. Is it netflix.com or netflx-support.com? Also notice the high urgency tone!"
        },
        {
          id: 2,
          sender: "it-operations@cyberacademy.edu",
          subject: "Scheduled Network Maintenance - Sunday 2 AM",
          body: "Hi team,\n\nPlease be advised that the academic portal will undergo scheduled database maintenance on Sunday between 2:00 AM and 4:00 AM UTC. No action is required on your part, but portal services may be briefly offline.\n\nBest regards,\nCyberAcademy IT Operations",
          isPhishing: false,
          audited: false,
          hint: "The sender domain is corporate/official, and there is no request for credentials, passwords, or stressful locking warnings."
        },
        {
          id: 3,
          sender: "billing-alert@paypal-security-service.net",
          subject: "Urgent: Direct Debit Payment Declined",
          body: "Dear Customer,\n\nYour recent transaction of $289.43 USD was declined due to outdated billing records. To prevent direct debit suspension, please upload your credit card and profile details immediately via our secure database node.\n\nhttps://paypal.secure-billing-node.net/login",
          isPhishing: true,
          audited: false,
          hint: "Pay attention to the sender and URL. PayPal wouldn't use paypal-security-service.net, nor would they ask you to upload cards to an external site."
        },
        {
          id: 4,
          sender: "registrar@cyberacademy.edu",
          subject: "Academic Calendar Update: Spring Break",
          body: "Hello Students,\n\nPlease note that the Spring semester schedule has been adjusted slightly. Spring Break will officially commence on Monday, March 16th, and classes will resume on Monday, March 23rd. Enjoy your break!\n\nOffice of the Registrar",
          isPhishing: false,
          audited: false,
          hint: "This is a routine administrative announcement. It points to no external links and doesn't try to scare you into acting."
        }
      ],
      selectedId: 1
    },

    // Room 2: Password Crypt State
    passwordState: {
      isUnlocked: false
    },

    // Room 3: Cipher Console State
    cipherState: {
      ciphertext: "Uifsf jt b tfdsfu cbuo uibu dbot ftdbqf.",
      correctShift: 25 // Uifsf shifted by 25 (which is -1) is 'There'
    },

    // Room 4: Malware Lab State
    malwareState: {
      processes: [
        {
          id: 1,
          name: "winupdates.exe",
          path: "C:\\Users\\Temp\\AppData\\Local\\winupdates.exe",
          description: "Windows System Update Simulation. Signature Check: UNSIGNED. Heavy registry writing behavior detected! Attempting bulk file encryption on User Documents node and requesting root-level system admin tokens. Telemetry highlights outgoing socket requests to command-and-control IP 45.9.110.2.",
          isMalware: true,
          audited: false,
          hint: "Windows updates run from C:\\Windows\\System32 as signed packages. Running from AppData\\Local and encrypting files are signs of trojan ransomware!"
        },
        {
          id: 2,
          name: "svchost.exe",
          path: "C:\\Windows\\System32\\svchost.exe",
          description: "Microsoft Service Host Core Node. Signature Check: SIGNED BY MICROSOFT OS AUTHORITY. Standard operating system component executing dynamic-link libraries (.dll services). Telemetry outlines normal memory load (14.2MB) and zero suspicious socket outbound traffic.",
          isMalware: false,
          audited: false,
          hint: "This is a legitimate system process signed by Microsoft and residing in the standard System32 library node. Wiping it would crash the simulator console!"
        },
        {
          id: 3,
          name: "monero_miner.exe",
          path: "C:\\Users\\Public\\Downloads\\monero_miner.exe",
          description: "Unsigned mathematical calculations application. Signature Check: UNSIGNED. Telemetry indicates 99.4% CPU resource consumption. Network connection active to external cryptocurrency mining pool at port 4444.",
          isMalware: true,
          audited: false,
          hint: "An unsigned miner executing from public directories, hogging 99% of your CPU resources, is a clear cryptojacking Trojan threat!"
        },
        {
          id: 4,
          name: "chrome.exe",
          path: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
          description: "Google Chrome Application. Signature Check: SIGNED BY GOOGLE LLC. Standard web navigation sandbox utility. Memory footprint is high (420MB) but operates safely under sandboxed user permissions.",
          isMalware: false,
          audited: false,
          hint: "This is a verified web browser binary signed by Google LLC operating under standard sandboxed permissions. It is safe to allow!"
        }
      ],
      selectedId: 1
    },

    // Room 5: MFA Database State
    mfaState: {
      notifications: [
        {
          id: 1,
          location: "Moscow, Russia",
          device: "Firefox / Linux Node (Curl client)",
          timestamp: "Just Now",
          isMalicious: true,
          audited: false
        },
        {
          id: 2,
          location: "Local Terminal Hub (You)",
          device: "Chrome / Windows Specialist Console",
          timestamp: "2 mins ago",
          isMalicious: false,
          audited: false
        },
        {
          id: 3,
          location: "Beijing, China",
          device: "Python scripting payload",
          timestamp: "5 mins ago",
          isMalicious: true,
          audited: false
        }
      ],
      seed: 7240,
      seconds: 48,
      otpTimerInterval: null,
      isFatigueCleared: false,
      isSyncCleared: false
    },

    /**
     * Set up listeners and references
     */
    init: function() {
      this.bindPhishingEvents();
      this.bindPasswordEvents();
      this.bindCipherEvents();
      this.bindMalwareEvents();
      this.bindMfaEvents();
    },

    /**
     * Start a specific puzzle's interactive loops
     */
    startPuzzle: function(roomNum, completeCallback) {
      this.currentRoom = roomNum;
      this.onCompleteCallback = completeCallback;

      // Deactivate all puzzle views, then activate the correct one
      document.querySelectorAll(".puzzle-view").forEach(el => el.classList.remove("active"));
      
      if (roomNum === 1) {
        document.getElementById("puzzle-phishing").classList.add("active");
        this.resetPhishingGame();
      } else if (roomNum === 2) {
        document.getElementById("puzzle-password").classList.add("active");
        this.resetPasswordGame();
      } else if (roomNum === 3) {
        document.getElementById("puzzle-cipher").classList.add("active");
        this.resetCipherGame();
      } else if (roomNum === 4) {
        document.getElementById("puzzle-malware").classList.add("active");
        this.resetMalwareGame();
      } else if (roomNum === 5) {
        document.getElementById("puzzle-mfa").classList.add("active");
        this.resetMfaGame();
      }
    },

    /**
     * Dynamic Simba dialogue helper
     */
    updateSimbaDialog: function(text, state = "normal") {
      const dialogueText = document.getElementById("gameSimbaDialogue");
      if (dialogueText) {
        dialogueText.innerHTML = text;
      }

      // Update global visor glow colors across all Simba instances
      const visors = document.querySelectorAll(".cyber-visor-fill");
      if (visors.length > 0) {
        let strokeColor = "#00ffff";
        let fillColor = "rgba(0, 255, 255, 0.25)";
        
        if (state === "error" || state === "scared") {
          strokeColor = "#ff3333";
          fillColor = "rgba(255, 51, 51, 0.25)";
        } else if (state === "warn" || state === "alert") {
          strokeColor = "#ffaa00";
          fillColor = "rgba(255, 170, 0, 0.25)";
        } else if (state === "success" || state === "happy") {
          strokeColor = "#00ff00";
          fillColor = "rgba(0, 255, 0, 0.25)";
        }
        
        visors.forEach(visor => {
          visor.setAttribute("stroke", strokeColor);
          visor.setAttribute("fill", fillColor);
        });
      }
    },

    /**
     * Provide current room hint when clicked
     */
    triggerHint: function() {
      if (this.currentRoom === 1) {
        const activeEmail = this.phishingState.emails.find(e => e.id === this.phishingState.selectedId);
        if (activeEmail) {
          this.updateSimbaDialog(`"Meow! Here is a cyber hint: ${activeEmail.hint}"`, "alert");
        }
      } else if (this.currentRoom === 2) {
        this.updateSimbaDialog(`"Meow! Combine at least 12 characters, uppercase letters, lowercase, digits, and a special character (like @, #, $, %) to crack the entropy shield!"`, "alert");
      } else if (this.currentRoom === 3) {
        this.updateSimbaDialog(`"Meow! Slide the offset key to match letter indices. Since 'U' is shifted by 1 letter from 'T', we need to offset the entire message backwards. Try looking at shifts around 23 to 25!"`, "alert");
      } else if (this.currentRoom === 4) {
        const activeProc = this.malwareState.processes.find(p => p.id === this.malwareState.selectedId);
        if (activeProc) {
          this.updateSimbaDialog(`"Meow! Here is a process analysis hint: ${activeProc.hint}"`, "alert");
        }
      } else if (this.currentRoom === 5) {
        if (!this.mfaState.isFatigueCleared) {
          this.updateSimbaDialog(`"Meow! Block any MFA pushes coming from locations or devices you don't recognize. Only approve logins you initiated!"`, "alert");
        } else {
          this.updateSimbaDialog(`"Meow! Calculate the 2FA token using the formula. Take the SEED value and add the current dynamic SYSTEM_SECONDS. Put the sum in the sync terminal!"`, "alert");
        }
      }
    },

    /* ==========================================================================
       ROOM 1: PHISHING FIREWALL LOGIC
       ========================================================================== */
    resetPhishingGame: function() {
      // Clear previous states
      this.phishingState.emails.forEach(e => e.audited = false);
      this.phishingState.selectedId = 1;
      
      this.renderInboxList();
      this.selectEmail(1);
      
      this.updateSimbaDialog(`"Cyber-phish detected! Meow! Review the incoming emails in the left inbox. Click on each and decide if it is phishing or legitimate to restore safety nodes!"`, "normal");
    },

    renderInboxList: function() {
      const inboxListEl = document.getElementById("phishingInboxList");
      if (!inboxListEl) return;
      
      inboxListEl.innerHTML = "";
      
      this.phishingState.emails.forEach(email => {
        const item = document.createElement("div");
        item.className = `inbox-item ${email.id === this.phishingState.selectedId ? "active" : ""} ${email.audited ? "cleared" : ""}`;
        item.setAttribute("data-id", email.id);
        
        // Audit Status badge
        let badgeHtml = email.audited 
          ? `<span class="item-badge tag-green">AUDITED</span>`
          : `<span class="item-badge tag-cyan">PENDING</span>`;
          
        item.innerHTML = `
          <div class="item-sender">${email.sender.split('@')[0]}</div>
          <div class="item-subject">${email.subject}</div>
          <div class="item-meta">
            <span style="font-size: 8px; color: var(--text-muted);">ID: 0${email.id}</span>
            ${badgeHtml}
          </div>
        `;
        
        item.addEventListener("click", () => {
          this.selectEmail(email.id);
        });
        
        inboxListEl.appendChild(item);
      });
    },

    selectEmail: function(id) {
      this.phishingState.selectedId = id;
      
      // Update UI active class
      const items = document.querySelectorAll(".inbox-item");
      items.forEach(item => {
        if (parseInt(item.getAttribute("data-id")) === id) {
          item.classList.add("active");
        } else {
          item.classList.remove("active");
        }
      });
      
      const email = this.phishingState.emails.find(e => e.id === id);
      if (!email) return;
      
      // Load details
      document.getElementById("emailSender").textContent = email.sender;
      document.getElementById("emailSubject").textContent = email.subject;
      
      // Format bodies with highlighted links if present
      let bodyHtml = email.body;
      if (email.isPhishing) {
        // Highlight links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        bodyHtml = email.body.replace(urlRegex, (url) => {
          return `<span class="sus-link" id="emailLink">${url}</span>`;
        });
      }
      
      document.getElementById("emailBody").innerHTML = bodyHtml;
      
      // Update Simba's dialog depending on audit state
      if (email.audited) {
        this.updateSimbaDialog(`"This audit node is already verified as safe. Meow! Spot checks complete for this segment."`, "success");
      } else {
        this.updateSimbaDialog(`"Auditing subject 0${email.id}... Inspect the sender's address and any linked nodes. Make your assessment!"`, "normal");
      }
    },

    bindPhishingEvents: function() {
      const flagLegitBtn = document.getElementById("flagLegitBtn");
      const flagPhishBtn = document.getElementById("flagPhishBtn");
      
      if (flagLegitBtn && flagPhishBtn) {
        flagLegitBtn.addEventListener("click", () => this.auditCurrentEmail(false));
        flagPhishBtn.addEventListener("click", () => this.auditCurrentEmail(true));
      }
    },

    auditCurrentEmail: function(chosenIsPhishing) {
      const email = this.phishingState.emails.find(e => e.id === this.phishingState.selectedId);
      if (!email) return;
      
      if (email.audited) {
        this.updateSimbaDialog(`"This segment has already been successfully audited, recruit! Move on to the pending ones."`, "success");
        return;
      }
      
      if (email.isPhishing === chosenIsPhishing) {
        // CORRECT
        email.audited = true;
        this.renderInboxList();
        
        // Add Score/XP dynamically via event/callback
        if (window.CyberGame) {
          window.CyberGame.addScore(100);
          window.CyberGame.addXp(50);
        }
        
        this.updateSimbaDialog(`"Purr! Spot on, specialist! 😻 That is exactly correct. Threat isolated! Let's check the remaining nodes."`, "success");
        
        // Check if all are audited
        const allAudited = this.phishingState.emails.every(e => e.audited);
        if (allAudited) {
          setTimeout(() => {
            this.updateSimbaDialog(`"PURR! Ultimate firewall restored! 😻 All phishing threats neutralized. You are clearing Room 1!"`, "success");
            setTimeout(() => {
              if (this.onCompleteCallback) this.onCompleteCallback();
            }, 1800);
          }, 1000);
        }
      } else {
        // INCORRECT
        if (window.CyberGame) {
          window.CyberGame.addScore(-25); // Minor penalty
        }
        
        let errorMsg = email.isPhishing 
          ? `"MEOW! 😾 Wrong diagnosis! Notice that the link goes to netflx-support or secure-billing-node, which are social engineering spoofing vectors! Let's re-audit."`
          : `"Oh no! 😼 That email is actually standard operational comms. It uses official registrar domains without suspicious triggers. Let's re-evaluate."`;
          
        this.updateSimbaDialog(errorMsg, "error");
      }
    },

    /* ==========================================================================
       ROOM 2: PASSWORD CRYPT LOGIC
       ========================================================================== */
    resetPasswordGame: function() {
      this.passwordState.isUnlocked = false;
      
      const pwdInput = document.getElementById("gamePasswordInput");
      const vaultGraphic = document.getElementById("vaultStatusGraphic");
      const submitBtn = document.getElementById("gamePasswordSubmitBtn");
      
      if (pwdInput) pwdInput.value = "";
      if (vaultGraphic) {
        vaultGraphic.className = "vault-graphic";
        vaultGraphic.textContent = "LOCKED";
      }
      if (submitBtn) submitBtn.disabled = true;
      
      this.evaluatePassword("");
      this.updateSimbaDialog(`"Security alert! 😾 We need a high-entropy master passcode to seal the active vault nodes. Type in a strong password below to test brute-force metrics!"`, "normal");
    },

    bindPasswordEvents: function() {
      const pwdInput = document.getElementById("gamePasswordInput");
      const submitBtn = document.getElementById("gamePasswordSubmitBtn");
      
      if (pwdInput) {
        pwdInput.addEventListener("input", (e) => {
          this.evaluatePassword(e.target.value);
        });
      }
      
      if (submitBtn) {
        submitBtn.addEventListener("click", () => {
          if (this.passwordState.isUnlocked) {
            const vaultGraphic = document.getElementById("vaultStatusGraphic");
            if (vaultGraphic) {
              vaultGraphic.textContent = "SECURED";
            }
            
            if (window.CyberGame) {
              window.CyberGame.addScore(400);
              window.CyberGame.addXp(150);
            }
            
            this.updateSimbaDialog(`"PURR! Vault lock operational! 😻 Brute-force proof defense parameters met. Decryption nodes sealed. Leaving password crypt room now!"`, "success");
            
            setTimeout(() => {
              if (this.onCompleteCallback) this.onCompleteCallback();
            }, 1800);
          }
        });
      }
    },

    evaluatePassword: function(pwd) {
      const ratingEl = document.getElementById("gamePasswordRating");
      const speedEl = document.getElementById("gamePasswordSpeed");
      const scoreBar = document.getElementById("gamePasswordScoreBar");
      const submitBtn = document.getElementById("gamePasswordSubmitBtn");
      const vaultGraphic = document.getElementById("vaultStatusGraphic");
      
      if (!ratingEl || !speedEl || !scoreBar) return;
      
      if (pwd.length === 0) {
        ratingEl.textContent = "EMPTY";
        ratingEl.className = "val label-red";
        speedEl.textContent = "0.0000 SECONDS";
        scoreBar.style.width = "0%";
        scoreBar.className = "progress-bar bar-red";
        if (submitBtn) submitBtn.disabled = true;
        return;
      }
      
      // Calculate dynamic entropy score (out of 100)
      let score = 0;
      score += Math.min(pwd.length * 5, 45); // up to 45 pts for length
      
      const hasLower = /[a-z]/.test(pwd);
      const hasUpper = /[A-Z]/.test(pwd);
      const hasDigit = /[0-9]/.test(pwd);
      const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
      
      if (hasLower) score += 10;
      if (hasUpper) score += 15;
      if (hasDigit) score += 15;
      if (hasSpecial) score += 20;
      
      // Repeated char penalty
      const repeats = pwd.length - new Set(pwd.split("")).size;
      score -= repeats * 2;
      score = Math.max(0, Math.min(score, 100));
      
      // Classify ratings
      let rating = "";
      let speed = "";
      let simbaMsg = "";
      let isSecure = false;
      
      if (score < 40) {
        rating = "VULNERABLE";
        speed = this.getPasswordWeakSpeed(pwd);
        simbaMsg = `"MEOW! 😾 That password is way too weak! It can be cracked in ${speed}. Simba feels insecure, add uppercase, lowercase, numbers, and special symbols!"`;
        ratingEl.className = "val label-red";
        scoreBar.className = "progress-bar bar-red";
      } else if (score >= 40 && score < 75) {
        rating = "MODERATE";
        speed = this.getPasswordMediumSpeed(pwd);
        simbaMsg = `"Hmm... Not bad! 😼 Defense nodes are turning amber. A mid-tier hacker would take ${speed} to brute force. Make it stronger to lock the vault!"`;
        ratingEl.className = "val label-amber";
        scoreBar.className = "progress-bar bar-amber";
      } else {
        rating = "UNBREAKABLE";
        speed = this.getPasswordStrongSpeed(pwd);
        simbaMsg = `"PURR! 😻 Dynamic entropy parameters passed! A supercomputer would take ${speed} to crack this code block. Seal the vault now!"`;
        ratingEl.className = "val label-green";
        scoreBar.className = "progress-bar bar-green";
        isSecure = true;
      }
      
      // Update UI elements
      ratingEl.textContent = rating;
      speedEl.textContent = speed.toUpperCase();
      scoreBar.style.width = `${score}%`;
      
      this.passwordState.isUnlocked = isSecure;
      
      if (submitBtn) {
        submitBtn.disabled = !isSecure;
      }
      
      if (vaultGraphic) {
        if (isSecure) {
          vaultGraphic.classList.add("unlocked");
          vaultGraphic.textContent = "READY";
        } else {
          vaultGraphic.classList.remove("unlocked");
          vaultGraphic.textContent = "LOCKED";
        }
      }
      
      this.updateSimbaDialog(simbaMsg, isSecure ? "success" : (score < 40 ? "error" : "warn"));
    },

    getPasswordWeakSpeed: function(pwd) {
      if (pwd.length < 5) return "0.000001 seconds (Instant)";
      if (pwd.length < 7) return "0.008 seconds";
      return "0.85 seconds";
    },
    
    getPasswordMediumSpeed: function(pwd) {
      const len = pwd.length;
      if (len < 8) return "1.5 minutes";
      if (len < 10) return "5.2 hours";
      return "34 days";
    },
    
    getPasswordStrongSpeed: function(pwd) {
      const len = pwd.length;
      if (len < 11) return "240 years";
      if (len < 13) return "9,800 centuries";
      if (len < 15) return "1.2 billion years";
      return "920 trillion centuries";
    },

    /* ==========================================================================
       ROOM 3: CIPHER CONSOLE LOGIC
       ========================================================================== */
    resetCipherGame: function() {
      const slider = document.getElementById("shiftSelector");
      const label = document.getElementById("shiftValLabel");
      const preview = document.getElementById("plaintextPreview");
      
      if (slider) slider.value = 0;
      if (label) label.textContent = "0";
      if (preview) preview.textContent = "[PLAIN TEXT DECRYPTION PREVIEW HERE]";
      
      this.updateCipherPreview(0);
      this.updateSimbaDialog(`"Cyber cipher override active! 😼 The core mainframe has locked Simba's escape door with a simple index shifting Caesar Cipher. Find the offset correct key to decipher!"`, "normal");
    },

    bindCipherEvents: function() {
      const slider = document.getElementById("shiftSelector");
      const submitBtn = document.getElementById("submitCipherBtn");
      
      if (slider) {
        slider.addEventListener("input", (e) => {
          const val = parseInt(e.target.value);
          const label = document.getElementById("shiftValLabel");
          if (label) label.textContent = val;
          this.updateCipherPreview(val);
        });
      }
      
      if (submitBtn) {
        submitBtn.addEventListener("click", () => {
          const sliderVal = parseInt(document.getElementById("shiftSelector").value);
          if (sliderVal === this.cipherState.correctShift) {
            // SUCCESS
            if (window.CyberGame) {
              window.CyberGame.addScore(500);
              window.CyberGame.addXp(200);
            }
            
            this.updateSimbaDialog(`"PURR! Mainframe bypass completed! 😻 Decrypted text matches system instructions. Escaping decryption room now!"`, "success");
            
            setTimeout(() => {
              if (this.onCompleteCallback) this.onCompleteCallback();
            }, 1800);
          } else {
            // INCORRECT
            if (window.CyberGame) {
              window.CyberGame.addScore(-30);
            }
            this.updateSimbaDialog(`"Buzzz! 😾 Override command denied. The plaintext preview is still garbage code. Keep shifting the offset key!"`, "error");
          }
        });
      }
    },

    updateCipherPreview: function(shift) {
      const preview = document.getElementById("plaintextPreview");
      if (!preview) return;
      
      const decrypted = this.caesarShift(this.cipherState.ciphertext, shift);
      preview.textContent = decrypted;
      
      // Update Simba's face color on matching key
      if (shift === this.cipherState.correctShift) {
        this.updateSimbaDialog(`"Wow! 😻 Plaintext translates cleanly! 'There is a secret cat that can escape.' Click Execute to save us!"`, "success");
      }
    },

    caesarShift: function(text, shift) {
      return text.split('').map(char => {
        const code = char.charCodeAt(0);
        
        // Uppercase
        if (code >= 65 && code <= 90) {
          return String.fromCharCode(((code - 65 + shift) % 26) + 65);
        }
        // Lowercase
        if (code >= 97 && code <= 122) {
          return String.fromCharCode(((code - 97 + shift) % 26) + 97);
        }
        
        return char;
      }).join('');
    },

    /* ==========================================================================
       ROOM 4: MALWARE LAB LOGIC
       ========================================================================== */
    resetMalwareGame: function() {
      this.malwareState.processes.forEach(p => p.audited = false);
      this.malwareState.selectedId = 1;
      
      this.renderProcessList();
      this.selectProcess(1);
      
      this.updateSimbaDialog(`"Ransomware alert! 😾 Rogue processes are trying to decrypt and corrupt our memory bank. Inspect the active processes in the left sidebar and quarantine the malware!"`, "normal");
    },

    renderProcessList: function() {
      const listEl = document.getElementById("malwareProcessList");
      if (!listEl) return;
      
      listEl.innerHTML = "";
      
      this.malwareState.processes.forEach(proc => {
        const item = document.createElement("div");
        item.className = `process-item ${proc.id === this.malwareState.selectedId ? "active" : ""} ${proc.audited ? "cleared" : ""}`;
        item.setAttribute("data-id", proc.id);
        
        let statusHtml = proc.audited 
          ? `<span class="item-badge tag-green" style="font-size: 7px; padding: 2px 4px;">SECURED</span>`
          : `<span class="item-badge tag-pink" style="font-size: 7px; padding: 2px 4px;">UNAUDITED</span>`;
          
        item.innerHTML = `
          <div class="proc-name">${proc.name}</div>
          <div class="proc-status">
            <span style="font-size: 8px; color: var(--text-muted);">ID: 0${proc.id}</span>
            ${statusHtml}
          </div>
        `;
        
        item.addEventListener("click", () => {
          this.selectProcess(proc.id);
        });
        
        listEl.appendChild(item);
      });
    },

    selectProcess: function(id) {
      this.malwareState.selectedId = id;
      
      const items = document.querySelectorAll(".process-item");
      items.forEach(item => {
        if (parseInt(item.getAttribute("data-id")) === id) {
          item.classList.add("active");
        } else {
          item.classList.remove("active");
        }
      });
      
      const proc = this.malwareState.processes.find(p => p.id === id);
      if (!proc) return;
      
      document.getElementById("procNameDisplay").textContent = proc.name;
      document.getElementById("procPathDisplay").textContent = proc.path;
      document.getElementById("procDescription").textContent = proc.description;
      
      if (proc.audited) {
        this.updateSimbaDialog(`"Process ${proc.name} has been successfully audited and isolated, Specialist! Good job!"`, "success");
      } else {
        this.updateSimbaDialog(`"Inspecting process 0${proc.id}: ${proc.name}... Check the signature, filepath, and behavior triggers. Allow or Quarantine?"`, "normal");
      }
    },

    bindMalwareEvents: function() {
      const allowBtn = document.getElementById("allowProcessBtn");
      const killBtn = document.getElementById("killProcessBtn");
      
      if (allowBtn && killBtn) {
        allowBtn.addEventListener("click", () => this.auditCurrentProcess(false));
        killBtn.addEventListener("click", () => this.auditCurrentProcess(true));
      }
    },

    auditCurrentProcess: function(chosenIsMalware) {
      const proc = this.malwareState.processes.find(p => p.id === this.malwareState.selectedId);
      if (!proc) return;
      
      if (proc.audited) {
        this.updateSimbaDialog(`"This process node is already successfully resolved, Specialist."`, "success");
        return;
      }
      
      if (proc.isMalware === chosenIsMalware) {
        proc.audited = true;
        this.renderProcessList();
        
        if (window.CyberGame) {
          window.CyberGame.addScore(100);
          window.CyberGame.addXp(50);
        }
        
        let successMsg = proc.isMalware
          ? `"Purr! Excellent kill command! 😻 Process isolated and quarantined successfully. Malicious telemetry closed!"`
          : `"Purr! Safe process allowed execution bypass. Essential system services remain operational!"`;
          
        this.updateSimbaDialog(successMsg, "success");
        
        const allAudited = this.malwareState.processes.every(p => p.audited);
        if (allAudited) {
          setTimeout(() => {
            this.updateSimbaDialog(`"PURR! Memory sandbox secured! 😻 Ransomware Trojan components eliminated. Room 4 Cleared!"`, "success");
            setTimeout(() => {
              if (this.onCompleteCallback) this.onCompleteCallback();
            }, 1800);
          }, 1000);
        }
      } else {
        if (window.CyberGame) {
          window.CyberGame.addScore(-25);
        }
        
        let errorMsg = proc.isMalware
          ? `"MEOW! 😾 Letting that process run would initiate hard disk encryption! Spot the unsigned state and APP_DATA TEMP path!"`
          : `"Oh no! 😼 Killing essential signed Windows services destabilizes the HUD! Review Microsoft certificate headers!"`;
          
        this.updateSimbaDialog(errorMsg, "error");
      }
    },

    /* ==========================================================================
       ROOM 5: MFA DATABASE LOGIC
       ========================================================================== */
    resetMfaGame: function() {
      this.mfaState.isFatigueCleared = false;
      this.mfaState.isSyncCleared = false;
      this.mfaState.notifications.forEach(n => n.audited = false);
      
      this.mfaState.seed = Math.floor(1000 + Math.random() * 8000);
      this.mfaState.seconds = Math.floor(10 + Math.random() * 45);
      
      // Update UI displays
      document.getElementById("mfaSeedVal").textContent = this.mfaState.seed;
      document.getElementById("mfaSecondsVal").textContent = this.mfaState.seconds;
      
      const syncInput = document.getElementById("mfaSyncInput");
      const syncBtn = document.getElementById("submitMfaSyncBtn");
      const statusLabel = document.getElementById("mfaSyncStatusLabel");
      
      if (syncInput) {
        syncInput.value = "";
        syncInput.disabled = true;
      }
      if (syncBtn) {
        syncBtn.disabled = true;
      }
      if (statusLabel) {
        statusLabel.textContent = "SYNC REQUIRED";
        statusLabel.className = "mfa-sync-lock-status text-pink";
      }
      
      this.renderMfaList();
      this.startOtpTimer();
      
      this.updateSimbaDialog(`"MFA Fatigue Bombardment detected! 😾 Hackers are spamming Simba's console with approval requests. DENY the bad ones, and APPROVE your local session!"`, "normal");
    },

    renderMfaList: function() {
      const listEl = document.getElementById("mfaNotificationList");
      if (!listEl) return;
      
      listEl.innerHTML = "";
      
      this.mfaState.notifications.forEach(notif => {
        const card = document.createElement("div");
        card.className = `mfa-notification-card ${notif.audited ? "cleared" : ""}`;
        card.setAttribute("data-id", notif.id);
        
        let actionButtons = "";
        if (!notif.audited) {
          actionButtons = `
            <div class="mfa-card-actions">
              <button class="cyber-btn border-green glow-green flex-1" style="font-size: 8px; padding: 4px;" onclick="window.CyberPuzzles.handleMfaFatigueAction(${notif.id}, true)">APPROVE</button>
              <button class="cyber-btn border-red glow-red flex-1" style="font-size: 8px; padding: 4px;" onclick="window.CyberPuzzles.handleMfaFatigueAction(${notif.id}, false)">DENY</button>
            </div>
          `;
        } else {
          actionButtons = `
            <div style="font-size: 8px; font-weight: bold; margin-top: 6px;" class="${notif.isMalicious ? "text-red" : "text-green"}">
              ${notif.isMalicious ? "THREAT BLOCKED" : "ACCESS AUTHORIZED"}
            </div>
          `;
        }
        
        card.innerHTML = `
          <div class="mfa-card-header">
            <span class="mfa-card-location">${notif.location}</span>
            <span class="item-badge ${notif.isMalicious ? "tag-pink" : "tag-cyan"}" style="font-size: 7px;">${notif.timestamp}</span>
          </div>
          <div class="mfa-card-meta">
            Device: <strong>${notif.device}</strong>
          </div>
          ${actionButtons}
        `;
        
        card.style.textAlign = "left";
        listEl.appendChild(card);
      });
    },

    handleMfaFatigueAction: function(id, approveChosen) {
      const notif = this.mfaState.notifications.find(n => n.id === id);
      if (!notif) return;
      
      const shouldApprove = !notif.isMalicious;
      
      if (approveChosen === shouldApprove) {
        notif.audited = true;
        this.renderMfaList();
        
        if (window.CyberGame) {
          window.CyberGame.addScore(100);
        }
        
        let msg = approveChosen 
          ? `"Purr! Authorized local console connection verified. Safe node online!"`
          : `"Purr! Remote hijacking push notification denied. Threat neutralized!"`;
        this.updateSimbaDialog(msg, "success");
        
        this.checkMfaFatigueCompletion();
      } else {
        if (window.CyberGame) {
          window.CyberGame.addScore(-30);
        }
        
        let errorMsg = approveChosen
          ? `"MEOW! 😾 That push was a remote hijacking attempt! Never approve push notifications you did not initiate!"`
          : `"Oh no! 😼 You blocked your own session! Specialist console link offline. Let's re-assess."`;
        this.updateSimbaDialog(errorMsg, "error");
      }
    },

    checkMfaFatigueCompletion: function() {
      const allFatigueResolved = this.mfaState.notifications.every(n => n.audited);
      if (allFatigueResolved) {
        this.mfaState.isFatigueCleared = true;
        
        // Enable TOTP sync block
        const syncInput = document.getElementById("mfaSyncInput");
        const syncBtn = document.getElementById("submitMfaSyncBtn");
        const statusLabel = document.getElementById("mfaSyncStatusLabel");
        
        if (syncInput) syncInput.disabled = false;
        if (syncBtn) syncBtn.disabled = false;
        if (statusLabel) {
          statusLabel.textContent = "FATIGUE GUARD CLASSIFIED";
          statusLabel.className = "mfa-sync-lock-status text-green";
        }
        
        this.updateSimbaDialog(`"MFA Fatigue Bombardment neutralized! 😻 Now, look at the TOTP sync panel on the right. Solve the dynamic Time Token formula to authorize hardware gateway sync!"`, "success");
      }
    },

    startOtpTimer: function() {
      this.stopOtpTimer();
      
      this.mfaState.otpTimerInterval = setInterval(() => {
        if (this.mfaState.seconds > 1) {
          this.mfaState.seconds -= 1;
          const secEl = document.getElementById("mfaSecondsVal");
          if (secEl) secEl.textContent = this.mfaState.seconds;
        } else {
          // Regenerate new OTP values on expiry
          this.mfaState.seconds = 30;
          this.mfaState.seed = Math.floor(1000 + Math.random() * 8000);
          
          const seedEl = document.getElementById("mfaSeedVal");
          const secEl = document.getElementById("mfaSecondsVal");
          if (seedEl) seedEl.textContent = this.mfaState.seed;
          if (secEl) secEl.textContent = this.mfaState.seconds;
          
          if (this.mfaState.isFatigueCleared) {
            this.updateSimbaDialog(`"Time window expired! 😿 OTP seeds rotated. Check the new numbers and recalculate the formula!"`, "warn");
          }
        }
      }, 1000);
    },

    stopOtpTimer: function() {
      if (this.mfaState.otpTimerInterval) {
        clearInterval(this.mfaState.otpTimerInterval);
        this.mfaState.otpTimerInterval = null;
      }
    },

    bindMfaEvents: function() {
      const syncBtn = document.getElementById("submitMfaSyncBtn");
      if (syncBtn) {
        syncBtn.addEventListener("click", () => {
          const inputVal = parseInt(document.getElementById("mfaSyncInput").value.trim());
          const correctVal = this.mfaState.seed + this.mfaState.seconds;
          
          if (inputVal === correctVal) {
            // SUCCESS!
            this.stopOtpTimer();
            
            if (window.CyberGame) {
              window.CyberGame.addScore(500);
              window.CyberGame.addXp(200);
            }
            
            this.updateSimbaDialog(`"PURR! MFA synchronization complete! 😻 Hardware tokens aligned and database secured. Escaping Room 5!"`, "success");
            
            setTimeout(() => {
              if (this.onCompleteCallback) this.onCompleteCallback();
            }, 1800);
          } else {
            // FAILED SYNC
            if (window.CyberGame) {
              window.CyberGame.addScore(-20);
            }
            this.updateSimbaDialog(`"Buzzz! 😾 OTP Sync check failed. The dynamic code entered is incorrect or has expired. Try again!"`, "error");
          }
        });
      }
    }
  };

  // Register on window object
  window.CyberPuzzles = CyberPuzzles;
})();
