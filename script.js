// ==============================
// MarvinTeach shared script
// - Dark/Light toggle (persisted)
// - Tabs init (only if present)
// - Estimator init (only if present)
// ==============================

(function () {
  // ---------- Theme ----------
  const root = document.documentElement;
  const THEME_KEY = "marvin_theme";

  function systemPref() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    const icon = document.querySelector("[data-theme-icon]");
    const label = document.querySelector("[data-theme-label]");
    if (icon) icon.textContent = theme === "light" ? "🌞" : "🌙";
    if (label) label.textContent = theme === "light" ? "Light" : "Dark";
  }

  const saved = localStorage.getItem(THEME_KEY);
  applyTheme(saved || systemPref());

  const toggleBtn = document.querySelector("[data-theme-toggle]");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
  }

  // ---------- Tabs (kosten.html) ----------
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".panel");

  if (tabs.length && panels.length) {
    tabs.forEach((t) => {
      t.addEventListener("click", () => {
        tabs.forEach((x) => x.classList.remove("active"));
        panels.forEach((p) => p.classList.remove("active"));
        t.classList.add("active");
        const id = t.dataset.tab;
        const panel = document.getElementById(id);
        if (panel) panel.classList.add("active");
      });
    });
  }

  // ---------- Estimator (kosten.html) ----------
  const calcBtn = document.getElementById("calcBtn");
  const out = document.getElementById("out");

  if (calcBtn && out) {
    const mode = document.getElementById("mode");
    const amount = document.getElementById("amount");
    const days = document.getElementById("days");
    const spreadPct = document.getElementById("spreadPct");
    const feeFixed = document.getElementById("feeFixed");
    const ratePct = document.getElementById("ratePct");
    const premiumPct = document.getElementById("premiumPct");
    const commissionPct = document.getElementById("commissionPct");
    const storagePct = document.getElementById("storagePct");

    const inputs = [mode, amount, days, spreadPct, feeFixed, ratePct, premiumPct, commissionPct, storagePct].filter(Boolean);

    function eur(x) {
      return x.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
    }

    function calc() {
      const A = Math.max(0, Number(amount?.value || 0));
      const D = Math.max(0, Number(days?.value || 0));

      const sp = Math.max(0, Number(spreadPct?.value || 0)) / 100;
      const ff = Math.max(0, Number(feeFixed?.value || 0));
      const rp = Math.max(0, Number(ratePct?.value || 0)) / 100;
      const pp = Math.max(0, Number(premiumPct?.value || 0)) / 100;
      const cp = Math.max(0, Number(commissionPct?.value || 0)) / 100;
      const lp = Math.max(0, Number(storagePct?.value || 0)) / 100;

      const daily = (annual) => (annual / 365) * D;

      let costSpread = 0, costFixed = 0, costCarry = 0, costOther = 0, total = 0;
      let headline = "";

      if (mode?.value === "forex") {
        costSpread = A * sp;
        costOther  = A * cp;
        costCarry  = A * daily(rp);
        costFixed  = ff;
        total = costSpread + costOther + costCarry + costFixed;
        headline = "Forex (vereinfachtes Modell)";
      } else if (mode?.value === "phys") {
        costSpread = A * sp;
        costOther  = A * pp;
        costCarry  = A * daily(lp);
        costFixed  = ff;
        total = costSpread + costOther + costCarry + costFixed;
        headline = "Physische Edelmetalle (vereinfachtes Modell)";
      } else {
        // etp
        costSpread = A * sp;
        costCarry  = A * daily(rp);
        costFixed  = ff;
        total = costSpread + costCarry + costFixed;
        headline = "ETC/ETP (vereinfachtes Modell)";
      }

      const pct = A > 0 ? (total / A) : 0;

      out.dataset.didcalc = "1";
      out.innerHTML = `
        <div style="font-weight:900; margin-bottom:6px;">${headline}</div>
        <div><b>Wert/Volumen:</b> ${eur(A)} • <b>Haltedauer:</b> ${D} Tage</div>
        <div style="margin-top:8px; line-height:1.7;">
          <div>• Spread/Händler-Spread: <b>${eur(costSpread)}</b></div>
          <div>• Fixe Gebühren: <b>${eur(costFixed)}</b></div>
          ${mode?.value === "forex" ? `<div>• Kommission: <b>${eur(costOther)}</b></div>` : ""}
          ${mode?.value === "phys"  ? `<div>• Premium/Aufgeld: <b>${eur(costOther)}</b></div>` : ""}
          <div>• Laufende Kosten (Tage): <b>${eur(costCarry)}</b></div>
          <div style="margin-top:10px; padding-top:10px; border-top:1px solid rgba(255,255,255,.10);">
            <b>Gesamtkosten:</b> <span style="font-weight:900;">${eur(total)}</span>
            <span style="opacity:.7;"> (${(pct * 100).toFixed(2)}% vom Wert)</span>
          </div>
        </div>
      `;
    }

    calcBtn.addEventListener("click", calc);

    inputs.forEach((el) => {
      el.addEventListener("input", () => {
        if (out.dataset.didcalc === "1") calc();
      });
    });
  }

  // ---------- Year ----------
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
