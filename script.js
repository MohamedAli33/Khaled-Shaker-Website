/* =========================================================
   Site configuration — fill these in to show email / phone
   in the Contact section (leave empty to hide them).
   ========================================================= */
const CONFIG = {
  email: "En_aboshaker@yahoo.com",
  phone: "",          // e.g. "+966 5X XXX XXXX"
};

(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- Language ---------- */
  const setLang = (lang) => {
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    try { localStorage.setItem("ks-lang", lang); } catch (e) {}
    if (location.search.includes("lang=")) {
      const u = new URL(location.href);
      u.searchParams.set("lang", lang);
      history.replaceState(null, "", u);
    }
    startTyping();
  };
  $("#langToggle").addEventListener("click", () => setLang(root.lang === "ar" ? "en" : "ar"));

  /* ---------- Contact config ---------- */
  if (CONFIG.email) {
    const a = $("#emailLink");
    a.href = "mailto:" + CONFIG.email;
    $("#emailText").textContent = CONFIG.email;
    a.hidden = false;
  }
  if (CONFIG.phone) {
    const a = $("#phoneLink");
    const digits = CONFIG.phone.replace(/[^\d]/g, "");
    a.href = "https://wa.me/" + digits;
    a.target = "_blank"; a.rel = "noopener";
    $("#phoneText").textContent = CONFIG.phone;
    a.hidden = false;
  }
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Nav: scrolled state, progress, burger ---------- */
  const nav = $("#nav");
  const bar = $("#progressBar");
  const toTop = $("#toTop");
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 20);
    toTop.classList.toggle("is-visible", y > 600);
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const burger = $("#burger");
  const links = $("#navLinks");
  const closeMenu = () => {
    burger.setAttribute("aria-expanded", "false");
    links.classList.remove("is-open");
    nav.classList.remove("menu-open");
  };
  burger.addEventListener("click", () => {
    const open = burger.getAttribute("aria-expanded") !== "true";
    burger.setAttribute("aria-expanded", String(open));
    links.classList.toggle("is-open", open);
    nav.classList.toggle("menu-open", open);
  });
  $$("a", links).forEach((a) => a.addEventListener("click", closeMenu));

  /* ---------- Scroll spy ---------- */
  const navMap = new Map($$("a[href^='#']", links).map((a) => [a.getAttribute("href").slice(1), a]));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      navMap.forEach((a) => a.classList.remove("is-active"));
      const a = navMap.get(e.target.id);
      if (a && !a.classList.contains("nav__cta")) a.classList.add("is-active");
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach((s) => spy.observe(s));

  /* ---------- Reveal on scroll ---------- */
  const groups = new Map();
  $$(".reveal").forEach((el) => {
    const p = el.parentElement;
    const i = groups.get(p) || 0;
    groups.set(p, i + 1);
    el.style.setProperty("--d", Math.min(i * 0.08, 0.4) + "s");
  });
  const revealer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); revealer.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach((el) => revealer.observe(el));

  /* ---------- Counters ---------- */
  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.target);
    const dec = parseInt(el.dataset.decimals || "0", 10);
    if (reduceMotion) { el.textContent = target.toFixed(dec); return; }
    const dur = 1800, t0 = performance.now();
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = (target * eased).toFixed(dec);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { animateCounter(e.target); counterObs.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  $$(".counter").forEach((c) => counterObs.observe(c));

  /* ---------- Typed role ---------- */
  const roles = {
    en: ["Senior Project Manager", "Data Center Infrastructure", "Quality Assurance Team Lead", "PMP® · PMO-CP® · HCIA-DCF", "DWDM / SDH & FTTH Specialist"],
    ar: ["مدير مشاريع أول", "البنية التحتية لمراكز البيانات", "قائد فريق ضمان الجودة", "PMP® · PMO-CP® · HCIA-DCF", "خبير DWDM / SDH وFTTH"],
  };
  let typeTimer;
  function startTyping() {
    clearTimeout(typeTimer);
    const lang = root.lang === "ar" ? "ar" : "en";
    const el = lang === "ar" ? $("#typedAr") : $("#typedEn");
    const list = roles[lang];
    if (reduceMotion) { el.textContent = list[0]; return; }
    let i = 0, j = 0, deleting = false;
    const step = () => {
      const word = list[i];
      j += deleting ? -1 : 1;
      el.textContent = word.slice(0, j);
      let delay = deleting ? 35 : 70;
      if (!deleting && j === word.length) { deleting = true; delay = 1800; }
      else if (deleting && j === 0) { deleting = false; i = (i + 1) % list.length; delay = 300; }
      typeTimer = setTimeout(step, delay);
    };
    step();
  }
  startTyping();

  /* ---------- Card spotlight ---------- */
  $$(".card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });

  /* ---------- Lightbox ---------- */
  const lb = $("#lightbox"), lbImg = $("#lbImg"), lbCap = $("#lbCap");
  let items = [], idx = 0, lastFocus = null;
  const show = (k) => {
    idx = (k + items.length) % items.length;
    const it = items[idx];
    lbImg.src = it.dataset.src;
    lbImg.alt = it.dataset.caption;
    lbCap.textContent = it.dataset.caption;
  };
  const openLb = (el) => {
    items = $$(`[data-gallery="${el.dataset.gallery}"]`);
    lastFocus = el;
    show(items.indexOf(el));
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    $("#lbClose").focus();
  };
  const closeLb = () => {
    lb.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  };
  $$("[data-gallery]").forEach((el) => el.addEventListener("click", () => openLb(el)));
  $("#lbClose").addEventListener("click", closeLb);
  $("#lbPrev").addEventListener("click", () => show(idx - 1));
  $("#lbNext").addEventListener("click", () => show(idx + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
  addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowRight") show(idx + 1);
    if (e.key === "ArrowLeft") show(idx - 1);
  });

  /* ---------- Hero network canvas ---------- */
  const canvas = $("#netCanvas");
  const ctx = canvas.getContext("2d");
  let W, H, DPR, nodes = [], packets = [], raf;
  const COLORS = ["34,211,238", "59,130,246", "139,92,246"];

  const resize = () => {
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const count = Math.round(Math.min(90, Math.max(30, (W * H) / 16000)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.6 + 0.8, c: COLORS[(Math.random() * COLORS.length) | 0],
    }));
    packets = [];
  };
  const LINK = 150;

  const frame = () => {
    ctx.clearRect(0, 0, W, H);
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    }
    const links = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy);
        if (d < LINK) {
          const o = (1 - d / LINK) * 0.35;
          ctx.strokeStyle = `rgba(${a.c},${o})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          links.push([a, b]);
        }
      }
    }
    for (const n of nodes) {
      ctx.fillStyle = `rgba(${n.c},.9)`;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
    }
    // data packets travelling along links
    if (links.length && packets.length < 14 && Math.random() < 0.08) {
      const [a, b] = links[(Math.random() * links.length) | 0];
      packets.push({ a, b, t: 0, s: 0.008 + Math.random() * 0.012 });
    }
    packets = packets.filter((p) => (p.t += p.s) < 1);
    for (const p of packets) {
      const x = p.a.x + (p.b.x - p.a.x) * p.t, y = p.a.y + (p.b.y - p.a.y) * p.t;
      const g = ctx.createRadialGradient(x, y, 0, x, y, 8);
      g.addColorStop(0, "rgba(34,211,238,.95)"); g.addColorStop(1, "rgba(34,211,238,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  };

  resize();
  addEventListener("resize", () => { cancelAnimationFrame(raf); resize(); reduceMotion ? frame1() : frame(); });
  const frame1 = () => { frame(); cancelAnimationFrame(raf); };
  // pause animation when hero is off-screen
  const heroObs = new IntersectionObserver(([e]) => {
    cancelAnimationFrame(raf);
    if (e.isIntersecting) reduceMotion ? frame1() : frame();
  });
  heroObs.observe($(".hero"));
})();
