/* Sylva front end — interactions, particles, reveals, parallax. */
(function () {
  "use strict";

  /* ---------- inline icon injection ---------- */
  var ICONS = {
    leaf: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21V10"/><path d="M12 10C12 6.5 9.5 4 6 4c0 3.5 2.5 6 6 6z"/><path d="M12 12c0-3.5 2.5-6 6-6 0 3.5-2.5 6-6 6z"/></svg>',
    "arrow-up-right": '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7"/><path d="M8 7h9v9"/></svg>',
    "arrow-down": '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v15"/><path d="M6 13l6 6 6-6"/></svg>',
    "arrow-up": '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V5"/><path d="M6 11l6-6 6 6"/></svg>',
    "arrow-left": '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12H4"/><path d="M10 6l-6 6 6 6"/></svg>',
    "arrow-right": '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16"/><path d="M14 6l6 6-6 6"/></svg>',
    play: '<svg class="ico" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M8 5.5v13l11-6.5z"/></svg>',
    canopy: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="7.5" stroke-dasharray="2.4 2.8"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/></svg>',
    sun: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="3.4" fill="currentColor" stroke="none"/><path d="M12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7"/></svg>',
    menu: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 8h16M4 16h16"/></svg>',
    close: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    layers: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></svg>',
    journal: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M6 4h11a1 1 0 011 1v14a1 1 0 01-1 1H6z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>',
    enter: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4h5v16h-5"/><path d="M3 12h13"/><path d="M11 8l4 4-4 4"/></svg>',
    quote: '<svg class="ico" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M10 7H6a3 3 0 00-3 3v7h7v-7H6.5A2.5 2.5 0 019 7.5V7zm11 0h-4a3 3 0 00-3 3v7h7v-7h-3.5A2.5 2.5 0 0120 7.5V7z"/></svg>'
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

  /* ---------- header light/dark theme over sections ---------- */
  var head = document.querySelector(".site-head");
  if (head && head.dataset.themeTrack !== "off") {
    var themed = Array.prototype.slice.call(document.querySelectorAll("[data-theme]"));
    function syncHeader() {
      var y = window.scrollY + 80;
      var light = false;
      themed.forEach(function (sec) {
        var r = sec.getBoundingClientRect();
        var top = r.top + window.scrollY;
        var bottom = top + r.height;
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
    }, { threshold: 0.16 });
    revealEls.forEach(function (el) { ro.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- count-up stats ---------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var dur = 1300;
    var start = null;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
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

  /* ---------- drifting dust / pollen particles ---------- */
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("canvas.dust-canvas").forEach(function (canvas) {
    var ctx = canvas.getContext("2d");
    var particles = [];
    var running = true;
    function size() {
      var rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = Math.max(1, rect.width);
      canvas.height = Math.max(1, rect.height);
      var n = Math.min(110, Math.floor(rect.width / 14));
      particles = [];
      for (var i = 0; i < n; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: 0.6 + Math.random() * 1.8,
          vx: (Math.random() - 0.5) * 0.18,
          vy: -0.08 - Math.random() * 0.22,
          a: 0.12 + Math.random() * 0.42,
          sway: Math.random() * Math.PI * 2
        });
      }
    }
    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.sway += 0.008;
        p.x += p.vx + Math.sin(p.sway) * 0.08;
        p.y += p.vy;
        if (p.y < -6) { p.y = canvas.height + 6; p.x = Math.random() * canvas.width; }
        if (p.x < -6) p.x = canvas.width + 6;
        if (p.x > canvas.width + 6) p.x = -6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
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

  /* ---------- pointer parallax ---------- */
  var pxTargets = document.querySelectorAll("[data-parallax]");
  if (pxTargets.length && !reduced) {
    var heroEl = document.querySelector("[data-parallax-root]") || document.body;
    var ticking = false;
    heroEl.addEventListener("pointermove", function (ev) {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var r = heroEl.getBoundingClientRect();
        var cx = (ev.clientX - r.left) / r.width - 0.5;
        var cy = (ev.clientY - r.top) / r.height - 0.5;
        pxTargets.forEach(function (el) {
          var f = parseFloat(el.getAttribute("data-parallax")) || 10;
          el.style.transform = "translate3d(" + (cx * f).toFixed(1) + "px," + (cy * f).toFixed(1) + "px,0)";
        });
        ticking = false;
      });
    });
  }

  /* ---------- quote carousel ---------- */
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
      active.classList.remove("in");
      void active.offsetWidth;
      active.classList.add("in");
    }
    if (prev) prev.addEventListener("click", function () { current = (current - 1 + slides.length) % slides.length; render(); });
    if (next) next.addEventListener("click", function () { current = (current + 1) % slides.length; render(); });
    render();
  }

  /* ---------- footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
