/**
 * TrustShield Main Application Controller
 */

import { analyzeOpportunity } from "./analyzer.js";
import { getSafeAlternatives } from "./alternatives.js";
import { SAMPLE_CASES } from "./sample-cases.js";

// Storage Key
const STORAGE_KEY = "trustshield_saved_checks_v1";

// Application State
const state = {
  currentView: "check", // "check", "samples", "guide", "history", "about"
  currentResult: null,
  activeChecklistState: {},
  savedChecks: loadSavedChecks(),
  enableLocalSave: localStorage.getItem("trustshield_save_preference") === "true"
};

function loadSavedChecks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn("Could not load saved checks from localStorage:", e);
    return [];
  }
}

function saveChecksToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.savedChecks));
  } catch (e) {
    console.warn("Could not save checks to localStorage:", e);
  }
}

// Initialization on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initForm();
  initSampleCases();
  initSavedChecksView();
  initSanitizerCheck();
  renderHistoryBadge();
});

/**
 * Navigation & Tab Routing
 */
function initNavigation() {
  const navButtons = document.querySelectorAll("[data-nav-target]");
  navButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const target = btn.getAttribute("data-nav-target");
      switchView(target);
    });
  });

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById("mobile-menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }
}

export function switchView(viewName) {
  state.currentView = viewName;

  // Hide all view sections
  const views = document.querySelectorAll(".view-section");
  views.forEach(v => v.classList.add("hidden"));

  // Show selected view
  const targetView = document.getElementById(`view-${viewName}`);
  if (targetView) {
    targetView.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Update nav link active states
  document.querySelectorAll("[data-nav-target]").forEach(btn => {
    const isActive = btn.getAttribute("data-nav-target") === viewName;
    if (isActive) {
      btn.classList.add("text-blue-600", "font-semibold", "border-b-2", "border-blue-600");
      btn.classList.remove("text-slate-600");
    } else {
      btn.classList.remove("text-blue-600", "font-semibold", "border-b-2", "border-blue-600");
      btn.classList.add("text-slate-600");
    }
  });

  // Close mobile menu if open
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
    mobileMenu.classList.add("hidden");
  }

  if (viewName === "history") {
    renderSavedChecksList();
  }
}

/**
 * Form Handling & Execution
 */
function initForm() {
  const form = document.getElementById("opportunity-form");
  const resetBtn = document.getElementById("form-reset-btn");
  const textInput = document.getElementById("offer-text");
  const piiWarningBanner = document.getElementById("pii-warning-banner");

  if (!form) return;

  // PII detector on input
  textInput.addEventListener("input", () => {
    const val = textInput.value;
    const hasPii = detectSensitiveData(val);
    if (hasPii) {
      piiWarningBanner.classList.remove("hidden");
    } else {
      piiWarningBanner.classList.add("hidden");
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    runAnalysisFromForm();
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      form.reset();
      piiWarningBanner.classList.add("hidden");
      document.getElementById("results-container").classList.add("hidden");
      document.getElementById("form-container").classList.remove("hidden");
    });
  }

  // Quick action to start new check from results
  const newCheckBtn = document.getElementById("start-new-check-btn");
  if (newCheckBtn) {
    newCheckBtn.addEventListener("click", () => {
      form.reset();
      document.getElementById("results-container").classList.add("hidden");
      document.getElementById("form-container").classList.remove("hidden");
      window.scrollTo({ top: form.offsetTop - 50, behavior: "smooth" });
    });
  }

  // Copy summary button
  const copyBtn = document.getElementById("copy-summary-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      copyResultsSummary();
    });
  }

  // Save analysis toggle
  const saveToggle = document.getElementById("save-locally-toggle");
  if (saveToggle) {
    saveToggle.checked = state.enableLocalSave;
    saveToggle.addEventListener("change", (e) => {
      state.enableLocalSave = e.target.checked;
      localStorage.setItem("trustshield_save_preference", e.target.checked);
      if (e.target.checked && state.currentResult) {
        saveCurrentResult();
      }
      showToast(e.target.checked ? "Local history enabled (saved in browser)" : "Local history disabled");
    });
  }
}

function detectSensitiveData(text) {
  // Simple regex for SSN, credit cards, bank account strings
  const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/;
  const ccPattern = /\b(?:\d{4}[-\s]?){3}\d{4}\b/;
  const passwordPattern = /password\s*[:=]\s*\S+/i;
  return ssnPattern.test(text) || ccPattern.test(text) || passwordPattern.test(text);
}

