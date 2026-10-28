// ========================================================
// QuickNotes Application Logic
// ========================================================

// ---------- 1. DOM Element Selectors ----------
// Note Composer & Counters (Preserved Day 4 Elements)
const noteText = document.querySelector("#note-text");
const charCount = document.querySelector("#char-count");
const wordCount = document.querySelector("#word-count");
const clearBtn = document.querySelector("#clear-btn");
const saveNoteBtn = document.querySelector("#save-note-btn");
const saveStatus = document.querySelector("#save-status");
const themeToggle = document.querySelector("#theme-toggle");
const themeSwitch = document.querySelector("#theme-switch");

// Notes Collection & Search
const searchNotesInput = document.querySelector("#search-notes");
const notesList = document.querySelector("#notes-list");
const noNotesState = document.querySelector("#no-notes-state");
const notesCount = document.querySelector("#notes-count");
const jumpToNotesBtn = document.querySelector("#jump-to-notes-btn");

// Profile & Login
const displayNameInput = document.querySelector("#display-name");
const loginEmailInput = document.querySelector("#login-email");
const saveProfileBtn = document.querySelector("#save-profile-btn");
const headerAvatar = document.querySelector("#header-avatar");
const headerName = document.querySelector("#header-name");
const welcomeName = document.querySelector("#welcome-name");
const authStatusText = document.querySelector("#auth-status-text");
const userPill = document.querySelector("#user-pill");

// Tasks
const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const taskEmptyState = document.querySelector("#task-empty-state");
const clearDoneTasksBtn = document.querySelector("#clear-done-tasks");

// Date & Time Displays
const liveDate = document.querySelector("#live-date");
const liveTime = document.querySelector("#live-time");
const statusClock = document.querySelector("#status-clock");

// Navigation & Drawer
const menuBtn = document.querySelector("#menu-btn");
const navDrawer = document.querySelector("#nav-drawer");
const drawerBackdrop = document.querySelector("#drawer-backdrop");
const closeDrawerBtn = document.querySelector("#close-drawer");
const tabButtons = document.querySelectorAll(".tab-btn");
const tabSections = document.querySelectorAll(".tab-section");

// Device Switcher (Mobile vs Landscape)
const viewportContainer = document.querySelector("#viewport-container");
const btnViewMobile = document.querySelector("#btn-view-mobile");
const btnViewLandscape = document.querySelector("#btn-view-landscape");

// ---------- 2. Storage Keys ----------
const DRAFT_KEY = "draft";
const THEME_KEY = "theme";
const USER_KEY = "quicknotes_user";
const TASKS_KEY = "quicknotes_tasks";
const NOTES_KEY = "quicknotes_saved_notes";
const VIEW_MODE_KEY = "quicknotes_view_mode";

// ---------- 3. Live Date & Time Updates ----------
function updateLiveClock() {
  const now = new Date();
  
  // Format Date: e.g. "Thursday, October 22, 2026"
  const dateOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  const formattedDate = now.toLocaleDateString("en-US", dateOptions);
  
  // Format Time: e.g. "12:10 PM"
  const timeOptions = { hour: "numeric", minute: "2-digit", hour12: true };
  const formattedTime = now.toLocaleTimeString("en-US", timeOptions);

  if (liveDate) liveDate.textContent = formattedDate;
  if (liveTime) liveTime.textContent = formattedTime;
  if (statusClock) statusClock.textContent = formattedTime;
}

// Initial tick and run every 10 seconds
updateLiveClock();
setInterval(updateLiveClock, 10000);

// ---------- 4. Character & Word Counting (Day 4 Core) ----------
function updateCounts() {
  if (!noteText) return;
  const text = noteText.value;
  const chars = text.length;

  const trimmed = text.trim();
  const words = trimmed === "" ? 0 : trimmed.split(/\s+/).length;

  charCount.textContent = `${chars} / 200 characters`;
  wordCount.textContent = `${words} words`;

  if (chars > 200) {
    charCount.classList.remove("warning");
    charCount.classList.add("over");
  } else if (chars > 180) {
    charCount.classList.add("warning");
    charCount.classList.remove("over");
  } else {
    charCount.classList.remove("warning");
    charCount.classList.remove("over");
  }

  // Update draft indicator
  if (saveStatus) {
    saveStatus.textContent = chars > 0 ? "Draft saved" : "Ready";
  }
}

// Helper functions for draft saving
function saveDraft(text) {
  localStorage.setItem(DRAFT_KEY, text);
  localStorage.setItem("note_draft", text);
}

function removeDraft() {
  localStorage.removeItem(DRAFT_KEY);
  localStorage.removeItem("note_draft");
}

function getSavedDraft() {
  return localStorage.getItem(DRAFT_KEY) ?? localStorage.getItem("note_draft");
}

function clearAll() {
  if (!noteText) return;
  noteText.value = "";
  removeDraft();
  updateCounts();
  noteText.focus();
}

