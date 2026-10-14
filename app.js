(() => {
  "use strict";
  const KEY = "smf-v1-data";
  const today = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  };
  const safeParse = (raw, fallback) => { try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } };
  const freshData = () => ({checkins:[], setbacks:[], reflections:{}, customAdvice:[], stories:[], about:"I'm building Set Myself Free because I want to turn what I've learned into something that could support other people, too."});
  let data = safeParse(localStorage.getItem(KEY), freshData());
  const $ = id => document.getElementById(id);
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { toast("Could not save. Your browser storage may be full."); } updateDashboard(); };
  const toast = message => {
    const el = $("toast"); el.textContent = message; el.classList.add("show");
    clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("show"), 2600);
  };
  const dateLabel = date => {
    if (!date) return "";
    const d = new Date(date + "T12:00:00");
    return d.toLocaleDateString(undefined, {weekday:"short", month:"short", day:"numeric", year:"numeric"});
  };
  const daysBetween = (a,b) => Math.floor((new Date(b+"T12:00:00") - new Date(a+"T12:00:00")) / 86400000);
  const currentStreak = () => {
    const checkins = new Set(data.checkins);
    const setbacks = new Set((data.setbacks || []).map(s => s.date));
    let cursor = new Date(today() + "T12:00:00");
    let key = today();
    // If the user hasn't checked in today, allow the streak to end yesterday.
    if (!checkins.has(key) || setbacks.has(key)) cursor.setDate(cursor.getDate() - 1);
    let streak = 0;
    while (true) {
      key = `${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,"0")}-${String(cursor.getDate()).padStart(2,"0")}`;
      if (!checkins.has(key) || setbacks.has(key)) break;
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  };
  function updateDashboard() {
    const streak = currentStreak(), checkins = [...new Set(data.checkins)].length, reflections = Object.keys(data.reflections || {}).length;
    $("homeStreak").textContent = `${streak} ${streak === 1 ? "day" : "days"}`;
    $("homeCheckins").textContent = checkins;
    $("homeReflections").textContent = reflections;
    $("streakNumber").textContent = streak;
    $("trackerCheckins").textContent = checkins;
    $("trackerReflections").textContent = reflections;
    $("checkinBar").style.width = `${Math.min(100, checkins/30*100)}%`;
    $("reflectionBar").style.width = `${Math.min(100, reflections/30*100)}%`;
    const next = [1,3,7,14,30,60,90].find(n => n > streak);
    $("nextMilestone").textContent = next ? `${next} day${next===1?"":"s"} — ${Math.max(0,next-streak)} to go.` : "90 days reached — choose a new goal that matters to you.";
    $("streakMessage").textContent = streak === 0 ? "Every journey starts with one choice." : streak === 1 ? "One day at a time. You're showing up." : "Keep going gently. Every day is a new choice.";
    const history = $("checkinHistory");
    const all = [...new Set(data.checkins)].sort().reverse().slice(0,7);
    history.innerHTML = all.length ? all.map(d => `<li><span>✓ &nbsp; ${escapeHtml(dateLabel(d))}</span><span>Check-in</span></li>`).join("") : '<li class="empty-state">Your check-ins will appear here.</li>';
    renderCustomAdvice(); renderStories(); renderAbout();
  }
  function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function go(page) {
    document.querySelectorAll(".page").forEach(p => p.classList.toggle("active", p.id === page));
    document.querySelectorAll("[data-go].nav-item").forEach(b => b.classList.toggle("active", b.dataset.go === page));
    if (!["home","tracker","advice","ai","stories","about"].includes(page)) page = "home";
    document.querySelectorAll(".page").forEach(p => p.classList.toggle("active", p.id === page));
    document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.go === page));
    history.replaceState(null, "", `#${page}`);
    window.scrollTo({top:0,behavior:"smooth"});
  }
  document.querySelectorAll("[data-go]").forEach(el => el.addEventListener("click", () => go(el.dataset.go)));
  window.addEventListener("hashchange", () => go(location.hash.slice(1) || "home"));
  $("reflectionDate").value = today();
  $("reflectionDate").addEventListener("change", () => {
    $("reflectionText").value = data.reflections[$("reflectionDate").value] || "";
    $("reflectionStatus").textContent = "Saved only on this device when you press save.";
  });
  $("saveReflectionBtn").addEventListener("click", () => {
    const date = $("reflectionDate").value || today(), text = $("reflectionText").value.trim();
    if (text) data.reflections[date] = text; else delete data.reflections[date];
    save(); $("reflectionStatus").textContent = text ? "Reflection saved on this device." : "Empty reflection removed.";
    toast(text ? "Reflection saved privately." : "Reflection removed.");
  });
  $("checkinBtn").addEventListener("click", () => {
    if (data.checkins.includes(today())) { toast("You've already checked in today. Be proud of showing up."); return; }
    data.checkins.push(today()); save(); toast("Check-in saved. One step at a time."); renderDashboardExtra();
  });
  const setbackDialog = $("setbackDialog");
  $("resetStreakBtn").addEventListener("click", () => { if (setbackDialog.showModal) setbackDialog.showModal(); else toast("Setback notes need a browser that supports dialogs."); });
  $("setbackForm").addEventListener("submit", e => {
    if (e.submitter && e.submitter.id === "confirmSetbackBtn") {
      e.preventDefault();
      data.setbacks.push({date:today(), note:$("setbackNote").value.trim()});
      // Remove today's check-in so a setback cannot count as a recovery day.
      data.checkins = data.checkins.filter(d => d !== today());
      save(); setbackDialog.close(); $("setbackNote").value = ""; toast("Recorded with kindness. Your earlier progress remains."); renderDashboardExtra();
    }
  });
  function renderDashboardExtra() {
    updateDashboard();
    const date = $("reflectionDate").value;
    $("reflectionText").value = data.reflections[date] || "";
  }
  $("exportBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(data,null,2)], {type:"application/json"});
    const url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url; a.download = `set-myself-free-backup-${today()}.json`; a.click(); URL.revokeObjectURL(url);
    toast("Backup export started.");
  });
  const adviceGrid = $("adviceGrid");
  function renderAdvice(filter="all") {
    const articles = (window.SMF_ADVICE || []).filter(a => filter === "all" || a.category === filter);
    adviceGrid.innerHTML = articles.map(a => `<article class="advice-card"><div class="article-icon">${escapeHtml(a.icon)}</div><div class="category">${escapeHtml(a.category.replace("-"," "))}</div><h2>${escapeHtml(a.title)}</h2><p>${escapeHtml(a.body)}</p></article>`).join("");
    document.querySelectorAll(".filter-chip").forEach(b => b.classList.toggle("selected", b.dataset.filter === filter));
  }
  document.querySelectorAll(".filter-chip").forEach(b => b.addEventListener("click", () => renderAdvice(b.dataset.filter)));
  $("saveCustomAdviceBtn").addEventListener("click", () => {
    const title = $("customAdviceTitle").value.trim(), body = $("customAdviceText").value.trim();
    if (!title || !body) { toast("Add both a title and a note first."); return; }
    data.customAdvice.unshift({id:crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), title, body, date:today()});
    save(); $("customAdviceTitle").value = ""; $("customAdviceText").value = ""; toast("Your note was saved privately.");
  });
  function renderCustomAdvice() {
    const el = $("customAdviceList");
    el.innerHTML = data.customAdvice.length ? data.customAdvice.map(n => `<article class="custom-note"><strong>${escapeHtml(n.title)}</strong><p>${escapeHtml(n.body)}</p><button data-delete-note="${escapeHtml(n.id)}">Delete note</button></article>`).join("") : "";
    el.querySelectorAll("[data-delete-note]").forEach(b => b.addEventListener("click", () => { data.customAdvice = data.customAdvice.filter(n => n.id !== b.dataset.deleteNote); save(); toast("Note deleted."); }));
  }
  $("saveStoryBtn").addEventListener("click", () => {
    const title = $("storyTitle").value.trim(), body = $("storyText").value.trim();
    if (!title || !body) { toast("Add a title and draft before saving."); return; }
    data.stories.unshift({id:crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), type:$("storyType").value, title, body, date:today()});
    save(); $("storyTitle").value = ""; $("storyText").value = ""; toast("Private draft saved on this device.");
  });
  function renderStories() {
    const el = $("storiesList");
    el.innerHTML = data.stories.length ? data.stories.map(s => `<article class="story-card"><div class="story-meta">${escapeHtml(s.type)} · ${escapeHtml(dateLabel(s.date))}</div><h3>${escapeHtml(s.title)}</h3><p>${escapeHtml(s.body)}</p><button data-delete-story="${escapeHtml(s.id)}">Delete draft</button></article>`).join("") : '<div class="empty-state">Your private drafts will appear here.</div>';
    el.querySelectorAll("[data-delete-story]").forEach(b => b.addEventListener("click", () => { data.stories = data.stories.filter(s => s.id !== b.dataset.deleteStory); save(); toast("Draft deleted."); }));
  }
  function renderAbout() {
    $("aboutTextDisplay").textContent = data.about;
    $("aboutTextInput").value = data.about;
  }
  $("editAboutBtn").addEventListener("click", () => { $("aboutDisplay").hidden = true; $("aboutEditor").hidden = false; $("aboutTextInput").focus(); });
  $("cancelAboutBtn").addEventListener("click", () => { $("aboutEditor").hidden = true; $("aboutDisplay").hidden = false; renderAbout(); });
  $("saveAboutBtn").addEventListener("click", () => { data.about = $("aboutTextInput").value.trim() || freshData().about; save(); $("aboutEditor").hidden = true; $("aboutDisplay").hidden = false; toast("Your story was saved."); });
  document.querySelectorAll("[data-prompt]").forEach(b => b.addEventListener("click", () => {
    go("tracker"); $("reflectionDate").value = today(); $("reflectionText").value = (data.reflections[today()] ? data.reflections[today()]+"\n\n" : "") + b.dataset.prompt; $("reflectionText").focus();
  }));
  let deferredPrompt;
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredPrompt = e; $("installBtn").hidden = false; });
  $("installBtn").addEventListener("click", async () => {
    if (!deferredPrompt) { toast("In Chrome, open the menu and choose Add to Home screen."); return; }
    deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; $("installBtn").hidden = true;
  });
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
  }
  function init() {
    renderAdvice(); updateDashboard();
    const hash = location.hash.slice(1);
    go(["home","tracker","advice","ai","stories","about"].includes(hash) ? hash : "home");
  }
  init();
})();