function initSanitizerCheck() {
  const sanitizeBtn = document.getElementById("sanitize-input-btn");
  if (sanitizeBtn) {
    sanitizeBtn.addEventListener("click", () => {
      const textInput = document.getElementById("offer-text");
      if (textInput) {
        let val = textInput.value;
        val = val.replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[REDACTED-SSN]");
        val = val.replace(/\b(?:\d{4}[-\s]?){3}\d{4}\b/g, "[REDACTED-CARD]");
        val = val.replace(/password\s*[:=]\s*\S+/gi, "password: [REDACTED]");
        textInput.value = val;
        document.getElementById("pii-warning-banner").classList.add("hidden");
        showToast("Sensitive information redacted successfully");
      }
    });
  }
}

function runAnalysisFromForm() {
  const type = document.getElementById("opportunity-type").value;
  const text = document.getElementById("offer-text").value;
  const url = document.getElementById("offer-url").value;
  const field = document.getElementById("opportunity-field").value;
  const location = document.getElementById("opportunity-location").value;
  const eligibility = document.getElementById("opportunity-eligibility").value;

  // Run analyzer
  const result = analyzeOpportunity({ type, text, url, field, location, eligibility });

  if (!result.isValid) {
    showToast(result.error, "error");
    return;
  }

  // Augment with form inputs for display
  result.inputs = {
    type,
    textSnippet: text.length > 200 ? text.substring(0, 200) + "..." : text,
    fullText: text,
    url,
    field,
    location,
    eligibility
  };

  state.currentResult = result;
  state.activeChecklistState = {};

  if (state.enableLocalSave) {
    saveCurrentResult();
  }

  renderResults(result);
}

/**
 * Render Analysis Results
 */
