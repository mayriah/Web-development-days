// ---------- 1. Select DOM Elements ----------
const noteText = document.querySelector("#note-text");
const charCount = document.querySelector("#char-count");
const wordCount = document.querySelector("#word-count");
const clearBtn = document.querySelector("#clear-btn");
const themeToggle = document.querySelector("#theme-toggle");

// ---------- 2. Storage Keys ----------
const DRAFT_KEY = "draft";
const THEME_KEY = "theme";

// Helper functions for localStorage draft
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

// ---------- 3. Update Character and Word Counts ----------
function updateCounts() {
  const text = noteText.value;
  const chars = text.length;

  // Count words by splitting trimmed text on whitespace; 0 if empty
  const trimmed = text.trim();
  const words = trimmed === "" ? 0 : trimmed.split(/\s+/).length;

  // Update text contents
  charCount.textContent = `${chars} / 200 characters`;
  wordCount.textContent = `${words} words`;

  // Warning class when over 180 characters, over class when over 200
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
}

// ---------- 4. Clear Everything ----------
function clearAll() {
  noteText.value = "";
  removeDraft();
  updateCounts();
  noteText.focus();
}

// ---------- 5. Theme Toggle Handler ----------
function toggleTheme() {
  const isDark = document.body.classList.toggle("dark");
  themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
}

// ---------- 6. Attach Event Listeners ----------
// On every input event: update counts and save draft
noteText.addEventListener("input", () => {
  updateCounts();
  saveDraft(noteText.value);
});

// Clear button clears textarea, resets counters, and removes draft
clearBtn.addEventListener("click", clearAll);

// Escape key inside textarea also clears everything
noteText.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    clearAll();
  }
});

// Theme button toggles dark mode and saves choice
themeToggle.addEventListener("click", toggleTheme);

// ---------- 7. Initialise on Page Load ----------
// Restore saved theme
const savedTheme = localStorage.getItem(THEME_KEY);
if (savedTheme === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "Light mode";
} else {
  document.body.classList.remove("dark");
  themeToggle.textContent = "Dark mode";
}

// Restore saved draft
const savedDraft = getSavedDraft();
if (savedDraft !== null) {
  noteText.value = savedDraft;
}

// Initialise counts
updateCounts();
