/* CHECKMATE marketing site — icons, nav, reveals, accordion, carousel, reader modal. */
(function () {
  "use strict";

  /* ---------- inline icon library (no emoji, no external icon font) ---------- */
  var ICONS = {
    king: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3"/><path d="M10.5 4.5h3"/><path d="M5 8.5 7.6 11 12 7.8 16.4 11 19 8.5l-1.8 6.4a2.4 2.4 0 0 1-2.3 1.8H9.1a2.4 2.4 0 0 1-2.3-1.8L5 8.5z"/><path d="M8.6 16.7h6.8l.5 3.3H8.1l.5-3.3z"/></svg>',
    shield: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.6-3 8.2-7 10-4-1.8-7-5.4-7-10V6l7-3z"/><path d="M9 12l2 2 4-4"/></svg>',
    bolt: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L5 13h6l-1 9 8-11h-6l1-9z"/></svg>',
    key: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="4"/><path d="M11 11l9 9"/><path d="M17 17l2.5-2.5"/><path d="M14.5 14.5l2-2"/></svg>',
    lock: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10" width="14" height="10" rx="2.5"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/></svg>',
    book: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h11a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5z"/><path d="M8 8h6M8 12h6M8 16h4"/></svg>',
    terminal: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M7.5 9.5l3 2.5-3 2.5M12.5 14.5h4"/></svg>',
    layers: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></svg>',
    audit: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M9.5 13l1.8 1.8 3.2-3.2"/></svg>',
    chip: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="7" y="7" width="10" height="10" rx="2"/><rect x="10" y="10" width="4" height="4"/><path d="M10 3.5V7M14 3.5V7M10 17v3.5M14 17v3.5M3.5 10H7M3.5 14H7M17 10h3.5M17 14h3.5"/></svg>',
    eye: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    server: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="4" y="4" width="16" height="6" rx="2"/><rect x="4" y="14" width="16" height="6" rx="2"/><path d="M7.5 7h.01M7.5 17h.01"/></svg>',
    "arrow-up-right": '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7"/><path d="M8 7h9v9"/></svg>',
    "arrow-down": '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v15"/><path d="M6 13l6 6 6-6"/></svg>',
    "arrow-left": '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12H4"/><path d="M10 6l-6 6 6 6"/></svg>',
    "arrow-right": '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16"/><path d="M14 6l6 6-6 6"/></svg>',
    "arrow-up": '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V5"/><path d="M6 11l6-6 6 6"/></svg>',
    play: '<svg class="ico" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M8 5.5v13l11-6.5z"/></svg>',
    close: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    check: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    download: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11"/><path d="M7.5 11.5L12 16l4.5-4.5"/><path d="M5 20h14"/></svg>',
    menu: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 8h16M4 16h16"/></svg>'
  };
  document.querySelectorAll("[data-icon]").forEach(function (el) {
    var name = el.getAttribute("data-icon");
    if (ICONS[name]) el.innerHTML = ICONS[name];
  });

  /* ---------- mobile navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".pill-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", nav.classList.contains("open"));
      toggle.innerHTML = nav.classList.contains("open") ? ICONS.close : ICONS.menu;
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("open"); });
    });
  }

  /* ---------- header light/dark state over paper chapters ---------- */
  var head = document.querySelector(".site-head");
  if (head) {
    var themed = Array.prototype.slice.call(document.querySelectorAll("[data-theme]"));
    function syncHeader() {
      var y = window.scrollY + 80, light = false;
      themed.forEach(function (sec) {
        var r = sec.getBoundingClientRect();
        var top = r.top + window.scrollY, bottom = top + r.height;
        if (y >= top && y < bottom && sec.dataset.theme === "light") light = true;
      });
      head.classList.toggle("on-light", light);
    }
    window.addEventListener("scroll", syncHeader, { passive: true });
    syncHeader();
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); ro.unobserve(e.target); }
      });
    }, { threshold: 0.05 });
    revealEls.forEach(function (el) { ro.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }
  /* fallback: never leave content hidden if observers do not fire */
  setTimeout(function () {
    document.querySelectorAll("[data-reveal]:not(.in)").forEach(function (el) { el.classList.add("in"); });
  }, 350);

  /* ---------- threat accordion ---------- */
  document.querySelectorAll(".stage-row button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var row = btn.closest(".stage-row");
      var open = row.getAttribute("aria-expanded") === "true";
      document.querySelectorAll(".stage-row").forEach(function (r) {
        r.setAttribute("aria-expanded", "false");
        var b = r.querySelector("button");
        if (b) b.setAttribute("aria-expanded", "false");
      });
      if (!open) {
        row.setAttribute("aria-expanded", "true");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- invariant carousel ---------- */
  var qWrap = document.querySelector("[data-quotes]");
  if (qWrap) {
    var slides = Array.prototype.slice.call(qWrap.querySelectorAll("[data-slide]"));
    var prev = qWrap.querySelector("[data-q-prev]");
    var next = qWrap.querySelector("[data-q-next]");
    var indexLabel = qWrap.querySelector("[data-q-index]");
    var current = 0;
    function render() {
      slides.forEach(function (s, i) { s.hidden = i !== current; });
      if (indexLabel) indexLabel.textContent = ("0" + (current + 1)) + " — 0" + slides.length;
      var active = slides[current];
      active.classList.remove("quote-slide");
      void active.offsetWidth;
      active.classList.add("quote-slide");
    }
    if (prev) prev.addEventListener("click", function () { current = (current - 1 + slides.length) % slides.length; render(); });
    if (next) next.addEventListener("click", function () { current = (current + 1) % slides.length; render(); });
    render();
  }

  /* ---------- engine operation selector (demo state only) ---------- */
  document.querySelectorAll(".ops-select").forEach(function (group) {
    group.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () {
        group.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
        var caption = group.closest(".story-card").querySelector(".story-caption");
        if (caption) {
          var label = b.getAttribute("data-label") || b.textContent.trim();
          caption.innerHTML = '<span class="live"></span>' + label;
        }
      });
    });
  });

  /* ---------- reader modal ---------- */
  var backdrop = document.querySelector(".reader-backdrop");
  var reader = document.querySelector(".reader");
  function openReader() {
    if (!reader) return;
    backdrop.classList.add("open");
    reader.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeReader() {
    backdrop && backdrop.classList.remove("open");
    reader && reader.classList.remove("open");
    document.body.style.overflow = "";
  }
  document.querySelectorAll("[data-open-reader]").forEach(function (el) {
    el.addEventListener("click", function (e) { e.preventDefault(); openReader(); });
  });
  document.querySelectorAll("[data-close-reader]").forEach(function (el) {
    el.addEventListener("click", closeReader);
  });
  if (backdrop) backdrop.addEventListener("click", closeReader);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeReader(); });

  /* ---------- count-up stats ---------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var dur = 1300, start = null;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); co.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* ---------- drifting dust particles in dark bands ---------- */
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("canvas.dust-canvas").forEach(function (canvas) {
    var ctx = canvas.getContext("2d");
    var particles = [], running = true;
    function size() {
      var rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = Math.max(1, rect.width);
      canvas.height = Math.max(1, rect.height);
      var n = Math.min(90, Math.floor(rect.width / 18));
      particles = [];
      for (var i = 0; i < n; i++) {
        particles.push({
          x: Math.random() * canvas.width, y: Math.random() * canvas.height,
          r: 0.6 + Math.random() * 1.7,
          vx: (Math.random() - .5) * .16, vy: -0.06 - Math.random() * .2,
          a: 0.1 + Math.random() * .34, sway: Math.random() * Math.PI * 2
        });
      }
    }
    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.sway += 0.008; p.x += p.vx + Math.sin(p.sway) * .07; p.y += p.vy;
        if (p.y < -6) { p.y = canvas.height + 6; p.x = Math.random() * canvas.width; }
        if (p.x < -6) p.x = canvas.width + 6;
        if (p.x > canvas.width + 6) p.x = -6;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(226, 234, 205, " + p.a.toFixed(3) + ")";
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    size();
    window.addEventListener("resize", size);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          running = e.isIntersecting && !reduced;
          if (running) draw();
        });
      }, { threshold: 0 }).observe(canvas);
    }
    if (!reduced) draw();
  });

  /* ---------- footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