// ---------- 5. Theme Palette (Champagne vs Midnight) ----------
function applyTheme(isDark) {
  if (isDark) {
    document.body.classList.add("dark");
    document.body.classList.add("palette-midnight");
    document.body.classList.remove("palette-champagne");
    if (themeToggle) themeToggle.textContent = "Light mode";
    if (themeSwitch) themeSwitch.checked = true;
    localStorage.setItem(THEME_KEY, "dark");
  } else {
    document.body.classList.remove("dark");
    document.body.classList.remove("palette-midnight");
    document.body.classList.add("palette-champagne");
    if (themeToggle) themeToggle.textContent = "Dark mode";
    if (themeSwitch) themeSwitch.checked = false;
    localStorage.setItem(THEME_KEY, "light");
  }
}

function toggleTheme() {
  const isCurrentlyDark = document.body.classList.contains("dark") || document.body.classList.contains("palette-midnight");
  applyTheme(!isCurrentlyDark);
}

// ---------- 6. User Profile & Login Info ----------
function loadProfile() {
  const savedUser = JSON.parse(localStorage.getItem(USER_KEY)) || {
    name: "Iantha",
    email: "iantha@quicknotes.app"
  };

  if (displayNameInput) displayNameInput.value = savedUser.name;
  if (loginEmailInput) loginEmailInput.value = savedUser.email;
  updateUserUI(savedUser.name);
}

function updateUserUI(name) {
  const safeName = name.trim() || "Guest";
  const initial = safeName.charAt(0).toUpperCase();

  if (headerAvatar) headerAvatar.textContent = initial;
  if (headerName) headerName.textContent = safeName;
  if (welcomeName) welcomeName.textContent = safeName;
  if (authStatusText) {
    authStatusText.innerHTML = `Logged in as <strong>${safeName}</strong> (Offline Persistence Active)`;
  }
}

function saveProfile() {
  const name = displayNameInput.value.trim() || "Iantha";
  const email = loginEmailInput.value.trim() || "iantha@quicknotes.app";

  const user = { name, email };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  updateUserUI(name);

  // Temporary visual feedback on save button
  saveProfileBtn.textContent = "Saved ✓";
  setTimeout(() => {
    saveProfileBtn.textContent = "Save";
  }, 1600);
}

// ---------- 7. Tasks Management (Photo 2 & 4) ----------
let tasks = JSON.parse(localStorage.getItem(TASKS_KEY)) || [
  { id: 1, text: "Review Day 8 system design architecture", done: false },
  { id: 2, text: "Prepare QuickNotes capstone presentation", done: true }
];

function renderTasks() {
  if (!taskList) return;
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    if (taskEmptyState) taskEmptyState.style.display = "block";
    return;
  }

  if (taskEmptyState) taskEmptyState.style.display = "none";

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = `task-item ${task.done ? "done" : ""}`;
    li.innerHTML = `
      <div class="task-content">
        <input type="checkbox" class="task-checkbox" ${task.done ? "checked" : ""} aria-label="Mark task done">
        <span class="task-text">${escapeHtml(task.text)}</span>
      </div>
      <button type="button" class="task-del-btn" title="Delete task">&times;</button>
    `;

    // Toggle Check
    li.querySelector(".task-checkbox").addEventListener("change", () => {
      task.done = !task.done;
      saveTasks();
      renderTasks();
    });

    // Delete Task
    li.querySelector(".task-del-btn").addEventListener("click", () => {
      tasks = tasks.filter((t) => t.id !== task.id);
      saveTasks();
      renderTasks();
    });

    taskList.appendChild(li);
  });
}

function saveTasks() {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  const newTask = {
    id: Date.now(),
    text: text,
    done: false
  };

  tasks.unshift(newTask);
  saveTasks();
  renderTasks();
  taskInput.value = "";
  taskInput.focus();
}

function clearDoneTasks() {
  tasks = tasks.filter((t) => !t.done);
  saveTasks();
  renderTasks();
}

// ---------- 8. Saved Notes Collection & Search ----------
let savedNotes = JSON.parse(localStorage.getItem(NOTES_KEY)) || [
  {
    id: 1,
    content: "QuickNotes gives instant live word counts and keeps transient thoughts organized.",
    createdAt: "Today at 12:05 PM"
  }
];

function renderSavedNotes(filterTerm = "") {
  if (!notesList) return;
  notesList.innerHTML = "";

  const term = filterTerm.toLowerCase().trim();
  const filtered = savedNotes.filter((note) => note.content.toLowerCase().includes(term));

  if (notesCount) {
    notesCount.textContent = `${savedNotes.length} note${savedNotes.length === 1 ? "" : "s"}`;
  }

  if (filtered.length === 0) {
    if (noNotesState) {
      noNotesState.style.display = "block";
      noNotesState.textContent = term
        ? "No notes matched your search."
        : "No notes saved yet. Type a note above and click Save!";
    }
    return;
  }

  if (noNotesState) noNotesState.style.display = "none";

  filtered.forEach((note) => {
    const li = document.createElement("li");
    li.className = "note-card-item";
    li.innerHTML = `
      <div class="note-card-header">
        <span>${escapeHtml(note.createdAt)}</span>
        <button type="button" class="note-delete-btn" title="Delete note">&times;</button>
      </div>
      <div class="note-card-body">${escapeHtml(note.content)}</div>
    `;

    li.querySelector(".note-delete-btn").addEventListener("click", () => {
      savedNotes = savedNotes.filter((n) => n.id !== note.id);
      localStorage.setItem(NOTES_KEY, JSON.stringify(savedNotes));
      renderSavedNotes(searchNotesInput ? searchNotesInput.value : "");
    });

    notesList.appendChild(li);
  });
}

