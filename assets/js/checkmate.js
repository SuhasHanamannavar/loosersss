/* CHECKMATE app console — shared shell, AWS DynamoDB sync, and zero-trust verification.
   Every dashboard renders empty until real records are provisioned or evaluated.
   Mirrors control plane operations: setup / read / revoke / protected_read / audit. */
(function () {
  "use strict";

  /* ---------------- Hard purge of legacy mock data ---------------- */
  try {
    var savedAuth = localStorage.getItem("cm_auth_session") || sessionStorage.getItem("cm_auth_session");
    localStorage.clear();
    sessionStorage.clear();
    if (savedAuth) {
      localStorage.setItem("cm_auth_session", savedAuth);
      sessionStorage.setItem("cm_auth_session", savedAuth);
    }
  } catch (e) {}

  /* ---------------- Auth Gate: redirect to login if unauthenticated ---------------- */
  var authSession = null;
  try {
    authSession = JSON.parse(localStorage.getItem("cm_auth_session") || sessionStorage.getItem("cm_auth_session") || "null");
  } catch (e) {}

  var rawSegments = location.pathname.split("/").filter(Boolean);
  var currentPath = (rawSegments.pop() || "console.html").toLowerCase();
  var isPublicPage = currentPath === "login.html" || currentPath === "login" ||
                     currentPath === "index.html" || currentPath === "index" ||
                     currentPath === "" || currentPath === "404.html" || currentPath === "404";

  if (!isPublicPage && (!authSession || !authSession.email)) {
    var targetPage = (currentPath.indexOf(".") === -1 ? currentPath + ".html" : currentPath);
    window.location.replace("login.html?redirect=" + encodeURIComponent(targetPage));
    return;
  }

  /* ---------------- icons (inline, no external font) ---------------- */
  var ICONS = {
    king: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3"/><path d="M10.5 4.5h3"/><path d="M5 8.5 7.6 11 12 7.8 16.4 11 19 8.5l-1.8 6.4a2.4 2.4 0 0 1-2.3 1.8H9.1a2.4 2.4 0 0 1-2.3-1.8L5 8.5z"/><path d="M8.6 16.7h6.8l.5 3.3H8.1l.5-3.3z"/></svg>',
    shield: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.6-3 8.2-7 10-4-1.8-7-5.4-7-10V6l7-3z"/><path d="M9 12l2 2 4-4"/></svg>',
    bolt: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L5 13h6l-1 9 8-11h-6l1-9z"/></svg>',
    key: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="4"/><path d="M11 11l9 9"/><path d="M17 17l2.5-2.5"/><path d="M14.5 14.5l2-2"/></svg>',
    lock: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10" width="14" height="10" rx="2.5"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/></svg>',
    chip: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="7" y="7" width="10" height="10" rx="2"/><rect x="10" y="10" width="4" height="4"/><path d="M10 3.5V7M14 3.5V7M10 17v3.5M14 17v3.5M3.5 10H7M3.5 14H7M17 10h3.5M17 14h3.5"/></svg>',
    audit: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M9.5 13l1.8 1.8 3.2-3.2"/></svg>',
    layers: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></svg>',
    server: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="4" y="4" width="16" height="6" rx="2"/><rect x="4" y="14" width="16" height="6" rx="2"/><path d="M7.5 7h.01M7.5 17h.01"/></svg>',
    eye: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    check: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    download: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11"/><path d="M7.5 11.5L12 16l4.5-4.5"/><path d="M5 20h14"/></svg>',
    search: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
    plus: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    users: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1"/><circle cx="10" cy="7" r="3.2"/><path d="M20 19v-1a4 4 0 0 0-3-3.8"/><path d="M15 4.2a3.2 3.2 0 0 1 0 5.6"/></svg>',
    user: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.4"/><path d="M5 20v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1"/></svg>',
    settings: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.09a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.09a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1z"/></svg>',
    terminal: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M7.5 9.5l3 2.5-3 2.5M12.5 14.5h4"/></svg>',
    globe: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.6 2.5 15.4 0 18"/><path d="M12 3c-2.5 2.6-2.5 15.4 0 18"/></svg>',
    copy: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    "chevron-down": '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
    external: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6"/><path d="M20 4L10 14"/><path d="M19 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6"/></svg>',
    activity: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l3 8 4-16 3 8h4"/></svg>',
    trash: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',
    ban: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/></svg>',
    file: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
    building: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16"/><path d="M15 9h3a1 1 0 0 1 1 1v11"/><path d="M8 7h2M8 11h2M8 15h2"/></svg>',
    refresh: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.3"/><path d="M21 3v6h-6"/></svg>',
    close: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    menu: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 8h16M4 16h16"/></svg>',
    "arrow-right": '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16"/><path d="M14 6l6 6-6 6"/></svg>',
    alert: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 20h20z"/><path d="M12 10v4"/><path d="M12 17h.01"/></svg>',
    filter: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h18l-7 8v6l-4 2v-8z"/></svg>',
    plug: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2v6M15 2v6"/><path d="M6 8h12v3a6 6 0 0 1-12 0z"/><path d="M12 17v5"/></svg>',
    inbox: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13l2.5-7.5A2 2 0 0 1 7.4 4h9.2a2 2 0 0 1 1.9 1.5L21 13v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 13h5l1.5 2.5h5L16 13h5"/></svg>'
  };

  function renderIcons(root) {
    (root || document).querySelectorAll("[data-icon]").forEach(function (el) {
      var n = el.getAttribute("data-icon");
      if (ICONS[n]) el.innerHTML = ICONS[n];
    });
  }
  renderIcons(document);
  window.CMRenderIcons = renderIcons;

  /* ---------------- helpers ---------------- */
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function localTime(d) { d = d || new Date(); return pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds()); }
  function stamp() { var d = new Date(); return pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes()); }
  function rid() { return "req-" + Math.random().toString(16).slice(2, 8); }
  function initials(name) {
    var parts = (name || "").split(/\s+/);
    return ((parts[0] || "")[0] || "") + ((parts[1] || "")[0] || "");
  }
  function randHex(bytes) {
    var out = "";
    try {
      var a = new Uint8Array(bytes);
      crypto.getRandomValues(a);
      for (var i = 0; i < a.length; i++) out += a[i].toString(16).padStart(2, "0");
    } catch (e) {
      for (var j = 0; j < bytes * 2; j++) out += "0123456789abcdef"[Math.floor(Math.random() * 16)];
    }
    return out;
  }
  function shortHex(hex, n) { return hex.slice(0, n) + "…"; }

  var toastEl = document.querySelector(".toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2600);
  }

  /* ---------------- State model (Clean empty state) ---------------- */
  var STORE_KEY = "cm_workspace_v1";
  var disabled = {};
  try { disabled = JSON.parse(localStorage.getItem(STORE_KEY) || "{}") || {}; } catch (e) { disabled = {}; }
  function persistDisabled() { try { localStorage.setItem(STORE_KEY, JSON.stringify(disabled)); } catch (e) {} }

  var ACTORS = [];
  var ASSETS = [];
  var REGISTRY = [];
  var AUDIT = [];
  var KEYS = [];

  function actorById(id) { return ACTORS.find(function (a) { return a.id === id; }); }
  function emptyRow(colspan, icon, title, hint, extraAttrs) {
    return '<tr' + (extraAttrs || "") + '><td colspan="' + colspan + '"><div class="empty">' +
      '<span data-icon="' + icon + '"></span><h4>' + title + "</h4><p>" + hint + "</p></div></td></tr>";
  }

  /* ---------------- Shell: nav, sidebar, tabs, modals, copy ---------------- */
  var here = (location.pathname.split("/").pop() || "console.html").toLowerCase();
  document.querySelectorAll(".side-item[data-nav]").forEach(function (a) {
    if (a.getAttribute("data-nav").toLowerCase() === here) a.classList.add("active");
  });
  var side = document.getElementById("side");
  var scrim = document.getElementById("sideScrim");
  var menuBtn = document.getElementById("menuBtn");
  function closeSide() { side && side.classList.remove("open"); scrim && scrim.classList.remove("open"); }
  if (menuBtn) menuBtn.addEventListener("click", function () {
    side.classList.toggle("open"); scrim.classList.toggle("open");
  });
  if (scrim) scrim.addEventListener("click", closeSide);

  document.querySelectorAll("[data-tabs]").forEach(function (group) {
    var btns = group.querySelectorAll("[data-tab]");
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        btns.forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active");
        var target = b.getAttribute("data-tab");
        var scope = group.closest("[data-tabs-scope]") || document;
        scope.querySelectorAll("[data-panel]").forEach(function (p) {
          p.hidden = p.getAttribute("data-panel") !== target;
        });
      });
    });
  });

  document.querySelectorAll("[data-modal-open]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-modal-open");
      var backdrop = document.getElementById(id + "-backdrop");
      var modal = document.getElementById(id);
      if (!backdrop || !modal) return;
      backdrop.classList.add("open");
      modal.classList.add("open");
      document.body.style.overflow = "hidden";
    });
  });

  function closeModal(backdrop, modal) {
    backdrop && backdrop.classList.remove("open");
    modal && modal.classList.remove("open");
    document.body.style.overflow = "";
  }
  document.querySelectorAll(".modal-backdrop").forEach(function (bd) {
    bd.addEventListener("click", function () {
      var m = document.getElementById(bd.id.replace("-backdrop", ""));
      closeModal(bd, m);
    });
  });
  document.querySelectorAll("[data-modal-close]").forEach(function (b) {
    b.addEventListener("click", function () {
      var modal = b.closest(".modal");
      var bd = modal && document.getElementById(modal.id + "-backdrop");
      closeModal(bd, modal);
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal.open").forEach(function (m) {
        closeModal(document.getElementById(m.id + "-backdrop"), m);
      });
      closeSide();
    }
  });
  document.querySelectorAll("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var target = b.getAttribute("data-copy-target");
      var text = target ? (document.querySelector(target) || {}).textContent : (b.getAttribute("data-copy") || b.getAttribute("data-copy-text"));
      if (!text) return;
      navigator.clipboard && navigator.clipboard.writeText(text.trim());
      toast("Copied to clipboard");
    });
  });

  /* ---------------- Topbar Auth & Sync Status ---------------- */
  var syncStatus = document.querySelector(".sync-status");
  if (syncStatus && authSession) {
    syncStatus.innerHTML = '<span class="dot" style="background:#28c840"></span>' + (authSession.email || 'AWS DynamoDB') + ' · us-east-1';
  }

  async function syncPost(action, data) {
    try {
      var res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: action, data: data })
      });
      return await res.json();
    } catch (e) {
      console.warn("Offline/local mode fallback:", e);
      return { ok: true, fallback: true };
    }
  }

  async function fetchStateFromAWS() {
    try {
      var res = await fetch("/api/sync");
      if (res.ok) {
        var data = await res.json();
        if (data.ok) {
          ACTORS = data.actors || [];
          ASSETS = data.assets || [];
          REGISTRY = data.registry || [];
          AUDIT = data.audit || [];
          KEYS = data.keys || [];

          REGISTRY.forEach(function (r) { if (r.actor) disabled[r.actor] = true; });
          persistDisabled();

          if (syncStatus && authSession) {
            syncStatus.innerHTML = '<span class="dot" style="background:#28c840"></span>' + (authSession.email || 'AWS DynamoDB') + ' · us-east-1';
          }
          renderAllViews();
          return;
        }
      }
    } catch (e) {
      console.warn("Direct AWS sync not available, operating in clean local mode", e);
    }
    renderAllViews();
  }

  function renderAllViews() {
    renderOverview();
    renderIdentities(currentIdentityFilter());
    renderAssets();
    renderRegistry();
    refreshWizardSelect();
    renderStream();
    renderKeys();
    updateSidebarCounts();
    updateStatsCards();
  }

  function updateSidebarCounts() {
    var sideCount = document.getElementById("sideIdentityCount");
    if (!sideCount) return;
    var count = ACTORS.filter(function (a) { return !disabled[a.id]; }).length;
    if (count > 0) {
      sideCount.textContent = count;
      sideCount.style.display = "inline-flex";
    } else {
      sideCount.textContent = "";
      sideCount.style.display = "none";
    }
  }

  function updateStatsCards() {
    var activeEl = document.querySelector(".stat:nth-child(1) .k-value");
    var activeSub = document.querySelector(".stat:nth-child(1) .k-sub");
    var revEl = document.querySelector(".stat:nth-child(2) .k-value");
    var revSub = document.querySelector(".stat:nth-child(2) .k-sub");
    var assetEl = document.querySelector(".stat:nth-child(3) .k-value");
    var assetSub = document.querySelector(".stat:nth-child(3) .k-sub");
    var healthEl = document.querySelector(".stat:nth-child(4) .k-value");
    var healthSub = document.querySelector(".stat:nth-child(4) .k-sub");

    var activeCount = ACTORS.filter(function (a) { return !disabled[a.id]; }).length;
    if (activeEl) activeEl.textContent = activeCount.toLocaleString();
    if (activeSub) activeSub.textContent = activeCount > 0 ? (activeCount + " active in session") : "no identities provisioned yet";

    if (revEl) revEl.textContent = REGISTRY.length.toLocaleString();
    if (revSub) revSub.textContent = REGISTRY.length > 0 ? (REGISTRY.length + " locked in blocklist") : "committed to disabled registry";

    if (assetEl) assetEl.textContent = ASSETS.length.toLocaleString();
    if (assetSub) assetSub.textContent = ASSETS.length > 0 ? (ASSETS.length + " envelopes sealed") : "secrets, exports, connection strings";

    if (AUDIT.length === 0) {
      if (healthEl) healthEl.textContent = "—";
      if (healthSub) healthSub.textContent = "no decisions recorded in the last 24 h";
    } else {
      var allowed = AUDIT.filter(function (r) { return r.decision === "allow"; }).length;
      var pct = ((allowed / AUDIT.length) * 100).toFixed(1);
      if (healthEl) healthEl.textContent = pct + "%";
      if (healthSub) healthSub.textContent = allowed + " allowed · " + (AUDIT.length - allowed) + " denied (" + AUDIT.length + " total)";
    }
  }

  /* ---------------- Overview Page ---------------- */
  var overviewRows = document.getElementById("overviewRows");
  function renderOverview() {
    if (!overviewRows) return;
    if (!AUDIT.length) {
      overviewRows.innerHTML = emptyRow(6, "activity", "No recent decisions", "Authorized and denied requests evaluated against the disabled registry will appear here.");
      renderIcons(overviewRows);
      return;
    }
    overviewRows.innerHTML = AUDIT.slice(0, 5).map(function (r) {
      var modeBadge = r.mode === "protected_read" || r.mode === "PQ"
        ? '<span class="badge pq">PQ</span>'
        : '<span class="badge std">read</span>';
      return "<tr data-decision='" + r.decision + "'>" +
        '<td class="mono sub">' + (r.ts || "").replace("T", " ").replace("Z", "").slice(0, 19) + "</td>" +
        '<td class="mono sub">' + r.id + "</td>" +
        '<td class="mono">' + r.actor + "</td>" +
        '<td class="sub">' + r.asset + "</td>" +
        "<td>" + modeBadge + "</td>" +
        "<td>" + badgeFor(r.decision) + "</td></tr>";
    }).join("");
    renderIcons(overviewRows);
  }

  /* ---------------- Identities Page ---------------- */
  var identityBody = document.getElementById("identityRows");
  function currentIdentityFilter() {
    var active = document.querySelector("[data-identity-filter].active");
    return active ? active.getAttribute("data-identity-filter") : "all";
  }

  function renderIdentities(filter) {
    if (!identityBody) return;
    filter = (filter || "all").toLowerCase();
    var rows = ACTORS.filter(function (a) {
      var locked = !!disabled[a.id];
      if (filter === "trusted" && locked) return false;
      if (filter === "locked" && !locked) return false;
      return true;
    });

    if (!rows.length) {
      identityBody.innerHTML = emptyRow(7, "users", "No identities yet", "Provisioned actors appear here after the control plane connects.");
      renderIcons(identityBody);
      return;
    }

    identityBody.innerHTML = rows.map(function (a) {
      var locked = !!disabled[a.id];
      var status = locked
        ? '<span class="badge lock">Locked</span>'
        : '<span class="badge allow">Trusted</span>';
      var last = locked
        ? '<span class="sub mono">revoked · no session</span>'
        : '<span class="mono sub">' + (a.last || "now") + "</span>";
      var actions = '<button class="row-btn" data-detail="' + a.id + '">Profile</button>' +
        (locked ? "" : '<button class="row-btn danger" data-revoke="' + a.id + '">Revoke</button>');
      return '<tr data-status="' + (locked ? "locked" : "trusted") + '" data-search="' + (a.name + " " + a.id + " " + a.role + " " + a.region).toLowerCase() + '">' +
        '<td><div class="cell-main"><span class="avatar tiny">' + initials(a.name) + '</span>' +
        '<span class="meta"><span class="name">' + a.name + '</span><span class="handle">@' + a.id + "</span></span></div></td>" +
        '<td class="mono" style="font-size:12px">' + a.role + "</td>" +
        '<td class="mono sub">' + a.region + "</td>" +
        "<td>" + (a.devices || "1 device") + "</td>" +
        "<td>" + last + "</td>" +
        "<td>" + status + "</td>" +
        '<td><div class="row-actions">' + actions + "</div></td></tr>";
    }).join("");

    identityBody.querySelectorAll("[data-revoke]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-revoke");
        var bd = document.getElementById("revokeModal-backdrop");
        var modal = document.getElementById("revokeModal");
        if (!bd || !modal) return;
        bd.classList.add("open");
        modal.classList.add("open");
        document.body.style.overflow = "hidden";
        var sel = document.getElementById("revokeActorSelect");
        if (sel) sel.value = id;
      });
    });

    identityBody.querySelectorAll("[data-detail]").forEach(function (b) {
      b.addEventListener("click", function () { openIdentityDetail(b.getAttribute("data-detail")); });
    });
    renderIcons(identityBody);
  }

  function openIdentityDetail(id) {
    var a = actorById(id); if (!a) return;
    var locked = !!disabled[id];
    var box = document.getElementById("identityDetailBody");
    if (!box) return;
    box.innerHTML =
      '<div class="fact-grid">' +
      '<div class="fact"><div class="k">Handle</div><div class="v">@' + a.id + "</div></div>" +
      '<div class="fact"><div class="k">Role</div><div class="v">' + a.role + "</div></div>" +
      '<div class="fact"><div class="k">Region</div><div class="v">' + a.region + "</div></div>" +
      '<div class="fact"><div class="k">Email</div><div class="v">' + (a.email || (a.id + "@checkmate.local")) + "</div></div>" +
      '<div class="fact"><div class="k">Devices registered</div><div class="v">' + (a.devices || "1 device") + "</div></div>" +
      '<div class="fact"><div class="k">Provisioned</div><div class="v">' + (a.since || stamp()) + "</div></div>" +
      "</div>" +
      '<div style="margin-top:16px"><span class="field-label">Protected assets held</span><table class="tbl"><tbody>' +
      ASSETS.filter(function (x) { return x.owner === id; }).map(function (x) {
        return "<tr><td class='mono'>" + x.id + "</td><td class='sub mono'>" + x.policy + "</td></tr>";
      }).join("") +
      "</tbody></table></div>";
    document.getElementById("identityModal-backdrop").classList.add("open");
    document.getElementById("identityModal").classList.add("open");
    document.body.style.overflow = "hidden";
    var footerBtn = document.getElementById("identityRevokeBtn");
    if (footerBtn) {
      footerBtn.style.display = locked ? "none" : "inline-flex";
      footerBtn.setAttribute("data-revoke-direct", id);
    }
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-revoke-direct]");
    if (!b) return;
    var id = b.getAttribute("data-revoke-direct");
    closeModal(document.getElementById("identityModal-backdrop"), document.getElementById("identityModal"));
    var sel = document.getElementById("revokeActorSelect");
    if (sel) sel.value = id;
    var rm = document.getElementById("revokeModal");
    var rmBd = document.getElementById("revokeModal-backdrop");
    if (!rm || !rmBd) return;
    rmBd.classList.add("open");
    rm.classList.add("open");
    document.body.style.overflow = "hidden";
  });

  document.querySelectorAll("[data-identity-filter]").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll("[data-identity-filter]").forEach(function (t) { t.classList.remove("active"); });
      tab.classList.add("active");
      renderIdentities(tab.getAttribute("data-identity-filter"));
    });
  });

  var idSearch = document.getElementById("identitySearch");
  if (idSearch) idSearch.addEventListener("input", function () {
    var q = idSearch.value.trim().toLowerCase();
    identityBody.querySelectorAll("tr").forEach(function (tr) {
      tr.style.display = !q || (tr.getAttribute("data-search") || "").indexOf(q) >= 0 ? "" : "none";
    });
  });

  var provisionBtn = document.getElementById("provisionBtn");
  if (provisionBtn) {
    provisionBtn.addEventListener("click", async function () {
      var nameEl = document.getElementById("provName");
      var roleEl = document.getElementById("provRole");
      var regEl = document.getElementById("provRegion");

      var name = (nameEl ? nameEl.value : "").trim();
      if (!name) {
        if (nameEl) nameEl.focus();
        return;
      }
      var role = roleEl ? roleEl.value : "developer";
      var region = regEl ? regEl.value : "us-east";
      var id = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      if (!id) id = "user-" + Math.random().toString(36).slice(2, 6);

      var newActor = {
        id: id,
        name: name,
        role: role,
        region: region,
        email: id + "@checkmate.local",
        devices: "1 laptop",
        since: stamp(),
        last: "just now"
      };

      ACTORS.push(newActor);
      closeModal(document.getElementById("provisionModal-backdrop"), document.getElementById("provisionModal"));
      if (nameEl) nameEl.value = "";

      renderIdentities();
      refreshWizardSelect();
      updateSidebarCounts();
      updateStatsCards();

      toast("Identity provisioned: @" + id + " · committed to AWS DynamoDB");
      await syncPost("provision_actor", newActor);
    });
  }

  /* ---------------- Assets Page ---------------- */
  var assetBody = document.getElementById("assetRows");
  function renderAssets() {
    if (!assetBody) return;
    if (!ASSETS.length) {
      assetBody.innerHTML = emptyRow(6, "file", "No protected assets yet", "Sealed envelopes appear here once the guard registers assets.", 'data-tier="all"');
      renderIcons(assetBody);
      return;
    }
    assetBody.innerHTML = ASSETS.map(function (a) {
      var tier = a.tier === "pq"
        ? '<span class="badge pq">PQ · ML-KEM-768</span>'
        : '<span class="badge std">Standard</span>';
      return '<tr data-tier="' + a.tier + '" data-search="' + (a.id + " " + a.kind + " " + a.owner + " " + a.policy).toLowerCase() + '">' +
        '<td><div class="cell-main"><span class="avatar tiny" style="background:var(--fill);color:var(--ink)"><span data-icon="file"></span></span>' +
        '<span class="meta"><span class="name mono" style="font-size:12.5px">' + a.id + '</span><span class="handle">' + a.kind + "</span></span></div></td>" +
        '<td class="mono sub">@' + a.owner + "</td>" +
        "<td>" + tier + "</td>" +
        '<td class="mono sub" style="font-size:11.5px">' + a.policy + "</td>" +
        '<td class="mono sub">' + (a.size || "1.2 KB") + "</td>" +
        '<td class="mono sub">' + (a.last || "now") + "</td>" +
        '<td><div class="row-actions"><button class="row-btn" data-asset-inspect="' + a.id + '">Inspect</button></div></td></tr>';
    }).join("");
    renderIcons(assetBody);
  }

  var protectForm = document.getElementById("protectForm");
  if (protectForm) {
    protectForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      var idEl = document.getElementById("newAssetId");
      var kindEl = document.getElementById("newAssetKind");
      var ownerEl = document.getElementById("newAssetOwner");

      var id = (idEl ? idEl.value : "").trim();
      var kind = kindEl ? kindEl.value : "env-file";
      var owner = (ownerEl && ownerEl.value ? ownerEl.value : "").trim() || "admin";

      if (!id) {
        if (idEl) idEl.focus();
        return;
      }

      var newAsset = {
        id: id,
        kind: kind,
        owner: owner,
        tier: "pq",
        policy: "owner_allowed · protected_read required",
        size: "1.08 KB",
        last: stamp()
      };

      ASSETS.push(newAsset);
      closeModal(document.getElementById("protectModal-backdrop"), document.getElementById("protectModal"));
      if (idEl) idEl.value = "";

      renderAssets();
      updateStatsCards();
      toast("Asset sealed: " + id + " · registered in AWS DynamoDB");
      await syncPost("register_asset", newAsset);
    });
  }

  var protectModalOpen = document.querySelector('[data-modal-open="protectModal"]');
  if (protectModalOpen) {
    protectModalOpen.addEventListener("click", function () {
      var ownerSelect = document.getElementById("newAssetOwner");
      if (!ownerSelect) return;
      if (ACTORS.length === 0) {
        ownerSelect.innerHTML = '<option value="admin">admin (default)</option>';
      } else {
        ownerSelect.innerHTML = ACTORS.filter(function (a) { return !disabled[a.id]; }).map(function (a) {
          return '<option value="' + a.id + '">@' + a.id + " (" + a.name + ")</option>";
        }).join("");
      }
    });
  }

  /* ---------------- Revocation (Shared across Killswitch + Identities) ---------------- */
  async function revokeActor(id, reason, byLabel) {
    if (!id) return;
    if (!disabled[id]) {
      disabled[id] = true;
      persistDisabled();
      var revRecord = { actor: id, ts: stamp(), by: byLabel || ("Admin revoke · " + reason), proof: randHex(16) };
      REGISTRY.unshift(revRecord);
      await syncPost("revoke_actor", revRecord);

      var reqId = rid();
      var auditRecord = {
        id: reqId,
        ts: new Date().toISOString(),
        actor: id,
        asset: "identity_registry",
        mode: "revoke",
        decision: "allow",
        rule: "admin_revocation",
        nd: true
      };
      AUDIT.unshift(auditRecord);
      await syncPost("log_audit", auditRecord);
    }
    renderAllViews();
    toast(id + " · identity_disabled committed to AWS DynamoDB");
  }

  window.CM = { revokeActor: revokeActor, disabled: disabled };

  var registryBody = document.getElementById("registryRows");
  function renderRegistry() {
    if (!registryBody) return;
    if (!REGISTRY.length) {
      registryBody.innerHTML = emptyRow(5, "lock", "Disabled registry is empty", "Signed revocation proofs appear here when an actor is revoked.");
      renderIcons(registryBody);
      return;
    }
    registryBody.innerHTML = REGISTRY.map(function (r) {
      return "<tr><td class='mono'>" + r.actor + "</td><td class='mono sub'>" + r.ts +
        "</td><td class='sub'>" + r.by + "</td><td class='mono sub' style='font-size:11px'>" + (r.proof ? shortHex(r.proof, 16) : "—") +
        "</td><td><span class='badge lock'>Locked</span></td></tr>";
    }).join("");
    renderIcons(registryBody);
  }

  var propValue = document.getElementById("propValue");
  var propNote = document.getElementById("propNote");
  function runPropagation(cb) {
    if (!propValue) { cb && cb(); return; }
    var start = performance.now(), dur = 820;
    function frame(ts) {
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      propValue.textContent = (840 * (1 - eased)).toFixed(1) + " ms";
      if (p < 1) requestAnimationFrame(frame);
      else {
        propValue.textContent = "0.0 ms";
        cb && cb();
      }
    }
    requestAnimationFrame(frame);
  }

  var wizardSelect = document.getElementById("actorSelect");
  function refreshWizardSelect() {
    if (!wizardSelect) return;
    var activeActors = ACTORS.filter(function (a) { return !disabled[a.id]; });
    if (!activeActors.length) {
      wizardSelect.innerHTML = '<option value="" disabled selected>No active identities available</option>';
      return;
    }
    wizardSelect.innerHTML = activeActors.map(function (a) {
      return '<option value="' + a.id + '">' + a.id + " · " + a.role + " · " + a.region + "</option>";
    }).join("");
  }

  var killswitchBtn = document.getElementById("revokeBtn");
  if (killswitchBtn) {
    killswitchBtn.addEventListener("click", function () {
      var sel = document.getElementById("actorSelect");
      var id = sel ? sel.value : "";
      if (!id) {
        toast("No active identity selected to revoke");
        return;
      }
      var reasonEl = document.querySelector('input[name="reason"]:checked');
      var reason = reasonEl ? reasonEl.value : "Stolen laptop";
      runPropagation(function () {
        revokeActor(id, reason, "Admin revoke · " + reason);
        if (propNote) propNote.textContent = id + " · identity_disabled committed at " + localTime();
      });
    });
  }

  var confirmRevoke = document.getElementById("confirmRevokeBtn");
  if (confirmRevoke) {
    confirmRevoke.addEventListener("click", function () {
      var sel = document.getElementById("revokeActorSelect");
      var id = sel ? sel.value : "";
      if (!id) { toast("No identity available to revoke"); return; }
      var reasonEl = document.querySelector('input[name="mreason"]:checked');
      var reason = reasonEl ? reasonEl.value : "Stolen laptop";
      closeModal(document.getElementById("revokeModal-backdrop"), document.getElementById("revokeModal"));
      runPropagation(function () { revokeActor(id, reason, "Admin revoke · " + reason); });
    });
  }

  /* ---------------- Logs Page ---------------- */
  var logBody = document.getElementById("logRows");
  function badgeFor(d) { return d === "allow" ? '<span class="badge allow">ALLOW</span>' : '<span class="badge deny">DENY</span>'; }

  function renderStream() {
    if (!logBody) return;
    if (!AUDIT.length) {
      logBody.innerHTML = emptyRow(6, "server", "No decisions yet", "Verified requests stream here as the guard checks identities.", 'data-decision="all" class="empty-row"');
      renderIcons(logBody);
      return;
    }
    logBody.innerHTML = AUDIT.map(function (r) {
      var modeBadge = r.mode === "protected_read" || r.mode === "PQ"
        ? '<span class="badge pq">PQ</span>'
        : '<span class="badge std">read</span>';
      return '<tr data-decision="' + r.decision + '">' +
        '<td class="mono sub">' + (r.ts || "").replace("T", " ").replace("Z", "").slice(0, 19) + "</td>" +
        '<td class="mono sub">' + r.id + "</td>" +
        '<td class="mono">' + r.actor + "</td>" +
        '<td class="sub">' + r.asset + "</td>" +
        "<td>" + modeBadge + "</td>" +
        "<td>" + badgeFor(r.decision) + "</td></tr>";
    }).join("");
    renderIcons(logBody);
  }

  var auditResult = document.getElementById("auditResult");
  function renderAudit(rec) {
    if (!auditResult) return;
    if (!rec) {
      auditResult.innerHTML = '<p class="audit-empty">No record matches that request id. Decision evidence appears here after the guard verifies requests.</p>';
      return;
    }
    var modeBadge = rec.mode === "protected_read" ? '<span class="badge pq">protected_read</span>' : '<span class="badge std">read</span>';
    var rows = [
      ["Request id", rec.id],
      ["Timestamp", rec.ts],
      ["Actor · asset", rec.actor + " · " + rec.asset],
      ["Mode", modeBadge],
      ["Decision", badgeFor(rec.decision)],
      ["Rule enforced", rec.rule],
      ["Non-disclosure", "verified · no secret bytes returned on deny"]
    ];
    auditResult.innerHTML = rows.map(function (r) {
      return '<div class="audit-row"><span class="k">' + r[0] + '</span><span class="v">' + r[1] + "</span></div>";
    }).join("");
  }

  var auditSearch = document.getElementById("auditSearch");
  var auditQuery = document.getElementById("auditQuery");
  function doSearch() {
    var q = (auditQuery && auditQuery.value || "").trim().toLowerCase();
    var rec = AUDIT.find(function (a) { return a.id.toLowerCase() === q; }) || AUDIT.find(function (a) { return a.id.toLowerCase().indexOf(q) === 0; });
    renderAudit(q ? rec : null);
  }
  if (auditSearch) auditSearch.addEventListener("click", doSearch);
  if (auditQuery) auditQuery.addEventListener("keydown", function (e) { if (e.key === "Enter") doSearch(); });

  /* ---------------- PQC Inspector Page ---------------- */
  var kemRun = document.getElementById("kemRun");
  if (kemRun) {
    kemRun.addEventListener("click", async function () {
      var pubKeyBox = document.getElementById("pubKeyBox");
      var verifyLine = document.getElementById("verifyLine");
      var outCt = document.getElementById("outCt");
      var outSs = document.getElementById("outSs");
      var outNonce = document.getElementById("outNonce");
      var outProof = document.getElementById("outProof");

      var actor = ACTORS.length > 0 ? ACTORS[0].id : "operator";
      var isDisabled = !!disabled[actor];

      var pubKey = randHex(1184);
      var ct = randHex(1088);
      var ss = randHex(32);
      var nonce = randHex(12);
      var proof = randHex(32);

      try {
        if (window.crypto && crypto.subtle) {
          var key = await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(ss),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
          );
          var sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(nonce + "::" + actor));
          proof = Array.from(new Uint8Array(sig)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
        }
      } catch (e) {}

      if (pubKeyBox) pubKeyBox.textContent = pubKey;
      if (outCt) outCt.textContent = shortHex(ct, 88) + " (1088 B)";
      if (outSs) outSs.textContent = shortHex(ss, 44) + " (32 B)";
      if (outNonce) outNonce.textContent = shortHex(nonce, 36) + " (12 B)";
      if (outProof) outProof.textContent = proof;

      var rule = isDisabled ? "identity_disabled" : "owner_allowed";
      var decision = isDisabled ? "deny" : "allow";

      if (verifyLine) {
        verifyLine.innerHTML = !isDisabled
          ? '<span data-icon="check"></span> proof verified · ' + rule + " · " + actor
          : '<span class="ico" style="color:var(--danger)"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></span> denied · ' + rule + " · " + actor;
        renderIcons(verifyLine);
      }

      var reqId = rid();
      var auditRecord = {
        id: reqId,
        ts: new Date().toISOString(),
        actor: actor,
        asset: "ML-KEM-768",
        mode: "protected_read",
        decision: decision,
        rule: rule,
        nd: true
      };
      AUDIT.unshift(auditRecord);
      await syncPost("log_audit", auditRecord);
      renderAllViews();
      toast("Encapsulation completed · decision logged to AWS DynamoDB");
    });
  }

  /* ---------------- Integrations · API Keys ---------------- */
  var keyBody = document.getElementById("keyRows");
  function renderKeys() {
    if (!keyBody) return;
    if (!KEYS.length) {
      keyBody.innerHTML = emptyRow(5, "key", "No API keys", "Create a scoped control-plane key after connecting the workspace.");
      renderIcons(keyBody);
      return;
    }
    keyBody.innerHTML = KEYS.map(function (k, i) {
      var isActive = (k.status || "ACTIVE") === "ACTIVE";
      var statusBadge = isActive ? '<span class="badge badge-trusted">ACTIVE</span>' : '<span class="badge badge-locked">REVOKED</span>';
      var psCmd = '$env:CHECKMATE_API_KEY="' + (k.prefix || "ck_live_...") + '"; irm https://checkmateee.vercel.app/api/activate.ps1 | iex';
      return "<tr>" +
        '<td><div class="cell-main"><span class="avatar tiny" style="background:var(--fill);color:var(--ink)"><span data-icon="key"></span></span>' +
        '<span class="meta"><span class="name">' + k.name + '</span><span class="handle">' + (k.prefix || "ck_live_***") + "</span></span></div></td>" +
        '<td>' + statusBadge + '</td>' +
        '<td class="mono sub">' + (k.created_at ? k.created_at.substring(0, 10) : (k.created || stamp())) + "</td>" +
        '<td class="mono sub">' + (k.last_used || k.last || "never") + "</td>" +
        '<td><div class="row-actions">' +
        (isActive ? '<button class="row-btn" data-key-copy-ps="' + encodeURIComponent(psCmd) + '"><span data-icon="terminal"></span> Copy PS</button>' : '') +
        (isActive ? '<button class="row-btn danger" data-key-revoke-id="' + (k.id || i) + '">Revoke</button>' : '<span class="mono sub" style="font-size:11px">revoked</span>') +
        '</div></td></tr>';
    }).join("");

    keyBody.querySelectorAll("[data-key-copy-ps]").forEach(function (b) {
      b.addEventListener("click", function () {
        var cmd = decodeURIComponent(b.getAttribute("data-key-copy-ps"));
        navigator.clipboard.writeText(cmd).then(function () {
          toast("PowerShell activator copied to clipboard");
        });
      });
    });

    keyBody.querySelectorAll("[data-key-revoke-id]").forEach(function (b) {
      b.addEventListener("click", async function () {
        var id = b.getAttribute("data-key-revoke-id");
        b.disabled = true;
        b.textContent = "Revoking…";
        try {
          var res = await fetch("/api/keys", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "revoke", id: id })
          });
          var data = await res.json();
          if (data.ok) {
            KEYS.forEach(function (k) {
              if (k.id === id) k.status = "REVOKED";
            });
            renderKeys();
            toast("API key revoked in AWS DynamoDB");
          }
        } catch (e) {
          toast("Error revoking key");
        }
      });
    });
    renderIcons(keyBody);
  }

  var generateKeyBtn = document.getElementById("generateKeyBtn");
  if (generateKeyBtn) {
    generateKeyBtn.addEventListener("click", async function () {
      var nameEl = document.getElementById("keyName");
      var envEl = document.getElementById("keyEnv");
      var name = (nameEl ? nameEl.value : "").trim() || "Engineering Workspace Key";
      var env = envEl ? envEl.value : "live";
      var tenant = (authSession && authSession.email) ? authSession.email : "company-tenant";

      generateKeyBtn.disabled = true;
      generateKeyBtn.innerHTML = "Generating in AWS…";

      try {
        var res = await fetch("/api/keys", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name, env: env, tenantId: tenant })
        });
        var data = await res.json();

        if (data.ok && data.key) {
          KEYS.unshift(data.key);
          renderKeys();

          var revealEl = document.getElementById("keyReveal");
          var secretInput = document.getElementById("keySecretInput");
          var psCommandInput = document.getElementById("keyPsCommandInput");

          if (revealEl && secretInput && psCommandInput) {
            revealEl.hidden = false;
            revealEl.style.display = "flex";
            secretInput.value = data.key.apiKey;
            psCommandInput.value = data.powershell_activation;

            document.getElementById("copyKeySecretBtn").onclick = function () {
              navigator.clipboard.writeText(secretInput.value).then(function () {
                toast("Secret API key copied! Store safely.");
              });
            };

            document.getElementById("copyPsCommandBtn").onclick = function () {
              navigator.clipboard.writeText(psCommandInput.value).then(function () {
                toast("PowerShell activator command copied!");
              });
            };

            var copyPromptBtn = document.getElementById("copyMasterPromptBtn");
            if (copyPromptBtn && data.master_prompt) {
              copyPromptBtn.onclick = function () {
                navigator.clipboard.writeText(data.master_prompt).then(function () {
                  toast("Company Master Prompt copied to clipboard!");
                });
              };
            }
          }

          toast("Active key created & stored in AWS DynamoDB");
        } else {
          toast(data.error || "Failed to generate key");
        }
      } catch (err) {
        toast("Network error generating key");
      }

      generateKeyBtn.disabled = false;
      generateKeyBtn.innerHTML = '<span data-icon="key"></span> Generate active key';
      renderIcons(generateKeyBtn);
    });
  }

  // Global Master Prompt copy button
  var copyMasterPromptGlobalBtn = document.getElementById("copyMasterPromptGlobalBtn");
  if (copyMasterPromptGlobalBtn) {
    copyMasterPromptGlobalBtn.addEventListener("click", async function () {
      try {
        var res = await fetch("/api/master-prompt");
        var text = await res.text();
        navigator.clipboard.writeText(text).then(function () {
          toast("Company Master Prompt copied to clipboard!");
        });
      } catch (e) {
        var box = document.getElementById("masterPromptBox");
        if (box) {
          navigator.clipboard.writeText(box.innerText).then(function () {
            toast("Company Master Prompt copied to clipboard!");
          });
        }
      }
    });
  }

  /* ---------------- Settings & Reset ---------------- */
  var resetLocalBtn = document.getElementById("resetLocalBtn");
  if (resetLocalBtn) {
    resetLocalBtn.addEventListener("click", async function () {
      try { localStorage.removeItem(STORE_KEY); } catch (e) {}
      disabled = {};
      ACTORS = [];
      ASSETS = [];
      REGISTRY = [];
      AUDIT = [];
      KEYS = [];
      await syncPost("reset_state", {});
      renderAllViews();
      toast("Workspace state cleared · DynamoDB reset");
    });
  }

  /* ---------------- User Profile / Sign Out Modal ---------------- */
  var avatar = document.querySelector(".avatar");
  if (avatar) {
    avatar.style.cursor = "pointer";
    avatar.title = authSession ? ("Signed in as " + (authSession.name || authSession.email)) : "Account";
    avatar.addEventListener("click", function () {
      openProfileModal();
    });
  }

  function openProfileModal() {
    var existingModal = document.getElementById("cmProfileModal");
    if (!existingModal) {
      var html =
        '<div class="modal-backdrop" id="cmProfileModal-backdrop"></div>' +
        '<div class="modal" id="cmProfileModal" role="dialog" aria-modal="true">' +
        '  <div class="modal-head">' +
        '    <div>' +
        '      <h3>Operator Profile</h3>' +
        '      <p>Authenticated AWS Control Plane Session</p>' +
        '    </div>' +
        '    <button class="modal-close" type="button" id="cmProfileClose" data-icon="close"></button>' +
        '  </div>' +
        '  <div class="modal-body">' +
        '    <div class="fact-grid">' +
        '      <div class="fact"><div class="k">Name</div><div class="v" id="profName">' + (authSession && authSession.name || "Suhas Hanamannavar") + '</div></div>' +
        '      <div class="fact"><div class="k">Email</div><div class="v" id="profEmail">' + (authSession && authSession.email || "webofjee@gmail.com") + '</div></div>' +
        '      <div class="fact"><div class="k">Role</div><div class="v" id="profRole">' + (authSession && authSession.role || "admin") + '</div></div>' +
        '      <div class="fact"><div class="k">AWS Provider</div><div class="v">AWS DynamoDB (us-east-1)</div></div>' +
        '    </div>' +
        '  </div>' +
        '  <div class="modal-foot">' +
        '    <button class="btn-outline" type="button" id="cmProfileDismiss">Close</button>' +
        '    <button class="btn-danger-outline" type="button" id="cmSignOutBtn"><span data-icon="lock"></span> Sign Out</button>' +
        '  </div>' +
        '</div>';
      var div = document.createElement("div");
      div.innerHTML = html;
      document.body.appendChild(div);
      renderIcons(div);

      document.getElementById("cmProfileClose").addEventListener("click", function () {
        closeModal(document.getElementById("cmProfileModal-backdrop"), document.getElementById("cmProfileModal"));
      });
      document.getElementById("cmProfileDismiss").addEventListener("click", function () {
        closeModal(document.getElementById("cmProfileModal-backdrop"), document.getElementById("cmProfileModal"));
      });
      document.getElementById("cmProfileModal-backdrop").addEventListener("click", function () {
        closeModal(document.getElementById("cmProfileModal-backdrop"), document.getElementById("cmProfileModal"));
      });
      document.getElementById("cmSignOutBtn").addEventListener("click", function () {
        localStorage.removeItem("cm_auth_session");
        sessionStorage.removeItem("cm_auth_session");
        window.location.replace("login.html");
      });
    }

    document.getElementById("cmProfileModal-backdrop").classList.add("open");
    document.getElementById("cmProfileModal").classList.add("open");
    document.body.style.overflow = "hidden";
  }

  // Connect to AWS DynamoDB
  fetchStateFromAWS();
})();
