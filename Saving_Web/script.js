  const QUOTES = [
    "Every shilling you save today is a step closer to your dream.",
    "Small consistent savings create extraordinary results over time.",
    "The sacrifice is temporary. The reward lasts forever.",
    "You are one deposit away from being closer to your goal.",
    "Financial freedom begins with a single decision to save.",
    "Discipline today creates freedom tomorrow.",
    "Your future self is counting on what you do right now.",
    "Wealth is built in the quiet moments when no one is watching.",
    "Don't give up — every great achievement started where you are now.",
    "Progress, not perfection. Keep going!",
    "The best investment you can make is in your own goals.",
    "Saving is not a sacrifice; it's a promise to yourself.",
    "A little saved every day becomes a fortune over time.",
    "Start where you are. Use what you have. Do what you can.",
  ];

  const GOAL_EMOJIS = {
    car: "🚗", truck: "🚗", vehicle: "🚗",
    house: "🏠", home: "🏠", land: "🏡", apartment: "🏠",
    travel: "✈️", trip: "✈️", holiday: "✈️", vacation: "✈️", safari: "🌍",
    education: "🎓", school: "🎓", college: "🎓", university: "🎓",
    laptop: "💻", computer: "💻", phone: "📱",
    wedding: "💍", marriage: "💍",
    business: "💼", shop: "🏪",
    emergency: "🛡️", fund: "🏦",
    baby: "👶", child: "👶",
    default: "🎯"
  };

  function getGoalEmoji(name) {
    const n = (name || "").toLowerCase();
    for (const [k, v] of Object.entries(GOAL_EMOJIS)) {
      if (n.includes(k)) return v;
    }
    return GOAL_EMOJIS.default;
  }

  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    if (h < 21) return "Good evening";
    return "Good night";
  }

  function formatKES(n) {
    return "KES " + Math.round(n).toLocaleString("en-KE");
  }

  function daysLeft(targetDate) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const t = new Date(targetDate); t.setHours(0, 0, 0, 0);
    return Math.max(0, Math.round((t - today) / 86400000));
  }

  // Storage helpers
  function loadGoal() {
    try { return JSON.parse(localStorage.getItem("sg_goal") || "null"); } catch { return null; }
  }
  function saveGoal(g) { localStorage.setItem("sg_goal", JSON.stringify(g)); }
  function loadLogs() {
    try { return JSON.parse(localStorage.getItem("sg_logs") || "[]"); } catch { return []; }
  }
  function saveLogs(l) { localStorage.setItem("sg_logs", JSON.stringify(l)); }

  function totalSaved(goal, logs) {
    return (goal.startSaved || 0) + logs.reduce((s, l) => s + l.amount, 0);
  }

  function renderGreeting(goal) {
    const name = goal ? goal.userName : "";
    document.getElementById("greetingText").textContent =
      getGreeting() + (name ? ", " + name + "!" : "!");
    document.getElementById("greetingTime").textContent =
      new Date().toLocaleDateString("en-KE", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    document.getElementById("motivationQuote").textContent = "\u201c" + q + "\u201d";
  }

  function renderGoal() {
    const goal = loadGoal();
    const logs = loadLogs();

    if (!goal) {
      document.getElementById("noGoalView").style.display = "block";
      document.getElementById("goalView").style.display = "none";
      renderGreeting(null);
      return;
    }

    document.getElementById("noGoalView").style.display = "none";
    document.getElementById("goalView").style.display = "block";
    renderGreeting(goal);

    const saved = totalSaved(goal, logs);
    const target = goal.amount;
    const pct = Math.min(100, (saved / target) * 100);
    const remaining = Math.max(0, target - saved);
    const dl = daysLeft(goal.targetDate);
    const dailyNeeded = dl > 0 ? remaining / dl : 0;

    document.getElementById("goalEmoji").textContent = getGoalEmoji(goal.name);
    document.getElementById("goalTitle").textContent = goal.name;
    document.getElementById("goalSubtitle").textContent =
      "Target: " + formatKES(target) + " · " +
      new Date(goal.targetDate).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });

    document.getElementById("progressBar").style.width = pct.toFixed(1) + "%";
    document.getElementById("savedLabel").textContent = formatKES(saved);
    document.getElementById("totalLabel").textContent = formatKES(target);
    document.getElementById("pctBadge").textContent = pct.toFixed(1) + "%";

    document.getElementById("statRemaining").textContent = formatKES(remaining);
    document.getElementById("statDaysLeft").textContent = dl + "d";
    document.getElementById("statDaily").textContent = dl > 0 ? formatKES(dailyNeeded) : "—";

    const congratsBox = document.getElementById("congratsBox");
    congratsBox.style.display = pct >= 100 ? "block" : "none";

    const rec = document.getElementById("recommendText");
    if (pct >= 100) {
      rec.textContent = "You've achieved your goal! Time to celebrate and maybe set a new one.";
    } else if (dl <= 0) {
      rec.textContent = "Your deadline has passed. Consider extending it or making a lump-sum deposit of " + formatKES(remaining) + " to close the gap.";
    } else {
      rec.textContent = "To stay on track, save " + formatKES(dailyNeeded) + " every day, or " +
        formatKES(dailyNeeded * 7) + " weekly. You're " + pct.toFixed(1) + "% there — keep going!";
    }

    renderHistory(logs);
  }

  function renderHistory(logs) {
    const container = document.getElementById("historyList");
    if (!logs || logs.length === 0) {
      container.innerHTML = `
        <div class="empty-hist">
          <i class="ti ti-inbox"></i>
          No savings logged yet. Add your first entry above.
        </div>`;
      return;
    }
    const sorted = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));
    container.innerHTML = sorted.map(l => `
      <div class="history-item">
        <div>
          <div class="hist-amount">+ ${formatKES(l.amount)}</div>
          <div class="hist-date">
            ${new Date(l.date + "T00:00:00").toLocaleDateString("en-KE", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
          </div>
        </div>
        <button class="btn-icon" onclick="deleteLog(${l.id})" title="Delete entry">
          <i class="ti ti-trash"></i>
        </button>
      </div>
    `).join("");
  }

  function createGoal() {
    const userName = document.getElementById("userName").value.trim();
    const name = document.getElementById("goalName").value.trim();
    const amount = parseFloat(document.getElementById("goalAmount").value);
    const targetDate = document.getElementById("goalDate").value;
    const startSaved = parseFloat(document.getElementById("startSaved").value) || 0;

    if (!name) { alert("Please enter what you are saving for."); return; }
    if (!amount || amount <= 0) { alert("Please enter a valid target amount."); return; }
    if (!targetDate) { alert("Please select a target date."); return; }

    saveGoal({ name, amount, targetDate, userName, startSaved });
    saveLogs([]);
    renderGoal();
  }

  function logSaving() {
    const amount = parseFloat(document.getElementById("logAmount").value);
    const date = document.getElementById("logDate").value;
    if (!amount || amount <= 0) { alert("Please enter a valid amount."); return; }
    if (!date) { alert("Please select a date."); return; }

    const logs = loadLogs();
    logs.push({ id: Date.now(), amount, date });
    saveLogs(logs);
    document.getElementById("logAmount").value = "";
    renderGoal();
  }

  function deleteLog(id) {
    if (!confirm("Remove this savings entry?")) return;
    saveLogs(loadLogs().filter(l => l.id !== id));
    renderGoal();
  }

  function resetGoal() {
    if (!confirm("Reset your goal and all history? This cannot be undone.")) return;
    localStorage.removeItem("sg_goal");
    localStorage.removeItem("sg_logs");
    renderGoal();
  }

  // Set default dates
  document.getElementById("logDate").value = new Date().toISOString().split("T")[0];
  const minDate = new Date(); minDate.setDate(minDate.getDate() + 1);
  document.getElementById("goalDate").min = minDate.toISOString().split("T")[0];

  renderGoal();