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

    /**
     * Set up listeners and references
     */
    init: function() {
      this.bindPhishingEvents();
      this.bindPasswordEvents();
      this.bindCipherEvents();
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
    }
  };

  // Register on window object
  window.CyberPuzzles = CyberPuzzles;
})();
