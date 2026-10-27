(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const u = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=70`;

  /* ---------- Menu data (edit freely) ---------- */
  const dishes = [
    { name: "Burrata & Heirloom Tomato", desc: "Creamy burrata, basil oil, aged balsamic.", price: 650, cat: "Starters", veg: true, img: "1546069901-ba9599a7e63c" },
    { name: "Smoked Paneer Tikka", desc: "Charred paneer, mint chutney, pickled onion.", price: 580, cat: "Starters", veg: true, img: "1504674900247-0877df9cc836" },
    { name: "Charcoal Lamb Rack", desc: "Saffron jus, roasted shallots, spiced mash.", price: 2450, cat: "Main Course", veg: false, img: "1600891964092-4316c288032e" },
    { name: "Seared Ribeye", desc: "Herb butter, grilled seasonal vegetables.", price: 2200, cat: "Main Course", veg: false, img: "1544025162-d76694265947" },
    { name: "Wild Mushroom Risotto", desc: "Arborio rice, truffle oil, parmesan crisp.", price: 1250, cat: "Main Course", veg: true, img: "1565299624946-b28f40a0ae38" },
    { name: "Dark Chocolate Fondant", desc: "Molten centre, vanilla bean cream.", price: 720, cat: "Desserts", veg: true, img: "1551024506-0bccd828d307" },
    { name: "Honey Pistachio Pancakes", desc: "Whipped mascarpone, berries, warm honey.", price: 640, cat: "Desserts", veg: true, img: "1567620905732-2d1ec7ab7445" },
    { name: "Saffron Cardamom Lassi", desc: "Chilled yoghurt drink with rose and saffron.", price: 320, cat: "Beverages", veg: true, img: "1482049016688-2d3e1b311543" }
  ];

  const grid = $("#menuGrid");
  const fmt = new Intl.NumberFormat("en-IN");
  function renderMenu(filter = "All") {
    grid.innerHTML = "";
    dishes.filter(d => filter === "All" || d.cat === filter).forEach((d, i) => {
      const card = document.createElement("article");
      card.className = "dish";
      card.style.animationDelay = `${i * 50}ms`;
      card.innerHTML = `
        <div class="dish-img"><img src="${u(d.img)}" alt="${d.name}" loading="lazy"></div>
        <div class="dish-body">
          <div class="dish-meta"><span class="cat">${d.cat}</span>${d.veg ? '<span class="veg">Vegetarian</span>' : ""}</div>
          <h3>${d.name}</h3><p>${d.desc}</p>
          <span class="price">₹${fmt.format(d.price)}</span>
        </div>`;
      grid.appendChild(card);
    });
  }
  renderMenu();
  $$(".filter").forEach(btn => btn.addEventListener("click", () => {
    $$(".filter").forEach(b => { b.classList.remove("active"); b.setAttribute("aria-pressed", "false"); });
    btn.classList.add("active"); btn.setAttribute("aria-pressed", "true");
    renderMenu(btn.dataset.filter);
  }));

  /* Hide broken images so the dark fallback background shows */
  document.addEventListener("error", e => {
    if (e.target.tagName === "IMG") e.target.style.visibility = "hidden";
  }, true);

  /* ---------- Header, mobile nav, back-to-top ---------- */
  const header = $("#header"), toggle = $("#navToggle"), menu = $("#navMenu"), toTop = $("#toTop");
  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 40);
    toTop.classList.toggle("show", window.scrollY > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  const closeNav = () => { menu.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); };
  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  $$("a", menu).forEach(a => a.addEventListener("click", closeNav));
  toTop.addEventListener("click", () => window.scrollTo({ top: 0 }));

  /* ---------- Reveal on scroll ---------- */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); }
    }), { threshold: 0.12 });
    reveals.forEach(el => io.observe(el));
  } else reveals.forEach(el => el.classList.add("visible"));

  /* ---------- Lightbox ---------- */
  const lb = $("#lightbox"), lbImg = $("#lbImg");
  let lastFocus = null;
  const closeLb = () => { lb.hidden = true; lbImg.src = ""; if (lastFocus) lastFocus.focus(); };
  $$(".g-item").forEach(item => item.addEventListener("click", () => {
    lastFocus = item;
    lbImg.src = item.dataset.full;
    lbImg.alt = $("img", item).alt;
    lb.hidden = false;
    $("#lbClose").focus();
  }));
  $("#lbClose").addEventListener("click", closeLb);
  lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !lb.hidden) closeLb(); });

  /* ---------- Testimonial carousel ---------- */
  const track = $("#track"), slides = $$(".slide", track), dotsWrap = $("#dots");
  let index = 0, startX = 0;
  slides.forEach((_, i) => {
    const d = document.createElement("button");
    d.type = "button"; d.className = "dot"; d.setAttribute("aria-label", `Show review ${i + 1}`);
    d.addEventListener("click", () => go(i));
    dotsWrap.appendChild(d);
  });
  function go(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    $$(".dot", dotsWrap).forEach((d, n) => d.classList.toggle("active", n === index));
  }
  $("#prevBtn").addEventListener("click", () => go(index - 1));
  $("#nextBtn").addEventListener("click", () => go(index + 1));
  track.addEventListener("touchstart", e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
  });
  go(0);

  /* ---------- Reservation form (sends email via Formspree) ---------- */
  const FORM_ENDPOINT = "https://formspree.io/f/myeewwjk";
  const form = $("#reserveForm"), msg = $("#formMsg"), dateInput = $("#date"), submitBtn = $("#submitBtn");
  const pad = n => String(n).padStart(2, "0");
  const t = new Date();
  dateInput.min = `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
  $$("input, select", form).forEach(f => f.addEventListener("blur", () => f.classList.add("touched")));

  form.addEventListener("submit", async e => {
    e.preventDefault();
    $$("input, select", form).forEach(f => f.classList.add("touched"));
    msg.className = "form-msg full";
    if (dateInput.value && dateInput.value < dateInput.min) dateInput.setCustomValidity("Please choose today or a future date.");
    else dateInput.setCustomValidity("");
    if (!form.checkValidity()) {
      const bad = form.querySelector(":invalid");
      msg.classList.add("err");
      msg.textContent = "Please correct the highlighted fields: " + (bad.validationMessage || "check your details.");
      bad.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });
      if (!res.ok) throw new Error("Request failed");
      msg.classList.add("ok");
      msg.textContent = "Thank you! Your request has been sent. We will contact you shortly to confirm your table.";
      form.reset();
      $$("input, select", form).forEach(f => f.classList.remove("touched"));
    } catch (err) {
      msg.classList.add("err");
      msg.textContent = "Sorry, something went wrong. Please try again or call us directly.";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Request Table";
    }
  });

  /* ---------- Footer year ---------- */
  $("#year").textContent = new Date().getFullYear();
})();