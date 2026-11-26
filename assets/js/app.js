/* CHECKMATE app console — shared shell + empty-state views.
   Static front end: no records, names, request ids or counters are seeded.
   Every table renders an empty state until the control plane supplies actors,
   assets, decisions, revocation proofs and API keys. Mirrors
   track4_service.py operations: setup / read / revoke / protected_read / audit. */
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
  function initials(name) {
    var parts = (name || "").split(/\s+/);
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
  /* ---------------- data model: empty until the control plane connects ---------------- */
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
      '<span data-icon="' + icon + '"></span><h4>' + title + "</h4><p>" + hint + "</p></div></td>";
  }
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
  /* ---------------- Identities page ---------------- */
  var identityBody = document.getElementById("identityRows");
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
        : '<span class="mono sub">' + a.last + "</span>";
      var actions = '<button class="row-btn" data-detail="' + a.id + '">Profile</button>' +
        (locked ? "" : '<button class="row-btn danger" data-revoke="' + a.id + '">Revoke</button>');
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
        return "<tr><td class='mono'>" + x.id + "</td><td class='sub mono'>" + x.policy + "</td></tr>";
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
  if (provisionBtn) provisionBtn.addEventListener("click", function () {
    closeModal(document.getElementById("provisionModal-backdrop"), document.getElementById("provisionModal"));
    toast("Control plane not connected — identities are provisioned server-side");
  });
  /* ---------------- Assets page ---------------- */
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
    renderIcons(assetBody);
  }
  renderAssets();
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
    if (b) toast("Open the PQC security page to inspect envelopes");
  });
  var protectForm = document.getElementById("protectForm");
  if (protectForm) protectForm.addEventListener("submit", function (e) {
    e.preventDefault();
    closeModal(document.getElementById("protectModal-backdrop"), document.getElementById("protectModal"));
    toast("Control plane not connected — envelopes are sealed server-side");
  });
  /* ---------------- Revocation (shared by killswitch + identities) ---------------- */
  function revokeActor(id, reason, byLabel) {
    if (!id) return;
    if (!disabled[id]) {
      disabled[id] = true;
      persistDisabled();
      REGISTRY.unshift({ actor: id, ts: stamp(), by: byLabel || ("Admin revoke · " + reason), proof: "" });
    }
    renderIdentities(currentIdentityFilter());
    renderRegistry();
    renderOverviewRows();
    var countEl = document.getElementById("sideIdentityCount");
    if (countEl) countEl.textContent = ACTORS.filter(function (a) { return !disabled[a.id]; }).length;
    toast(id + " · identity_disabled committed");
  }
  window.CM = { revokeActor: revokeActor, disabled: disabled };
  function currentIdentityFilter() {
    var active = document.querySelector("[data-identity-filter].active");
    return active ? active.getAttribute("data-identity-filter") : "all";
  }
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
        "</td><td class='sub'>" + r.by + "</td><td class='mono sub' style='font-size:11px'>" + (r.proof || "—") +
        "</td><td><span class='badge lock'>Locked</span></td></tr>";
    }).join("");
    renderIcons(registryBody);
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
  function refreshWizardSelect() {
    if (!wizardSelect || !ACTORS.length) return;
    wizardSelect.innerHTML = ACTORS.filter(function (a) { return !disabled[a.id]; }).map(function (a) {
      return '<option value="' + a.id + '">' + a.id + " · " + a.role + " · " + a.region + "</option>";
    }).join("");
  }
  refreshWizardSelect();
  var killswitchBtn = document.getElementById("revokeBtn");
  if (killswitchBtn) killswitchBtn.addEventListener("click", function () {
    var sel = document.getElementById("actorSelect");
    var id = sel ? sel.value : "";
    if (!id) { toast("No identity available to revoke — connect the control plane"); return; }
    var reasonEl = document.querySelector('input[name="reason"]:checked');
    var reason = reasonEl ? reasonEl.value : "Stolen laptop";
    runPropagation(function () {
      revokeActor(id, reason, "Admin revoke · " + reason);
      if (propNote) propNote.textContent = id + " · identity_disabled committed at " + localTime();
    });
  });
  var confirmRevoke = document.getElementById("confirmRevokeBtn");
  if (confirmRevoke) confirmRevoke.addEventListener("click", function () {
    var sel = document.getElementById("revokeActorSelect");
    var id = sel ? sel.value : "";
    if (!id) { toast("No identity available to revoke — connect the control plane"); return; }
    var reasonEl = document.querySelector('input[name="mreason"]:checked');
    var reason = reasonEl ? reasonEl.value : "Stolen laptop";
    closeModal(document.getElementById("revokeModal-backdrop"), document.getElementById("revokeModal"));
    runPropagation(function () { revokeActor(id, reason, "Admin revoke · " + reason); });
  });
  var revokeModalSelect = document.getElementById("revokeActorSelect");
  if (revokeModalSelect && ACTORS.length) {
    revokeModalSelect.innerHTML = ACTORS.map(function (a) {
      return '<option value="' + a.id + '"' + (disabled[a.id] ? " disabled" : "") + ">" + a.id + " · " + a.role + (disabled[a.id] ? " · locked" : "") + "</option>";
    }).join("");
  }
  /* ---------------- Logs page (stream + audit) ---------------- */
  var logBody = document.getElementById("logRows");
  var blockNote = document.getElementById("blockNote");
  function renderStream() {
    if (!logBody) return;
    if (!logBody.querySelector("tr:not(.empty-row)") || !logBody.rows.length) {
      logBody.innerHTML = emptyRow(6, "server", "No decisions yet", "Verified requests stream here as the guard checks identities.", 'data-decision="all" class="empty-row"');
      renderIcons(logBody);
    }
  }
  renderStream();
  document.querySelectorAll("[data-log-filter]").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll("[data-log-filter]").forEach(function (t) { t.classList.remove("active"); });
      tab.classList.add("active");
      var f = tab.getAttribute("data-log-filter");
      logBody.querySelectorAll("tr").forEach(function (tr) {
        tr.style.display = f === "all" || tr.getAttribute("data-decision") === f || tr.classList.contains("empty-row") ? "" : "none";
      });
    });
  });
  var logSearch = document.getElementById("logSearch");
  if (logSearch) logSearch.addEventListener("input", function () {
    var q = logSearch.value.trim().toLowerCase();
    logBody.querySelectorAll("tr").forEach(function (tr) {
      if (tr.classList.contains("empty-row")) { tr.style.display = ""; return; }
      tr.style.display = !q || tr.textContent.toLowerCase().indexOf(q) >= 0 ? "" : "none";
    });
  });
  var auditResult = document.getElementById("auditResult");
  function badgeFor(d) { return d === "allow" ? '<span class="badge allow">ALLOW</span>' : '<span class="badge deny">DENY</span>'; }
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
    if (!AUDIT.length) { toast("No audit records to export"); return; }
    download("checkmate-audit.json", JSON.stringify(AUDIT, null, 2), "application/json");
    toast("Audit pack exported · JSON");
  });
  var exportCsv = document.getElementById("exportCsv");
  if (exportCsv) exportCsv.addEventListener("click", function () {
    if (!AUDIT.length) { toast("No audit records to export"); return; }
    var head = "request_id,timestamp,actor,asset,mode,decision,rule,non_disclosure";
    var lines = AUDIT.map(function (r) {
      return [r.id, r.ts, r.actor, r.asset, r.mode, r.decision, r.rule, r.nd ? "verified" : "n/a"].join(",");
    });
    download("checkmate-audit.csv", head + "\n" + lines.join("\n"), "text/csv");
    toast("Audit pack exported · CSV");
  });
  /* ---------------- Security page · inspector ---------------- */
  var kemRun = document.getElementById("kemRun");
  if (kemRun) kemRun.addEventListener("click", function () {
    toast("Control plane not connected — encapsulation runs server-side");
  });
  /* ---------------- Overview page ---------------- */
  var overviewRows = document.getElementById("overviewRows");
  function renderOverviewRows() {
    if (!overviewRows) return;
    if (!AUDIT.length) {
      overviewRows.innerHTML = emptyRow(6, "activity", "No recent decisions", "Authorized and denied requests appear here after the first verification.");
      renderIcons(overviewRows);
      return;
    }
    overviewRows.innerHTML = AUDIT.slice(0, 5).map(function (r) {
      return "<tr data-decision='" + r.decision + "'>" +
        '<td class="mono sub">' + r.ts.replace("T", " ").replace("Z", "") + "</td>" +
        '<td class="mono sub">' + r.id + "</td>" +
        '<td class="mono">' + r.actor + "</td>" +
        '<td class="sub">' + r.asset + "</td>" +
        (r.mode === "protected_read" ? '<td><span class="badge pq">PQ</span></td>' : '<td><span class="badge std">read</span></td>') +
        "<td>" + badgeFor(r.decision) + "</td></tr>";
    }).join("");
    renderIcons(overviewRows);
  }
  renderOverviewRows();
  /* ---------------- Integrations · API keys ---------------- */
  var keyBody = document.getElementById("keyRows");
  function renderKeys() {
    if (!keyBody) return;
    if (!KEYS.length) {
      keyBody.innerHTML = emptyRow(5, "key", "No API keys", "Create a scoped control-plane key after connecting the workspace.");
      renderIcons(keyBody);
      return;
    }
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
        toast("API key revoked · registry updated");
      });
    });
    renderIcons(keyBody);
  }
  renderKeys();
  var keyGenBtn = document.getElementById("generateKeyBtn");
  if (keyGenBtn) keyGenBtn.addEventListener("click", function () {
    toast("Control plane not connected — keys are issued server-side");
  });
  var sideCount = document.getElementById("sideIdentityCount");
  if (sideCount) sideCount.textContent = "0";
  /* ---------------- Settings actions ---------------- */
  document.querySelectorAll("[data-toast]").forEach(function (b) {
    b.addEventListener("click", function () { toast(b.getAttribute("data-toast")); });
  });
  var resetLocalBtn = document.getElementById("resetLocalBtn");
  if (resetLocalBtn) resetLocalBtn.addEventListener("click", function () {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    disabled = {};
    toast("Local workspace state cleared");
  });
})();
