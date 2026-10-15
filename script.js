(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const money = n => "$" + n.toFixed(2).replace(/\.00$/, "");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Data ---------- */
  const PRODUCTS = [
    { id: "idea", name: "Idea Engine", cat: "youtube", icon: "💡", price: 12, was: 20, rate: 4.8, n: 1240, tag: "Bestseller", grad: "linear-gradient(135deg,#7c5cff,#22d3ee)", desc: "Trending video ideas tailored to your niche." },
    { id: "script", name: "Script Writer", cat: "youtube", icon: "✍️", price: 15, was: 25, rate: 4.7, n: 980, tag: "Popular", grad: "linear-gradient(135deg,#ff5c9d,#7c5cff)", desc: "Hooks, outlines and full scripts in your voice." },
    { id: "thumb", name: "Thumbnail Studio", cat: "youtube", icon: "🖼️", price: 14, was: 22, rate: 4.6, n: 640, tag: "New", grad: "linear-gradient(135deg,#f59e0b,#ef4444)", desc: "High-CTR thumbnail concepts and text overlays." },
    { id: "caption", name: "Caption & Hashtags", cat: "instagram", icon: "#️⃣", price: 9, was: 15, rate: 4.8, n: 1510, tag: "Bestseller", grad: "linear-gradient(135deg,#22d3ee,#34d399)", desc: "Scroll-stopping captions with smart hashtag sets." },
    { id: "reels", name: "Reels Planner", cat: "instagram", icon: "🎬", price: 13, was: 21, rate: 4.7, n: 870, tag: "Popular", grad: "linear-gradient(135deg,#ec4899,#f97316)", desc: "30-day Reels calendar with shot lists." },
    { id: "repurpose", name: "Repurpose Pro", cat: "growth", icon: "♻️", price: 18, was: 30, rate: 4.9, n: 720, tag: "Top rated", grad: "linear-gradient(135deg,#6366f1,#22d3ee)", desc: "Turn one long video into Shorts, Reels and posts." },
    { id: "analytics", name: "Growth Analytics", cat: "growth", icon: "📈", price: 11, was: 18, rate: 4.5, n: 410, tag: "New", grad: "linear-gradient(135deg,#34d399,#22d3ee)", desc: "See what works across channels and double down." },
    { id: "seo", name: "Title & SEO Booster", cat: "youtube", icon: "🔍", price: 8, was: 14, rate: 4.6, n: 560, tag: "Value", grad: "linear-gradient(135deg,#a855f7,#ec4899)", desc: "Titles, descriptions and tags built to rank." }
  ];
  const PLANS = [
    { name: "Starter", amt: 0, per: "forever", feats: ["3 AI tools", "20 generations / month", "Community support"], cta: "Start free" },
    { name: "Pro", amt: 19, per: "/mo", feats: ["All AI tools", "Unlimited generations", "Repurpose Pro", "Priority support"], cta: "Add to cart", pop: true, id: "plan-pro" },
    { name: "Studio", amt: 49, per: "/mo", feats: ["Everything in Pro", "5 team seats", "Brand voice training", "Analytics dashboard"], cta: "Add to cart", id: "plan-studio" }
  ];
  const FEED = [
    "Aarav added Script Writer", "Meera planned 12 Reels", "Kabir repurposed a 20-min video", "Isha generated 30 captions",
    "Rohan upgraded to Pro", "Sana found 15 video ideas", "Dev exported a thumbnail pack", "Naina scheduled a week of posts"
  ];

  /* ---------- Cart ---------- */
  let cart = JSON.parse(localStorage.getItem("t360-cart") || "[]");
  const save = () => localStorage.setItem("t360-cart", JSON.stringify(cart));
  const catalog = Object.fromEntries([
    ...PRODUCTS.map(p => [p.id, { name: p.name, price: p.price }]),
    ...PLANS.filter(p => p.id).map(p => [p.id, { name: p.name + " plan", price: p.amt }])
  ]);

  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 1800);
  }
  function add(id) {
    const line = cart.find(l => l.id === id);
    line ? line.qty++ : cart.push({ id, qty: 1 });
    save(); renderCart(); toast("Added " + catalog[id].name);
    const b = $("#cartCount"); b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump");
  }
  function renderCart() {
    const list = $("#cartItems"); list.innerHTML = "";
    let total = 0, count = 0;
    cart.forEach(l => {
      const item = catalog[l.id]; total += item.price * l.qty; count += l.qty;
      const li = document.createElement("li");
      li.innerHTML = `<div><strong>${item.name}</strong><br><small class="muted">${money(item.price)} each</small></div>
        <div class="qty"><button data-d="-1" aria-label="Decrease">−</button><span>${l.qty}</span><button data-d="1" aria-label="Increase">+</button></div>`;
      li.querySelectorAll("button").forEach(b => b.onclick = () => {
        l.qty += +b.dataset.d; cart = cart.filter(x => x.qty > 0); save(); renderCart();
      });
      list.appendChild(li);
    });
    $("#cartEmpty").hidden = cart.length > 0;
    $("#cartTotal").textContent = money(total);
    $("#cartCount").textContent = count;
  }
  function drawer(open) {
    $("#drawer").classList.toggle("open", open);
    $("#drawer").setAttribute("aria-hidden", String(!open));
    const o = $("#overlay"); o.hidden = false;
    requestAnimationFrame(() => o.classList.toggle("show", open));
    if (!open) setTimeout(() => (o.hidden = true), 250);
  }
  $("#cartOpen").onclick = () => drawer(true);
  $("#cartClose").onclick = $("#overlay").onclick = () => drawer(false);
  document.addEventListener("keydown", e => e.key === "Escape" && drawer(false));
  $("#checkout").onclick = () => { drawer(false); toast("Checkout opens soon — join the waitlist!"); location.hash = "#waitlist"; };

  /* ---------- Products ---------- */
  let cat = "all", q = "";
  function renderProducts() {
    const grid = $("#products"); grid.innerHTML = "";
    const list = PRODUCTS.filter(p => (cat === "all" || p.cat === cat) && (p.name + p.desc).toLowerCase().includes(q));
    $("#empty").hidden = list.length > 0;
    list.forEach(p => {
      const off = Math.round((1 - p.price / p.was) * 100);
      const el = document.createElement("article");
      el.className = "card glass";
      el.innerHTML = `<div class="thumb" style="--grad:${p.grad}"><span class="tag">${p.tag} · −${off}%</span>${p.icon}</div>
        <h3>${p.name}</h3><p>${p.desc}</p>
        <div class="rating">${"★".repeat(Math.round(p.rate))} <span>${p.rate} (${p.n.toLocaleString()})</span></div>
        <div class="price-row"><span class="price">${money(p.price)}<s>${money(p.was)}</s></span>
        <button class="btn sm">Add to cart</button></div>`;
      $(".btn", el).onclick = () => add(p.id);
      grid.appendChild(el);
    });
  }
  document.querySelectorAll(".chip").forEach(c => c.onclick = () => {
    document.querySelectorAll(".chip").forEach(x => x.classList.remove("active"));
    c.classList.add("active"); cat = c.dataset.cat; renderProducts();
  });
  $("#search").oninput = e => { q = e.target.value.trim().toLowerCase(); renderProducts(); };

  /* ---------- Plans ---------- */
  PLANS.forEach(p => {
    const el = document.createElement("div");
    el.className = "plan glass" + (p.pop ? " pop" : "");
    el.innerHTML = `${p.pop ? '<span class="ribbon">Most popular</span>' : ""}<h3>${p.name}</h3>
      <div class="amt">${money(p.amt)}<small> ${p.per}</small></div>
      <ul>${p.feats.map(f => `<li>${f}</li>`).join("")}</ul>
      <button class="btn ${p.pop ? "" : "ghost"} block">${p.cta}</button>`;
    $(".btn", el).onclick = () => (p.id ? add(p.id) : (location.hash = "#waitlist"));
    $("#plans").appendChild(el);
  });

  /* ---------- Live ticker, counters, countdown ---------- */
  const ticker = $("#ticker");
  function pushFeed() {
    const li = document.createElement("li");
    li.innerHTML = `${FEED[Math.floor(Math.random() * FEED.length)]}<small>just now</small>`;
    ticker.prepend(li);
    while (ticker.children.length > 4) ticker.lastChild.remove();
  }
  for (let i = 0; i < 3; i++) pushFeed();
  setInterval(pushFeed, 2600);

  document.querySelectorAll("[data-count]").forEach(el => {
    const end = +el.dataset.count, dec = el.nextElementSibling.textContent.includes("/5");
    let n = 0; const step = () => {
      n = Math.min(end, n + end / 50);
      el.textContent = dec ? (n / 10).toFixed(1) : Math.round(n).toLocaleString();
      if (n < end) requestAnimationFrame(step);
    }; step();
  });

  const deadline = Date.now() + 1000 * 60 * 60 * 36;
  (function tick() {
    let s = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
    const p = n => String(n).padStart(2, "0");
    $("#countdown").textContent = `${p(Math.floor(s / 3600))}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}`;
    setTimeout(tick, 1000);
  })();

  /* ---------- Live background ---------- */
  const cv = $("#bg"), ctx = cv.getContext("2d");
  let W, H, dots = [], mouse = { x: -999, y: -999 };
  const blobs = [
    { c: "124,92,255", r: .38, sp: .00035, ph: 0 },
    { c: "34,211,238", r: .3, sp: .00045, ph: 2 },
    { c: "255,92,157", r: .28, sp: .0004, ph: 4 }
  ];
  function resize() {
    W = cv.width = innerWidth; H = cv.height = innerHeight;
    dots = Array.from({ length: Math.min(90, Math.floor(W * H / 16000)) }, () => ({
      x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4
    }));
  }
  addEventListener("resize", resize);
  addEventListener("pointermove", e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  function frame(t) {
    ctx.clearRect(0, 0, W, H);
    blobs.forEach(b => {
      const x = W * (.5 + .35 * Math.sin(t * b.sp + b.ph)), y = H * (.5 + .3 * Math.cos(t * b.sp * 1.3 + b.ph));
      const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(W, H) * b.r);
      g.addColorStop(0, `rgba(${b.c},.28)`); g.addColorStop(1, `rgba(${b.c},0)`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    });
    dots.forEach((d, i) => {
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0 || d.x > W) d.vx *= -1;
      if (d.y < 0 || d.y > H) d.vy *= -1;
      const mx = d.x - mouse.x, my = d.y - mouse.y, md = Math.hypot(mx, my);
      if (md < 120) { d.x += mx / md * 1.2; d.y += my / md * 1.2; }
      ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.beginPath(); ctx.arc(d.x, d.y, 1.4, 0, 7); ctx.fill();
      for (let j = i + 1; j < dots.length; j++) {
        const o = dots[j], dist = Math.hypot(d.x - o.x, d.y - o.y);
        if (dist < 120) {
          ctx.strokeStyle = `rgba(160,170,255,${(1 - dist / 120) * .25})`;
          ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(o.x, o.y); ctx.stroke();
        }
      }
    });
    if (!reduceMotion) requestAnimationFrame(frame);
  }
  resize(); requestAnimationFrame(frame);

  renderProducts(); renderCart();
})();
