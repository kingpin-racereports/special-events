/* ============================================================================
 * Planner sign-in modal — Stage 2: wired to real Supabase Auth.
 *
 * Requires supabase-client.js to be loaded first (defines the global
 * `supabase` client). See that file for the one-time project setup steps
 * (URL/key, enabling Google, configuring redirect URLs).
 * ==========================================================================
 */
(function(){

  const LOGO_SRC = "images/KingpinLogo.png";
  const PLANNER_URL = window.location.origin + window.location.pathname.replace(/index\.html$/, "") + "race-strategy-planner.html";

  const ICONS = {
    flag:'<path d="M4 22V4"/><path d="M4 4h14l-2 4 2 4H4"/>',
    mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>',
    arrowLeft:'<path d="M19 12H5M11 19l-7-7 7-7"/>',
    x:'<path d="M18 6 6 18M6 6l12 12"/>',
  };
  function icon(name, size){
    size = size || 16;
    return '<svg class="pa-icon" width="' + size + '" height="' + size + '" viewBox="0 0 24 24">' + (ICONS[name] || "") + '</svg>';
  }
  const GOOGLE_G = '<svg width="18" height="18" viewBox="0 0 48 48">' +
    '<path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.8 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8.1 3l6.1-6.1C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-4z"/>' +
    '<path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.9 1.1 8.1 3l6.1-6.1C34.6 5.1 29.6 3 24 3 16.3 3 9.7 7.4 6.3 14.7z"/>' +
    '<path fill="#4CAF50" d="M24 45c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.5C29.6 35.9 27 36.8 24 36.8c-5.3 0-9.8-3.3-11.4-8l-6.6 5.1C9.6 40.5 16.2 45 24 45z"/>' +
    '<path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 3-3.1 5.5-5.7 7l6.5 5.5C39.9 37.2 43 31.2 43 24c0-1.4-.1-2.7-.4-4z"/>' +
    '</svg>';

  let state = {
    modalOpen: false,
    view: "start",      // start | sending | sent | code | code-error
    email: "",
    emailError: "",
    startError: "",     // Google sign-in failures surface here
    resendIn: 30,
  };
  let resendTimer = null;

  function goToPlanner(){
    window.location.href = "race-strategy-planner.html";
  }

  function esc(s){ return (s == null ? "" : String(s)).replace(/[&<>"']/g, function(c){
    return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c];
  }); }

  function maskEmail(email){
    const parts = email.split("@");
    if (parts.length < 2) return email;
    const user = parts[0], domain = parts[1];
    const visible = user.slice(0,1);
    return visible + "*".repeat(Math.max(user.length-1,3)) + "@" + domain;
  }

  function render(){
    const root = document.getElementById("plannerAuthRoot");
    if (!root) return;
    if (!state.modalOpen){ root.innerHTML = ""; return; }

    let inner = "";
    if (state.view === "start" || state.view === "sending") inner = viewStart();
    else if (state.view === "sent") inner = viewSent();
    else if (state.view === "code" || state.view === "code-error") inner = viewCode();

    root.innerHTML =
      '<div class="pa-overlay" id="paOverlay" role="dialog" aria-modal="true" aria-label="Sign in">' +
        '<div class="pa-card">' +
          '<button class="pa-close" id="paCloseBtn" aria-label="Close">' + icon("x",15) + '</button>' +
          '<div class="pa-card-scroll">' + inner + '</div>' +
        '</div>' +
      '</div>';
    bind();
  }

  function viewStart(){
    const sending = state.view === "sending";
    return (
      '<div class="pa-mark">' +
        '<img src="' + LOGO_SRC + '" alt="Kingpin Racing" onerror="this.outerHTML=\'<div class=&quot;pa-flag-circle&quot;>' + icon("flag",22).replace(/"/g,'&quot;') + '</div>\'" />' +
        '<h1>Kingpin Racing</h1>' +
        '<p>Sign in to view or manage your race plan</p>' +
      '</div>' +
      '<div class="pa-panel">' +
        (state.startError ? '<div class="pa-err-msg" style="margin-bottom:12px;">' + esc(state.startError) + '</div>' : '') +
        '<button class="pa-btn-google" id="paGoogleBtn"' + (sending?" disabled":"") + '>' +
          (sending ? '<span class="pa-spinner"></span> Connecting…' : GOOGLE_G + ' Continue with Google') +
        '</button>' +
        '<div class="pa-divider"><span class="pa-line"></span><span>or</span><span class="pa-line"></span></div>' +
        '<label class="pa-label">Email</label>' +
        '<input class="pa-field' + (state.emailError?' pa-err':'') + '" id="paEmailInput" type="email" placeholder="you@team.com" value="' + esc(state.email) + '"' + (sending?" disabled":"") + ' />' +
        (state.emailError ? '<div class="pa-err-msg">' + esc(state.emailError) + '</div>' : '') +
        '<button class="pa-btn-primary" id="paSendLinkBtn"' + (sending?" disabled":"") + '>' +
          (sending ? '<span class="pa-spinner" style="border-top-color:#EDEFF2;"></span> Sending…' : 'Send Sign-In Link') +
        '</button>' +
      '</div>' +
      '<p class="pa-foot-note">Access is granted by your race engineer —<br/>if your email isn\'t on the roster yet, ask them to add you.</p>'
    );
  }

  function viewSent(){
    return (
      '<button class="pa-back-link" data-act="back-to-start">' + icon("arrowLeft",14) + ' Use a different email</button>' +
      '<div class="pa-panel pa-center">' +
        '<div class="pa-icon-badge">' + icon("mail",22) + '</div>' +
        '<h2>Check your email</h2>' +
        '<p>We sent a sign-in link to<br/><span class="pa-email-chip">' + esc(maskEmail(state.email)) + '</span></p>' +
        '<div class="pa-row-links">' +
          '<button class="pa-link-btn" id="paResendBtn"' + (state.resendIn>0?" disabled":"") + '>' +
            (state.resendIn>0 ? 'Resend in 0:' + String(state.resendIn).padStart(2,"0") : 'Resend link') +
          '</button>' +
          '<span class="pa-sep">·</span>' +
          '<button class="pa-link-btn" data-act="use-code">Use a code instead</button>' +
        '</div>' +
      '</div>' +
      '<div class="pa-role-hint">' +
        icon("shield",15) +
        '<span>Opening the link on any device signs you in — your role (engineer or driver) is set automatically based on your race roster.</span>' +
      '</div>'
    );
  }

  function viewCode(){
    const bad = state.view === "code-error";
    let boxes = "";
    for (let i=0;i<6;i++){
      boxes += '<input class="pa-otp-box" data-otp="' + i + '" maxlength="1" inputmode="numeric"' + (bad?' style="border-color:var(--pa-red);"':'') + ' />';
    }
    return (
      '<button class="pa-back-link" data-act="back-to-sent">' + icon("arrowLeft",14) + ' Back</button>' +
      '<div class="pa-panel pa-center">' +
        '<h2>Enter the code</h2>' +
        '<p>We sent a 6-digit code to<br/><span class="pa-email-chip">' + esc(maskEmail(state.email)) + '</span></p>' +
        '<div class="pa-otp-row">' + boxes + '</div>' +
        (bad ? '<div class="pa-err-msg" style="margin-top:2px;">That code didn\'t match. Check your email and try again.</div>' : '') +
        '<button class="pa-btn-primary" id="paVerifyBtn" style="margin-top:18px;">Verify &amp; Sign In</button>' +
        '<div class="pa-row-links"><button class="pa-link-btn" id="paResendCodeBtn">Resend code</button></div>' +
      '</div>'
    );
  }

  function openModal(){
    state.modalOpen = true;
    state.view = "start";
    state.email = "";
    state.emailError = "";
    state.startError = "";
    render();
    document.addEventListener("keydown", escListener);
  }
  function closeModal(){
    clearInterval(resendTimer);
    state.modalOpen = false;
    document.removeEventListener("keydown", escListener);
    render();
  }
  function escListener(e){ if (e.key === "Escape") closeModal(); }

  function startResendTimer(){
    clearInterval(resendTimer);
    resendTimer = setInterval(function(){
      state.resendIn -= 1;
      if (state.resendIn <= 0) clearInterval(resendTimer);
      const btn = document.getElementById("paResendBtn");
      if (btn){
        if (state.resendIn > 0){
          btn.disabled = true;
          btn.textContent = "Resend in 0:" + String(state.resendIn).padStart(2,"0");
        } else {
          btn.disabled = false;
          btn.textContent = "Resend link";
        }
      }
    }, 1000);
  }

  // Sends (or resends) the magic link + numeric code in one call — both
  // arrive in the same email, which is why "Use a code instead" and
  // "Resend code" reuse this exact function rather than needing a
  // separate code-only endpoint.
  async function sendMagicLink(){
    const { error } = await supabase.auth.signInWithOtp({
      email: state.email,
      options: { emailRedirectTo: PLANNER_URL }
    });
    return error;
  }

  function bind(){
    const overlay = document.getElementById("paOverlay");
    if (overlay) overlay.addEventListener("click", function(e){ if (e.target === overlay) closeModal(); });
    const closeBtn = document.getElementById("paCloseBtn");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    const googleBtn = document.getElementById("paGoogleBtn");
    if (googleBtn) googleBtn.addEventListener("click", async function(){
      state.startError = "";
      state.view = "sending"; render();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: PLANNER_URL }
      });
      // On success this line is never reached — signInWithOAuth navigates
      // the whole page to Google's consent screen as a side effect.
      if (error){
        state.view = "start";
        state.startError = "Couldn't start Google sign-in. Please try again.";
        render();
      }
    });

    const emailInput = document.getElementById("paEmailInput");
    if (emailInput){
      emailInput.addEventListener("input", function(){ state.email = emailInput.value; });
      emailInput.addEventListener("keydown", function(e){ if (e.key === "Enter") document.getElementById("paSendLinkBtn").click(); });
    }

    const sendLinkBtn = document.getElementById("paSendLinkBtn");
    if (sendLinkBtn) sendLinkBtn.addEventListener("click", async function(){
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim());
      if (!valid){ state.emailError = "Enter a valid email address."; render(); return; }
      state.email = state.email.trim();
      state.emailError = "";
      state.view = "sending"; render();

      const error = await sendMagicLink();
      if (error){
        state.view = "start";
        state.emailError = "Couldn't send the link. Please try again.";
        render();
        return;
      }
      state.view = "sent";
      state.resendIn = 30;
      render();
      startResendTimer();
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-act="back-to-start"]'), function(el){
      el.addEventListener("click", function(){ clearInterval(resendTimer); state.view = "start"; render(); });
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-act="back-to-sent"]'), function(el){
      el.addEventListener("click", function(){ state.view = "sent"; render(); });
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-act="use-code"]'), function(el){
      el.addEventListener("click", function(){ clearInterval(resendTimer); state.view = "code"; render(); });
    });

    const resendBtn = document.getElementById("paResendBtn");
    if (resendBtn) resendBtn.addEventListener("click", async function(){
      if (state.resendIn > 0) return;
      resendBtn.disabled = true;
      await sendMagicLink();
      state.resendIn = 30; render(); startResendTimer();
    });
    const resendCodeBtn = document.getElementById("paResendCodeBtn");
    if (resendCodeBtn) resendCodeBtn.addEventListener("click", async function(){
      resendCodeBtn.disabled = true;
      await sendMagicLink();
      resendCodeBtn.disabled = false;
    });

    const otpBoxes = document.querySelectorAll('[data-otp]');
    Array.prototype.forEach.call(otpBoxes, function(el, idx){
      el.addEventListener("input", function(){
        el.value = el.value.replace(/[^0-9]/g,"").slice(0,1);
        if (el.value && otpBoxes[idx+1]) otpBoxes[idx+1].focus();
      });
      el.addEventListener("keydown", function(e){
        if (e.key === "Backspace" && !el.value && otpBoxes[idx-1]) otpBoxes[idx-1].focus();
      });
    });

    const verifyBtn = document.getElementById("paVerifyBtn");
    if (verifyBtn) verifyBtn.addEventListener("click", async function(){
      const digits = Array.prototype.map.call(document.querySelectorAll('[data-otp]'), function(el){ return el.value; }).join("");
      if (digits.length < 6){ state.view = "code-error"; render(); return; }
      verifyBtn.disabled = true;
      const { error } = await supabase.auth.verifyOtp({ email: state.email, token: digits, type: "email" });
      if (error){
        state.view = "code-error";
        render();
        return;
      }
      goToPlanner();
    });
  }

  document.addEventListener("DOMContentLoaded", function(){
    const trigger = document.getElementById("openPlannerBtn");
    if (trigger) trigger.addEventListener("click", async function(e){
      e.preventDefault();
      // getSession() reads the cached session first (localStorage, no
      // network round-trip in the common case), so this resolves near-
      // instantly — no visible flicker before deciding modal vs. redirect.
      const { data: { session } } = await supabase.auth.getSession();
      if (session){
        goToPlanner(); // already signed in — no modal, straight through
      } else {
        openModal();
      }
    });
  });

})();
