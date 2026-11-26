/* CHECKMATE app console — shared shell, demo data, interactions.
   Static demonstration: no credentials leave the browser; all state lives in
   localStorage and resets on clear. Mirrors track4_service.py operations:
   setup / read / revoke / protected_read / audit. */
(function () {
  "use strict";

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
    "chevron-right": '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
    external: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6"/><path d="M20 4L10 14"/><path d="M19 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6"/></svg>',
    activity: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l3 8 4-16 3 8h4"/></svg>',
    trash: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',
    ban: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/></svg>',
    file: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
    building: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16"/><path d="M15 9h3a1 1 0 0 1 1 1v11"/><path d="M8 7h2M8 11h2M8 15h2"/></svg>',
    refresh: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.3"/><path d="M21 3v6h-6"/></svg>',
    close: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    menu: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 8h16M4 16h16"/></svg>',
    "arrow-right": '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16"/><path d="M14 6l6 6-6 6"/></svg>',
    alert: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 20h20z"/><path d="M12 10v4"/><path d="M12 17h.01"/></svg>',
    filter: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h18l-7 8v6l-4 2v-8z"/></svg>',
    plug: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2v6M15 2v6"/><path d="M6 8h12v3a6 6 0 0 1-12 0z"/><path d="M12 17v5"/></svg>'
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
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function initials(name) {
    var parts = name.split(/\s+/);
    return ((parts[0] || "")[0] || "") + ((parts[1] || "")[0] || "");
  }
  var toastEl = document.querySelector(".toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2600);
  }

  /* ---------------- persisted revocation set (demo) ---------------- */
  var STORE_KEY = "cm_disabled_v1";
  var disabled = {};
  try { disabled = JSON.parse(localStorage.getItem(STORE_KEY) || "{}") || {}; } catch (e) { disabled = {}; }
  ["fiona", "grace", "hugo"].forEach(function (id) { disabled[id] = true; });
  function persistDisabled() { try { localStorage.setItem(STORE_KEY, JSON.stringify(disabled)); } catch (e) {} }

  var ACTORS = [
    { id: "alice", name: "Alice Rao", role: "contract-developer", region: "eu-west", devices: 2, last: "09:41:12", email: "alice@silica.dev", since: "2025-09-02" },
    { id: "bhargav", name: "Bhargav Kulkarni", role: "platform-engineer", region: "us-east", devices: 1, last: "09:38:02", email: "bhargav@silica.dev", since: "2024-11-18" },
    { id: "carlos", name: "Carlos Mendez", role: "finance-clerk", region: "eu-west", devices: 1, last: "08:57:44", email: "carlos@silica.dev", since: "2026-01-06" },
    { id: "dana", name: "Dana Whitfield", role: "security-ops", region: "global", devices: 3, last: "09:42:55", email: "dana@silica.dev", since: "2023-05-30" },
    { id: "eva", name: "Eva Lindqvist", role: "product-manager", region: "ap-south", devices: 1, last: "09:12:30", email: "eva@silica.dev", since: "2025-03-14" },
    { id: "fiona", name: "Fiona Osei", role: "data-analyst", region: "eu-west", devices: 1, last: "—", email: "fiona@silica.dev", since: "2024-08-22" },
    { id: "grace", name: "Grace Tanaka", role: "product-designer", region: "ap-south", devices: 1, last: "—", email: "grace@silica.dev", since: "2025-02-10" },
    { id: "hugo", name: "Hugo Ferreira", role: "devops-engineer", region: "us-east", devices: 2, last: "—", email: "hugo@silica.dev", since: "2023-12-01" }
  ];
  var ASSETS = [
    { id: "prod-db-credentials", kind: "connection-string", owner: "dana", tier: "pq", policy: "owner_allowed · protected_read", size: "1.2 KB", last: "09:42:10" },
    { id: "stripe-customer-keys", kind: "api-keys", owner: "dana", tier: "pq", policy: "owner_allowed · protected_read", size: "0.6 KB", last: "09:31:52" },
    { id: "q4-financial-report", kind: "financial-export", owner: "carlos", tier: "pq", policy: "owner_allowed · protected_read", size: "840 KB", last: "08:55:18" },
    { id: "app-env-production", kind: "env-file", owner: "alice", tier: "pq", policy: "owner_allowed · protected_read", size: "0.4 KB", last: "09:40:05" },
    { id: "customer-pii-export", kind: "data-export", owner: "bhargav", tier: "std", policy: "owner_allowed · standard read", size: "2.1 MB", last: "09:14:37" },
    { id: "k8s-sealed-secret", kind: "workload-secret", owner: "dana", tier: "pq", policy: "owner_allowed · protected_read", size: "0.9 KB", last: "09:22:44" },
    { id: "vault-seed-note", kind: "seed-note", owner: "alice", tier: "pq", policy: "owner_allowed · protected_read", size: "0.3 KB", last: "07:48:19" },
    { id: "design-spec-board", kind: "document", owner: "eva", tier: "std", policy: "owner_allowed · standard read", size: "1.8 MB", last: "09:02:11" }
  ];
  var REGISTRY = [
    { actor: "fiona", ts: "11-26 08:14", by: "Automated IDS", proof: "rev_f8a21c" },
    { actor: "grace", ts: "11-25 21:40", by: "Self-service wipe", proof: "rev_2b77e0" },
    { actor: "hugo", ts: "11-25 11:03", by: "Admin revoke", proof: "rev_91c4d6" }
  ];

  function actorById(id) { return ACTORS.find(function (a) { return a.id === id; }); }

  /* ---------------- shell: nav, sidebar, tabs, modals, copy ---------------- */
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
      if (!modal) return;
      backdrop && backdrop.classList.add("open");
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

  /* ---------------- Identities page ---------------- */
  var identityBody = document.getElementById("identityRows");
  function renderIdentities(filter) {
    if (!identityBody) return;
    filter = (filter || "all").toLowerCase();
    identityBody.innerHTML = ACTORS.map(function (a) {
      var locked = !!disabled[a.id];
      if (filter === "trusted" && locked) return "";
      if (filter === "locked" && !locked) return "";
      var status = locked
        ? '<span class="badge lock">Locked</span>'
        : '<span class="badge allow">Trusted</span>';
      var last = locked
        ? '<span class="sub mono">revoked · no session</span>'
        : '<span class="mono sub">' + a.last + "</span>";
      var actions = locked
        ? '<button class="row-btn" data-detail="' + a.id + '">Profile</button>'
        : '<button class="row-btn" data-detail="' + a.id + '">Profile</button>' +
          '<button class="row-btn danger" data-revoke="' + a.id + '">Revoke</button>';
      return '<tr data-status="' + (locked ? "locked" : "trusted") + '" data-search="' + (a.name + " " + a.id + " " + a.role + " " + a.region).toLowerCase() + '">' +
        '<td><div class="cell-main"><span class="avatar tiny">' + initials(a.name) + '</span>' +
        '<span class="meta"><span class="name">' + a.name + '</span><span class="handle">@' + a.id + "</span></span></div></td>" +
        '<td class="mono" style="font-size:12px">' + a.role + "</td>" +
        '<td class="mono sub">' + a.region + "</td>" +
        "<td>" + a.devices + "</td>" +
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
  renderIdentities();

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
      '<div class="fact"><div class="k">Email</div><div class="v">' + a.email + "</div></div>" +
      '<div class="fact"><div class="k">Devices registered</div><div class="v">' + a.devices + "</div></div>" +
      '<div class="fact"><div class="k">Provisioned</div><div class="v">' + a.since + "</div></div>" +
      "</div>" +
      '<div style="margin-top:16px"><span class="field-label">Protected assets held</span><table class="tbl"><tbody>' +
      ASSETS.filter(function (x) { return x.owner === id; }).map(function (x) {
        return "<tr><td class='mono'>" + x.id + "</td><td class='sub'>" + x.policy + "</td></tr>";
      }).join("") +
      "</tbody></table></div>";
    document.getElementById("identityModal-backdrop").classList.add("open");
    document.getElementById("identityModal").classList.add("open");
    document.body.style.overflow = "hidden";
    var footerBtn = document.getElementById("identityRevokeBtn");
    if (footerBtn) footerBtn.style.display = locked ? "none" : "inline-flex";
    if (footerBtn) footerBtn.setAttribute("data-revoke-direct", id);
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

  /* identity filter tabs + search */
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

  /* ---------------- Assets page ---------------- */
  var assetBody = document.getElementById("assetRows");
  function renderAssets() {
    if (!assetBody) return;
    assetBody.innerHTML = ASSETS.map(function (a) {
      var tier = a.tier === "pq"
        ? '<span class="badge pq">PQ · ML-KEM-768</span>'
        : '<span class="badge std">Standard</span>';
      var owner = actorById(a.owner) || { name: a.owner, id: a.owner };
      return '<tr data-tier="' + a.tier + '" data-search="' + (a.id + " " + a.kind + " " + a.owner + " " + a.policy).toLowerCase() + '">' +
        '<td><div class="cell-main"><span class="avatar tiny" style="background:var(--fill);color:var(--ink)"><span data-icon="file"></span></span>' +
        '<span class="meta"><span class="name mono" style="font-size:12.5px">' + a.id + '</span><span class="handle">' + a.kind + "</span></span></div></td>" +
        '<td class="mono sub">@' + a.owner + "</td>" +
        "<td>" + tier + "</td>" +
        '<td class="mono sub" style="font-size:11.5px">' + a.policy + "</td>" +
        '<td class="mono sub">' + a.size + "</td>" +
        '<td class="mono sub">' + a.last + "</td>" +
        '<td><div class="row-actions"><button class="row-btn" data-asset-inspect="' + a.id + '">Inspect</button></div></td></tr>';
    }).join("");
  }
  renderAssets();
  if (assetBody) renderIcons(assetBody);
  var assetSearch = document.getElementById("assetSearch");
  if (assetSearch) assetSearch.addEventListener("input", function () {
    var q = assetSearch.value.trim().toLowerCase();
    assetBody.querySelectorAll("tr").forEach(function (tr) {
      tr.style.display = !q || (tr.getAttribute("data-search") || "").indexOf(q) >= 0 ? "" : "none";
    });
  });
  document.querySelectorAll("[data-tier-filter]").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll("[data-tier-filter]").forEach(function (t) { t.classList.remove("active"); });
      tab.classList.add("active");
      var f = tab.getAttribute("data-tier-filter");
      assetBody.querySelectorAll("tr").forEach(function (tr) {
        tr.style.display = f === "all" || tr.getAttribute("data-tier") === f ? "" : "none";
      });
    });
  });
  if (assetBody) assetBody.addEventListener("click", function (e) {
    var b = e.target.closest("[data-asset-inspect]");
    if (b) toast("Inspect in the PQC security page · demo shortcut");
  });
  var protectForm = document.getElementById("protectForm");
  if (protectForm) protectForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var id = (document.getElementById("newAssetId") || {}).value || "asset-" + randHex(3).slice(0, 6);
    ASSETS.unshift({ id: id, kind: "protected-file", owner: "dana", tier: "pq", policy: "owner_allowed · protected_read", size: "new envelope", last: localTime() });
    renderAssets();
    closeModal(document.getElementById("protectModal-backdrop"), document.getElementById("protectModal"));
    toast("Envelope sealed · protected_read required");
  });

  /* ---------------- Revocation (shared by killswitch + identities) ---------------- */
  function revokeActor(id, reason, byLabel) {
    if (!disabled[id]) {
      disabled[id] = true;
      persistDisabled();
      REGISTRY.unshift({ actor: id, ts: stamp(), by: byLabel || ("Admin revoke · " + reason), proof: "rev_" + randHex(3).slice(0, 6) });
    }
    renderIdentities(currentIdentityFilter());
    renderRegistry();
    renderOverviewRows();
    var countEl = document.getElementById("sideIdentityCount");
    if (countEl) countEl.textContent = ACTORS.filter(function (a) { return !disabled[a.id]; }).length;
    toast(id + " · identity_disabled committed · 0.0 ms propagation");
  }
  window.CM = { revokeActor: revokeActor, disabled: disabled };
  function currentIdentityFilter() {
    var active = document.querySelector("[data-identity-filter].active");
    return active ? active.getAttribute("data-identity-filter") : "all";
  }

  var registryBody = document.getElementById("registryRows");
  function renderRegistry() {
    if (!registryBody) return;
    registryBody.innerHTML = REGISTRY.map(function (r) {
      return "<tr><td class='mono'>" + r.actor + "</td><td class='mono sub'>" + r.ts +
        "</td><td class='sub'>" + r.by + "</td><td class='mono sub' style='font-size:11px'>" + r.proof +
        "</td><td><span class='badge lock'>Locked</span></td></tr>";
    }).join("");
  }
  renderRegistry();

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
  if (wizardSelect && !wizardSelect.options.length) {
    wizardSelect.innerHTML = ACTORS.filter(function (a) { return !disabled[a.id]; }).map(function (a) {
      return '<option value="' + a.id + '">' + a.id + " · " + a.role + " · " + a.region + "</option>";
    }).join("");
  }
  var killswitchBtn = document.getElementById("revokeBtn");
  if (killswitchBtn) killswitchBtn.addEventListener("click", function () {
    var sel = document.getElementById("actorSelect");
    var id = sel ? sel.value : "alice";
    var reasonEl = document.querySelector('input[name="reason"]:checked');
    var reason = reasonEl ? reasonEl.value : "Stolen laptop";
    runPropagation(function () {
      revokeActor(id, reason, "Admin revoke · " + reason);
      if (propNote) propNote.textContent = id + " · identity_disabled committed at " + localTime() + " · key material zeroized in volatile memory";
    });
  });
  var confirmRevoke = document.getElementById("confirmRevokeBtn");
  if (confirmRevoke) confirmRevoke.addEventListener("click", function () {
    var sel = document.getElementById("revokeActorSelect");
    var id = sel ? sel.value : "alice";
    var reasonEl = document.querySelector('input[name="mreason"]:checked');
    var reason = reasonEl ? reasonEl.value : "Stolen laptop";
    closeModal(document.getElementById("revokeModal-backdrop"), document.getElementById("revokeModal"));
    runPropagation(function () { revokeActor(id, reason, "Admin revoke · " + reason); });
  });
  var revokeModalSelect = document.getElementById("revokeActorSelect");
  if (revokeModalSelect && !revokeModalSelect.options.length) {
    revokeModalSelect.innerHTML = ACTORS.map(function (a) {
      return '<option value="' + a.id + '"' + (disabled[a.id] ? " disabled" : "") + ">" + a.id + " · " + a.role + (disabled[a.id] ? " · locked" : "") + "</option>";
    }).join("");
  }

  /* ---------------- Logs page (stream + audit) ---------------- */
  var logBody = document.getElementById("logRows");
  var blockNote = document.getElementById("blockNote");
  function addLogRow(initial) {
    if (!logBody) return;
    var actor = pick(ACTORS).id;
    var asset = pick(ASSETS).id;
    var pq = Math.random() < 0.34;
    var isDisabled = !!disabled[actor];
    var deny = isDisabled || (!initial && Math.random() < 0.08);
    var mode = pq ? '<span class="badge pq">protected_read</span>' : '<span class="badge std">read</span>';
    var decision = deny ? '<span class="badge deny">DENY</span>' : '<span class="badge allow">ALLOW</span>';
    var tr = document.createElement("tr");
    tr.setAttribute("data-decision", deny ? "deny" : "allow");
    tr.setAttribute("data-mode", pq ? "protected_read" : "read");
    tr.setAttribute("data-actor", actor);
    if (isDisabled) tr.className = "row-blocked";
    tr.innerHTML =
      '<td class="mono sub">' + localTime() + "</td>" +
      '<td class="mono sub">' + rid() + "</td>" +
      '<td class="mono">' + actor + "</td>" +
      '<td class="sub">' + asset + "</td>" +
      "<td>" + mode + "</td>" +
      "<td>" + decision + "</td>";
    logBody.prepend(tr);
    while (logBody.rows.length > 20) logBody.deleteRow(-1);
    if (isDisabled && blockNote) {
      blockNote.hidden = false;
      blockNote.textContent = "BLOCKED: revoked device access attempt · " + actor + " · identity_disabled at verification";
    }
  }
  if (logBody) {
    for (var i = 0; i < 8; i++) addLogRow(true);
    setInterval(function () { addLogRow(false); }, 2600);
  }
  document.querySelectorAll("[data-log-filter]").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll("[data-log-filter]").forEach(function (t) { t.classList.remove("active"); });
      tab.classList.add("active");
      var f = tab.getAttribute("data-log-filter");
      logBody.querySelectorAll("tr").forEach(function (tr) {
        tr.style.display = f === "all" || tr.getAttribute("data-decision") === f ? "" : "none";
      });
    });
  });
  var logSearch = document.getElementById("logSearch");
  if (logSearch) logSearch.addEventListener("input", function () {
    var q = logSearch.value.trim().toLowerCase();
    logBody.querySelectorAll("tr").forEach(function (tr) {
      tr.style.display = !q || tr.textContent.toLowerCase().indexOf(q) >= 0 ? "" : "none";
    });
  });

  var AUDIT = [
    { id: "req-9f31c2", ts: "2026-11-26T09:42:10Z", actor: "dana", asset: "prod-db-credentials", mode: "protected_read", decision: "allow", rule: "owner_allowed", nd: true },
    { id: "req-4b77e0", ts: "2026-11-26T08:14:02Z", actor: "fiona", asset: "prod-db-credentials", mode: "read", decision: "deny", rule: "identity_disabled", nd: true },
    { id: "req-c2a91d", ts: "2026-11-26T09:11:58Z", actor: "carlos", asset: "customer-pii-export", mode: "read", decision: "deny", rule: "owner_mismatch", nd: true },
    { id: "req-77e0bf", ts: "2026-11-26T07:48:19Z", actor: "alice", asset: "vault-seed-note", mode: "protected_read", decision: "allow", rule: "owner_allowed", nd: true },
    { id: "req-3d91aa", ts: "2026-11-26T09:31:52Z", actor: "dana", asset: "stripe-customer-keys", mode: "protected_read", decision: "allow", rule: "owner_allowed", nd: true },
    { id: "req-88c04e", ts: "2026-11-26T09:02:11Z", actor: "hugo", asset: "k8s-sealed-secret", mode: "protected_read", decision: "deny", rule: "identity_disabled", nd: true },
    { id: "req-51ab77", ts: "2026-11-26T08:55:18Z", actor: "carlos", asset: "q4-financial-report", mode: "protected_read", decision: "allow", rule: "owner_allowed", nd: true },
    { id: "req-e02cd9", ts: "2026-11-26T09:22:44Z", actor: "bhargav", asset: "k8s-sealed-secret", mode: "read", decision: "deny", rule: "owner_mismatch", nd: true }
  ];
  var auditResult = document.getElementById("auditResult");
  function badgeFor(d) { return d === "allow" ? '<span class="badge allow">ALLOW</span>' : '<span class="badge deny">DENY</span>'; }
  function renderAudit(rec) {
    if (!auditResult) return;
    if (!rec) {
      auditResult.innerHTML = '<p class="audit-empty">No record matches that request ID. Sample IDs: req-9f31c2 · req-4b77e0 · req-c2a91d · req-3d91aa.</p>';
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
  function download(name, text, mime) {
    var blob = new Blob([text], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  var exportJson = document.getElementById("exportJson");
  if (exportJson) exportJson.addEventListener("click", function () {
    download("checkmate-audit.json", JSON.stringify(AUDIT, null, 2), "application/json");
    toast("Audit pack exported · JSON");
  });
  var exportCsv = document.getElementById("exportCsv");
  if (exportCsv) exportCsv.addEventListener("click", function () {
    var head = "request_id,timestamp,actor,asset,mode,decision,rule,non_disclosure";
    var lines = AUDIT.map(function (r) {
      return [r.id, r.ts, r.actor, r.asset, r.mode, r.decision, r.rule, r.nd ? "verified" : "n/a"].join(",");
    });
    download("checkmate-audit.csv", head + "\n" + lines.join("\n"), "text/csv");
    toast("Audit pack exported · CSV");
  });

  /* ---------------- Security page · KEM demo ---------------- */
  var pubKeyBox = document.getElementById("pubKeyBox");
  if (pubKeyBox) pubKeyBox.textContent = randHex(1184);
  var kemRun = document.getElementById("kemRun");
  var verifyLine = document.getElementById("verifyLine");
  function setVerify(ok, actor, rule) {
    if (!verifyLine) return;
    verifyLine.innerHTML = ok
      ? '<span data-icon="check"></span> proof verified · ' + rule + " · " + actor
      : '<span class="ico" style="color:var(--danger)"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></span> denied · ' + rule + " · " + actor;
  }
  if (kemRun) kemRun.addEventListener("click", async function () {
    var actor = "dana";
    var disabledActor = !!disabled[actor];
    var ct = randHex(1088), ss = randHex(32), nonce = randHex(12), proof = randHex(32);
    try {
      if (window.crypto && crypto.subtle) {
        var key = await crypto.subtle.importKey("raw", new TextEncoder().encode(ss), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
        var sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(nonce + "::" + actor));
        proof = Array.from(new Uint8Array(sig)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
      }
    } catch (e) {}
    var outCt = document.getElementById("outCt"), outSs = document.getElementById("outSs"), outNonce = document.getElementById("outNonce"), outProof = document.getElementById("outProof");
    if (outCt) outCt.textContent = shortHex(ct, 88) + " (1088 B)";
    if (outSs) outSs.textContent = shortHex(ss, 44) + " (32 B)";
    if (outNonce) outNonce.textContent = shortHex(nonce, 36) + " (12 B)";
    if (outProof) outProof.textContent = proof;
    setVerify(!disabledActor, actor, disabledActor ? "identity_disabled" : "owner_allowed");
  });

  /* ---------------- Overview page ---------------- */
  var overviewRows = document.getElementById("overviewRows");
  function renderOverviewRows() {
    if (!overviewRows) return;
    var recent = AUDIT.slice(0, 5);
    overviewRows.innerHTML = recent.map(function (r) {
      return "<tr data-decision='" + r.decision + "'>" +
        '<td class="mono sub">' + r.ts.replace("T", " ").replace("Z", "") + "</td>" +
        '<td class="mono sub">' + r.id + "</td>" +
        '<td class="mono">' + r.actor + "</td>" +
        '<td class="sub">' + r.asset + "</td>" +
        (r.mode === "protected_read" ? '<td><span class="badge pq">PQ</span></td>' : '<td><span class="badge std">read</span></td>') +
        "<td>" + badgeFor(r.decision) + "</td></tr>";
    }).join("");
  }
  renderOverviewRows();
  document.querySelectorAll("[data-count]").forEach(function (el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var dur = 1200, start = null;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });

  /* ---------------- Integrations · API keys ---------------- */
  var KEYS = [
    { prefix: "ck_live_9f31…", name: "production-server", scope: "read · protected_read · revoke", created: "2026-10-02", last: "09:42 today" },
    { prefix: "ck_live_b77e…", name: "ci-pipeline", scope: "read", created: "2026-08-19", last: "yesterday" },
    { prefix: "ck_test_4c02…", name: "sandbox-local", scope: "read · protected_read", created: "2026-11-01", last: "08:11 today" }
  ];
  var keyBody = document.getElementById("keyRows");
  function renderKeys() {
    if (!keyBody) return;
    keyBody.innerHTML = KEYS.map(function (k, i) {
      return "<tr>" +
        '<td><div class="cell-main"><span class="avatar tiny" style="background:var(--fill);color:var(--ink)"><span data-icon="key"></span></span>' +
        '<span class="meta"><span class="name">' + k.name + '</span><span class="handle">' + k.prefix + "</span></span></div></td>" +
        '<td class="mono sub" style="font-size:11.5px">' + k.scope + "</td>" +
        '<td class="mono sub">' + k.created + "</td>" +
        '<td class="mono sub">' + k.last + "</td>" +
        '<td><div class="row-actions"><button class="row-btn danger" data-key-revoke="' + i + '">Revoke</button></div></td></tr>';
    }).join("");
    keyBody.querySelectorAll("[data-key-revoke]").forEach(function (b) {
      b.addEventListener("click", function () {
        KEYS.splice(+b.getAttribute("data-key-revoke"), 1);
        renderKeys();
        if (keyBody) renderIcons(keyBody);
        toast("API key revoked · registry updated");
      });
    });
    if (keyBody) renderIcons(keyBody);
  }
  renderKeys();
  var keyGenBtn = document.getElementById("generateKeyBtn");
  if (keyGenBtn) keyGenBtn.addEventListener("click", function () {
    var env = document.getElementById("keyEnv") ? document.getElementById("keyEnv").value : "live";
    var keyVal = "ck_" + env + "_" + randHex(24);
    var reveal = document.getElementById("keyReveal");
    if (!reveal) return;
    reveal.hidden = false;
    reveal.style.display = "flex";
    reveal.querySelector(".key-value").textContent = keyVal;
    toast("Key generated · copy it now; it is not shown again");
  });
  var sideCount = document.getElementById("sideIdentityCount");
  if (sideCount) sideCount.textContent = ACTORS.filter(function (a) { return !disabled[a.id]; }).length;

  /* ---------------- Settings demo buttons ---------------- */
  document.querySelectorAll("[data-demo-toast]").forEach(function (b) {
    b.addEventListener("click", function () { toast(b.getAttribute("data-demo-toast")); });
  });
  var resetDemoBtn = document.getElementById("resetDemoBtn");
  if (resetDemoBtn) resetDemoBtn.addEventListener("click", function () {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    toast("Demonstration state reset · reloading");
    setTimeout(function () { location.reload(); }, 700);
  });
})();
