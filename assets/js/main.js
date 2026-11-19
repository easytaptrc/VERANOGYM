/* =========================================================
   VERANO GYM — Configuración y funcionalidad
   ---------------------------------------------------------
   ✏️  Para actualizar teléfono, redes, precios u horarios,
       edita SOLO el objeto CONFIG de abajo.
   ========================================================= */
const CONFIG = {
  // Número de WhatsApp con código de país (52 = México), sin espacios ni "+"
  whatsapp: "528711518748",
  telefono: "+528711518748",
  instagram: "https://www.instagram.com/veranogym_trc24hrs/",
  // ⚠️ Reemplazar por la URL oficial de la página de Facebook del gym
  facebook: "https://www.facebook.com/search/top/?q=Verano%20Gym%20TRC%2024Hrs%20Torre%C3%B3n",
  maps: "https://maps.app.goo.gl/tJx56C7JnDN16szH9",
  resenas: "https://www.google.com/maps/place/Verano+Gym+TRC/@25.5337842,-103.3963771,17z/data=!4m8!3m7!1s0x868fdb007fb57e53:0xb722cb72224cdb72!8m2!3d25.5337842!4d-103.3963771!9m1!1b1",
  zonaHoraria: "America/Monterrey",

  // Planes (precio en MXN). "destacado: true" resalta la tarjeta.
  planes: [
    { nombre: "Visita", precio: 80, periodo: "por día", incluye: ["Acceso a todo el gym", "Ideal para conocernos"] },
    { nombre: "Semana", precio: 270, periodo: "7 días", incluye: ["Acceso ilimitado", "Pesas, máquinas y cardio"] },
    { nombre: "Quincena", precio: 440, periodo: "15 días", incluye: ["Acceso ilimitado", "Regaderas y vestidores"] },
    { nombre: "Mes Mujeres", precio: 650, periodo: "por mes", incluye: ["Acceso ilimitado 24/5", "Zona de glúteo", "Inscripción gratis"], destacado: true, etiqueta: "Más popular" },
    { nombre: "Mes Hombres", precio: 680, periodo: "por mes", incluye: ["Acceso ilimitado 24/5", "+80 máquinas", "Inscripción gratis"] }
  ],

  // Horario: 0 = domingo … 6 = sábado. "24h" o [apertura, cierre] en formato 24 h.
  horario: {
    1: "24h", 2: "24h", 3: "24h", 4: "24h", 5: "24h",
    6: ["05:30", "16:00"],
    0: ["08:00", "16:00"]
  }
};

/* ---------------- Utilidades ---------------- */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const waLink = (msg) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

/* ---------------- Enlaces (WhatsApp, redes, mapa, tel) ---------------- */
function wireLinks() {
  $$("[data-wa]").forEach((a) => (a.href = waLink(a.dataset.wa || "Hola Verano Gym 👋")));
  $$("[data-ig]").forEach((a) => (a.href = CONFIG.instagram));
  $$("[data-fb]").forEach((a) => (a.href = CONFIG.facebook));
  $$("[data-maps]").forEach((a) => (a.href = CONFIG.maps));
  $$("[data-reviews]").forEach((a) => (a.href = CONFIG.resenas));
  $$("[data-tel]").forEach((a) => (a.href = `tel:${CONFIG.telefono}`));
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
}

/* ---------------- Precios ---------------- */
function renderPlans() {
  const wrap = $("[data-plans]");
  if (!wrap) return;
  wrap.innerHTML = CONFIG.planes.map((p) => `
    <article class="plan${p.destacado ? " plan--featured" : ""}">
      ${p.etiqueta ? `<span class="plan__ribbon">${p.etiqueta}</span>` : ""}
      <h3 class="plan__name">${p.nombre}</h3>
      <div class="plan__price"><sup>$</sup>${p.precio.toLocaleString("es-MX")}</div>
      <p class="plan__per">${p.periodo}</p>
      <ul class="plan__list">${p.incluye.map((i) => `<li>${i}</li>`).join("")}</ul>
      <a class="btn ${p.destacado ? "btn--yellow" : "btn--ghost"} btn--block" target="_blank" rel="noopener"
         href="${waLink(`Hola Verano Gym 👋 Me interesa el plan ${p.nombre} ($${p.precio}). ¿Me dan más información?`)}">Lo quiero</a>
    </article>`).join("");
}

