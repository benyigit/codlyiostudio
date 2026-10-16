import { mountOffice3D, setOffice3DVisible } from "./office3d.js";
import { createWorkspaceStore } from "./workspace-store.js";

(function () {
  "use strict";

  const STORE = "codly-office-demo-v1";
  const OWNER_STORE = "codly-office-cloud-owner-v1";
  const THEME_STORE = "codly-studio-theme";
  const MAX_MAP_SCALE = 4.5;
  function studioLocale() {
    return window.codlyioI18n?.getLanguage() === "en" ? "en-US" : "tr-TR";
  }
  const PROVIDERS = ["OpenAI-compatible", "Anthropic", "Google Gemini", "OpenRouter", "Ollama", "LM Studio", "Custom endpoint"];
  const PROVIDER_URLS = {
    "OpenAI-compatible": "https://api.openai.com/v1",
    Anthropic: "https://api.anthropic.com",
    "Google Gemini": "https://generativelanguage.googleapis.com",
    OpenRouter: "https://openrouter.ai/api/v1",
    Ollama: "http://localhost:11434/v1",
    "LM Studio": "http://localhost:1234/v1",
    "Custom endpoint": ""
  };
  function applyStudioTheme(theme) {
    const light = theme === "light";
    document.documentElement.classList.toggle("light-theme", light);
    window.codlyioI18n?.setTheme(light ? "light" : "dark");
  }
  applyStudioTheme(window.codlyioI18n?.getTheme() || (localStorage.getItem(THEME_STORE) === "dark" ? "dark" : "light"));
  const SEED_EMPLOYEES = [
    ["Alex", "Chief AI Manager", "Executive", "Reasoning", "Planning · Delegation · Coordination"],
    ["Oliver", "Research Analyst", "Research", "Balanced", "Market research · Web research · Source analysis"],
    ["Emma", "Product Manager", "Product", "Balanced", "Product strategy · Requirements · Roadmaps"],
    ["Chloe", "Creative Director", "Design", "Creative", "Art direction · Brand design · Visual systems"],
    ["Ethan", "Full-stack Engineer", "Software Development", "Reasoning", "Frontend · Backend · APIs · Debugging"],
    ["Liam", "DevOps Engineer", "Software Development", "Pro", "Infrastructure · CI/CD · Deployment"],
    ["Grace", "QA Engineer", "Software Development", "Pro", "Testing · Quality assurance · Accessibility"],
    ["Maya", "Growth Strategist", "Growth & Marketing", "Balanced", "Growth strategy · Social campaigns · Audience"],
    ["Noah", "Content Manager", "Content", "Balanced", "Editorial · Copywriting · Content planning"],
    ["Ava", "Video Director", "Content", "Pro", "Video · Storyboards · Short-form content"],
    ["Leo", "Media Producer", "Design", "Balanced", "Image production · Layout · Brand consistency"],
    ["Zoe", "Ads Manager", "Advertising", "Balanced", "Paid social · Campaigns · Budget monitoring"],
    ["Daniel", "Data Analyst", "Data & Analytics", "Reasoning", "Analytics · Metrics · Reporting"],
    ["Lily", "Support Specialist", "Customer Support", "Pro", "Customer support · Triage · Knowledge base"],
    ["Jack", "Operations Coordinator", "Operations", "Pro", "Operations · Scheduling · Process design"]
  ];
  const LEGACY_EMPLOYEE_NAMES = {
    "staff-0": ["Manager", "Deniz"], "staff-1": ["Atlas", "Bora"], "staff-2": ["Aria", "Ece"],
    "staff-3": ["Nova", "Selin"], "staff-4": ["Codey", "Mert"], "staff-5": ["Forge", "Emre"],
    "staff-6": ["Quinn", "Ayşe"], "staff-7": ["Mira", "Duru"], "staff-8": ["Echo", "Cem"],
    "staff-9": ["Lumi", "İrem"], "staff-10": ["Pixel", "Can"], "staff-11": ["Max", "Elif"],
    "staff-12": ["Iris", "Barış"], "staff-13": ["Sage", "Aslı"], "staff-14": ["Otto", "Onur"]
  };
  function hasLegacyEmployeeName(person) {
    const oldNames = LEGACY_EMPLOYEE_NAMES[person.id] || [];
    return oldNames.includes(person.name);
  }
  function seedEmployees() {
    return SEED_EMPLOYEES.map(function (item, index) {
      return {
        id: "staff-" + index,
        name: item[0],
        role: item[1],
        department: item[2],
        tier: item[3],
        skills: item[4],
        status: "Idle",
        provider: "",
        model: "",
        baseUrl: "",
        instructions: "",
        permissions: index === 0 ? ["workspace.plan", "workspace.coordinate", "web.search", "analytics.read"] : ["workspace.artifacts", "workspace.memory", "web.search", "file.read"]
      };
    });
  }

  function loadSaved(snapshotOverride) {
    try {
      const saved = snapshotOverride === undefined ? JSON.parse(localStorage.getItem(STORE) || "{}") : (snapshotOverride || {});
      const employees = seedEmployees().map(function (person) {
        const match = (saved.employees || []).find(function (item) { return item.id === person.id; });
        if (match) {
          const savedPerson = Object.assign({}, match);
          if (hasLegacyEmployeeName(savedPerson)) savedPerson.name = person.name;
          Object.assign(person, savedPerson);
        }
        person.status = "Idle";
        return person;
      });
      return {
        employees: employees,
        goals: Array.isArray(saved.goals) ? saved.goals : [],
        tasks: Array.isArray(saved.tasks) ? saved.tasks : [],
        workflows: Array.isArray(saved.workflows) ? saved.workflows : [],
        activity: Array.isArray(saved.activity) ? saved.activity : [],
        meetings: Array.isArray(saved.meetings) ? saved.meetings : [],
        directMessages: saved.directMessages && typeof saved.directMessages === "object" ? saved.directMessages : {},
        settings: saved.settings || {},
        workspaceProfile: saved.workspaceProfile && typeof saved.workspaceProfile === "object" ? saved.workspaceProfile : null,
        currentPage: "office",
        selectedEmployee: "",
        teamListOpen: false,
        managerPanelOpen: true,
        managerTab: "manager",
        approvalTab: "Waiting",
        taskTab: "Goals",
        taskFilter: "All",
        settingsTab: "General",
        integrationCategory: "Popular",
        integrationSearch: "",
        calendarDate: new Date(),
        calendarMode: "Month",
        showNames: true,
        reduceMotion: false,
        mapScale: 1.1,
        mapRotate: 0,
        emergency: false,
        apiOnline: false,
        serverRoutes: {},
        busyManager: false,
        runningGoalId: "",
        officeActivity: null
      };
    } catch (error) {
      return {
        employees: seedEmployees(), goals: [], tasks: [], workflows: [], activity: [], meetings: [], directMessages: {}, settings: {}, workspaceProfile: null,
        currentPage: "office", selectedEmployee: "", managerTab: "manager", approvalTab: "Waiting",
        teamListOpen: false, managerPanelOpen: true,
        taskTab: "Goals", taskFilter: "All", settingsTab: "General", integrationCategory: "Popular",
        integrationSearch: "", calendarDate: new Date(), calendarMode: "Month", showNames: true,
        reduceMotion: false, mapScale: 1.1, mapRotate: 0, emergency: false,
        apiOnline: false, serverRoutes: {}, busyManager: false, runningGoalId: "", officeActivity: null
      };
    }
  }

  const state = loadSaved();
  const view = document.getElementById("view");
  const modalRoot = document.getElementById("modal-root");
  const authScreen = document.getElementById("auth-screen");
  const workspaceOnboarding = document.getElementById("workspace-onboarding");
  let toastTimer = null;
  let ambientCoffeeTimer = null;
  let workspaceStore = null;
  let cloudUser = null;
  let cloudSyncStatus = "local";
  let cloudSaveTimer = null;
  let cloudSaveChain = Promise.resolve();
  let cloudRestoreInProgress = false;
  let cloudRevision = null;
  let cloudConflictNotified = false;
  let cloudSessionGeneration = 0;
  let activatingUserId = "";
  let authSubscription = null;
  let workspaceSubscription = null;
  let authMode = "signin";
  let authNotice = "";
  let authNoticeIsError = false;
  state.dmPending = {};

  function scrubSecrets(value) {
    if (Array.isArray(value)) return value.map(scrubSecrets);
    if (!value || typeof value !== "object") return value;
    return Object.keys(value).reduce(function (clean, key) {
      if (/(api[_-]?keys?|secret|access[_-]?token|refresh[_-]?token|password|authorization)/i.test(key)) return clean;
      clean[key] = scrubSecrets(value[key]);
      return clean;
    }, {});
  }

  function persistedSnapshot() {
    const snapshot = {
      employees: state.employees.map(function (person) {
        return {
          id: person.id,
          name: person.name,
          role: person.role,
          department: person.department,
          tier: person.tier,
          skills: person.skills,
          provider: person.provider,
          model: person.model,
          baseUrl: person.baseUrl,
          instructions: person.instructions,
          permissions: person.permissions
        };
      }),
      goals: state.goals,
      tasks: state.tasks,
      workflows: state.workflows,
      activity: state.activity,
      meetings: state.meetings,
      directMessages: state.directMessages,
      settings: state.settings,
      workspaceProfile: state.workspaceProfile
    };
    return scrubSecrets(snapshot);
  }

  function saveLocalSnapshot(snapshot) {
    try { localStorage.setItem(STORE, JSON.stringify(snapshot)); } catch (error) { /* Private browsing can block local persistence. */ }
  }

  function localWorkspaceOwner() {
    try { return localStorage.getItem(OWNER_STORE) || ""; } catch (error) { return ""; }
  }

  function saveLocalWorkspaceOwner(userId) {
    try { localStorage.setItem(OWNER_STORE, userId); } catch (error) { /* Private browsing can block local persistence. */ }
  }

  function queueCloudSave(snapshot) {
    if (!workspaceStore || !cloudUser || cloudRestoreInProgress || cloudSyncStatus === "conflict") return;
    const userId = cloudUser.id;
    const generation = cloudSessionGeneration;
    clearTimeout(cloudSaveTimer);
    cloudSaveTimer = setTimeout(async function () {
      cloudSaveTimer = null;
      if (!cloudUser || cloudUser.id !== userId || cloudSessionGeneration !== generation) return;
      cloudSyncStatus = "syncing";
      cloudSaveChain = cloudSaveChain.catch(function () {}).then(function () {
        if (!cloudUser || cloudUser.id !== userId || cloudSessionGeneration !== generation) return;
        const expectedRevision = cloudRevision;
        return workspaceStore.saveSnapshot(snapshot, userId, expectedRevision).then(function (revision) {
          if (cloudUser && cloudUser.id === userId && cloudSessionGeneration === generation) cloudRevision = revision;
        });
      });
      try { await cloudSaveChain; if (cloudUser && cloudUser.id === userId && cloudSessionGeneration === generation) cloudSyncStatus = "synced"; }
      catch (error) {
        if (cloudUser && cloudUser.id === userId && cloudSessionGeneration === generation) {
          cloudSyncStatus = error.code === "WORKSPACE_CONFLICT" ? "conflict" : "error";
          if (cloudSyncStatus === "conflict" && !cloudConflictNotified) {
            cloudConflictNotified = true;
            toast("This workspace changed on another device. Reload this page to load the latest version.");
          }
        }
        console.error("Workspace sync failed:", error);
      }
    }, 600);
  }

  function persist() {
    const snapshot = persistedSnapshot();
    saveLocalSnapshot(snapshot);
    queueCloudSave(snapshot);
  }

  function applySnapshot(snapshot) {
    const restored = loadSaved(snapshot);
    ["employees", "goals", "tasks", "workflows", "activity", "meetings", "directMessages", "settings", "workspaceProfile"].forEach(function (key) {
      state[key] = restored[key];
    });
  }

  function showAuthScreen(message, isError) {
    if (!authScreen) return;
    authNotice = message || "";
    authNoticeIsError = Boolean(isError);
    const signup = authMode === "signup";
    authScreen.innerHTML = '<section class="auth-card"><div class="brand auth-brand"><img class="brand-logo" src="/brand-mark.png?v=2" alt=""><span>Codlyio Studio</span></div><p class="eyebrow">YOUR AI WORKSPACE</p><h1>' + (signup ? "Create your account" : "Welcome back") + '</h1><p class="auth-subtitle">' + (signup ? "Create an account to keep your team and workspace in sync across devices." : "Sign in to open your workspace on this device.") + '</p>' + (authNotice ? '<div class="auth-notice ' + (authNoticeIsError ? "error" : "") + '">' + esc(authNotice) + '</div>' : '') + '<form id="auth-form"><label class="auth-field"><span>Email</span><input name="email" type="email" autocomplete="email" required placeholder="you@example.com"></label><label class="auth-field"><span>Password</span><input name="password" type="password" autocomplete="' + (signup ? "new-password" : "current-password") + '" minlength="8" required placeholder="At least 8 characters"></label><button class="button primary auth-submit" type="submit">' + (signup ? "Create account" : "Sign in") + '</button></form><button class="auth-switch" type="button" data-auth-mode="' + (signup ? "signin" : "signup") + '">' + (signup ? "Already have an account? Sign in" : "New to Codlyio Studio? Create an account") + '</button><p class="auth-footnote">Your model provider keys stay on the local runtime and are not included in workspace sync.</p></section>';
    authScreen.classList.remove("hidden");
    if (workspaceOnboarding) workspaceOnboarding.classList.add("hidden");
    document.querySelector(".shell").classList.add("hidden");
  }

  function showWorkspaceOnboarding() {
    if (!workspaceOnboarding) return;
    const profile = state.workspaceProfile || {};
    const type = profile.type || "Company";
    const industry = profile.industry || "";
    workspaceOnboarding.innerHTML = '<section class="onboarding-card"><div class="brand onboarding-brand"><img class="brand-logo" src="/brand-mark.png?v=2" alt=""><span>Codlyio Studio</span></div><p class="eyebrow">LET’S SET UP YOUR SPACE</p><h1>Tell us what you’re building</h1><p class="auth-subtitle">Add a few details about your company or personal workspace. This profile is saved to your account and can shape your Studio experience.</p><form id="workspace-profile-form"><label class="auth-field"><span>Workspace name</span><input name="name" maxlength="60" required value="' + esc(profile.name || state.settings.workspaceName || "") + '" placeholder="e.g. Acme Studio"></label><div class="onboarding-grid"><label class="auth-field"><span>Workspace type</span><select name="type"><option value="Company"' + (type === "Company" ? " selected" : "") + '>Company</option><option value="Personal"' + (type === "Personal" ? " selected" : "") + '>Personal workspace</option></select></label><label class="auth-field"><span>Industry</span><select name="industry"><option value="">Choose an industry</option><option' + (industry === "Technology" ? " selected" : "") + '>Technology</option><option' + (industry === "Creative" ? " selected" : "") + '>Creative & design</option><option' + (industry === "Marketing" ? " selected" : "") + '>Marketing</option><option' + (industry === "E-commerce" ? " selected" : "") + '>E-commerce</option><option' + (industry === "Education" ? " selected" : "") + '>Education</option><option' + (industry === "Other" ? " selected" : "") + '>Other</option></select></label></div><label class="auth-field"><span>What do you want to build?</span><textarea name="description" maxlength="280" rows="3" placeholder="Briefly describe your company, project, or goals…">' + esc(profile.description || "") + '</textarea></label><label class="auth-field"><span>Website <em>optional</em></span><input name="website" type="url" maxlength="200" value="' + esc(profile.website || "") + '" placeholder="https://example.com"></label><button class="button primary auth-submit" type="submit">Save workspace and continue</button></form><p class="auth-footnote">Your workspace profile is saved to your account and synced across your devices.</p></section>';
    if (authScreen) authScreen.classList.add("hidden");
    workspaceOnboarding.classList.remove("hidden");
    document.querySelector(".shell").classList.add("hidden");
  }

  function hideWorkspaceOnboarding() {
    if (workspaceOnboarding) workspaceOnboarding.classList.add("hidden");
    document.querySelector(".shell").classList.remove("hidden");
  }

  function hideAuthScreen() {
    if (authScreen) authScreen.classList.add("hidden");
    document.querySelector(".shell").classList.remove("hidden");
  }

  async function activateCloudUser(user) {
    if (!user || !workspaceStore || activatingUserId === user.id) return;
    if (cloudUser && cloudUser.id === user.id && cloudSyncStatus === "synced") return;
    activatingUserId = user.id;
    cloudSessionGeneration += 1;
    clearTimeout(cloudSaveTimer);
    cloudSaveTimer = null;
    if (workspaceSubscription) workspaceSubscription.unsubscribe();
    workspaceSubscription = null;
    cloudUser = user;
    cloudRevision = null;
    cloudConflictNotified = false;
    cloudRestoreInProgress = true;
    cloudSyncStatus = "syncing";
    let migratedEmployeeNames = false;
    try {
      const snapshot = await workspaceStore.loadSnapshot();
      if (snapshot) {
        migratedEmployeeNames = (snapshot.data.employees || []).some(hasLegacyEmployeeName);
        applySnapshot(snapshot.data);
        cloudRevision = snapshot.revision;
        saveLocalSnapshot(persistedSnapshot());
      } else {
        if (localWorkspaceOwner() && localWorkspaceOwner() !== user.id) applySnapshot({});
        const initialSnapshot = persistedSnapshot();
        cloudRevision = await workspaceStore.saveSnapshot(initialSnapshot, user.id, null);
        saveLocalSnapshot(initialSnapshot);
      }
      if (!cloudUser || cloudUser.id !== user.id) return;
      saveLocalWorkspaceOwner(user.id);
      workspaceSubscription = workspaceStore.subscribeSnapshot(user.id, function (update) {
        if (!cloudUser || cloudUser.id !== user.id || update.revision <= cloudRevision) return;
        if (JSON.stringify(update.data) === JSON.stringify(persistedSnapshot())) {
          cloudRevision = update.revision;
          return;
        }
        if (cloudSaveTimer || cloudSyncStatus === "syncing") return;
        cloudRevision = update.revision;
        applySnapshot(update.data);
        saveLocalSnapshot(persistedSnapshot());
        cloudSyncStatus = "synced";
        render();
      });
      cloudSyncStatus = "synced";
      authNotice = "";
      if (!state.workspaceProfile || !state.workspaceProfile.name) {
        showWorkspaceOnboarding();
        return;
      }
      hideAuthScreen();
      render();
    } catch (error) {
      if (!cloudUser || cloudUser.id === user.id) cloudUser = null;
      cloudSyncStatus = "error";
      if (!cloudUser) showAuthScreen("Workspace eşitlemesi başlatılamadı. Supabase migration dosyasının uygulandığını ve proje ayarlarının doğru olduğunu kontrol edin. " + (error.message || ""), true);
    } finally {
      cloudRestoreInProgress = false;
      activatingUserId = "";
      if (migratedEmployeeNames && cloudUser && cloudUser.id === user.id && cloudSyncStatus === "synced") {
        queueCloudSave(persistedSnapshot());
      }
    }
  }

  async function initializeWorkspace() {
    let config;
    try { config = await apiRequest("/api/config"); }
    catch (error) { return; }
    if (!config.supabaseUrl || !config.supabasePublishableKey) return;
    try {
      workspaceStore = createWorkspaceStore({ url: config.supabaseUrl, publishableKey: config.supabasePublishableKey });
      const session = await workspaceStore.getSession();
      authSubscription = workspaceStore.onAuthStateChange(function (user) {
        if (user) {
          activateCloudUser(user);
        } else if (cloudUser) {
          cloudSessionGeneration += 1;
          clearTimeout(cloudSaveTimer);
          cloudSaveTimer = null;
          cloudUser = null;
          cloudRevision = null;
          if (workspaceSubscription) workspaceSubscription.unsubscribe();
          workspaceSubscription = null;
          cloudSyncStatus = "signed-out";
          showAuthScreen("Oturum kapatıldı.");
        }
      });
      if (session && session.user) await activateCloudUser(session.user);
      else showAuthScreen();
    } catch (error) {
      workspaceStore = null;
      console.error("Workspace setup failed:", error);
      toast("Shared workspace could not be initialized. The local workspace is still available.");
    }
  }

  async function apiRequest(path, payload) {
    const response = await fetch(path, {
      method: payload ? "POST" : "GET",
      headers: payload ? { "content-type": "application/json" } : {},
      body: payload ? JSON.stringify(payload) : undefined
    });
    const data = await response.json().catch(function () { return {}; });
    if (!response.ok) throw new Error(data.error || "Local runtime request failed.");
    return data;
  }

  async function syncRuntime() {
    try {
      await apiRequest("/api/health");
      const data = await apiRequest("/api/routes");
      state.apiOnline = true;
      state.serverRoutes = {};
      (data.routes || []).forEach(function (route) { state.serverRoutes[route.employeeId] = route; });
    } catch (error) {
      state.apiOnline = false;
      state.serverRoutes = {};
    }
    render();
  }

  function routeReady(person) {
    const route = state.serverRoutes[person.id];
    if (!state.apiOnline || !route || !route.model) return false;
    if (route.provider !== person.provider || route.model !== person.model || route.baseUrl !== person.baseUrl) return false;
    return route.keyConfigured || route.provider === "Ollama" || route.provider === "LM Studio";
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char];
    });
  }

  function employee(id) {
    return state.employees.find(function (person) { return person.id === id; });
  }

  function findEmployee(name) {
    return state.employees.find(function (person) { return person.name === name; });
  }

  function toast(message) {
    const current = document.querySelector(".toast");
    if (current) current.remove();
    const item = document.createElement("div");
    item.className = "toast";
    item.textContent = message;
    document.body.appendChild(item);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { item.remove(); }, 2800);
  }

  function addActivity(text, kind) {
    state.activity.unshift({ id: "event-" + Date.now() + Math.random(), text: text, kind: kind || "work", time: new Date().toISOString() });
    state.activity = state.activity.slice(0, 50);
  }

  function titleCase(value) {
    return String(value).replace(/\b\w/g, function (letter) { return letter.toUpperCase(); });
  }

  function pageHeader(title, subtitle, action) {
    return '<div class="page-header"><div><h1>' + title + '</h1><p class="page-subtitle">' + subtitle + '</p></div>' + (action || "") + '</div>';
  }

  function navTo(page) {
    state.currentPage = page;
    render();
    if (view) view.scrollTop = 0;
  }

  function showModal(title, body, actions, className) {
    modalRoot.innerHTML = '<div class="modal-backdrop" data-action="backdrop-close"><section class="modal ' + (className || "") + '" role="dialog" aria-modal="true" aria-label="' + esc(title) + '"><div class="modal-head"><h2>' + esc(title) + '</h2><button class="modal-close" data-action="close-modal" aria-label="Kapat">×</button></div>' + body + (actions || "") + '</section></div>';
  }

  function closeModal() { modalRoot.innerHTML = ""; }

  function initials(name) { return String(name).split(/\s+/).map(function (part) { return part.slice(0, 1); }).join("").slice(0, 2).toUpperCase(); }
  function employeeDot(person, extraClass) {
    const hue = (person.name.charCodeAt(0) * 17 + person.name.length * 31) % 360;
    return '<span class="employee-dot ' + (extraClass || "") + '" style="background:hsl(' + hue + ' 56% 72%)">' + esc(initials(person.name)) + '</span>';
  }

  function renderTeamCard() {
    const rows = state.employees.map(function (person) {
      const color = person.status === "Offline" ? "#68759d" : person.status === "Coffee" ? "#c99a5d" : person.status === "Meeting" || person.status === "Speaking" ? "#9d8bf0" : "#a288e9";
      const description = person.status === "Coffee" ? "getting coffee" : person.status === "Meeting" ? "in a meeting" : person.status === "Speaking" ? "speaking" : person.status === "Working" ? "on a task" : person.status === "Offline" ? "away" : "at their desk";
      return '<button class="team-person" data-employee="' + esc(person.id) + '"><span class="team-color" style="background:' + color + '"></span><span class="team-person-copy"><span class="team-person-name">' + esc(person.name) + ' <span class="muted">' + esc(person.status) + '</span></span><span class="team-person-status">' + description + '</span></span></button>';
    }).join("");
    const active = state.employees.filter(function (item) { return ["Working", "Meeting", "Speaking"].includes(item.status); }).length;
    const toggleLabel = state.teamListOpen ? "Collapse team list" : "Expand team list";
    return '<div class="team-card' + (state.teamListOpen ? " team-card-open" : "") + '"><div class="team-card-head"><span>Team · ' + active + ' active</span><button class="team-list-toggle" type="button" data-action="toggle-team-list" aria-expanded="' + state.teamListOpen + '" aria-label="' + toggleLabel + '" title="' + toggleLabel + '">' + (state.teamListOpen ? "⌃" : "⌄") + '</button></div>' + (state.teamListOpen ? rows : "") + '</div>';
  }

  function renderManagerPanel() {
    const isActivity = state.managerTab === "activity";
    const entries = state.goals.slice(0, 3).map(function (goal) {
      const tasks = Array.isArray(goal.tasks) ? goal.tasks : [];
      const taskMarkup = tasks.map(function (task) { return '<div class="plan-task"><span class="task-dot">' + (task.status === "Done" ? "✓" : "●") + '</span><span>' + esc(task.title) + ' <span class="muted">· ' + esc(task.assignee) + ' · ' + esc(task.status || "Planned") + '</span></span>' + (task.output ? '<button class="text-button" data-action="view-task" data-task="' + esc(task.id) + '">Output</button>' : '') + '</div>'; }).join("");
      const canRun = goal.status === "Planned" || goal.status === "Needs attention";
      const runButton = canRun ? '<button class="button primary small" data-action="run-goal" data-goal="' + esc(goal.id) + '" ' + (state.runningGoalId ? "disabled" : "") + '>Run team</button>' : "";
      return '<div class="chat-entry"><div class="chat-you">' + esc(goal.title) + '</div><p class="chat-manager">' + esc(goal.summary || "Manager prepared the work plan.") + '</p><div class="plan-card"><div class="plan-card-title"><span>' + esc(goal.title) + '</span><span>' + esc(goal.status) + '</span></div>' + taskMarkup + (goal.finalReport ? '<div class="task-output">' + esc(goal.finalReport) + '</div>' : '') + '<div class="plan-actions">' + runButton + '<span class="demo-note">' + (goal.status === "Done" ? "Completed by the assigned models." : "Running tasks sends their prompts to each employee’s configured provider.") + '</span></div></div></div>';
    }).join("");
    const suggestions = [
      "Build a class booking app for my yoga studio",
      "Post three Reels a week and run ads, max 5,000 TL a week",
      "Research our five main competitors and compare their pricing",
      "Every Monday at 9, send me a summary of last week's work",
      "Call a team meeting about the launch plan",
      "Take a coffee break"
    ].map(function (text) { return '<button class="suggestion" data-suggestion="' + esc(text) + '">' + esc(text) + '</button>'; }).join("");
    let body = "";
    if (isActivity) {
      body = state.activity.length ? '<div class="activity-list">' + state.activity.map(function (item) { return '<div class="activity-item"><span class="activity-marker"></span><span>' + esc(item.text) + '<br><span class="muted">' + new Date(item.time).toLocaleString(studioLocale()) + '</span></span></div>'; }).join("") + '</div>' : '<p class="chat-manager">Nothing has happened yet. The activity stream will appear here when the team starts work.</p>';
    } else if (state.busyManager) {
      body = '<p class="manager-intro">Manager is turning your outcome into a team plan…</p><p class="demo-note">Your prompt is being sent to the Manager’s configured provider.</p>';
    } else if (state.goals.length) {
      body = entries;
    } else {
      body = '<p class="manager-intro">Tell the Manager the outcome you want. It plans the work and runs your team.</p><div class="try-label">TRY ASKING FOR</div><div class="suggestions">' + suggestions + '</div>';
    }
    return '<section class="manager-panel"><div class="panel-tabs"><button class="panel-tab ' + (!isActivity ? "active" : "") + '" data-manager-tab="manager">Manager</button><button class="panel-tab ' + (isActivity ? "active" : "") + '" data-manager-tab="activity">Activity</button><button class="manager-panel-close" type="button" data-action="toggle-manager-panel" aria-label="Close chat panel" title="Close chat panel">×</button></div><div class="manager-scroll">' + body + '</div>' + (!isActivity ? '<form class="manager-composer" id="manager-form"><div class="composer-box"><textarea id="manager-input" placeholder="Describe the outcome you want…" aria-label="Describe the outcome you want" ' + (state.busyManager || state.emergency ? "disabled" : "") + '></textarea><button class="send-button" id="manager-send" type="submit" disabled aria-label="Send">↑</button></div><div class="composer-hint">Enter to send · Shift+Enter for a new line</div></form>' : '') + '</section>';
  }

  function renderOffice() {
    const working = state.employees.filter(function (person) { return ["Working", "Meeting", "Speaking"].includes(person.status); }).length;
    const activeGoals = state.goals.filter(function (goal) { return goal.status !== "Done"; }).length;
    const overview = '<div class="office-summary"><h1>' + esc((state.workspaceProfile && state.workspaceProfile.name) || state.settings.workspaceName || "Codlyio Studio") + '</h1><div class="summary-meta"><span class="online-dot"></span><span>' + working + ' of ' + state.employees.length + ' working</span><span class="separator">·</span><span>' + activeGoals + ' active goal' + (activeGoals === 1 ? "" : "s") + '</span><span class="separator">·</span><button class="credits-link" data-page="usage">Model routes</button></div></div>';
    const activity = state.officeActivity;
    const activityName = activity ? activity.type === "meeting" ? "Team meeting" : "Coffee break" : "";
    const activityBar = activity ? '<div class="office-live-activity"><div><strong>' + activityName + '</strong><span>' + esc(activity.subject || activity.participantIds.map(function (id) { return employee(id)?.name || ""; }).join(", ")) + '</span></div><button class="button small" data-action="end-office-activity">End</button></div>' : '';
    const sceneActions = activity ? '' : '<div class="office-scene-actions"><button class="button small" data-action="coffee-break">☕ Coffee break</button><button class="button small" data-action="new-meeting">＋ Call meeting</button></div>';
    const empty = !state.goals.length && !activity ? '<div class="quiet-banner"><span class="online-dot"></span>The office is quiet. Give the Manager a goal to get started.</div>' : '';
    const panelReopen = state.managerPanelOpen ? "" : '<button class="office-panel-reopen" type="button" data-action="toggle-manager-panel" aria-label="Open chat panel" title="Open chat panel">◧ <span>Open chat</span></button>';
    const panel = state.managerPanelOpen ? renderManagerPanel() : "";
    return '<div class="office-view' + (state.managerPanelOpen ? "" : " office-view--manager-collapsed") + '"><section class="office-stage">' + overview + '<div class="office-map-wrap"><div id="office-3d" class="office-3d" aria-label="Interactive 3D office"></div><div id="office-hover-card" class="office-hover-card hidden" role="tooltip"></div></div>' + renderTeamCard() + '<div class="scene-hint">Drag to orbit · Scroll to zoom</div><div class="office-tools"><button data-action="zoom-in" title="Zoom in">＋</button><button data-action="zoom-out" title="Zoom out">−</button><button data-action="rotate-map" title="Rotate the office">⟳</button><button data-action="fit-map" title="Fit the office to the screen">⛶</button><button data-action="team-toggle" title="Show every name">♧</button></div>' + sceneActions + activityBar + '<div class="office-options"><label><input type="checkbox" data-option="showNames" ' + (state.showNames ? "checked" : "") + '> Show every name</label><label><input type="checkbox" data-option="reduceMotion" ' + (state.reduceMotion ? "checked" : "") + '> Reduce motion</label></div>' + empty + panelReopen + '</section>' + panel + '</div>';
  }

  function renderManagerPage() {
    const note = state.apiOnline ? "The prompt is sent to the Manager’s configured provider when you submit it." : "Start the local runtime with npm start before sending a goal.";
    return '<div class="page">' + pageHeader("Manager", "Give the Manager an outcome. It creates a text task plan and assigns work to configured employees.") + '<div class="card" style="max-width:760px"><p class="eyebrow">NEW OUTCOME</p><p class="serif" style="font-size:24px;margin:0 0 14px">What should the team make happen?</p><form class="manager-composer" id="manager-form" style="padding:0;border:0"><div class="composer-box"><textarea id="manager-input" placeholder="Describe the outcome you want…" aria-label="Describe the outcome you want" ' + (state.busyManager || state.emergency ? "disabled" : "") + '></textarea><button class="send-button" id="manager-send" type="submit" disabled aria-label="Send">↑</button></div><div class="composer-hint">Enter to send · Shift+Enter for a new line</div></form><p class="demo-note">' + esc(note) + ' Current runs are text-only; tools and external actions are not connected.</p></div><div style="margin-top:22px"><h2 class="serif" style="font-size:22px;font-weight:400">Recent goals</h2>' + (state.goals.length ? state.goals.slice(0, 5).map(goalCard).join("") : '<div class="empty-state"><strong>No goals yet</strong>Set an outcome above to start a team plan.</div>') + '</div></div>';
  }

  function goalCard(goal) {
    const tasks = Array.isArray(goal.tasks) ? goal.tasks : [];
    const action = goal.status === "Planned" || goal.status === "Needs attention" ? '<button class="button small" data-action="run-goal" data-goal="' + esc(goal.id) + '" ' + (state.runningGoalId ? "disabled" : "") + '>Run team</button>' : "";
    return '<article class="workflow-row"><div><strong>' + esc(goal.title) + '</strong><span>' + tasks.length + ' tasks · ' + new Date(goal.createdAt).toLocaleString(studioLocale()) + '</span></div><span class="status-badge">' + esc(goal.status) + '</span>' + action + '</article>';
  }

  function renderTasks() {
    const content = state.taskTab === "Goals" ? (state.goals.length ? state.goals.map(goalCard).join("") : '<div class="empty-state"><strong>No goals yet</strong>Tell the Manager what you want to achieve.</div>') : renderAllTasks();
    const filters = ["All", "Active", "Needs attention", "Done"].map(function (filter) { return '<button class="filter-chip ' + (state.taskFilter === filter ? "active" : "") + '" data-task-filter="' + filter + '">' + filter + '</button>'; }).join("");
    return '<div class="page">' + pageHeader("Tasks", "Every goal the Manager planned and every task your team is working on.") + '<div class="tabs"><button class="tab-button ' + (state.taskTab === "Goals" ? "active" : "") + '" data-task-tab="Goals">Goals</button><button class="tab-button ' + (state.taskTab === "All tasks" ? "active" : "") + '" data-task-tab="All tasks">All tasks</button></div>' + (state.taskTab === "All tasks" ? '<div class="filter-row">' + filters + '</div>' : '') + content + '</div>';
  }

  function renderAllTasks() {
    const filtered = state.tasks.filter(function (task) {
      if (state.taskFilter === "Done") return task.status === "Done";
      if (state.taskFilter === "Active") return task.status !== "Done";
      if (state.taskFilter === "Needs attention") return task.status === "Needs attention";
      return true;
    });
    if (!filtered.length) return '<div class="empty-state"><strong>No tasks yet</strong>Tasks created from Manager goals will appear here.</div>';
    return '<div class="workflow-list">' + filtered.map(function (task) {
      return '<article class="workflow-row"><div><strong>' + esc(task.title) + '</strong><span>' + esc(task.assignee) + ' · ' + esc(task.department) + '</span></div><span class="status-badge">' + esc(task.status) + '</span>' + (task.output || task.error ? '<button class="button small" data-action="view-task" data-task="' + esc(task.id) + '">Details</button>' : '') + '</article>';
    }).join("") + '</div>';
  }

  function renderProjects() {
    return '<div class="page">' + pageHeader("Projects", "Goals are grouped here. Persistent project memory and artifact storage are planned for a later slice.") + (state.goals.length ? '<div class="card-grid">' + state.goals.map(function (goal) { return '<article class="card"><p class="eyebrow">PROJECT · ' + new Date(goal.createdAt).toLocaleDateString(studioLocale()) + '</p><h3>' + esc(goal.title) + '</h3><p>' + (Array.isArray(goal.tasks) ? goal.tasks.length : 0) + ' planned tasks · ' + esc(goal.status) + '</p><div class="card-meta"><span class="online-dot"></span> Goal workspace</div></article>'; }).join("") + '</div>' : '<div class="empty-state"><strong>No projects yet</strong>A project is created when the Manager plans a goal.</div>') + '</div>';
  }

  function renderDevelopment() {
    return '<div class="page">' + pageHeader("Development", "Code, repositories, tests and deployments across your projects. Commands stay in local isolated sandboxes when a runtime is connected.") + '<div class="callout">Demo mode: repository access and code execution are not connected. No commands run from this interface.</div><div class="card-grid"><article class="card"><p class="eyebrow">GITHUB</p><h3>Not connected</h3><p>Connect a fine-grained token limited to the repositories the team may use.</p><div class="field"><label>GitHub token</label><input type="password" placeholder="Token stays in this tab" disabled></div><button class="button" disabled>Connect GitHub</button></article><article class="card"><p class="eyebrow">CODE SANDBOX</p><h3>Not connected</h3><p>When enabled, tests and builds should run in short-lived isolated containers.</p></article><article class="card"><p class="eyebrow">DEPLOYMENTS</p><h3>No provider connected</h3><p>Production deployments should wait for an explicit approval.</p></article></div><div class="card-grid" style="margin-top:13px"><article class="card"><p class="eyebrow">DEPLOYMENTS</p><p>No deployments yet.</p></article><article class="card"><p class="eyebrow">TEST RUNS</p><p>No test runs yet.</p></article><article class="card"><p class="eyebrow">REPOSITORIES</p><p>No repositories linked yet.</p></article></div></div>';
  }

  function renderArtifacts() {
    return '<div class="page">' + pageHeader("Artifacts", "Documents, code, designs and reports your team produced.") + '<div class="empty-state"><strong>No artifacts yet</strong>Finished work will be saved to its project and listed here.</div></div>';
  }

  function renderApprovals() {
    return '<div class="page">' + pageHeader("Approvals", "Risky and external actions wait here until you decide. Each approval unlocks exactly one action.") + '<div class="tabs"><button class="tab-button ' + (state.approvalTab === "Waiting" ? "active" : "") + '" data-approval-tab="Waiting">Waiting</button><button class="tab-button ' + (state.approvalTab === "History" ? "active" : "") + '" data-approval-tab="History">History</button></div><div class="empty-state"><strong>' + (state.approvalTab === "Waiting" ? "Nothing is waiting for your approval" : "No approval history yet") + '</strong>External actions stay paused until an approval is explicitly granted.</div></div>';
  }

  function renderActivity() {
    const meetings = state.meetings.length ? '<h2 class="serif" style="margin-top:24px;font-size:22px;font-weight:400">Meeting notes</h2><div class="meeting-history">' + state.meetings.slice(0, 10).map(function (meeting) { const names = meeting.participantNames || meeting.participants.map(function (id) { return employee(id)?.name || "Employee"; }); return '<article class="card"><p class="eyebrow">' + new Date(meeting.createdAt).toLocaleString(studioLocale()) + ' · ' + names.map(esc).join(", ") + '</p><h3>' + esc(meeting.subject) + '</h3><p>' + esc(meeting.summary || "No model summary was produced.") + '</p>' + (meeting.notes ? '<pre class="task-output">' + esc(meeting.notes) + '</pre>' : '') + '</article>'; }).join("") + '</div>' : '';
    const rows = state.activity.length ? '<div class="activity-list">' + state.activity.map(function (item) { return '<div class="activity-item"><span class="activity-marker"></span><span>' + esc(item.text) + '<br><span class="muted">' + new Date(item.time).toLocaleString(studioLocale()) + '</span></span></div>'; }).join("") + '</div>' : '<div class="empty-state"><strong>No activity yet</strong>Everything the team does will appear here.</div>';
    return '<div class="page">' + pageHeader("Activity", "Everything your team did, as it happened.") + '<div class="setting-row"><span>Show system events</span><button class="switch ' + (state.settings.showSystemEvents ? "on" : "") + '" data-setting-switch="showSystemEvents" aria-label="Show system events"></button></div>' + meetings + rows + '</div>';
  }

  function renderContent() {
    return '<div class="page">' + pageHeader("Content", "Reels, posts and stories your team writes, storyboards and produces. Review them here before anything goes out.", '<button class="button" data-page="calendar">Open calendar</button>') + '<div class="empty-state"><strong>No content yet</strong>Ask the Manager for a posting plan and the team can prepare drafts for review.</div></div>';
  }

  function calendarMarkup() {
    const year = state.calendarDate.getFullYear();
    const month = state.calendarDate.getMonth();
    const first = new Date(year, month, 1);
    const start = new Date(year, month, 1 - ((first.getDay() + 6) % 7));
    let cells = "";
    ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].forEach(function (day) { cells += '<div class="calendar-cell weekday">' + day + '</div>'; });
    for (let i = 0; i < 42; i += 1) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      const outside = day.getMonth() !== month;
      const today = day.toDateString() === new Date().toDateString();
      if (state.calendarMode === "Week" && i >= 7) break;
      cells += '<div class="calendar-cell ' + (outside ? "outside" : "") + ' ' + (today ? "today" : "") + '">' + day.getDate() + '</div>';
    }
    return cells;
  }

  function renderCalendar() {
    return '<div class="page">' + pageHeader("Calendar", "Planned posts, shown in your workspace time zone.") + '<div class="calendar-toolbar"><div><h2 class="serif" style="margin:0;font-size:23px;font-weight:400">' + state.calendarDate.toLocaleString(studioLocale(), { month: "long", year: "numeric" }) + '</h2><span class="muted" style="font-size:9px">Europe/Istanbul · ' + state.calendarMode + ' view</span></div><div style="display:flex;gap:6px;align-items:center"><button class="button small" data-action="calendar-prev">‹</button><button class="button small" data-action="calendar-today">Today</button><button class="button small" data-action="calendar-next">›</button><button class="filter-chip ' + (state.calendarMode === "Month" ? "active" : "") + '" data-calendar-mode="Month">Month</button><button class="filter-chip ' + (state.calendarMode === "Week" ? "active" : "") + '" data-calendar-mode="Week">Week</button></div></div><div class="calendar-grid">' + calendarMarkup() + '</div><div class="empty-state" style="margin-top:15px;padding:20px">Nothing is planned for this period.</div></div>';
  }

  function renderCampaigns() {
    return '<div class="page">' + pageHeader("Campaigns", "Meta ads your team runs from your content. Your ad platform bills the account directly.") + '<div class="callout">No ad budget limit is set, so nothing can go live. Add a policy under Settings → Budgets before enabling campaigns.</div><div class="empty-state"><strong>No campaigns yet</strong>Ask the Manager to promote content within a weekly maximum.</div></div>';
  }

  function renderAnalytics() {
    return '<div class="page">' + pageHeader("Analytics", "How your content and ads perform. Your team reads these results before planning what comes next.") + '<div class="filter-row">' + ["7 days", "14 days", "30 days"].map(function (item, index) { return '<button class="filter-chip ' + (index === 1 ? "active" : "") + '">' + item + '</button>'; }).join("") + '<button class="button small" style="margin-left:auto">Refresh</button></div><div class="empty-state"><strong>No results yet</strong>Numbers appear once posts are published or ads are running.</div></div>';
  }

  function renderEmployees() {
    const rows = state.employees.map(function (person) {
      return '<tr data-employee="' + esc(person.id) + '"><td><span class="employee-cell">' + employeeDot(person) + '<span><strong>' + esc(person.name) + '</strong><br><span class="muted">' + esc(person.role) + '</span></span></span></td><td>' + esc(person.department) + '</td><td><span class="status-badge">' + esc(person.status) + '</span></td><td>' + esc(person.provider || "Not configured") + '<br><span class="muted">' + esc(person.model || person.tier + " model") + '</span></td></tr>';
    }).join("");
    return '<div class="page">' + pageHeader("Employees", "What an employee may do comes from capabilities and permissions — never from their title.") + '<div class="table-wrap"><table><thead><tr><th>EMPLOYEE</th><th>DEPARTMENT</th><th>NOW</th><th>MODEL ROUTE</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
  }

  function renderDepartments() {
    const deptNames = Array.from(new Set(state.employees.map(function (person) { return person.department; })));
    return '<div class="page">' + pageHeader("Departments", "Departments group employees and their capabilities. Each one has a home in the office.") + '<div class="card-grid">' + deptNames.map(function (dept) {
      const members = state.employees.filter(function (person) { return person.department === dept; });
      return '<article class="card"><p class="eyebrow">' + esc(members.length) + ' EMPLOYEE' + (members.length === 1 ? "" : "S") + '</p><h3>' + esc(dept) + '</h3><p>Office area: ' + esc(dept === "Software Development" ? "Development" : dept === "Growth & Marketing" ? "Social desk" : dept) + '</p><div class="card-meta">' + members.map(function (person) { return '<button class="filter-chip" data-employee="' + esc(person.id) + '">' + esc(person.name) + '</button>'; }).join("") + '</div></article>';
    }).join("") + '</div></div>';
  }

  function renderEmployeeChat(person) {
    const messages = Array.isArray(state.directMessages[person.id]) ? state.directMessages[person.id] : [];
    const sending = Boolean(state.dmPending[person.id]);
    const routeAvailable = routeReady(person);
    const content = messages.length ? messages.map(function (message) {
      const role = message.role === "user" ? "user" : message.role === "assistant" ? "assistant" : "system";
      const name = role === "user" ? "You" : role === "assistant" ? person.name : "Codly Office";
      return '<article class="dm-message dm-' + role + '"><span class="dm-sender">' + esc(name) + '</span><p>' + esc(message.content) + '</p></article>';
    }).join("") : '<div class="dm-empty"><span class="dm-empty-icon">↗</span><strong>Start a conversation</strong><span>Messages and replies will appear here.</span></div>';
    const routeHint = !state.apiOnline ? "Start the local runtime to message a model." : !routeAvailable ? "Add and save this employee’s model route to receive replies." : "Replies use this employee’s configured model.";
    return '<section class="card dm-card"><div class="dm-card-head"><div><div class="section-title">DIRECT MESSAGES</div><p>Private chat with ' + esc(person.name) + '</p></div><span class="dm-online ' + (routeAvailable ? "ready" : "") + '">' + (routeAvailable ? "MODEL READY" : "SETUP NEEDED") + '</span></div><div class="dm-thread" id="dm-thread-' + esc(person.id) + '" aria-live="polite">' + content + (sending ? '<article class="dm-message dm-system"><span class="dm-sender">' + esc(person.name) + '</span><p class="dm-thinking">Thinking<span>…</span></p></article>' : '') + '</div><form id="employee-message-form" data-employee="' + esc(person.id) + '"><div class="dm-composer"><textarea name="message" rows="2" placeholder="Message ' + esc(person.name) + '…" aria-label="Message ' + esc(person.name) + '" required></textarea><button class="send-button" type="submit" aria-label="Send message" ' + (sending ? "disabled" : "") + '>↑</button></div><p class="field-help">' + esc(routeHint) + '</p></form></section>';
  }

  async function sendEmployeeMessage(employeeId, message) {
    const person = employee(employeeId);
    if (!person || !message) return;
    if (!Array.isArray(state.directMessages[person.id])) state.directMessages[person.id] = [];
    const thread = state.directMessages[person.id];
    thread.push({ role: "user", content: message, createdAt: new Date().toISOString() });
    state.dmPending[person.id] = true;
    persist();
    render();

    if (!routeReady(person)) {
      thread.push({ role: "system", content: "No active model route is saved for this employee. Set a provider, model and required key in this profile, then send again.", createdAt: new Date().toISOString() });
      state.dmPending[person.id] = false;
      persist();
      render();
      return;
    }

    try {
      const history = thread.filter(function (item) { return item.role === "user" || item.role === "assistant"; }).slice(-24).map(function (item) {
        return { role: item.role, content: item.content };
      });
      const response = await apiRequest("/api/chat", { employeeId: person.id, messages: [
        { role: "system", content: "You are " + person.name + ", a " + person.role + " in " + person.department + ". Reply as this employee in a direct internal chat. Be helpful, concise, and honest about what you have or have not done. Do not claim external actions or tool use. Standing instructions: " + (person.instructions || "None") },
        ...history
      ] });
      thread.push({ role: "assistant", content: response.text, createdAt: new Date().toISOString() });
      addActivity(person.name + " replied to a direct message.", "message");
    } catch (error) {
      thread.push({ role: "system", content: "The model could not reply: " + error.message, createdAt: new Date().toISOString() });
    } finally {
      state.dmPending[person.id] = false;
      persist();
      render();
    }
  }

  function renderEmployeeProfile() {
    const person = employee(state.selectedEmployee);
    if (!person) { state.currentPage = "employees"; return renderEmployees(); }
    const permissionMarkup = person.permissions.map(function (permission) { return '<span class="capability">' + esc(permission) + '</span>'; }).join("");
    const providerOptions = '<option value="">Not configured</option>' + PROVIDERS.map(function (provider) { return '<option value="' + esc(provider) + '" ' + (person.provider === provider ? "selected" : "") + '>' + esc(provider) + '</option>'; }).join("");
    const baseUrl = person.baseUrl || PROVIDER_URLS[person.provider] || "";
    const route = state.serverRoutes[person.id];
    const keyExists = Boolean(route && route.keyConfigured);
    const routeMatches = Boolean(route && route.provider === person.provider && route.model === person.model && route.baseUrl === person.baseUrl);
    const routeState = !state.apiOnline ? "Local runtime is offline" : routeMatches && (keyExists || person.provider === "Ollama" || person.provider === "LM Studio") ? "Route ready" : "Save this route to the local runtime";
    return '<div class="page"><button class="button small" data-action="back-employees">← All employees</button><div class="profile-heading" style="margin-top:20px">' + employeeDot(person) + '<div><h1>' + esc(person.name) + '</h1><div class="profile-role">' + esc(person.role) + ' · ' + esc(person.department) + ' · ' + esc(person.tier) + ' model</div></div></div><div class="profile-layout"><div class="profile-main">' + renderEmployeeChat(person) + '<section class="card"><div class="section-title">RIGHT NOW <span class="status-badge">' + esc(person.status) + '</span></div><p class="muted" style="font-size:10px;margin:0">' + (person.status === "Working" ? "Working on a task" : person.status === "Offline" ? "Not available for work" : "Available for work") + '</p></section><section class="card"><div class="section-title">STANDING INSTRUCTIONS</div><p class="field-help">Applied to every task this employee works on.</p><textarea class="field" id="employee-instructions" style="width:100%;min-height:80px" placeholder="Add instructions for this employee…">' + esc(person.instructions) + '</textarea><button class="button small" data-action="save-instructions" data-employee="' + esc(person.id) + '">Save instructions</button></section><section class="card"><div class="section-title">CAPABILITIES <span class="muted">Planned tool access</span></div><div class="capability-list">' + permissionMarkup + '</div><p class="field-help" style="margin-top:11px">Tool access and approval checks are not connected yet.</p></section><section class="card"><div class="section-title">SKILLS</div><p style="margin:0;color:#c6c5c0;font-size:10px;line-height:1.6">' + esc(person.skills) + '</p></section></div><div class="profile-side"><section class="card"><div class="section-title">AI PROVIDER & MODEL</div><p class="field-help">Each employee can use a separate provider, model and endpoint.</p><div class="route-state">' + esc(routeState) + '</div><div class="field"><label for="employee-provider">Provider</label><select id="employee-provider" data-provider-for="' + esc(person.id) + '">' + providerOptions + '</select></div><div class="field"><label for="employee-model">Model ID</label><input id="employee-model" value="' + esc(person.model) + '" placeholder="Enter a model ID" data-model-for="' + esc(person.id) + '"></div><div class="field"><label for="employee-url">Base URL</label><input id="employee-url" value="' + esc(baseUrl) + '" placeholder="https://…" data-url-for="' + esc(person.id) + '"></div><div class="field"><label for="employee-key">API key</label><input id="employee-key" type="password" placeholder="' + (keyExists ? "Key configured in local runtime" : "Enter key for this session") + '" autocomplete="off"><span class="field-help">The key is sent only to this local runtime, held in memory, and cleared when the server exits. The selected provider receives the model prompt.</span></div><button class="button primary" data-action="save-provider" data-employee="' + esc(person.id) + '">Save route</button>' + (keyExists ? '<button class="button small" style="margin-left:6px" data-action="clear-provider-key" data-employee="' + esc(person.id) + '">Clear key</button>' : '') + '<div class="demo-note">Provider, model and endpoint are stored in your workspace; provider keys remain on this device.</div></section><section class="card"><div class="section-title">PROFILE</div><div class="field"><label for="employee-name">Name</label><input id="employee-name" value="' + esc(person.name) + '" data-name-for="' + esc(person.id) + '"></div><button class="button small" data-action="save-name" data-employee="' + esc(person.id) + '">Save name</button></section><section class="card"><div class="section-title">RECENT TASKS</div>' + (state.tasks.filter(function (task) { return task.assigneeId === person.id || task.assignee === person.name; }).length ? '<p>Tasks listed on the Tasks page.</p>' : '<p class="muted" style="font-size:10px">No tasks yet.</p>') + '</section></div></div></div>';
  }

  const INTEGRATIONS = [
    ["Instagram", "Publish approved posts, Reels and stories.", "Social"], ["Facebook", "Post to Pages and read comments and insights.", "Social"],
    ["Gmail", "Read, sort and summarize email; draft replies.", "Email"], ["Google Calendar", "Read your calendar and prepare meetings.", "Calendar"],
    ["Google Drive", "Find, read and organize files.", "Documents"], ["Google Sheets", "Read sheets and update rows.", "Documents"],
    ["Google Ads", "Read campaigns and prepare changes for approval.", "Ads & analytics"], ["Google Analytics", "Read traffic and conversion metrics.", "Ads & analytics"],
    ["Notion", "Read pages and databases, and add pages.", "Documents"], ["Slack", "Read channels and prepare messages.", "Chat"],
    ["HubSpot", "Manage contacts, companies and deals.", "CRM"], ["LinkedIn", "Post to a page and read posts.", "Social"],
    ["YouTube", "Manage channel videos and read performance.", "Social"], ["Trello", "Manage boards and cards.", "Projects"],
    ["Shopify", "Read products and orders.", "Commerce"], ["Figma", "Read and organize design files.", "Design & web"]
  ];
  const CATEGORIES = ["Popular", "Ads & analytics", "Email", "Calendar", "Documents", "Social", "Commerce", "CRM", "Projects", "Design & web", "Chat"];

  function renderIntegrations() {
    const categories = CATEGORIES.map(function (category) { return '<button class="filter-chip ' + (state.integrationCategory === category ? "active" : "") + '" data-integration-category="' + esc(category) + '">' + esc(category) + '</button>'; }).join("");
    const matches = INTEGRATIONS.filter(function (item) {
      const categoryMatch = state.integrationCategory === "Popular" || item[2] === state.integrationCategory;
      const searchMatch = (item[0] + " " + item[1]).toLowerCase().includes(state.integrationSearch.toLowerCase());
      return categoryMatch && searchMatch;
    });
    return '<div class="page">' + pageHeader("Integrations", "Connect the apps your employees use. In a real runtime, sending or changing data should require approval.") + '<div class="card" style="margin-bottom:15px"><h3>1,000+ apps</h3><p>Browse app categories or search for a connection. This local prototype does not request OAuth access.</p></div><div class="tabs">' + categories + '</div><div class="search-row"><input class="search-input" id="integration-search" placeholder="Search apps" value="' + esc(state.integrationSearch) + '"></div><div class="integration-list">' + matches.map(function (item) { return '<article class="integration-card"><div><h3>' + esc(item[0]) + '</h3><p>' + esc(item[1]) + '</p></div><button class="button small" data-action="connect-integration" data-integration="' + esc(item[0]) + '">Connect</button></article>'; }).join("") + '</div><div class="demo-note" style="margin-top:12px">Connections are visual placeholders in this prototype.</div></div>';
  }

  function renderWorkflows() {
    const rows = state.workflows.map(function (workflow) { return '<article class="workflow-row"><div><strong>' + esc(workflow.name) + '</strong><span>' + esc(workflow.schedule) + ' · ' + esc(workflow.timeZone) + ' · ' + esc(workflow.prompt) + '</span></div><button class="switch ' + (workflow.active ? "on" : "") + '" data-action="toggle-workflow" data-workflow="' + esc(workflow.id) + '"></button></article>'; }).join("");
    return '<div class="page">' + pageHeader("Workflows", "Workflow schedules can be drafted here. A durable scheduler and automated runs are not connected yet.", '<button class="button primary" data-action="new-workflow">＋ New recurring workflow</button>') + (rows ? rows : '<div class="empty-state"><strong>No recurring workflows yet</strong>Ask the Manager for something recurring or create one here.</div>') + '</div>';
  }

  function renderUsage() {
    const used = Math.min(500, state.goals.length * 18);
    return '<div class="page">' + pageHeader("Usage", "Provider calls are routed directly. Token costs, subscription credits and ad spend are not measured in this prototype.") + '<div class="filter-row"><button class="filter-chip">Last 7 days</button><button class="filter-chip active">Last 30 days</button><button class="filter-chip">Last 90 days</button></div><div class="metric-grid"><div class="metric"><div class="metric-label">SUBSCRIPTION</div><div class="metric-value">Local</div></div><div class="metric"><div class="metric-label">MODEL RUNS</div><div class="metric-value">' + state.goals.reduce(function (sum, goal) { return sum + (Array.isArray(goal.tasks) ? goal.tasks.filter(function (task) { return task.status === "Done"; }).length : 0); }, 0) + '</div></div><div class="metric"><div class="metric-label">MEDIA USAGE</div><div class="metric-value">—</div></div><div class="metric"><div class="metric-label">AD SPEND THIS WEEK</div><div class="metric-value">—</div></div></div><section class="card"><div class="section-title">LOCAL MODEL ROUTING</div><div class="setting-row"><span>Configured employee routes</span><span>' + Object.keys(state.serverRoutes).length + '</span></div><div class="setting-row"><span>Runtime status</span><span>' + (state.apiOnline ? "Ready" : "Offline") + '</span></div><p class="field-help">Provider-specific token usage is not shown yet. Usage values are not billed by Codly Office.</p></section><div class="card-grid" style="margin-top:12px"><section class="card"><div class="section-title">BY CATEGORY</div><p class="muted">Detailed usage reporting is not implemented.</p></section><section class="card"><div class="section-title">BY EMPLOYEE</div><p class="muted">Detailed usage reporting is not implemented.</p></section><section class="card"><div class="section-title">BUDGET CEILINGS</div><p class="muted">Budget enforcement is not implemented.</p></section></div></div>';
  }

  const SETTINGS_TABS = ["General", "Language & market", "Brand", "Autonomy & policies", "Keys", "Budgets", "Plan", "Emergency stop"];

  function settingRow(label, value) {
    return '<div class="setting-row"><span>' + label + '</span><span>' + value + '</span></div>';
  }

  function renderSettings() {
    const interfaceLanguage = window.codlyioI18n?.getLanguage() || "tr";
    const interfaceTheme = window.codlyioI18n?.getTheme() || (localStorage.getItem(THEME_STORE) === "dark" ? "dark" : "light");
    const tabs = SETTINGS_TABS.map(function (tab) { return '<button class="settings-tab ' + (state.settingsTab === tab ? "active" : "") + '" data-settings-tab="' + esc(tab) + '">' + esc(tab) + '</button>'; }).join("");
    let content = "";
    if (state.settingsTab === "General") {
      content = '<h2>General</h2><div class="field"><label>Workspace name</label><input value="' + esc((state.workspaceProfile && state.workspaceProfile.name) || state.settings.workspaceName || "Codlyio Studio") + '" data-workspace-name></div>' + (state.workspaceProfile ? '<div class="workspace-profile-summary"><strong>' + esc(state.workspaceProfile.type || "Workspace") + (state.workspaceProfile.industry ? ' · ' + esc(state.workspaceProfile.industry) : '') + '</strong><span>' + esc(state.workspaceProfile.description || "Workspace profile saved to your account.") + '</span></div>' : '') + '<div class="field"><label>Interface theme</label><select data-theme-setting><option value="light" ' + (interfaceTheme === "light" ? "selected" : "") + '>Light</option><option value="dark" ' + (interfaceTheme === "dark" ? "selected" : "") + '>Dark</option></select><span class="field-help">Choose the appearance used on this device.</span></div><div class="field"><label>Time zone</label><select data-time-zone><option>Europe/Istanbul</option><option>UTC</option><option>Europe/London</option><option>America/New York</option></select></div><button class="button" data-action="save-general">Save</button>' + settingRow("Model runtime", state.apiOnline ? "Local runtime" : "Runtime offline") + settingRow("Workspace sync", cloudUser ? cloudSyncStatus : "Local only") + (cloudUser ? settingRow("Account", esc(cloudUser.email || "Signed in")) : "") + settingRow("Your role", "Owner");
    } else if (state.settingsTab === "Language & market") {
      content = '<h2>Language & market</h2><div class="field"><label>Interface language</label><select data-interface-language><option value="tr" ' + (interfaceLanguage === "tr" ? "selected" : "") + '>Türkçe</option><option value="en" ' + (interfaceLanguage === "en" ? "selected" : "") + '>English</option></select><span class="field-help">The Manager’s replies can follow the interface language.</span></div><div class="field"><label>Default content language</label><input value="' + esc(state.settings.contentLanguage || "tr") + '" data-content-language></div><div class="field"><label>Default target market</label><input value="' + esc(state.settings.targetMarket || "TR") + '" data-target-market></div><button class="button" data-action="save-language">Save</button>';
    } else if (state.settingsTab === "Brand") {
      content = '<h2>Brand brain</h2><p class="page-subtitle">Every employee can read this context before writing, designing or producing output.</p>' + ["Positioning / USP", "Target audience", "Brand voice", "Visual style", "Approved claims", "Never claim", "Preferred calls to action"].map(function (label) { const key = "brand-" + label.toLowerCase().replace(/[^a-z]+/g, "-"); return '<div class="field"><label>' + esc(label) + '</label><textarea data-setting-field="' + key + '" placeholder="Add ' + esc(label.toLowerCase()) + '…">' + esc(state.settings[key] || "") + '</textarea></div>'; }).join("") + '<button class="button" data-action="save-brand">Save brand profile</button>';
    } else if (state.settingsTab === "Autonomy & policies") {
      const mode = state.settings.autonomy || "Approval mode";
      content = '<h2>Autonomy mode</h2><div class="card-grid">' + ["Approval mode", "Guarded autopilot", "Full autopilot"].map(function (option) { return '<button class="card autonomy-card ' + (mode === option ? "selected" : "") + '" data-autonomy="' + esc(option) + '" style="text-align:left;cursor:pointer"><h3>' + esc(option) + '</h3><p>' + (option === "Approval mode" ? "Every risky or external action waits for your approval." : option === "Guarded autopilot" ? "The team works within the permissions and limits you set." : "Broader automation with budget, security and isolation limits.") + '</p></button>'; }).join("") + '</div><h2 style="margin-top:22px">Policies</h2>' + [["Publish social posts without approval", "publishNoApproval"], ["Deploy previews automatically", "autoPreviews"], ["Always require approval for production deploys", "productionApproval"]].map(function (row) { return '<div class="setting-row"><span>' + row[0] + '</span><button class="switch ' + (state.settings[row[1]] ? "on" : "") + '" data-setting-switch="' + row[1] + '"></button></div>'; }).join("") + '<div class="demo-note">Model text tasks run locally through this runtime. Tools, integrations, budgets and external actions are not connected yet.</div>';
    } else if (state.settingsTab === "Keys") {
      content = '<h2>Provider keys</h2><div class="callout">Employee API keys are held in the local runtime process memory and cleared when it exits. They are not encrypted or saved to disk yet. Model prompts go to the provider configured for that employee.</div><div class="card"><h3>AI providers</h3><p>Assign each employee a separate model and endpoint from their profile. Local Ollama and LM Studio routes do not need a cloud API key.</p><div class="card-meta"><button class="button small" data-page="employees">Open employees</button></div></div><div class="card-grid" style="margin-top:12px">' + PROVIDERS.map(function (provider) { return '<article class="card"><p class="eyebrow">PROVIDER</p><h3>' + esc(provider) + '</h3><p>Available as a model route for an employee.</p></article>'; }).join("") + '</div>';
    } else if (state.settingsTab === "Budgets") {
      content = '<h2>Budget policies</h2><p class="page-subtitle">A maximum is a hard ceiling enforced before an external spend action.</p><div class="card"><div class="field"><label>Applies to</label><select data-budget-kind><option>Agent spend</option><option>Media spend</option><option>Ad spend</option></select></div><div class="model-grid"><div class="field"><label>Weekly maximum</label><input type="number" placeholder="0"></div><div class="field"><label>Daily maximum</label><input type="number" placeholder="0"></div><div class="field"><label>Per-campaign maximum</label><input type="number" placeholder="0"></div><div class="field"><label>Single action maximum</label><input type="number" placeholder="0"></div></div><button class="button" data-action="save-budget">Save policy</button></div>';
    } else if (state.settingsTab === "Plan") {
      content = '<h2>Plan</h2><p class="eyebrow">CURRENT PLAN</p><div class="card" style="max-width:420px;margin-bottom:18px"><h3>Free</h3><p>500 credits every month</p></div><p class="eyebrow">REFERENCE PRICES OBSERVED 16 OCT 2026</p><div class="card-grid"><article class="card"><h3>Pro</h3><p>399.90 USD / month</p><p>25,000 credits and 15,000 media credits every month</p></article>' + [["2,000 credits", "$19.90"], ["5,000 credits", "$69.90"], ["10,000 credits", "$89.90"], ["20,000 credits", "$129.90"]].map(function (item) { return '<article class="card"><h3>' + item[0] + '</h3><p>' + item[1] + '</p></article>'; }).join("") + '</div><div class="demo-note">This is a reference page only; no billing or purchase actions are implemented.</div>';
    } else {
      content = '<h2>Emergency stop</h2><div class="callout">Stops additional model task starts after the current provider request finishes. Workflow schedules are local drafts and no external actions are connected.</div>' + settingRow("Current state", state.emergency ? "Stopped" : "Running") + '<button class="button danger" data-action="stop-all">Stop all</button>';
    }
    return '<div class="page">' + pageHeader("Settings", "Workspace, model routing, policies and safety boundaries.") + '<div class="settings-layout"><nav class="settings-tabs">' + tabs + '</nav><section class="settings-content">' + content + '</section></div></div>';
  }

  function render() {
    document.querySelectorAll(".nav-item[data-page]").forEach(function (item) { item.classList.toggle("active", item.dataset.page === state.currentPage || (state.currentPage === "employee" && item.dataset.page === "employees")); });
    const approvalCount = document.getElementById("approval-count");
    approvalCount.classList.add("hidden");
    let html = "";
    switch (state.currentPage) {
      case "office": html = renderOffice(); break;
      case "manager": html = renderManagerPage(); break;
      case "tasks": html = renderTasks(); break;
      case "projects": html = renderProjects(); break;
      case "development": html = renderDevelopment(); break;
      case "artifacts": html = renderArtifacts(); break;
      case "approvals": html = renderApprovals(); break;
      case "activity": html = renderActivity(); break;
      case "content": html = renderContent(); break;
      case "calendar": html = renderCalendar(); break;
      case "campaigns": html = renderCampaigns(); break;
      case "analytics": html = renderAnalytics(); break;
      case "employees": html = renderEmployees(); break;
      case "employee": html = renderEmployeeProfile(); break;
      case "departments": html = renderDepartments(); break;
      case "workflows": html = renderWorkflows(); break;
      case "integrations": html = renderIntegrations(); break;
      case "usage": html = renderUsage(); break;
      case "settings": html = renderSettings(); break;
      default: html = renderOffice();
    }
    view.innerHTML = html;
    const workspaceSwitch = document.getElementById("workspace-switch");
    const accountButton = document.getElementById("account-menu");
    if (workspaceSwitch) {
      const label = workspaceSwitch.firstChild;
      if (label) label.textContent = ((state.workspaceProfile && state.workspaceProfile.name) || state.settings.workspaceName || "Codlyio Studio") + " ";
    }
    if (accountButton) {
      accountButton.textContent = cloudUser && cloudUser.email ? cloudUser.email.slice(0, 1).toUpperCase() : "Y";
      accountButton.title = cloudUser ? cloudUser.email : "Local profile";
    }
    const dmThread = document.querySelector(".dm-thread");
    if (dmThread) dmThread.scrollTop = dmThread.scrollHeight;
    const runtimeMode = document.getElementById("runtime-mode");
    const runtimeIndicator = document.getElementById("runtime-indicator");
    const runtimeDot = document.getElementById("runtime-dot");
    const runtimePillDot = document.getElementById("runtime-pill-dot");
    if (runtimeMode) runtimeMode.textContent = state.apiOnline ? "Local runtime ready" : "Runtime offline";
    if (runtimeIndicator) runtimeIndicator.lastChild.textContent = state.apiOnline ? " Local runtime" : " Offline";
    [runtimeDot, runtimePillDot].forEach(function (dot) { if (dot) dot.classList.toggle("offline", !state.apiOnline); });
    const officeScene = document.getElementById("office-3d");
    if (officeScene) {
      try {
        mountOffice3D(officeScene, state.employees, {
          mapScale: state.mapScale,
          mapRotate: state.mapRotate,
          showNames: state.showNames,
          reduceMotion: state.reduceMotion,
          activity: state.officeActivity,
          selectedEmployee: state.selectedEmployee
        }, function (employeeId) {
          state.selectedEmployee = employeeId;
          state.currentPage = "employee";
          render();
        }, function (person, event, canvasRect) {
          const card = document.getElementById("office-hover-card");
          if (!card) return;
          if (!person) { card.classList.add("hidden"); return; }
          const employeeTasks = state.tasks.filter(function (task) { return task.assigneeId === person.id || task.assignee === person.name; });
          const recentTask = employeeTasks.find(function (task) { return task.status === "Running"; }) || employeeTasks[0];
          const taskLabel = recentTask ? recentTask.title + " · " + (recentTask.status || "Planned") : "No tasks assigned yet";
          const left = Math.max(8, Math.min(event.clientX - canvasRect.left + 14, canvasRect.width - 270));
          const top = Math.max(8, Math.min(event.clientY - canvasRect.top + 14, canvasRect.height - 142));
          card.style.left = left + "px";
          card.style.top = top + "px";
          card.innerHTML = '<div class="hover-name">' + esc(person.name) + '<span>' + esc(person.status) + '</span></div><div class="hover-role">' + esc(person.role) + '</div><div class="hover-department">' + esc(person.department) + '</div><div class="hover-task"><span>RECENT TASK</span><strong>' + esc(taskLabel) + '</strong></div>';
          card.classList.remove("hidden");
        }, function (zoom) { state.mapScale = zoom; });
      } catch (error) {
        setOffice3DVisible(false);
        officeScene.textContent = "The 3D office could not start. Enable WebGL in this browser and reload.";
        officeScene.classList.add("office-3d-error");
      }
    } else setOffice3DVisible(false);
    syncSendButton();
  }

  function syncSendButton() {
    const input = document.getElementById("manager-input");
    const button = document.getElementById("manager-send");
    if (input && button) button.disabled = !input.value.trim() || state.emergency || state.busyManager || Boolean(state.runningGoalId);
  }

  function parseManagerPlan(rawText) {
    const raw = String(rawText || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    let plan;
    try { plan = JSON.parse(raw); }
    catch (error) {
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start < 0 || end <= start) throw new Error("Manager did not return a JSON task plan. Try again with a more specific outcome.");
      try { plan = JSON.parse(raw.slice(start, end + 1)); }
      catch (parseError) { throw new Error("Manager returned an unreadable task plan. Try again."); }
    }
    if (!plan || !Array.isArray(plan.tasks) || !plan.tasks.length) throw new Error("Manager's plan did not include any tasks.");
    const tasks = plan.tasks.slice(0, 8).map(function (item, index) {
      const assigneeValue = String(item.assigneeId || item.assignee || "").trim().toLowerCase();
      const person = state.employees.find(function (candidate) {
        return candidate.id.toLowerCase() === assigneeValue || candidate.name.trim().toLowerCase() === assigneeValue;
      });
      if (!person) throw new Error("Manager assigned a task to an unknown employee. Review the team names and retry.");
      const title = String(item.title || "").trim();
      if (!title) throw new Error("Manager returned a task without a title.");
      return {
        id: "task-" + Date.now() + "-" + index,
        goalId: "goal-" + Date.now(),
        title: title.slice(0, 240),
        deliverable: String(item.deliverable || "").trim().slice(0, 1200),
        assigneeId: person.id,
        assignee: person.name,
        department: person.department,
        status: "Planned",
        output: "",
        error: ""
      };
    });
    return { summary: String(plan.summary || "The Manager created a team plan.").trim().slice(0, 1200), tasks: tasks };
  }

  async function submitGoal(prompt) {
    const clean = String(prompt || "").trim();
    if (!clean) return;
    if (state.emergency) { toast("Emergency stop is on. New tasks are paused."); return; }
    if (handleOfficeIntent(clean)) return;
    if (state.busyManager || state.runningGoalId) return;
    if (!state.apiOnline) { toast("Start the local runtime with npm start first."); return; }
    const manager = employee("staff-0");
    if (!manager || !routeReady(manager)) { toast("Configure a provider, model and API key for Manager under Employees first."); return; }
    state.busyManager = true;
    render();
    const employees = state.employees.map(function (person) {
      return { id: person.id, name: person.name, role: person.role, department: person.department, skills: person.skills };
    });
    const system = "You are the Manager of a small AI employee team. Turn the user's outcome into a practical plan with 2 to 6 text-only tasks. Assign every task to one of the exact employee IDs or names listed below. Do not claim you executed anything. Do not request or perform external actions. Return only valid JSON in this shape: {\"summary\":\"short plan summary\",\"tasks\":[{\"title\":\"task title\",\"assigneeId\":\"staff-1\",\"deliverable\":\"what this employee should return\"}]}. Team: " + JSON.stringify(employees);
    try {
      const result = await apiRequest("/api/chat", { employeeId: manager.id, messages: [{ role: "system", content: system }, { role: "user", content: clean }] });
      const parsed = parseManagerPlan(result.text);
      const goalId = "goal-" + Date.now();
      const tasks = parsed.tasks.map(function (task) { task.goalId = goalId; return task; });
      const goal = { id: goalId, title: clean, summary: parsed.summary, status: "Planned", tasks: tasks, createdAt: new Date().toISOString(), finalReport: "" };
      state.goals.unshift(goal);
      state.tasks = tasks.concat(state.tasks);
      addActivity("Manager created a plan with " + tasks.length + " tasks: " + clean, "goal");
      persist();
      toast("Manager plan is ready. Review it, then choose Run team.");
    } catch (error) {
      toast("Manager could not create the plan: " + error.message);
    } finally {
      state.busyManager = false;
      render();
    }
  }

  function syncTask(task) {
    state.tasks = state.tasks.map(function (item) { return item.id === task.id ? task : item; });
  }

  function normalizeIntent(text) {
    return String(text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function finishOfficeActivity(activityId, silent) {
    const activity = state.officeActivity;
    if (!activity || activity.id !== activityId) return;
    if (activity.timer) clearTimeout(activity.timer);
    activity.participantIds.forEach(function (personId) {
      const person = employee(personId);
      if (person && ["Coffee", "Meeting", "Speaking"].includes(person.status)) person.status = activity.previousStatuses[personId] || "Idle";
    });
    state.officeActivity = null;
    persist();
    render();
    if (!silent) toast(activity.type === "meeting" ? "Meeting ended. Notes are saved in Activity." : "Coffee break is over. The team returned to work.");
  }

  function startCoffeeBreak(ambient) {
    if (state.emergency) { if (!ambient) toast("Emergency stop is on. The team cannot start an office activity."); return; }
    if (state.officeActivity) { toast("Finish the current office activity first."); return; }
    const available = state.employees.filter(function (person) { return person.status === "Idle" && person.id !== "staff-0"; });
    if (!available.length) { toast("No available employees can take a break right now."); return; }
    const participants = available.slice(0, Math.min(3, available.length));
    const previousStatuses = {};
    participants.forEach(function (person) { previousStatuses[person.id] = person.status; person.status = "Coffee"; });
    const activityId = "coffee-" + Date.now();
    state.officeActivity = { id: activityId, type: "coffee", participantIds: participants.map(function (person) { return person.id; }), previousStatuses: previousStatuses };
    state.currentPage = "office";
    addActivity(participants.map(function (person) { return person.name; }).join(", ") + " went to the cafe for a coffee break.", "work");
    persist();
    render();
    if (!ambient) toast("The team is heading to the cafe.");
    state.officeActivity.timer = setTimeout(function () { finishOfficeActivity(activityId, false); }, ambient ? 9000 : 14000);
  }

  function openMeetingModal(subject) {
    const available = state.employees.filter(function (person) { return person.status !== "Offline"; });
    const selectedIds = available.slice(0, 5).map(function (person) { return person.id; });
    const participants = available.map(function (person) {
      const label = '<label class="meeting-participant">' + employeeDot(person) + '<span>' + esc(person.name) + '<small>' + esc(person.role) + '</small></span><input type="checkbox" name="participants" value="' + esc(person.id) + '" ' + (selectedIds.includes(person.id) ? "checked" : "") + '></label>';
      return label;
    }).join("");
    const body = '<form id="meeting-form"><div class="field"><label for="meeting-subject">Meeting topic</label><input id="meeting-subject" name="subject" required value="' + esc(subject || "Team sync") + '" placeholder="What should the team discuss?"></div><div class="meeting-roster"><div class="section-title">ATTENDEES</div>' + participants + '</div><p class="field-help">The Manager and up to six teammates walk to the meeting table. Employees with a saved model route can speak and contribute notes.</p><div class="modal-actions"><button type="button" class="button" data-action="close-modal">Cancel</button><button type="submit" class="button primary">Start meeting</button></div></form>';
    showModal("Call a team meeting", body, "", "meeting-modal");
  }

  async function startMeeting(subject, participantIds) {
    if (state.emergency) { toast("Emergency stop is on. The team cannot start an office activity."); return; }
    if (state.officeActivity) { toast("Finish the current office activity first."); return; }
    const chosen = Array.from(new Set(participantIds)).map(employee).filter(function (person) { return person && person.status !== "Offline"; });
    const manager = employee("staff-0");
    if (manager && !chosen.some(function (person) { return person.id === manager.id; })) chosen.unshift(manager);
    if (chosen.length > 7) chosen.length = 7;
    if (chosen.length < 2) { toast("Choose at least two available team members for a meeting."); return; }
    const previousStatuses = {};
    chosen.forEach(function (person) { previousStatuses[person.id] = person.status; person.status = "Meeting"; });
    const activityId = "meeting-" + Date.now();
    const session = {
      id: activityId,
      type: "meeting",
      subject: String(subject || "Team sync").trim().slice(0, 240),
      participantIds: chosen.map(function (person) { return person.id; }),
      participantNames: chosen.map(function (person) { return person.name; }),
      previousStatuses: previousStatuses,
      speakerId: "",
      timer: null
    };
    state.officeActivity = session;
    state.currentPage = "office";
    state.managerTab = "activity";
    addActivity("Team meeting started: " + session.subject, "meeting");
    persist();
    render();
    closeModal();
    toast("The team is gathering in the meeting room.");
    await runMeetingDiscussion(session);
  }

  async function runMeetingDiscussion(session) {
    const speakers = session.participantIds.map(employee).filter(function (person) { return person && person.id !== "staff-0" && routeReady(person); });
    const manager = employee("staff-0");
    const notes = [];
    const unavailable = session.participantIds.map(employee).filter(function (person) { return person && person.id !== "staff-0" && !routeReady(person); }).map(function (person) { return person.name; });
    if (!speakers.length || !state.apiOnline) {
      session.summary = "The team gathered in the 3D meeting room. Add model routes to attendees to generate discussion and meeting notes.";
      session.notes = unavailable.length ? "No model route for: " + unavailable.join(", ") : "The local model runtime is offline.";
      state.meetings.unshift({ subject: session.subject, participants: session.participantIds, participantNames: session.participantNames, summary: session.summary, notes: session.notes, createdAt: new Date().toISOString() });
      addActivity("Meeting held in the office; no attendee model routes were ready to contribute.", "meeting");
      persist();
      render();
      session.timer = setTimeout(function () { finishOfficeActivity(session.id, false); }, 16000);
      return;
    }

    for (const person of speakers) {
      if (state.officeActivity !== session) return;
      person.status = "Speaking";
      session.speakerId = person.id;
      render();
      try {
        const prior = notes.map(function (note) { return note.name + ": " + note.text; }).join("\n\n");
        const response = await apiRequest("/api/chat", { employeeId: person.id, messages: [
          { role: "system", content: "You are " + person.name + ", " + person.role + ". You are in a short internal team meeting. Give one useful point, one recommendation, and any risk. Stay within 100 words. Do not claim to use tools or change external systems." },
          { role: "user", content: "Meeting topic: " + session.subject + (prior ? "\n\nTeam discussion so far:\n" + prior : "") + "\n\nShare your contribution for the team." }
        ] });
        notes.push({ name: person.name, text: response.text });
        addActivity(person.name + " spoke in the meeting: " + session.subject, "meeting");
      } catch (error) {
        notes.push({ name: person.name, text: "Could not join the discussion: " + error.message });
      }
      if (state.officeActivity !== session) return;
      person.status = "Meeting";
      session.speakerId = "";
      render();
    }

    let summary = "";
    if (manager && routeReady(manager) && state.officeActivity === session) {
      manager.status = "Speaking";
      session.speakerId = manager.id;
      render();
      try {
        const transcript = notes.map(function (note) { return note.name + ":\n" + note.text; }).join("\n\n");
        const response = await apiRequest("/api/chat", { employeeId: manager.id, messages: [
          { role: "system", content: "You are the team Manager. Summarize this internal meeting in clear, concise notes with decisions and next steps. Do not invent commitments or claim external actions." },
          { role: "user", content: "Meeting topic: " + session.subject + "\n\nAttendee contributions:\n" + transcript }
        ] });
        summary = response.text;
      } catch (error) { summary = "Meeting summary could not be generated: " + error.message; }
    }
    if (state.officeActivity !== session) return;
    if (manager && manager.status === "Speaking") manager.status = "Meeting";
    session.speakerId = "";
    const transcript = notes.map(function (note) { return note.name + ":\n" + note.text; }).join("\n\n");
    const missed = unavailable.length ? "No model route: " + unavailable.join(", ") + "\n\n" : "";
    summary = summary || (notes.length ? "Meeting discussion finished. Review the attendee notes below." : "No model responses were available.");
    state.meetings.unshift({ subject: session.subject, participants: session.participantIds, participantNames: session.participantNames, summary: summary, notes: missed + transcript, createdAt: new Date().toISOString() });
    addActivity("Manager wrapped up the meeting: " + session.subject, "meeting");
    persist();
    render();
    toast("Meeting notes are ready in Activity.");
    session.timer = setTimeout(function () { finishOfficeActivity(session.id, false); }, 10000);
  }

  function handleOfficeIntent(prompt) {
    const normalized = normalizeIntent(prompt);
    if (/\b(kahve|coffee|kahve molasi|coffee break|kahve icmeye)\b/.test(normalized)) {
      startCoffeeBreak(false);
      return true;
    }
    if (/\b(toplanti|meeting|meet with|gorusme|ekibi topla)\b/.test(normalized)) {
      const named = state.employees.filter(function (person) {
        if (person.id === "staff-0" || person.status === "Offline") return false;
        return normalized.includes(normalizeIntent(person.name));
      });
      const manager = employee("staff-0");
      const defaultAttendees = named.length ? named : state.employees.filter(function (person) { return person.id !== "staff-0" && person.status !== "Offline"; }).slice(0, 4);
      const attendeeIds = (manager ? [manager.id] : []).concat(defaultAttendees.map(function (person) { return person.id; }));
      startMeeting(prompt, attendeeIds);
      return true;
    }
    return false;
  }

  function scheduleAmbientCoffee() {
    clearTimeout(ambientCoffeeTimer);
    ambientCoffeeTimer = setTimeout(function () {
      const available = state.employees.some(function (person) { return person.status === "Idle"; });
      if (!state.emergency && state.currentPage === "office" && !state.officeActivity && !state.runningGoalId && available && Math.random() < 0.28) startCoffeeBreak(true);
      scheduleAmbientCoffee();
    }, 42000);
  }

  async function runGoal(goalId) {
    const goal = state.goals.find(function (item) { return item.id === goalId; });
    const manager = employee("staff-0");
    if (!goal || state.runningGoalId || state.emergency) return;
    if (state.officeActivity && state.officeActivity.type === "meeting") { toast("End the team meeting before starting another goal."); return; }
    if (state.officeActivity && state.officeActivity.type === "coffee") finishOfficeActivity(state.officeActivity.id, true);
    if (!state.apiOnline) { toast("Start the local runtime with npm start first."); return; }
    if (!manager || !routeReady(manager)) { toast("Manager's model route is not available. Reconfigure it before running this team."); return; }
    state.runningGoalId = goal.id;
    goal.status = "Running";
    persist();
    render();
    try {
      for (const task of goal.tasks) {
        if (task.status === "Done") continue;
        if (state.emergency) { task.status = "Needs attention"; task.error = "Emergency stop was enabled before this task started."; syncTask(task); break; }
        const person = employee(task.assigneeId) || findEmployee(task.assignee);
        if (!person || !routeReady(person)) {
          task.status = "Needs attention";
          task.error = "Configure this employee's provider, model and API key before running the task.";
          syncTask(task);
          addActivity(task.assignee + " needs a model route before: " + task.title, "system");
          persist();
          render();
          continue;
        }
        const priorStatus = person.status;
        person.status = "Working";
        task.status = "Running";
        task.error = "";
        syncTask(task);
        addActivity(person.name + " started: " + task.title, "work");
        persist();
        render();
        const previousWork = goal.tasks.filter(function (other) { return other !== task && other.status === "Done"; }).map(function (other) {
          return "Task: " + other.title + "\nEmployee: " + other.assignee + "\nResult:\n" + other.output;
        }).join("\n\n");
        const instructions = [person.instructions, "Skills: " + person.skills, "Task: " + task.title, "Expected deliverable: " + (task.deliverable || task.title)].filter(Boolean).join("\n\n");
        const userContent = "Overall outcome: " + goal.title + "\n\n" + instructions + (previousWork ? "\n\nCompleted teammate work:\n" + previousWork : "") + "\n\nReturn your text deliverable. Do not claim you used tools or changed external systems.";
        try {
          const result = await apiRequest("/api/chat", { employeeId: person.id, messages: [{ role: "system", content: "You are " + person.name + ", a " + person.role + " in " + person.department + ". Work only on the assigned text task. Do not use tools or claim external actions." }, { role: "user", content: userContent }] });
          task.output = result.text;
          task.status = "Done";
          addActivity(person.name + " completed: " + task.title, "work");
        } catch (error) {
          task.status = "Needs attention";
          task.error = error.message;
          addActivity(person.name + " needs attention: " + error.message, "system");
        } finally {
          person.status = priorStatus === "Offline" ? "Offline" : "Idle";
          syncTask(task);
          persist();
          render();
        }
      }
      if (goal.tasks.every(function (task) { return task.status === "Done"; })) {
        addActivity("Manager is reviewing the team's deliverables.", "work");
        render();
        const work = goal.tasks.map(function (task) { return "Task: " + task.title + "\nEmployee: " + task.assignee + "\nDeliverable:\n" + task.output; }).join("\n\n---\n\n");
        const review = await apiRequest("/api/chat", { employeeId: manager.id, messages: [
          { role: "system", content: "You are the Manager. Review the employee deliverables against the user's outcome. Give a concise final report, note gaps honestly, and do not claim external actions." },
          { role: "user", content: "Outcome: " + goal.title + "\n\nEmployee deliverables:\n" + work }
        ] });
        goal.finalReport = review.text;
        goal.status = "Done";
        addActivity("Manager delivered the completed result for: " + goal.title, "goal");
      } else {
        goal.status = "Needs attention";
      }
    } catch (error) {
      goal.status = "Needs attention";
      addActivity("Team run stopped: " + error.message, "system");
    } finally {
      state.runningGoalId = "";
      persist();
      render();
      toast(goal.status === "Done" ? "The team finished. Manager's final report is ready." : "The team run needs attention. Check task details and model routes.");
    }
  }

  async function saveEmployeeRoute(employeeId) {
    const person = employee(employeeId);
    if (!person) return;
    const provider = document.getElementById("employee-provider");
    const model = document.getElementById("employee-model");
    const url = document.getElementById("employee-url");
    const key = document.getElementById("employee-key");
    const providerName = provider ? provider.value : "";
    const modelName = model ? model.value.trim() : "";
    const baseUrl = url ? url.value.trim() : "";
    if (!state.apiOnline) { toast("Start the local runtime with npm start first."); return; }
    if (!providerName || !modelName) { toast("Choose a provider and enter a model ID first."); return; }
    try {
      const result = await apiRequest("/api/routes", {
        employeeId: person.id,
        provider: providerName,
        model: modelName,
        baseUrl: baseUrl,
        apiKey: key ? key.value.trim() : ""
      });
      person.provider = providerName;
      person.model = modelName;
      person.baseUrl = baseUrl;
      state.serverRoutes[person.id] = result.route;
      if (key) key.value = "";
      persist();
      render();
      toast("Model route saved in the local runtime.");
    } catch (error) {
      toast("Could not save route: " + error.message);
    }
  }

  async function clearProviderKey(employeeId) {
    try {
      const result = await apiRequest("/api/routes/clear-key", { employeeId: employeeId });
      if (result.route) state.serverRoutes[employeeId] = result.route;
      render();
      toast("The in-memory provider key was cleared.");
    } catch (error) {
      toast("Could not clear key: " + error.message);
    }
  }

  function viewTask(taskId) {
    const task = state.tasks.find(function (item) { return item.id === taskId; });
    if (!task) return;
    const content = task.error ? '<p class="callout">' + esc(task.error) + '</p>' : '<pre class="task-output">' + esc(task.output || "No output yet.") + '</pre>';
    showModal(task.title, content);
  }

  function openWorkflowModal() {
    const body = '<form id="workflow-form"><div class="field"><label>Name</label><input name="name" required placeholder="Weekly report"></div><div class="field"><label>What should the team do each time?</label><textarea name="prompt" required placeholder="Summarize last week’s work…"></textarea></div><div class="field"><label>Schedule</label><select name="schedule"><option>Every day at 09:00</option><option>Weekdays at 09:00</option><option>Mondays at 09:00</option><option>Mon, Wed, Fri at 10:00</option><option>Custom</option></select></div><div class="field hidden" id="cron-field"><label>Cron expression</label><input name="cron" placeholder="0 9 * * 1"><span class="field-help">minute hour day-of-month month day-of-week</span></div><div class="field"><label>Time zone</label><select name="timeZone"><option>Europe/Istanbul</option><option>UTC</option><option>Europe/London</option></select></div><div class="modal-actions"><button type="button" class="button" data-action="close-modal">Cancel</button><button type="submit" class="button primary">Create workflow</button></div></form>';
    showModal("New recurring workflow", body);
  }

  function employeeByRow(target) {
    const item = target.closest("tr[data-employee], .team-person[data-employee], .office-person[data-employee], .card button[data-employee]:not([data-action])");
    if (!item) return null;
    return employee(item.dataset.employee);
  }

  document.addEventListener("click", function (event) {
    const target = event.target;
    const authModeButton = target.closest("[data-auth-mode]");
    if (authModeButton) {
      authMode = authModeButton.dataset.authMode;
      showAuthScreen();
      return;
    }
    const nav = target.closest("[data-page]");
    if (nav) {
      const employeeId = nav.dataset.employee;
      if (employeeId) { state.selectedEmployee = employeeId; state.currentPage = "employee"; render(); return; }
      navTo(nav.dataset.page);
      return;
    }
    const employeeItem = employeeByRow(target);
    if (employeeItem) {
      state.selectedEmployee = employeeItem.id;
      state.currentPage = "employee";
      render();
      return;
    }
    const action = target.closest("[data-action]");
    if (action) {
      const name = action.dataset.action;
      if (name === "close-modal" || (name === "backdrop-close" && target === action)) closeModal();
      else if (name === "sign-out") {
        if (workspaceStore) workspaceStore.signOut().catch(function (error) { toast("Could not sign out: " + error.message); });
        closeModal();
      }
      else if (name === "new-workflow") openWorkflowModal();
      else if (name === "new-meeting") openMeetingModal();
      else if (name === "coffee-break") startCoffeeBreak(false);
      else if (name === "end-office-activity" && state.officeActivity) finishOfficeActivity(state.officeActivity.id, false);
      else if (name === "zoom-in") { state.mapScale = Math.min(MAX_MAP_SCALE, state.mapScale + .12); render(); }
      else if (name === "zoom-out") { state.mapScale = Math.max(.62, state.mapScale - .12); render(); }
      else if (name === "rotate-map") { state.mapRotate = (state.mapRotate + 45) % 360; render(); }
      else if (name === "fit-map") { state.mapScale = 1.1; state.mapRotate = 0; render(); }
      else if (name === "team-toggle") { state.showNames = !state.showNames; render(); }
      else if (name === "toggle-team-list") { state.teamListOpen = !state.teamListOpen; render(); }
      else if (name === "toggle-manager-panel") { state.managerPanelOpen = !state.managerPanelOpen; render(); }
      else if (name === "back-employees") navTo("employees");
      else if (name === "run-goal") { runGoal(action.dataset.goal); return; }
      else if (name === "view-task") { viewTask(action.dataset.task); return; }
      else if (name === "save-instructions") {
        const person = employee(action.dataset.employee);
        const input = document.getElementById("employee-instructions");
        if (person && input) { person.instructions = input.value; persist(); toast(cloudUser ? "Instructions saved; syncing workspace." : "Instructions saved locally."); }
      } else if (name === "save-provider") {
        saveEmployeeRoute(action.dataset.employee);
        return;
      } else if (name === "clear-provider-key") {
        clearProviderKey(action.dataset.employee);
        return;
      } else if (name === "save-name") {
        const person = employee(action.dataset.employee);
        const input = document.querySelector("[data-name-for='" + action.dataset.employee + "']");
        if (person && input && input.value.trim()) { person.name = input.value.trim(); persist(); render(); toast("Employee name saved."); }
      } else if (name === "toggle-task") {
        const task = state.tasks.find(function (item) { return item.id === action.dataset.task; });
        if (task) { task.status = task.status === "Done" ? "Planned" : "Done"; persist(); render(); }
      } else if (name === "calendar-prev" || name === "calendar-next") {
        state.calendarDate.setMonth(state.calendarDate.getMonth() + (name === "calendar-prev" ? -1 : 1)); render();
      } else if (name === "calendar-today") { state.calendarDate = new Date(); render(); }
      else if (name === "stop-all") {
      showModal("Stop all work?", '<p class="page-subtitle">This pauses new task starts. A model request already in progress will finish before the team stops.</p><div class="modal-actions"><button class="button" data-action="close-modal">Cancel</button><button class="button danger" data-action="confirm-stop">Stop all</button></div>');
      } else if (name === "confirm-stop") {
        state.emergency = true;
        if (state.officeActivity) finishOfficeActivity(state.officeActivity.id, true);
        state.workflows.forEach(function (workflow) { workflow.active = false; });
        addActivity("Emergency stop enabled. No additional task will start after the current model request finishes.", "system");
        persist(); closeModal(); render(); toast("The team will stop after the current model request.");
      } else if (name === "connect-integration") toast(action.dataset.integration + " is a placeholder; OAuth is not connected.");
      else if (name === "toggle-workflow") {
        const workflow = state.workflows.find(function (item) { return item.id === action.dataset.workflow; });
        if (workflow) { workflow.active = !workflow.active && !state.emergency; persist(); render(); }
      } else if (name === "save-general") {
        const nameInput = document.querySelector("[data-workspace-name]");
        if (nameInput) {
          state.settings.workspaceName = nameInput.value.trim();
          if (state.workspaceProfile) state.workspaceProfile.name = nameInput.value.trim();
        }
        persist(); render(); toast(cloudUser ? "Workspace preferences saved; syncing." : "Workspace preferences saved locally.");
      } else if (name === "save-language") {
        const lang = document.querySelector("[data-content-language]");
        const market = document.querySelector("[data-target-market]");
        if (lang) state.settings.contentLanguage = lang.value.trim();
        if (market) state.settings.targetMarket = market.value.trim();
        persist(); render(); toast(cloudUser ? "Language preferences saved; syncing." : "Language preferences saved locally.");
      } else if (name === "save-brand") {
        document.querySelectorAll("[data-setting-field]").forEach(function (field) { state.settings[field.dataset.settingField] = field.value; });
        persist(); toast(cloudUser ? "Brand profile saved; syncing." : "Brand profile saved locally.");
      } else if (name === "save-budget") toast("Budget limits are not enforced by this UI-only prototype.");
      return;
    }
    const managerTab = target.closest("[data-manager-tab]");
    if (managerTab) { state.managerTab = managerTab.dataset.managerTab; render(); return; }
    const suggestion = target.closest("[data-suggestion]");
    if (suggestion) {
      const input = document.getElementById("manager-input");
      if (input) { input.value = suggestion.dataset.suggestion; input.focus(); syncSendButton(); }
      return;
    }
    const taskTab = target.closest("[data-task-tab]");
    if (taskTab) { state.taskTab = taskTab.dataset.taskTab; render(); return; }
    const taskFilter = target.closest("[data-task-filter]");
    if (taskFilter) { state.taskFilter = taskFilter.dataset.taskFilter; render(); return; }
    const approvalTab = target.closest("[data-approval-tab]");
    if (approvalTab) { state.approvalTab = approvalTab.dataset.approvalTab; render(); return; }
    const integrationCategory = target.closest("[data-integration-category]");
    if (integrationCategory) { state.integrationCategory = integrationCategory.dataset.integrationCategory; render(); return; }
    const calendarMode = target.closest("[data-calendar-mode]");
    if (calendarMode) { state.calendarMode = calendarMode.dataset.calendarMode; render(); return; }
    const settingsTab = target.closest("[data-settings-tab]");
    if (settingsTab) { state.settingsTab = settingsTab.dataset.settingsTab; render(); return; }
    const autonomy = target.closest("[data-autonomy]");
    if (autonomy) { state.settings.autonomy = autonomy.dataset.autonomy; persist(); render(); return; }
    const switchButton = target.closest("[data-setting-switch]");
    if (switchButton) {
      const key = switchButton.dataset.settingSwitch;
      state.settings[key] = !state.settings[key];
      persist(); render(); return;
    }
    if (target.closest("#workspace-switch")) toast("Only one local workspace is available in this prototype.");
    if (target.closest("#notifications-button")) toast("No new notifications.");
    if (target.closest("#account-menu")) {
      if (cloudUser) {
        showModal("Account", '<p class="page-subtitle">Signed in as <strong>' + esc(cloudUser.email || "") + '</strong></p><div class="setting-row"><span>Workspace sync</span><span>' + esc(cloudSyncStatus) + '</span></div><p class="field-help">Model provider keys stay on this device’s local runtime.</p>', '<div class="modal-actions"><button class="button" data-action="close-modal">Close</button><button class="button danger" data-action="sign-out">Sign out</button></div>');
      } else toast("Local demo profile.");
    }
    if (target.closest("#stop-all")) {
      showModal("Stop all work?", '<p class="page-subtitle">This pauses new task starts and ends office activities. Any provider request already in progress will finish.</p><div class="modal-actions"><button class="button" data-action="close-modal">Cancel</button><button class="button danger" data-action="confirm-stop">Stop all</button></div>');
    }
  });

  document.addEventListener("input", function (event) {
    if (event.target.id === "manager-input") syncSendButton();
    if (event.target.id === "integration-search") {
      state.integrationSearch = event.target.value;
      const caret = event.target.selectionStart;
      render();
      const next = document.getElementById("integration-search");
      if (next) { next.focus(); next.setSelectionRange(caret, caret); }
    }
  });

  document.addEventListener("change", function (event) {
    const input = event.target;
    if (input.matches("[data-interface-language]")) {
      window.codlyioI18n?.setLanguage(input.value);
      render();
      return;
    }
    if (input.matches("[data-theme-setting]")) {
      applyStudioTheme(input.value);
      return;
    }
    if (input.dataset.option === "showNames") { state.showNames = input.checked; render(); }
    if (input.dataset.option === "reduceMotion") { state.reduceMotion = input.checked; render(); }
    if (input.dataset.providerFor) {
      const person = employee(input.dataset.providerFor);
      if (person) {
        person.provider = input.value;
        person.baseUrl = PROVIDER_URLS[input.value] || "";
        const endpoint = document.getElementById("employee-url");
        if (endpoint) endpoint.value = person.baseUrl;
        persist();
      }
    }
    if (input.dataset.modelFor || input.dataset.urlFor) {
      const personId = input.dataset.modelFor || input.dataset.urlFor;
      const person = employee(personId);
      if (person) {
        if (input.dataset.modelFor) person.model = input.value;
        if (input.dataset.urlFor) person.baseUrl = input.value;
        persist();
      }
    }
    if (input.name === "schedule") {
      const cron = document.getElementById("cron-field");
      if (cron) cron.classList.toggle("hidden", input.value !== "Custom");
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.target.id === "manager-input" && event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      submitGoal(event.target.value);
    }
    if (event.key === "Escape") closeModal();
  });

  document.addEventListener("submit", async function (event) {
    if (event.target.id === "auth-form") {
      event.preventDefault();
      if (!workspaceStore) return;
      const data = new FormData(event.target);
      const email = String(data.get("email") || "").trim();
      const password = String(data.get("password") || "");
      try {
        const result = authMode === "signup"
          ? await workspaceStore.signUp(email, password)
          : await workspaceStore.signIn(email, password);
        if (result.user && result.session) await activateCloudUser(result.user);
        else if (authMode === "signup") showAuthScreen("Hesap oluşturuldu. Giriş yapmadan önce e-postanı doğrulaman gerekebilir.");
      } catch (error) {
        showAuthScreen(error.message || "Giriş işlemi tamamlanamadı.", true);
      }
    } else if (event.target.id === "workspace-profile-form") {
      event.preventDefault();
      const data = new FormData(event.target);
      const name = String(data.get("name") || "").trim();
      if (!name) return;
      state.workspaceProfile = {
        name: name,
        type: String(data.get("type") || "Company"),
        industry: String(data.get("industry") || ""),
        description: String(data.get("description") || "").trim(),
        website: String(data.get("website") || "").trim(),
        createdAt: state.workspaceProfile && state.workspaceProfile.createdAt ? state.workspaceProfile.createdAt : new Date().toISOString()
      };
      state.settings.workspaceName = name;
      persist();
      hideWorkspaceOnboarding();
      render();
      toast("Workspace profile saved to your account.");
    } else if (event.target.id === "manager-form") {
      event.preventDefault();
      const input = document.getElementById("manager-input");
      submitGoal(input ? input.value : "");
    } else if (event.target.id === "workflow-form") {
      event.preventDefault();
      const data = new FormData(event.target);
      const schedule = data.get("schedule") === "Custom" ? "Cron " + String(data.get("cron") || "") : String(data.get("schedule"));
      state.workflows.unshift({ id: "flow-" + Date.now(), name: String(data.get("name")), prompt: String(data.get("prompt")), schedule: schedule, timeZone: String(data.get("timeZone")), active: !state.emergency });
      addActivity("Recurring workflow created locally: " + String(data.get("name")), "workflow");
      persist(); closeModal(); render(); toast("Local recurring workflow created. No scheduled run was started.");
    } else if (event.target.id === "employee-message-form") {
      event.preventDefault();
      const person = employee(event.target.dataset.employee);
      const data = new FormData(event.target);
      const message = String(data.get("message") || "").trim();
      if (person && message) sendEmployeeMessage(person.id, message);
    } else if (event.target.id === "meeting-form") {
      event.preventDefault();
      const data = new FormData(event.target);
      startMeeting(String(data.get("subject") || "Team sync"), data.getAll("participants").map(String));
    }
  });

  render();
  syncRuntime();
  scheduleAmbientCoffee();
  initializeWorkspace();
})();
