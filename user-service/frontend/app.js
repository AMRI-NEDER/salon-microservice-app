/* ════════════════════════════════════════════════
   AURA CUT — app.js
   Frontend calls each service directly.
   No gateway. No cross-service HTTP.
   Each service is fully independent.
════════════════════════════════════════════════ */

// ── Service URLs — edit ports to match your deployment ──────
const SVC = {
  auth: "/api/auth",
  users: "/api/users",
  bookings: "/api/bookings",
  reservations: "/api/reservations",
  promotions: "/api/promotions",
  notifications: "/api/notifications",
  ai: "/api/ai",
  admin: "/api/admin",
};

// ── State ────────────────────────────────────────────────────
const S = {
  token:    localStorage.getItem("token") || null,
  user:     JSON.parse(localStorage.getItem("user") || "null"),
  date:     null,
  time:     null,
  calYear:  new Date().getFullYear(),
  calMonth: new Date().getMonth(),
  history:  [],
};

// ── Core fetch helper ────────────────────────────────────────
async function call(method, serviceKey, path, body) {
  const url = SVC[serviceKey] + path;
  const opts = {
    method,
    headers: { "Content-Type": "application/json" }
  };

  if (S.token) opts.headers["Authorization"] = `Bearer ${S.token}`;
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(url, opts);
  const contentType = res.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    const text = await res.text();
    console.error("Expected JSON but got:", url, text);
    throw new Error(`Expected JSON but got ${contentType || "unknown content type"}`);
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  return data;
}

// ── Init ─────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  syncNav();
  buildServicesGrid();
  initCal();
  document.getElementById("bService").addEventListener("change", updateSummary);
  document.getElementById("chatInput").addEventListener("keydown", e => {
    if (e.key === "Enter") sendChat();
  });
});

// ── Navigation ───────────────────────────────────────────────
function showPage(name) {
  if (name === "admin") {
    if (!S.user || S.user.role !== "admin") {
      toast("Admin access only.", "error");
      return;
    }
    loadAdminDashboard();
    document.querySelectorAll(".admin-nav-btn").forEach(b => b.classList.remove("active"));
    document.querySelector(".admin-nav-btn")?.classList.add("active");
    document.querySelectorAll(".admin-section").forEach(s => s.classList.remove("active"));
    document.getElementById("adm-dashboard")?.classList.add("active");
  }
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(`page-${name}`).classList.add("active");
  if (name === "promotions") loadPromos();
  if (name === "booking")    initBookingPage();
  document.getElementById("navLinks").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function toggleMenu() {
  document.getElementById("navLinks").classList.toggle("open");
}

function syncNav() {
  const in_ = !!S.user;
  document.getElementById("navAuthItem").classList.toggle("hidden", in_);
  document.getElementById("navUserItem").classList.toggle("hidden", !in_);
  if (in_) document.getElementById("navUserName").textContent = S.user.name.split(" ")[0];
  const adminItem = document.getElementById("navAdminItem");
  if (adminItem) adminItem.classList.toggle("hidden", !(in_ && S.user.role === "admin"));
}

function save(user, token) {
  S.user = user; S.token = token;
  localStorage.setItem("user",  JSON.stringify(user));
  localStorage.setItem("token", token);
}

function logout() {
  S.user = null; S.token = null;
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  syncNav();
  showPage("home");
  toast("Signed out.");
}

// ── Modal ─────────────────────────────────────────────────────
function openModal(tab = "login") {
  document.getElementById("overlay").classList.add("open");
  switchTab(tab);
}
function closeModal() {
  document.getElementById("overlay").classList.remove("open");
  clearErrors();
}
function handleOverlayClick(e) { if (e.target.id === "overlay") closeModal(); }
function switchTab(tab) {
  document.getElementById("formLogin").classList.toggle("hidden", tab !== "login");
  document.getElementById("formRegister").classList.toggle("hidden", tab !== "register");
  document.getElementById("mtabLogin").classList.toggle("active", tab === "login");
  document.getElementById("mtabRegister").classList.toggle("active", tab !== "login");
  clearErrors();
}
function clearErrors() {
  ["loginError","registerError"].forEach(id => {
    const el = document.getElementById(id);
    el.textContent = ""; el.classList.add("hidden");
  });
}
function showError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg; el.classList.remove("hidden");
}