function renderResults(result) {
  const container = document.getElementById("results-container");
  const formContainer = document.getElementById("form-container");

  if (!container) return;

  container.classList.remove("hidden");
  container.scrollIntoView({ behavior: "smooth" });

  // 1. Risk Banner
  const riskBadge = document.getElementById("res-risk-badge");
  const riskTitle = document.getElementById("res-risk-title");
  const riskSummary = document.getElementById("res-risk-summary");
  const riskScore = document.getElementById("res-risk-score");
  const riskIcon = document.getElementById("res-risk-icon");
  const riskBannerCard = document.getElementById("res-risk-banner");

  riskTitle.textContent = result.riskTitle;
  riskSummary.textContent = result.riskSummary;
  riskScore.textContent = `Risk Score: ${result.riskScore}/100`;

  // Color & Badge configuration
  if (result.overallRisk === "High") {
    riskBadge.className = "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold bg-red-100 text-red-800 border border-red-200";
    riskBadge.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-red-600"></span> High Risk`;
    riskBannerCard.className = "p-6 rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 shadow-sm";
    riskIcon.innerHTML = `<svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;
  } else if (result.overallRisk === "Medium") {
    riskBadge.className = "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold bg-amber-100 text-amber-800 border border-amber-200";
    riskBadge.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-amber-600"></span> Medium Risk (Caution)`;
    riskBannerCard.className = "p-6 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-sm";
    riskIcon.innerHTML = `<svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
  } else {
    riskBadge.className = "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200";
    riskBadge.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Low Risk (Standard Patterns)`;
    riskBannerCard.className = "p-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 shadow-sm";
    riskIcon.innerHTML = `<svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
  }

  // 2. Confidence & Limitations
  document.getElementById("res-confidence-badge").textContent = result.confidence;
  document.getElementById("res-confidence-explanation").textContent = result.confidenceExplanation;

  // 3. User Supplied Info vs System Evaluation
  renderUserSuppliedData(result);

  // 4. Claim-by-Claim Cards
  renderClaimCards(result.claims);

  // 5. Missing Information
  renderMissingInfo(result.missingInformation);

  // 6. Verification Checklist
  renderChecklist(result.verificationChecklist);

  // 7. Safe Alternatives
  renderSafeAlternativesSection(result);
}

function renderUserSuppliedData(result) {
  const container = document.getElementById("res-supplied-data");
  if (!container) return;

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
      <div>
        <span class="block text-xs font-semibold uppercase tracking-wider text-slate-500">Opportunity Type</span>
        <span class="font-medium text-slate-800 capitalize">${result.inputs.type.replace("_", " ")}</span>
      </div>
      <div>
        <span class="block text-xs font-semibold uppercase tracking-wider text-slate-500">Domain / URL Supplied</span>
        <span class="font-medium text-slate-800 break-all">${result.inputs.url ? result.inputs.url : "None provided (text-only check)"}</span>
      </div>
      <div>
        <span class="block text-xs font-semibold uppercase tracking-wider text-slate-500">Evaluation Mode</span>
        <span class="font-medium text-slate-800">Client-Side Heuristic Rules (Private)</span>
      </div>
    </div>
    <div class="mt-3 text-xs text-slate-500 flex items-center gap-2">
      <svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      <span>Pasted text is analyzed locally inside your browser session. No data is stored remotely or shared with third parties.</span>
    </div>
  `;
}

function renderClaimCards(claims) {
  const container = document.getElementById("res-claims-list");
  if (!container) return;

  if (claims.length === 0) {
    container.innerHTML = `<div class="p-4 bg-slate-50 rounded-xl text-slate-600 text-sm">No specific claims or signals detected in the short input provided.</div>`;
    return;
  }

  container.innerHTML = claims.map(c => {
    let badgeColor = "bg-slate-100 text-slate-800 border-slate-200";
    let icon = "ℹ️";
    if (c.statusBadge === "negative") {
      badgeColor = "bg-red-50 text-red-700 border-red-200";
      icon = "⚠️";
    } else if (c.statusBadge === "warning") {
      badgeColor = "bg-amber-50 text-amber-700 border-amber-200";
      icon = "⚡";
    } else if (c.statusBadge === "positive") {
      badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
      icon = "✓";
    }

    return `
      <div class="p-5 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-slate-300 transition">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600">${escapeHtml(c.category)}</span>
            <h4 class="font-semibold text-slate-900">${escapeHtml(c.title)}</h4>
          </div>
          <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${badgeColor}">
            <span>${icon}</span>
            <span>${escapeHtml(c.status)}</span>
          </span>
        </div>

        <div class="space-y-2.5 text-sm">
          <div>
            <span class="font-medium text-slate-700">Claim examined:</span>
            <p class="text-slate-600 mt-0.5">${escapeHtml(c.claimText)}</p>
          </div>

          <div class="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Evidence in Submission</span>
            <p class="text-slate-800 text-sm mt-0.5 font-mono text-xs bg-white p-2 rounded border border-slate-200">${escapeHtml(c.evidenceFound)}</p>
          </div>

          <div class="text-slate-600">
            <span class="font-medium text-slate-700">Plain-language impact:</span>
            <p class="mt-0.5">${escapeHtml(c.explanation)}</p>
          </div>

          <div class="text-xs text-slate-500 border-t border-slate-100 pt-2 flex flex-col sm:flex-row justify-between gap-1">
            <span><strong>Source / Check method:</strong> ${escapeHtml(c.source)} (${c.dateChecked})</span>
            <span class="text-amber-700 font-medium"><strong>Uncertainty:</strong> ${escapeHtml(c.uncertainty)}</span>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function renderMissingInfo(missingItems) {
  const container = document.getElementById("res-missing-list");
  if (!container) return;

  container.innerHTML = missingItems.map(item => `
    <li class="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-sm">
      <div class="font-semibold text-slate-900 flex items-center gap-1.5">
        <svg class="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        ${escapeHtml(item.item)}
      </div>
      <p class="text-slate-600 text-xs mt-1"><strong>Limitation:</strong> ${escapeHtml(item.reason)}</p>
      <p class="text-blue-700 text-xs mt-1"><strong>How to verify:</strong> ${escapeHtml(item.action)}</p>
    </li>
  `).join("");
}

function renderChecklist(checklistItems) {
  const container = document.getElementById("res-checklist");
  const progressText = document.getElementById("res-checklist-progress");
  if (!container) return;

  function updateChecklistProgress() {
    const total = checklistItems.length;
    const completed = Object.values(state.activeChecklistState).filter(Boolean).length;
    if (progressText) {
      progressText.textContent = `${completed} of ${total} verified`;
    }
  }

  container.innerHTML = checklistItems.map((item, idx) => `
    <label class="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer">
      <input type="checkbox" data-check-id="${item.id}" class="mt-1 h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 checklist-item-input" />
      <div class="text-sm">
        <div class="font-medium text-slate-900 flex items-center gap-2">
          ${escapeHtml(item.task)}
          ${item.critical ? '<span class="px-2 py-0.5 text-[10px] font-semibold uppercase bg-red-100 text-red-700 rounded">Critical</span>' : ''}
        </div>
        <p class="text-xs text-slate-600 mt-0.5">${escapeHtml(item.detail)}</p>
      </div>
    </label>
  `).join("");

  // Attach event listeners
  container.querySelectorAll(".checklist-item-input").forEach(checkbox => {
    checkbox.addEventListener("change", (e) => {
      const id = checkbox.getAttribute("data-check-id");
      state.activeChecklistState[id] = checkbox.checked;
      updateChecklistProgress();
    });
  });

  updateChecklistProgress();
}

function renderSafeAlternativesSection(result) {
  const section = document.getElementById("res-safe-alternatives-section");
  const listContainer = document.getElementById("res-alternatives-list");
  if (!section || !listContainer) return;

  const category = result.opportunityType;
  const field = result.inputs.field || "all";
  const alternatives = getSafeAlternatives(category, field);

  if (alternatives.length === 0) {
    section.classList.add("hidden");
    return;
  }

  section.classList.remove("hidden");

  listContainer.innerHTML = alternatives.map(alt => `
    <div class="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm transition flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">${escapeHtml(alt.badge)}</span>
          <span class="text-xs text-slate-400 font-mono">${escapeHtml(alt.domain)}</span>
        </div>
        <h4 class="font-semibold text-slate-900 text-base">${escapeHtml(alt.name)}</h4>
        <p class="text-xs text-slate-600 mt-1">${escapeHtml(alt.description)}</p>
        <div class="mt-3 p-2.5 bg-blue-50/60 rounded-lg text-xs text-blue-900">
          <strong>Why this is safer:</strong> ${escapeHtml(alt.whySafer)}
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <a href="${escapeHtml(alt.url)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800">
          <span>Visit Official Portal</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
        </a>
        <span class="text-[10px] text-slate-400">Official Directory</span>
      </div>
    </div>
  `).join("");
}

/**
 * Copy Results Summary for Student to Share
 */
function copyResultsSummary() {
  if (!state.currentResult) return;

  const r = state.currentResult;
  let text = `TRUSTSHIELD VERIFICATION ASSESSMENT
--------------------------------------------------
Opportunity: ${r.opportunityType.toUpperCase()}
Assessment Date: ${r.displayDate}
Overall Risk Level: ${r.overallRisk.toUpperCase()} (Score: ${r.riskScore}/100)
Confidence: ${r.confidence}

SUMMARY:
${r.riskSummary}

KEY CLAIMS & SIGNALS CHECKED:
`;

  r.claims.forEach((c, idx) => {
    text += `\n${idx + 1}. [${c.status.toUpperCase()}] ${c.title}
   - Claim: ${c.claimText}
   - Evidence: ${c.evidenceFound}
   - Explanation: ${c.explanation}
   - Source: ${c.source}
`;
  });

  text += `\nWHAT COULD NOT BE VERIFIED:
`;
  r.missingInformation.forEach((m, idx) => {
    text += `- ${m.item}: ${m.action}\n`;
  });

  text += `\nPRACTICAL VERIFICATION CHECKLIST:
`;
  r.verificationChecklist.forEach((item, idx) => {
    text += `[ ] ${item.task} (${item.detail})\n`;
  });

  text += `\nDISCLAIMER:
This assessment is automated educational risk guidance generated by TrustShield heuristics. It does not constitute legal counsel or a guarantee of safety. Independently confirm all offers through official corporate or university channels.`;

  navigator.clipboard.writeText(text).then(() => {
    showToast("Summary copied to clipboard! You can share this with an advisor or parent.");
  }).catch(() => {
    showToast("Could not copy automatically. Please select text manually.", "error");
  });
}

/**
 * Local Storage History Operations
 */
function saveCurrentResult() {
  if (!state.currentResult) return;

  const item = {
    id: "check-" + Date.now(),
    date: state.currentResult.displayDate,
    type: state.currentResult.opportunityType,
    risk: state.currentResult.overallRisk,
    score: state.currentResult.riskScore,
    summary: state.currentResult.riskSummary,
    inputs: state.currentResult.inputs,
    fullResult: state.currentResult
  };

  state.savedChecks.unshift(item);
  if (state.savedChecks.length > 25) {
    state.savedChecks = state.savedChecks.slice(0, 25);
  }
  saveChecksToStorage();
  renderHistoryBadge();
}

function renderHistoryBadge() {
  const badge = document.getElementById("history-count-badge");
  if (badge) {
    badge.textContent = state.savedChecks.length;
    badge.classList.toggle("hidden", state.savedChecks.length === 0);
  }
}

function initSavedChecksView() {
  const clearBtn = document.getElementById("clear-history-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to delete all saved check records from your browser?")) {
        state.savedChecks = [];
        saveChecksToStorage();
        renderHistoryBadge();
        renderSavedChecksList();
        showToast("Local history wiped clean");
      }
    });
  }
}

function renderSavedChecksList() {
  const container = document.getElementById("saved-checks-list");
  const emptyState = document.getElementById("saved-checks-empty");
  if (!container || !emptyState) return;

  if (state.savedChecks.length === 0) {
    container.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");
  container.innerHTML = state.savedChecks.map(item => {
    let riskBadge = "bg-emerald-100 text-emerald-800";
    if (item.risk === "High") riskBadge = "bg-red-100 text-red-800";
    if (item.risk === "Medium") riskBadge = "bg-amber-100 text-amber-800";

    return `
      <div class="p-5 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${riskBadge}">${item.risk} Risk</span>
            <span class="text-xs text-slate-500">${item.date}</span>
            <span class="text-xs uppercase tracking-wider font-semibold text-slate-400">• ${item.type}</span>
          </div>
          <p class="text-sm font-medium text-slate-800 line-clamp-2">${escapeHtml(item.summary)}</p>
          <p class="text-xs text-slate-500 font-mono line-clamp-1">${escapeHtml(item.inputs.textSnippet || item.inputs.url || "")}</p>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button data-load-check="${item.id}" class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition">
            View Assessment
          </button>
          <button data-delete-check="${item.id}" class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 transition">
            Delete
          </button>
        </div>
      </div>
    `;
  }).join("");

  // Bind view & delete buttons
  container.querySelectorAll("[data-load-check]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-load-check");
      const found = state.savedChecks.find(c => c.id === id);
      if (found && found.fullResult) {
        state.currentResult = found.fullResult;
        switchView("check");
        renderResults(found.fullResult);
      }
    });
  });

  container.querySelectorAll("[data-delete-check]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-delete-check");
      state.savedChecks = state.savedChecks.filter(c => c.id !== id);
      saveChecksToStorage();
      renderHistoryBadge();
      renderSavedChecksList();
      showToast("Saved check deleted");
    });
  });
}

/**
 * Sample Cases Setup
 */
function initSampleCases() {
  const container = document.getElementById("sample-cases-grid");
  if (!container) return;

  container.innerHTML = SAMPLE_CASES.map(sample => {
    let badgeClass = "bg-red-100 text-red-800 border-red-200";
    if (sample.badgeRisk.includes("Medium")) badgeClass = "bg-amber-100 text-amber-800 border-amber-200";
    if (sample.badgeRisk.includes("Low")) badgeClass = "bg-emerald-100 text-emerald-800 border-emerald-200";

    return `
      <div class="p-5 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">${sample.category}</span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeClass}">${sample.badgeRisk}</span>
          </div>
          <h3 class="font-bold text-slate-900 text-base mb-1">${escapeHtml(sample.title)}</h3>
          <p class="text-xs text-slate-600 mb-4">${escapeHtml(sample.description)}</p>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span class="text-[11px] text-slate-400">Demo Scenario</span>
          <button data-load-sample="${sample.id}" class="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
            Load & Analyze
          </button>
        </div>
      </div>
    `;
  }).join("");

  // Attach sample loader
  container.querySelectorAll("[data-load-sample]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-load-sample");
      const sample = SAMPLE_CASES.find(s => s.id === id);
      if (sample) {
        populateFormWithSample(sample);
      }
    });
  });
}

function populateFormWithSample(sample) {
  switchView("check");

  document.getElementById("opportunity-type").value = sample.input.type;
  document.getElementById("offer-text").value = sample.input.text;
  document.getElementById("offer-url").value = sample.input.url || "";
  document.getElementById("opportunity-field").value = sample.input.field || "general";
  document.getElementById("opportunity-location").value = sample.input.location || "remote";
  document.getElementById("opportunity-eligibility").value = sample.input.eligibility || "any";

  showToast(`Loaded sample: ${sample.title}`);
  runAnalysisFromForm();
}

/**
 * Toast Notifications
 */
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `p-4 rounded-xl text-sm font-medium shadow-lg border transition-all duration-300 transform translate-y-2 opacity-0 flex items-center justify-between gap-3 ${
    type === "error" 
      ? "bg-red-900 text-white border-red-700" 
      : "bg-slate-900 text-white border-slate-700"
  }`;
  toast.innerHTML = `
    <span>${escapeHtml(message)}</span>
    <button class="text-slate-400 hover:text-white">&times;</button>
  `;

  container.appendChild(toast);

  // Fade in
  requestAnimationFrame(() => {
    toast.classList.remove("translate-y-2", "opacity-0");
  });

  const dismiss = () => {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toast.remove(), 300);
  };

  toast.querySelector("button").addEventListener("click", dismiss);
  setTimeout(dismiss, 4500);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