function saveCurrentNote() {
  const content = noteText.value.trim();
  if (!content) return;

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const newNote = {
    id: Date.now(),
    content: content,
    createdAt: `Saved at ${timeStr}`
  };

  savedNotes.unshift(newNote);
  localStorage.setItem(NOTES_KEY, JSON.stringify(savedNotes));
  renderSavedNotes();

  // Clear composer after saving
  clearAll();

  // Switch to notes tab if not already on it
  switchTab("tab-notes");
}

// Utility HTML escape
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ---------- 9. Tabs & Navigation Switching ----------
function switchTab(tabId) {
  tabSections.forEach((section) => {
    section.classList.toggle("active", section.id === tabId);
  });

  tabButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tabId);
  });

  // Close drawer after selection
  closeDrawer();
}

function openDrawer() {
  if (navDrawer) navDrawer.classList.add("open");
  if (drawerBackdrop) drawerBackdrop.classList.add("open");
}

function closeDrawer() {
  if (navDrawer) navDrawer.classList.remove("open");
  if (drawerBackdrop) drawerBackdrop.classList.remove("open");
}

// ---------- 10. Device Switcher: Mobile vs Landscape ----------
function setViewMode(mode) {
  if (mode === "mobile") {
    viewportContainer.classList.remove("mode-landscape");
    viewportContainer.classList.add("mode-mobile");
    btnViewMobile.classList.add("active");
    btnViewLandscape.classList.remove("active");
    localStorage.setItem(VIEW_MODE_KEY, "mobile");
  } else {
    viewportContainer.classList.remove("mode-mobile");
    viewportContainer.classList.add("mode-landscape");
    btnViewLandscape.classList.add("active");
    btnViewMobile.classList.remove("active");
    localStorage.setItem(VIEW_MODE_KEY, "landscape");
  }
}

// ---------- 11. Event Listeners ----------
// Note composer input & keystrokes
if (noteText) {
  noteText.addEventListener("input", () => {
    updateCounts();
    saveDraft(noteText.value);
  });

  noteText.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      clearAll();
    }
  });
}

// Clear and Save buttons
if (clearBtn) clearBtn.addEventListener("click", clearAll);
if (saveNoteBtn) saveNoteBtn.addEventListener("click", saveCurrentNote);

// Theme toggles
if (themeToggle) themeToggle.addEventListener("click", toggleTheme);
if (themeSwitch) themeSwitch.addEventListener("change", toggleTheme);

// Profile form
if (saveProfileBtn) saveProfileBtn.addEventListener("click", saveProfile);
if (displayNameInput) {
  displayNameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveProfile();
  });
}

// Tasks form
if (taskForm) taskForm.addEventListener("submit", addTask);
if (clearDoneTasksBtn) clearDoneTasksBtn.addEventListener("click", clearDoneTasks);

// Notes Search
if (searchNotesInput) {
  searchNotesInput.addEventListener("input", (e) => {
    renderSavedNotes(e.target.value);
  });
}

// Navigation drawer
if (menuBtn) menuBtn.addEventListener("click", openDrawer);
if (closeDrawerBtn) closeDrawerBtn.addEventListener("click", closeDrawer);
if (drawerBackdrop) drawerBackdrop.addEventListener("click", closeDrawer);

// Tab buttons
tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    switchTab(btn.dataset.tab);
  });
});

// Quick Jump Buttons
if (jumpToNotesBtn) {
  jumpToNotesBtn.addEventListener("click", () => switchTab("tab-notes"));
}
if (userPill) {
  userPill.addEventListener("click", () => switchTab("tab-profile"));
}

// Device Switcher
if (btnViewMobile) {
  btnViewMobile.addEventListener("click", () => setViewMode("mobile"));
}
if (btnViewLandscape) {
  btnViewLandscape.addEventListener("click", () => setViewMode("landscape"));
}

// ---------- 12. Initialise on Page Load ----------
document.addEventListener("DOMContentLoaded", () => {
  // Restore theme
  const savedTheme = localStorage.getItem(THEME_KEY);
  applyTheme(savedTheme === "dark");

  // Restore user profile
  loadProfile();

  // Restore draft
  const savedDraft = getSavedDraft();
  if (savedDraft !== null && noteText) {
    noteText.value = savedDraft;
  }
  updateCounts();

  // Render collections
  renderTasks();
  renderSavedNotes();

  // Restore device view mode (default to landscape)
  const savedViewMode = localStorage.getItem(VIEW_MODE_KEY) || "landscape";
  setViewMode(savedViewMode);
});
