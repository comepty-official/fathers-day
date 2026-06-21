/* ===================================================================
   HAPPY FATHER'S DAY — LUXURY TRIBUTE
   Behaviour
=================================================================== */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------
     PRELOADER
  --------------------------------------------------------------- */
  const preloader = document.getElementById("preloader");
  const hidePreloader = () => {
    if (!preloader) return;
    preloader.classList.add("is-hidden");
    document.body.style.overflow = "";
    window.setTimeout(() => preloader.remove(), 1100);
  };

  if (reduceMotion) {
    hidePreloader();
  } else {
    document.body.style.overflow = "hidden";
    window.addEventListener("load", () => {
      window.setTimeout(() => {
        hidePreloader();
        document.body.style.overflow = "";
      }, 1700);
    });
    // Safety net in case 'load' fires unusually late or never.
    window.setTimeout(hidePreloader, 4000);
  }

  /* ---------------------------------------------------------------
     IMAGE FALLBACK
     If the user hasn't replaced father-portrait.jpg yet, keep the
     elegant placeholder visible instead of a broken image icon.
  --------------------------------------------------------------- */
  const portraitImg = document.getElementById("portraitImg");
  if (portraitImg) {
    portraitImg.addEventListener("error", () => {
      portraitImg.style.display = "none";
    });
  }

  /* ---------------------------------------------------------------
     SCROLL PROGRESS BAR
  --------------------------------------------------------------- */
  const progressBar = document.getElementById("progressBar");
  const updateProgress = () => {
    if (!progressBar) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + "%";
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  /* ---------------------------------------------------------------
     SCROLL REVEAL
  --------------------------------------------------------------- */
  const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));

  // Stagger items that share a parent so groups cascade in elegantly.
  const groups = new Map();
  revealEls.forEach((el) => {
    const parent = el.parentElement;
    if (!groups.has(parent)) groups.set(parent, []);
    groups.get(parent).push(el);
  });
  groups.forEach((els) => {
    els.forEach((el, i) => {
      el.style.setProperty("--reveal-delay", `${Math.min(i * 0.12, 0.6)}s`);
    });
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------------------------------------------------------------
     CUSTOM CURSOR (desktop, fine pointer only)
  --------------------------------------------------------------- */
  const canHover = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  if (canHover && !reduceMotion) {
    const dot = document.getElementById("cursorDot");
    const ring = document.getElementById("cursorRing");
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      if (dot) { dot.style.left = mx + "px"; dot.style.top = my + "px"; }
    });

    const animateRing = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      if (ring) { ring.style.left = rx + "px"; ring.style.top = ry + "px"; }
      requestAnimationFrame(animateRing);
    };
    requestAnimationFrame(animateRing);

    const interactiveSelector = "a, button, .memory-card, .timeline-card";
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(interactiveSelector) && ring) ring.classList.add("is-active");
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(interactiveSelector) && ring) ring.classList.remove("is-active");
    });
  }

  /* ---------------------------------------------------------------
     FLOATING GOLD PARTICLES
  --------------------------------------------------------------- */
  const canvas = document.getElementById("particles");
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    let width, height, particles, rafId;
    let visible = true;

    const density = window.innerWidth < 720 ? 0.045 : 0.07; // particles per 1000px^2-ish
    const colors = ["212,175,106", "246,231,193", "138,109,59"];

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      const count = Math.min(120, Math.round((width * height) / 18000 * density * 10));
      particles = Array.from({ length: count }, makeParticle);
    }

    function makeParticle() {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.8 + 0.4,
        speedY: Math.random() * 0.35 + 0.08,
        speedX: (Math.random() - 0.5) * 0.18,
        drift: Math.random() * Math.PI * 2,
        driftSpeed: Math.random() * 0.01 + 0.003,
        alpha: Math.random() * 0.5 + 0.15,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    }

    function tick() {
      if (!visible) { rafId = requestAnimationFrame(tick); return; }
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.drift += p.driftSpeed;
        p.y -= p.speedY;
        p.x += p.speedX + Math.sin(p.drift) * 0.15;

        if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
        ctx.shadowColor = `rgba(${p.color},${p.alpha})`;
        ctx.shadowBlur = p.r * 4;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      rafId = requestAnimationFrame(tick);
    }

    resize();
    tick();

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    });

    document.addEventListener("visibilitychange", () => {
      visible = !document.hidden;
    });
  }

  /* ---------------------------------------------------------------
     SMOOTH ANCHOR SCROLL (graceful fallback for older browsers)
  --------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  });
})();
