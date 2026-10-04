// Starting data
let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

/**
 * Returns an array of notes whose text contains word, ignoring case.
 * Uses filter, toLowerCase, and includes.
 * @param {string} word - The search keyword
 * @returns {Array<object>} - Array of matching note objects
 */
function searchNotes(word) {
  const query = word.toLowerCase();
  return notes.filter((note) => note.text.toLowerCase().includes(query));
}

/**
 * Returns the note object with the most characters, or null if there are no notes.
 * Handles the empty array first, then compares lengths.
 * @returns {object|null} - Longest note object or null if notes array is empty
 */
function longestNote() {
  if (notes.length === 0) {
    return null;
  }

  let longest = notes[0];
  for (let i = 1; i < notes.length; i++) {
    if (notes[i].text.length > longest.text.length) {
      longest = notes[i];
    }
  }
  return longest;
}

/**
 * Returns an object counting notes per category by looping over notes and incrementing counters.
 * @returns {object} - Object with category names as keys and counts as values
 */
function countByCategory() {
  const counts = {};
  for (const note of notes) {
    if (counts[note.category]) {
      counts[note.category]++;
    } else {
      counts[note.category] = 1;
    }
  }
  return counts;
}

/**
 * Returns a summary sentence of all notes using countByCategory and a template literal.
 * Uses "note" for exactly one note and "notes" otherwise.
 * @returns {string} - Summary sentence, e.g., "5 notes: 2 personal, 2 study, 1 work."
 */
function getSummary() {
  const counts = countByCategory();
  const total = notes.length;
  const noteWord = total === 1 ? "note" : "notes";
  const categoryDetails = Object.entries(counts)
    .map(([category, count]) => `${count} ${category}`)
    .join(", ");

  return categoryDetails
    ? `${total} ${noteWord}: ${categoryDetails}.`
    : `${total} ${noteWord}.`;
}

/**
 * Returns true if a note with the same text already exists, ignoring case and extra spaces.
 * Uses some, comparing trimmed lower-case text.
 * @param {string} text - The note text to check
 * @returns {boolean} - True if duplicate exists, false otherwise
 */
function isDuplicate(text) {
  if (typeof text !== "string") {
    return false;
  }
  const cleanText = text.trim().toLowerCase();
  return notes.some((note) => note.text.trim().toLowerCase() === cleanText);
}

/**
 * Adds a note if it is 1–200 characters, not a duplicate, and category is personal, work, or study.
 * Returns true when added and false otherwise, logging the reason.
 * @param {string} text - Note text
 * @param {string} category - Note category
 * @returns {boolean} - True if added, false otherwise
 */
function addNote(text, category) {
  // Check length (1–200 characters)
  if (typeof text !== "string" || text.trim().length < 1 || text.trim().length > 200) {
    console.log("Cannot add note: Note text must be between 1 and 200 characters.");
    return false;
  }

  // Check valid category
  const validCategories = ["personal", "work", "study"];
  if (!validCategories.includes(category)) {
    console.log(`Cannot add note: Invalid category "${category}". Category must be one of: ${validCategories.join(", ")}.`);
    return false;
  }

  // Check duplicate
  if (isDuplicate(text)) {
    console.log(`Cannot add note: A note with the text "${text.trim()}" already exists.`);
    return false;
  }

  // Add new note to notes array
  const nextId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) + 1 : 1;
  const newNote = {
    id: nextId,
    text: text.trim(),
    category: category,
  };
  notes.push(newNote);
  return true;
}

// ==========================================
// Tests for every function
// ==========================================

console.log("--- 1. searchNotes ---");
// Normal case: search matching notes (case-insensitive substring)
console.log("searchNotes('milk'):", searchNotes("milk"));
// Expected: [ { id: 1, text: "Buy milk and bread", category: "personal" } ]

// Edge case: search with no matching results
console.log("searchNotes('nonexistent'):", searchNotes("nonexistent"));
// Expected: []

// Edge case: case-insensitivity check with uppercase query
console.log("searchNotes('JAVASCRIPT'):", searchNotes("JAVASCRIPT"));
// Expected: [ { id: 4, text: "Revise JavaScript arrays", category: "study" } ]

console.log("\n--- 2. longestNote ---");
// Normal case: finding the longest note among the starting notes
console.log("longestNote():", longestNote());
// Expected: { id: 3, text: "Email the project report to Grace", category: "work" }

// Edge case: empty notes array returns null
const backupNotesForLongest = notes;
notes = [];
console.log("longestNote() when notes is empty:", longestNote());
// Expected: null
notes = backupNotesForLongest; // restore starting notes

console.log("\n--- 3. countByCategory ---");
// Normal case: counts per category for starting notes
console.log("countByCategory():", countByCategory());
// Expected: { personal: 2, study: 2, work: 1 }

// Edge case: empty notes array returns empty object
const backupNotesForCount = notes;
notes = [];
console.log("countByCategory() when notes is empty:", countByCategory());
// Expected: {}
notes = backupNotesForCount; // restore starting notes

console.log("\n--- 4. getSummary ---");
// Normal case: summary sentence for the starting 5 notes
console.log("getSummary():", getSummary());
// Expected: "5 notes: 2 personal, 2 study, 1 work."

// Edge case: exactly one note uses singular "note"
const backupNotesForSummary = notes;
notes = [{ id: 1, text: "Read a book chapter", category: "study" }];
console.log("getSummary() with 1 note:", getSummary());
// Expected: "1 note: 1 study."

// Edge case: 0 notes
notes = [];
console.log("getSummary() with 0 notes:", getSummary());
// Expected: "0 notes."
notes = backupNotesForSummary; // restore starting notes

console.log("\n--- 5. isDuplicate ---");
// Normal case: checking an existing note text
console.log("isDuplicate('Call mum'):", isDuplicate("Call mum"));
// Expected: true

// Normal case: checking a note text that does not exist
console.log("isDuplicate('Walk the dog'):", isDuplicate("Walk the dog"));
// Expected: false

// Edge case: duplicate with extra leading/trailing whitespace and mixed casing
console.log("isDuplicate('   cAlL mUm   '):", isDuplicate("   cAlL mUm   "));
// Expected: true

// Edge case: empty string
console.log("isDuplicate(''):", isDuplicate(""));
// Expected: false

console.log("\n--- 6. addNote ---");
// Normal case: adding a valid note
console.log("addNote('Submit project proposal', 'work'):", addNote("Submit project proposal", "work"));
// Expected: true

// Edge case: duplicate note (ignoring casing and extra spaces)
console.log("addNote('   call MUM   ', 'personal'):", addNote("   call MUM   ", "personal"));
// Expected: false (logs reason: already exists)

// Edge case: invalid category
console.log("addNote('Go for a morning jog', 'fitness'):", addNote("Go for a morning jog", "fitness"));
// Expected: false (logs reason: invalid category)

// Edge case: empty string text (violates 1–200 characters)
console.log("addNote('', 'personal'):", addNote("", "personal"));
// Expected: false (logs reason: text must be between 1 and 200 characters)

// Edge case: text exceeding 200 characters
console.log("addNote(text > 200 characters, 'study'):", addNote("a".repeat(201), "study"));
// Expected: false (logs reason: text must be between 1 and 200 characters)

// Verify getSummary after adding the valid note above (now 6 notes)
console.log("getSummary() after adding note:", getSummary());
// Expected: "6 notes: 2 personal, 2 study, 2 work."