// ── Auth ──────────────────────────────────────────────────────
async function handleLogin() {
  const email    = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  if (!email || !password) return showError("loginError", "Please fill in all fields.");
  try {
    const { user, token } = await call("POST", "auth", "/login", { email, password });
    save(user, token);
    closeModal();
    syncNav();
    toast(`Welcome back, ${user.name.split(" ")[0]} ✦`);
    if (document.getElementById("page-booking").classList.contains("active")) initBookingPage();
  } catch(e) { showError("loginError", e.message); }
}

async function handleRegister() {
  const name     = document.getElementById("regName").value.trim();
  const email    = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;
  if (!name || !email || !password) return showError("registerError", "Please fill in all fields.");
  try {
    const { user, token } = await call("POST", "auth", "/register", { name, email, password });
    save(user, token);
    closeModal();
    syncNav();
    toast(`Welcome, ${user.name.split(" ")[0]} ✦`);
  } catch(e) { showError("registerError", e.message); }
}

// ── Services page ─────────────────────────────────────────────
const SVCS = [
  { name: "Classic Cut",        price: "DT35", icon: "✂",  desc: "Timeless scissor cut shaped to your face and lifestyle." },
  { name: "Signature Fade",     price: "DT45", icon: "⚡", desc: "Seamless gradient fades executed with precision clippers." },
  { name: "Beard Sculpt",       price: "DT30", icon: "◈",  desc: "Expert shaping, conditioning, and beard line definition." },
  { name: "Hot Towel Shave",    price: "DT40", icon: "✦",  desc: "Classic wet shave — warm towels, fine lather, straight razor." },
  { name: "Cut & Beard",        price: "DT65", icon: "⬡",  desc: "The most popular combo — haircut and full beard treatment." },
  { name: "Full Groom Package", price: "DT85", icon: "★",  desc: "The complete Aura experience — cut, shave, and facial." },
];

function buildServicesGrid() {
  const grid = document.getElementById("svcGrid");
  if (!grid) return;
  grid.innerHTML = SVCS.map(s => `
    <div class="svc-card">
      <div class="svc-card-top">
        <div>
          <div style="font-size:1.8rem;margin-bottom:0.5rem;">${s.icon}</div>
          <div class="svc-card-name">${s.name}</div>
        </div>
        <div class="svc-card-price">${s.price}</div>
      </div>
      <p class="svc-card-desc">${s.desc}</p>
      <button class="svc-card-btn" onclick="showPage('booking')">Book Now →</button>
    </div>`).join("");
}

// ── Promotions ────────────────────────────────────────────────
async function loadPromos() {
  const grid = document.getElementById("promoGrid");
  grid.innerHTML = `<p class="placeholder-text">Loading…</p>`;
  try {
    const data = await call("GET", "promotions", "/");
    if (!data.length) {
      grid.innerHTML = `<p class="placeholder-text">No active promotions right now.</p>`;
      return;
    }
    grid.innerHTML = data.map(p => `
      <div class="promo-card">
        <span class="promo-badge">${p.title.split(" ")[0]}</span>
        <h3>${p.title}</h3>
        <p>${p.description || ""}</p>
        <div class="promo-num">${p.discount_percent}<span>% off</span></div>
        <p class="promo-date">${p.end_date
          ? `Valid until ${new Date(p.end_date).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}`
          : "Ongoing — no expiry"}</p>
      </div>`).join("");
  } catch {
    grid.innerHTML = `<p class="placeholder-text">Could not load promotions.</p>`;
  }
}

// ── Booking page ──────────────────────────────────────────────
function initBookingPage() {
  if (!S.user) {
    document.getElementById("bookingGate").classList.remove("hidden");
    document.getElementById("bookingLayout").classList.add("hidden");
    document.getElementById("myBookings").classList.add("hidden");
  } else {
    document.getElementById("bookingGate").classList.add("hidden");
    document.getElementById("bookingLayout").classList.remove("hidden");
    document.getElementById("myBookings").classList.remove("hidden");
    loadMyBookings();
  }
}

// ── Calendar ──────────────────────────────────────────────────
const MONTHS = ["January","February","March","April","May","June","July",
                "August","September","October","November","December"];

function initCal() {
  document.getElementById("calPrev").onclick = () => {
    S.calMonth--;
    if (S.calMonth < 0) { S.calMonth = 11; S.calYear--; }
    renderCal();
  };
  document.getElementById("calNext").onclick = () => {
    S.calMonth++;
    if (S.calMonth > 11) { S.calMonth = 0; S.calYear++; }
    renderCal();
  };
  renderCal();
}

