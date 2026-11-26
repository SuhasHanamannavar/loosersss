/* CHECKMATE console — local demonstration state, stream, revoke, KEM demo, audit export. */
(function () {
  "use strict";

  /* ---------------- icons ---------------- */
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
    download: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11"/><path d="M7.5 11.5L12 16l4.5-4.5"/><path d="M5 20h14"/></svg>'
  };
  document.querySelectorAll("[data-icon]").forEach(function (el) {
    var n = el.getAttribute("data-icon");
    if (ICONS[n]) el.innerHTML = ICONS[n];
  });

  /* ---------------- helpers ---------------- */
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function localTime(d) { d = d || new Date(); return pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds()); }
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

  /* ---------------- state ---------------- */
  var disabled = { fiona: true, grace: true, hugo: true };
  var registry = [
    { actor: "fiona", ts: "11-26 08:14", by: "Automated IDS" },
    { actor: "grace", ts: "11-25 21:40", by: "Self-service wipe" },
    { actor: "hugo", ts: "11-25 11:03", by: "Admin revoke" }
  ];
  var actors = ["alice", "bhargav", "carlos", "dana", "eva"];
  var assets = [
    { id: "prod-db-credentials", owner: "dana", tier: "pq" },
    { id: "q4-financial-report", owner: "carlos", tier: "pq" },
    { id: "vault-seed-note", owner: "alice", tier: "pq" },
    { id: "customer-pii-export", owner: "bhargav", tier: "std" },
    { id: "k8s-sealed-secret", owner: "dana", tier: "pq" },
    { id: "design-spec-board", owner: "eva", tier: "std" }
  ];

  /* ---------------- Module 05 · matrix ---------------- */
  var matrixBody = document.getElementById("matrixRows");
  if (matrixBody) {
    matrixBody.innerHTML = assets.map(function (a) {
      var tier = a.tier === "pq"
        ? '<span class="badge pq">PQ protected</span>'
        : '<span class="badge std">Standard</span>';
      var rule = a.tier === "pq" ? "owner_allowed · protected_read required" : "owner_allowed · standard read";
      return '<tr><td class="mono">' + a.id + '</td><td class="mono">' + a.owner + '</td><td>' + tier + '</td><td class="sub mono">' + rule + "</td></tr>";
    }).join("");
  }

  /* ---------------- Module 03 · live stream ---------------- */
  var streamBody = document.getElementById("streamRows");
  var blockNote = document.getElementById("blockNote");
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function addRow(initial) {
    if (!streamBody) return;
    var actor = pick(actors);
    var asset = pick(assets).id;
    var pq = Math.random() < 0.34;
    var isDisabled = !!disabled[actor];
    var deny = isDisabled || (!initial && Math.random() < 0.08);
    var mode = pq ? '<span class="badge pq" title="protected_read">PQ</span>' : '<span class="badge std">read</span>';
    var decision = deny ? '<span class="badge deny">DENY</span>' : '<span class="badge allow">ALLOW</span>';
    var tr = document.createElement("tr");
    if (isDisabled) tr.className = "row-blocked";
    tr.innerHTML =
      '<td class="mono sub">' + localTime() + "</td>" +
      '<td class="mono sub">' + rid() + "</td>" +
      '<td class="mono">' + actor + "</td>" +
      '<td class="sub">' + asset + "</td>" +
      "<td>" + mode + "</td>" +
      "<td>" + decision + "</td>";
    streamBody.prepend(tr);
    while (streamBody.rows.length > 14) streamBody.deleteRow(-1);
    if (isDisabled && blockNote) {
      blockNote.hidden = false;
      blockNote.textContent = "BLOCKED: Stolen device access attempt · " + actor + " · identity_disabled at verification";
    }
  }
  for (var i = 0; i < 6; i++) addRow(true);
  setInterval(function () { addRow(false); }, 1900);

  /* ---------------- Module 02 · killswitch ---------------- */
  var registryBody = document.getElementById("registryRows");
  var propValue = document.getElementById("propValue");
  var propNote = document.getElementById("propNote");
  function renderRegistry() {
    if (!registryBody) return;
    registryBody.innerHTML = registry.map(function (r) {
      return '<tr><td class="mono">' + r.actor + '</td><td class="mono sub">' + r.ts +
        '</td><td class="sub">' + r.by + '</td><td><span class="badge lock">Locked</span></td></tr>';
    }).join("");
  }
  renderRegistry();

  var revokeBtn = document.getElementById("revokeBtn");
  if (revokeBtn) {
    revokeBtn.addEventListener("click", function () {
      var sel = document.getElementById("actorSelect");
      var actor = sel ? sel.value : "alice";
      var reasonEl = document.querySelector('input[name="reason"]:checked');
      var reason = reasonEl ? reasonEl.value : "Stolen laptop";
      if (!disabled[actor]) {
        disabled[actor] = true;
        var d = new Date(), pad = function (n) { return String(n).padStart(2, "0"); };
        var stamp = pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
        registry.unshift({ actor: actor, ts: stamp, by: "Admin revoke · " + reason });
        renderRegistry();
      }
      /* propagation animation 840 ms -> 0.0 ms */
      var start = performance.now(), dur = 820;
      function frame(ts) {
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var ms = (840 * (1 - eased)).toFixed(1);
        if (propValue) propValue.textContent = ms + " ms";
        if (p < 1) requestAnimationFrame(frame);
        else {
          if (propValue) propValue.textContent = "0.0 ms";
          if (propNote) propNote.textContent = actor + " · identity_disabled committed at " + localTime();
        }
      }
      requestAnimationFrame(frame);
    });
  }

  /* ---------------- Module 04 · PQC inspector ---------------- */
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
  if (kemRun) {
    kemRun.addEventListener("click", async function () {
      var sel = document.getElementById("actorSelect");
      var actor = sel ? sel.value : "alice";
      var disabledActor = !!disabled[actor];
      var ct = randHex(1088), ss = randHex(32), nonce = randHex(12);
      var proof = randHex(32);
      try {
        if (window.crypto && crypto.subtle) {
          var key = await crypto.subtle.importKey("raw", new TextEncoder().encode(ss), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
          var sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(nonce + "::" + actor));
          proof = Array.from(new Uint8Array(sig)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
        }
      } catch (e) { /* fallback random digest retained */ }
      document.getElementById("outCt").textContent = shortHex(ct, 88) + " (1088 B)";
      document.getElementById("outSs").textContent = shortHex(ss, 44) + " (32 B)";
      document.getElementById("outNonce").textContent = shortHex(nonce, 36) + " (12 B)";
      document.getElementById("outProof").textContent = proof;
      setVerify(!disabledActor, actor, disabledActor ? "identity_disabled" : "owner_allowed");
    });
  }

  /* ---------------- Module 06 · audit explorer ---------------- */
  var AUDIT = [
    { id: "req-9f31c2", ts: "2026-11-26T09:12:44Z", actor: "dana", asset: "prod-db-credentials", mode: "protected_read", decision: "allow", rule: "owner_allowed", nd: true },
    { id: "req-4b77e0", ts: "2026-11-26T09:11:58Z", actor: "fiona", asset: "prod-db-credentials", mode: "read", decision: "deny", rule: "identity_disabled", nd: true },
    { id: "req-c2a91d", ts: "2026-11-26T09:10:31Z", actor: "carlos", asset: "customer-pii-export", mode: "read", decision: "deny", rule: "owner_mismatch", nd: true },
    { id: "req-77e0bf", ts: "2026-11-26T09:08:02Z", actor: "alice", asset: "vault-seed-note", mode: "protected_read", decision: "allow", rule: "owner_allowed", nd: true }
  ];
  var auditResult = document.getElementById("auditResult");
  function badgeFor(d) { return d === "allow" ? '<span class="badge allow">ALLOW</span>' : '<span class="badge deny">DENY</span>'; }
  function renderAudit(rec) {
    if (!auditResult) return;
    if (!rec) {
      auditResult.innerHTML = '<p class="audit-empty">No record matches that request ID. Try one of the sample IDs listed.</p>';
      return;
    }
    var modeBadge = rec.mode === "protected_read"
      ? '<span class="badge pq">protected_read</span>'
      : '<span class="badge std">read</span>';
    var rows = [
      ["Request id", rec.id],
      ["Timestamp", rec.ts],
      ["Actor · asset", rec.actor + " · " + rec.asset],
      ["Mode", modeBadge],
      ["Decision", badgeFor(rec.decision)],
      ["Rule enforced", rec.rule],
      ["Non-disclosure", '<span style="color:var(--moss-bright)">verified · no secret bytes returned on deny</span>']
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
  });
  var exportCsv = document.getElementById("exportCsv");
  if (exportCsv) exportCsv.addEventListener("click", function () {
    var head = "request_id,timestamp,actor,asset,mode,decision,rule,non_disclosure";
    var lines = AUDIT.map(function (r) {
      return [r.id, r.ts, r.actor, r.asset, r.mode, r.decision, r.rule, r.nd ? "verified" : "n/a"].join(",");
    });
    download("checkmate-audit.csv", head + "\n" + lines.join("\n"), "text/csv");
  });
})();