/* ---------------- Horarios + estado abierto/cerrado ---------------- */
function nowInGym() {
  // Hora actual en Torreón, sin importar la zona horaria del visitante
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CONFIG.zonaHoraria, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, mins: parseInt(get("hour"), 10) * 60 + parseInt(get("minute"), 10) };
}
const toMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
const fmt = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  const ap = h < 12 ? "am" : "pm";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ap}`;
};

function gymStatus() {
  const { day, mins } = nowInGym();
  const today = CONFIG.horario[day];
  if (today === "24h") {
    const tomorrow = CONFIG.horario[(day + 1) % 7];
    if (tomorrow !== "24h" && mins >= 22 * 60) return { open: true, text: "Abierto ahora · cierra a las 11:59 pm" };
    return { open: true, text: "Abierto ahora · 24 horas" };
  }
  const [o, c] = today;
  if (mins >= toMin(o) && mins < toMin(c)) return { open: true, text: `Abierto ahora · cierra a las ${fmt(c)}` };
  if (mins < toMin(o)) return { open: false, text: `Cerrado · abrimos hoy a las ${fmt(o)}` };
  // Buscar la próxima apertura
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    const h = CONFIG.horario[d];
    const when = i === 1 ? "mañana" : `el ${DIAS[d].toLowerCase()}`;
    if (h === "24h") return { open: false, text: `Cerrado · abrimos ${when} a las 12:00 am` };
    if (h) return { open: false, text: `Cerrado · abrimos ${when} a las ${fmt(h[0])}` };
  }
  return { open: false, text: "Cerrado" };
}

function renderHours() {
  const table = $("[data-hours]");
  const { day } = nowInGym();
  if (table) {
    const order = [1, 2, 3, 4, 5, 6, 0];
    table.innerHTML = order.map((d) => {
      const h = CONFIG.horario[d];
      const txt = h === "24h" ? "24 horas" : `${fmt(h[0])} – ${fmt(h[1])}`;
      return `<div class="hour-row${h === "24h" ? " is-24" : ""}${d === day ? " is-today" : ""}" role="row">
        <span role="cell">${DIAS[d]}</span><span role="cell">${txt}</span></div>`;
    }).join("");
  }
  const st = gymStatus();
  $$("[data-status]").forEach((el) => {
    el.classList.toggle("is-open", st.open);
    el.classList.toggle("is-closed", !st.open);
    el.querySelector("span").textContent = st.text;
  });
}

/* ---------------- Menú móvil y nav ---------------- */
function nav() {
  const header = $(".nav");
  const toggle = $(".nav__toggle");
  const menu = $("#menu");
  const close = () => { menu.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); toggle.setAttribute("aria-label", "Abrir menú"); };
  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  });
  $$("a", menu).forEach((a) => a.addEventListener("click", close));
  document.addEventListener("keydown", (e) => e.key === "Escape" && close());

  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 30);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Resaltar sección activa
  const links = $$('.nav__links a[href^="#"]');
  const map = new Map(links.map((l) => [l.getAttribute("href").slice(1), l]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting && map.has(en.target.id)) {
        links.forEach((l) => l.classList.remove("is-active"));
        map.get(en.target.id).classList.add("is-active");
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
}

/* ---------------- Galería con lightbox ---------------- */
function gallery() {
  const items = $$("[data-gallery] a");
  const lb = $("[data-lightbox]");
  if (!items.length || !lb) return;
  const img = $("img", lb), cap = $(".lightbox__cap", lb);
  let idx = 0, lastFocus = null, touchX = null;
  const show = (i) => {
    idx = (i + items.length) % items.length;
    const a = items[idx], alt = $("img", a).alt;
    img.src = a.href; img.alt = alt; cap.textContent = `${idx + 1} / ${items.length} · ${alt}`;
  };
  const open = (i) => { lastFocus = document.activeElement; show(i); lb.hidden = false; document.body.style.overflow = "hidden"; $(".lightbox__close", lb).focus(); };
  const close = () => { lb.hidden = true; document.body.style.overflow = ""; lastFocus && lastFocus.focus(); };
  items.forEach((a, i) => a.addEventListener("click", (e) => { e.preventDefault(); open(i); }));
  $(".lightbox__close", lb).addEventListener("click", close);
  $(".lightbox__prev", lb).addEventListener("click", () => show(idx - 1));
  $(".lightbox__next", lb).addEventListener("click", () => show(idx + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
  });
  lb.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    touchX = null;
  });
}

/* ---------------- Formulario → WhatsApp ---------------- */
function form() {
  const f = $("[data-form]");
  if (!f) return;
  const err = $(".form__error", f);
  f.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f));
    const nombre = (d.nombre || "").trim();
    if (!nombre) {
      err.hidden = false; f.nombre.classList.add("is-invalid"); f.nombre.focus();
      return;
    }
    err.hidden = true; f.nombre.classList.remove("is-invalid");
    const msg = [
      `Hola Verano Gym 👋 Soy ${nombre}.`,
      `Me interesa: ${d.plan}.`,
      `Mi objetivo: ${d.objetivo}.`,
      `Entrenaría en: ${d.horario}.`,
      d.mensaje && d.mensaje.trim() ? `Mensaje: ${d.mensaje.trim()}` : ""
    ].filter(Boolean).join("\n");
    window.open(waLink(msg), "_blank", "noopener");
  });
}

/* ---------------- Animaciones al hacer scroll ---------------- */
function reveal() {
  const els = $$(".section__head, .feature, .plan, .extra, .split > *, .hours > *, .g, .post, .review, .faq details, .contact > *");
  if (!("IntersectionObserver" in window)) return;
  els.forEach((el) => el.classList.add("reveal"));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  els.forEach((el) => io.observe(el));
}

/* ---------------- Init ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  wireLinks();
  renderPlans();
  renderHours();
  setInterval(renderHours, 60 * 1000);
  nav();
  gallery();
  form();
  reveal();
});