function renderCal() {
  document.getElementById("calTitle").textContent = `${MONTHS[S.calMonth]} ${S.calYear}`;
  const today  = new Date();
  const first  = new Date(S.calYear, S.calMonth, 1).getDay();
  const days   = new Date(S.calYear, S.calMonth + 1, 0).getDate();
  const offset = first === 0 ? 6 : first - 1;
  const prev   = new Date(S.calYear, S.calMonth, 0).getDate();
  let html = "";
  for (let i = 0; i < offset; i++)
    html += `<div class="cal-day cal-other">${prev - offset + 1 + i}</div>`;
  for (let d = 1; d <= days; d++) {
    const dt      = new Date(S.calYear, S.calMonth, d);
    const past    = dt < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const sel     = S.date && S.date.getDate() === d && S.date.getMonth() === S.calMonth && S.date.getFullYear() === S.calYear;
    const isToday = d === today.getDate() && S.calMonth === today.getMonth() && S.calYear === today.getFullYear();
    const cls     = `cal-day ${past?"cal-disabled":""} ${sel?"cal-selected":""} ${isToday&&!sel?"cal-today":""}`.trim();
    html += `<div class="${cls}" ${!past ? `onclick="pickDate(${d})"` : ""}>${d}</div>`;
  }
  const rem = (7 - (offset + days) % 7) % 7;
  for (let i = 1; i <= rem; i++) html += `<div class="cal-day cal-other">${i}</div>`;
  document.getElementById("calGrid").innerHTML = html;
}

async function pickDate(d) {
  S.date = new Date(S.calYear, S.calMonth, d);
  S.time = null;
  renderCal();
  document.getElementById("selectedDateLabel").textContent =
    S.date.toLocaleDateString("en-GB", { weekday:"short", day:"numeric", month:"short" });

  const grid    = document.getElementById("timeGrid");
  const dateStr = S.date.toISOString().split("T")[0];
  grid.innerHTML = `<p class="placeholder-text" style="grid-column:1/-1">Loading slots…</p>`;

  try {
    // GET slots from reservation-service directly
    const slots = await call("GET", "reservations", `/?date=${dateStr}`);
    grid.innerHTML = slots.map(s => {
      const t     = String(s.time).slice(0, 5);
      const avail = s.is_available;
      return `<div class="time-slot ${!avail?"ts-booked":""}" ${avail?`onclick="pickTime('${t}')"`:""}>${t}</div>`;
    }).join("") || `<p class="placeholder-text" style="grid-column:1/-1">No slots for this date.</p>`;
  } catch {
    const times = ["09:00","09:30","10:00","10:30","11:00","11:30",
                   "13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30"];
    grid.innerHTML = times.map(t =>
      `<div class="time-slot" onclick="pickTime('${t}')">${t}</div>`
    ).join("");
  }
  updateSummary();
}

function pickTime(t) {
  S.time = t;
  document.querySelectorAll(".time-slot").forEach(el => {
    el.classList.toggle("ts-selected", el.textContent.trim() === t);
  });
  updateSummary();
}

function updateSummary() {
  const svc   = document.getElementById("bService").value;
  const sum   = document.getElementById("bookingSummary");
  const btn   = document.getElementById("confirmBtn");
  const ready = !!(svc && S.date && S.time);
  btn.disabled = !ready;
  if (!ready) { sum.innerHTML = ""; return; }
  const dateStr = S.date.toLocaleDateString("en-GB",
    { weekday:"long", day:"numeric", month:"long", year:"numeric" });
  sum.innerHTML = `
    <div class="sum-row"><span>Service</span><strong>${svc}</strong></div>
    <div class="sum-row"><span>Date</span><strong>${dateStr}</strong></div>
    <div class="sum-row"><span>Time</span><strong>${S.time}</strong></div>`;
}

async function submitBooking() {
  const service = document.getElementById("bService").value;
  const notes   = document.getElementById("bNotes").value;
  if (!service || !S.date || !S.time)
    return toast("Please select a service, date, and time.", "error");

  const btn = document.getElementById("confirmBtn");
  btn.disabled = true;
  btn.textContent = "Booking…";

  const date = S.date.toISOString().split("T")[0];
  const time = S.time + ":00";

  try {
    // 1. Create booking in booking-service
    const booking = await call("POST", "bookings", "/", {
      service, date, time,
      notes:     notes || undefined,
      userName:  S.user.name  || "",
      userEmail: S.user.email || "",
    });

    // 2. Mark slot as unavailable in reservation-service
    await call("PATCH", "reservations", "/mark", {
      date, time, is_available: false
    }).catch(() => {}); // non-blocking — slot marking failure won't break booking

    // 3. Send notification to notification-service
    await call("POST", "notifications", "/send", {
      user_id: S.user.id,
      message: `Booking confirmed: "${service}" on ${date} at ${S.time}. Ref: ${booking.id.slice(0,8).toUpperCase()}`,
    }).catch(() => {}); // non-blocking

    toast(`✓ Booking confirmed for ${S.time} on ${S.date.toDateString()}`);

    // Reset form
    S.date = null; S.time = null;
    renderCal();
    document.getElementById("timeGrid").innerHTML = `<p class="placeholder-text">Select a date to see available slots.</p>`;
    document.getElementById("bookingSummary").innerHTML = "";
    document.getElementById("bService").value = "";
    document.getElementById("bNotes").value = "";
    document.getElementById("selectedDateLabel").textContent = "";
    loadMyBookings();

  } catch(e) {
    toast(e.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Confirm Booking";
  }
}

async function loadMyBookings() {
  const list = document.getElementById("myBookingsList");
  list.innerHTML = `<p class="placeholder-text">Loading…</p>`;
  try {
    const data = await call("GET", "bookings", "/");
    if (!data.length) {
      list.innerHTML = `<p class="placeholder-text">No bookings yet.</p>`;
      return;
    }
    list.innerHTML = data.map(b => `
      <div class="bk-item">
        <div>
          <div class="bk-service">${b.service}</div>
          <div class="bk-meta">${new Date(b.date).toLocaleDateString("en-GB",
            {weekday:"short",day:"numeric",month:"long",year:"numeric"})} at ${String(b.time).slice(0,5)}</div>
        </div>
        <span class="status-pill s-${b.status}">${b.status}</span>
        ${b.status === "confirmed" ? `<button class="bk-cancel" onclick="cancelBooking('${b.id}','${b.date}','${b.time}')">Cancel</button>` : ""}
      </div>`).join("");
  } catch(e) {
    list.innerHTML = `<p class="placeholder-text">${e.message}</p>`;
  }
}

async function cancelBooking(id, date, time) {
  if (!confirm("Cancel this booking?")) return;
  try {
    // 1. Update status in booking-service
    await call("PATCH", "bookings", `/${id}/status`, { status: "cancelled" });

    // 2. Free slot in reservation-service
    await call("PATCH", "reservations", "/mark", {
      date, time: time.slice(0,5) + ":00", is_available: true
    }).catch(() => {});

    toast("Booking cancelled.");
    loadMyBookings();
  } catch(e) { toast(e.message, "error"); }
}

// ── Chat ──────────────────────────────────────────────────────
async function sendChat() {
  const input = document.getElementById("chatInput");
  const msg   = input.value.trim();
  if (!msg) return;
  input.value = "";
  addBubble(msg, "user");
  const typId = "typ-" + Date.now();
  addBubble("…", "bot", typId);
  try {
    const { reply } = await call("POST", "ai", "/chat", {
      message: msg, history: S.history.slice(-6)
    });
    document.getElementById(typId)?.remove();
    addBubble(reply, "bot");
    S.history.push({ role:"user", content:msg }, { role:"assistant", content:reply });
  } catch {
    document.getElementById(typId)?.remove();
    addBubble("Sorry, I'm having trouble right now. Please call us on +216 77 777 777.", "bot");
  }
}

function addBubble(text, who, id) {
  const wrap = document.getElementById("chatMessages");
  const d    = document.createElement("div");
  d.className = `msg ${who}`;
  if (id) d.id = id;
  d.innerHTML = `<div class="bubble">${text}</div>`;
  wrap.appendChild(d);
  wrap.scrollTop = wrap.scrollHeight;
}

// ── Toast ─────────────────────────────────────────────────────
let _tt;
function toast(msg, type = "success") {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.className = `toast ${type === "error" ? "error" : ""} show`;
  clearTimeout(_tt);
  _tt = setTimeout(() => el.classList.remove("show"), 3800);
}

// ══════════════════════════════════════════════
//  ADMIN PANEL — all calls go to admin-service :3008
// ══════════════════════════════════════════════

function adminTab(name, btn) {
  document.querySelectorAll(".admin-section").forEach(s => s.classList.remove("active"));
  document.querySelectorAll(".admin-nav-btn").forEach(b => b.classList.remove("active"));
  document.getElementById(`adm-${name}`).classList.add("active");
  if (btn) btn.classList.add("active");
  if (name === "dashboard")     loadAdminDashboard();
  if (name === "bookings")      loadAdminBookings();
  if (name === "users")         loadAdminUsers();
  if (name === "promotions")    loadAdminPromos();
  if (name === "notifications") loadAdminNotifications();
}

async function loadAdminDashboard() {
  try {
    const d = await call("GET", "admin", "/dashboard");
    setText("dTotalUsers",    d.stats.total_users);
    setText("dTotalBookings", d.stats.total_bookings);
    setText("dTodayBookings", d.stats.today_bookings);
    setText("dPending",       d.stats.pending_bookings);
    setText("dUnread",        d.stats.unread_notifications);

    const ul = document.getElementById("dTopServices");
    ul.innerHTML = d.top_services.length
      ? d.top_services.map(s => `
          <li class="top-svc-item">
            <span class="top-svc-name">${s.name}</span>
            <span class="top-svc-count">${s.bookings} bookings</span>
          </li>`).join("")
      : "<li class='admin-empty'>No completed bookings yet.</li>";

    const chart = document.getElementById("dMiniChart");
    if (!d.monthly_bookings.length) {
      chart.innerHTML = "<span style='color:var(--tx3);font-size:.8rem'>No data yet</span>";
    } else {
      const max = Math.max(...d.monthly_bookings.map(m => +m.count), 1);
      chart.innerHTML = d.monthly_bookings.map(m => {
        const pct = Math.max(8, (+m.count / max) * 100);
        return `<div class="mini-bar-wrap">
          <div class="mini-bar" style="height:${pct}%" title="${m.count}"></div>
          <span class="mini-label">${m.month}</span>
        </div>`;
      }).join("");
    }
  } catch(e) { console.error("Dashboard error:", e.message); }
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val ?? "—";
}

async function loadAdminBookings() {
  const el = document.getElementById("admBookingsBody");
  el.innerHTML = "<p class='admin-loading'>Loading…</p>";
  try {
    const data = await call("GET", "admin", "/bookings");
    if (!data.length) { el.innerHTML = "<p class='admin-empty'>No bookings found.</p>"; return; }
    el.innerHTML = `<table class="admin-table">
      <thead><tr><th>Client</th><th>Service</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${data.map(b => `
        <tr>
          <td class="name-cell">${b.user_name || "—"}</td>
          <td>${b.service}</td>
          <td>${new Date(b.date).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</td>
          <td>${String(b.time).slice(0,5)}</td>
          <td><span class="status-pill s-${b.status}">${b.status}</span></td>
          <td style="display:flex;gap:.4rem;flex-wrap:wrap;">
            ${b.status !== "completed" ? `<button class="btn-sm btn-sm-green" onclick="admSetBookingStatus('${b.id}','completed')">✓ Done</button>` : ""}
            ${b.status === "confirmed"  ? `<button class="btn-sm btn-sm-red"   onclick="admSetBookingStatus('${b.id}','cancelled')">✕ Cancel</button>` : ""}
            <button class="btn-sm btn-sm-red" onclick="admDeleteBooking('${b.id}')">🗑</button>
          </td>
        </tr>`).join("")}
      </tbody></table>`;
  } catch(e) { el.innerHTML = `<p class="admin-empty">Error: ${e.message}</p>`; }
}

async function admSetBookingStatus(id, status) {
  try {
    await call("PATCH", "admin", `/bookings/${id}/status`, { status });
    toast(`Booking marked as ${status}.`);
    loadAdminBookings();
    loadAdminDashboard();
  } catch(e) { toast(e.message, "error"); }
}

async function admDeleteBooking(id) {
  if (!confirm("Delete this booking?")) return;
  try {
    await call("DELETE", "admin", `/bookings/${id}`);
    toast("Booking deleted.");
    loadAdminBookings();
    loadAdminDashboard();
  } catch(e) { toast(e.message, "error"); }
}

async function loadAdminUsers() {
  const el = document.getElementById("admUsersBody");
  el.innerHTML = "<p class='admin-loading'>Loading…</p>";
  try {
    const data = await call("GET", "admin", "/users");
    if (!data.length) { el.innerHTML = "<p class='admin-empty'>No users found.</p>"; return; }
    el.innerHTML = `<table class="admin-table">
      <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Action</th></tr></thead>
      <tbody>${data.map(u => `
        <tr>
          <td class="name-cell">${u.name}</td>
          <td>${u.email}</td>
          <td><span class="status-pill ${u.role === "admin" ? "s-completed" : "s-confirmed"}">${u.role}</span></td>
          <td>${new Date(u.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</td>
          <td>${u.role !== "admin"
            ? `<button class="btn-sm btn-sm-red" onclick="admDeleteUser('${u.id}','${u.name}')">🗑 Delete</button>`
            : "<span style='color:var(--tx3);font-size:.75rem'>Protected</span>"}</td>
        </tr>`).join("")}
      </tbody></table>`;
  } catch(e) { el.innerHTML = `<p class="admin-empty">Error: ${e.message}</p>`; }
}

async function admDeleteUser(id, name) {
  if (!confirm(`Delete user "${name}"?`)) return;
  try {
    await call("DELETE", "admin", `/users/${id}`);
    toast(`User ${name} deleted.`);
    loadAdminUsers();
    loadAdminDashboard();
  } catch(e) { toast(e.message, "error"); }
}

async function loadAdminPromos() {
  const el = document.getElementById("admPromosBody");
  el.innerHTML = "<p class='admin-loading'>Loading…</p>";
  try {
    const data = await call("GET", "admin", "/promotions");
    if (!data.length) { el.innerHTML = "<p class='admin-empty'>No promotions found.</p>"; return; }
    el.innerHTML = `<table class="admin-table">
      <thead><tr><th>Title</th><th>Discount</th><th>End Date</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>${data.map(p => `
        <tr>
          <td class="name-cell">${p.title}</td>
          <td>${p.discount_percent}%</td>
          <td>${p.end_date ? new Date(p.end_date).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}) : "No expiry"}</td>
          <td><span class="status-pill ${p.is_active ? "s-confirmed" : "s-cancelled"}">${p.is_active ? "Active" : "Inactive"}</span></td>
          <td><button class="btn-sm btn-sm-red" onclick="admDeletePromo('${p.id}')">🗑 Delete</button></td>
        </tr>`).join("")}
      </tbody></table>`;
  } catch(e) { el.innerHTML = `<p class="admin-empty">Error: ${e.message}</p>`; }
}

async function createPromo() {
  const title    = document.getElementById("pTitle").value.trim();
  const discount = document.getElementById("pDiscount").value;
  const endDate  = document.getElementById("pEndDate").value;
  const desc     = document.getElementById("pDesc").value.trim();
  if (!title || !discount) return toast("Title and discount are required.", "error");
  try {
    await call("POST", "admin", "/promotions", {
      title,
      discount_percent: parseFloat(discount),
      description: desc || undefined,
      end_date: endDate || undefined,
      is_active: true,
    });
    toast("Promotion created!");
    ["pTitle","pDiscount","pEndDate","pDesc"].forEach(id => document.getElementById(id).value = "");
    loadAdminPromos();
  } catch(e) { toast(e.message, "error"); }
}

async function admDeletePromo(id) {
  if (!confirm("Delete this promotion?")) return;
  try {
    await call("DELETE", "admin", `/promotions/${id}`);
    toast("Promotion deleted.");
    loadAdminPromos();
  } catch(e) { toast(e.message, "error"); }
}

async function loadAdminNotifications() {
  const el = document.getElementById("admNotifsBody");
  el.innerHTML = "<p class='admin-loading'>Loading…</p>";
  try {
    const data = await call("GET", "admin", "/notifications");
    if (!data.length) { el.innerHTML = "<p class='admin-empty'>No notifications yet.</p>"; return; }
    el.innerHTML = `<table class="admin-table">
      <thead><tr><th>User</th><th>Message</th><th>Sent</th><th>Read</th></tr></thead>
      <tbody>${data.map(n => `
        <tr>
          <td class="name-cell">${n.user_name || "—"}</td>
          <td>${n.message}</td>
          <td>${new Date(n.sent_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</td>
          <td><span class="status-pill ${n.is_read ? "s-completed" : "s-confirmed"}">${n.is_read ? "Read" : "Unread"}</span></td>
        </tr>`).join("")}
      </tbody></table>`;
  } catch(e) { el.innerHTML = `<p class="admin-empty">Error: ${e.message}</p>`; }
}

async function sendBroadcast() {
  const msg = document.getElementById("broadcastMsg").value.trim();
  if (!msg) return toast("Please enter a message.", "error");
  try {
    const r = await call("POST", "admin", "/notifications/broadcast", { message: msg });
    toast(r.message || "Broadcast sent!");
    document.getElementById("broadcastMsg").value = "";
    loadAdminNotifications();
    loadAdminDashboard();
  } catch(e) { toast(e.message, "error"); }
}