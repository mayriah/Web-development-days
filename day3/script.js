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
 * Returns an object counting notes per category.
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
 * Returns a summary sentence using countByCategory and a template literal.
 * Uses "note" for exactly one note and "notes" otherwise.
 * @returns {string} - Summary sentence
 */
function getSummary() {
  const counts = countByCategory();
  const total = notes.length;
  const noteWord = total === 1 ? "note" : "notes";

  return `${total} ${noteWord}: ${counts.personal || 0} personal, ${counts.work || 0} work, ${counts.study || 0} study.`;
}

/**
 * Returns true if a note with the same text already exists.
 * Ignores case and extra spaces.
 * @param {string} text - The note text to check
 * @returns {boolean} - True if duplicate exists, false otherwise
 */
function isDuplicate(text) {
  if (typeof text !== "string") {
    return false;
  }

  const cleanText = text.trim().toLowerCase();

  return notes.some(
    (note) => note.text.trim().toLowerCase() === cleanText
  );
}

/**
 * Adds a note if it is 1–200 characters, not a duplicate,
 * and the category is personal, work, or study.
 * @param {string} text - Note text
 * @param {string} category - Note category
 * @returns {boolean} - True if added, false otherwise
 */
function addNote(text, category) {
  // Check text length
  if (
    typeof text !== "string" ||
    text.trim().length < 1 ||
    text.trim().length > 200
  ) {
    console.log(
      "Cannot add note: Note text must be between 1 and 200 characters."
    );
    return false;
  }

  // Check valid category
  const validCategories = ["personal", "work", "study"];

  if (!validCategories.includes(category)) {
    console.log(`Cannot add note: Invalid category "${category}".`);
    return false;
  }

  // Check duplicate
  if (isDuplicate(text)) {
    console.log(
      `Cannot add note: A note with the text "${text.trim()}" already exists.`
    );
    return false;
  }

  // Add new note
  const nextId =
    notes.length > 0
      ? Math.max(...notes.map((note) => note.id)) + 1
      : 1;

  const newNote = {
    id: nextId,
    text: text.trim(),
    category: category,
  };

  notes.push(newNote);

  console.log("Note added successfully.");

  return true;
}

// Tests

console.log("--- 1. searchNotes ---");

console.log("searchNotes('milk'):", searchNotes("milk"));
// Expected: [{ id: 1, text: "Buy milk and bread", category: "personal" }]

console.log("searchNotes('nonexistent'):", searchNotes("nonexistent"));
// Expected: []

console.log("searchNotes('JAVASCRIPT'):", searchNotes("JAVASCRIPT"));
// Expected: [{ id: 4, text: "Revise JavaScript arrays", category: "study" }]


console.log("\n--- 2. longestNote ---");

console.log("longestNote():", longestNote());
// Expected: { id: 3, text: "Email the project report to Grace", category: "work" }

const backupNotesForLongest = notes;
notes = [];

console.log("longestNote() with empty array:", longestNote());
// Expected: null

notes = backupNotesForLongest;


console.log("\n--- 3. countByCategory ---");

console.log("countByCategory():", countByCategory());
// Expected: { personal: 2, study: 2, work: 1 }

const backupNotesForCount = notes;
notes = [];

console.log("countByCategory() with empty array:", countByCategory());
// Expected: {}

notes = backupNotesForCount;


console.log("\n--- 4. getSummary ---");

console.log("getSummary():", getSummary());
// Expected: "5 notes: 2 personal, 1 work, 2 study."

const backupNotesForSummary = notes;

notes = [
  { id: 1, text: "Read a book chapter", category: "study" },
];

console.log("getSummary() with 1 note:", getSummary());
// Expected: "1 note: 0 personal, 0 work, 1 study."

notes = [];

console.log("getSummary() with 0 notes:", getSummary());
// Expected: "0 notes: 0 personal, 0 work, 0 study."

notes = backupNotesForSummary;


console.log("\n--- 5. isDuplicate ---");

console.log("isDuplicate('Call mum'):", isDuplicate("Call mum"));
// Expected: true

console.log("isDuplicate('Walk the dog'):", isDuplicate("Walk the dog"));
// Expected: false

console.log("isDuplicate('   cAlL mUm   '):", isDuplicate("   cAlL mUm   "));
// Expected: true

console.log("isDuplicate(''):", isDuplicate(""));
// Expected: false


console.log("\n--- 6. addNote ---");

console.log(
  "addNote('Submit project proposal', 'work'):",
  addNote("Submit project proposal", "work")
);
// Expected: true

console.log(
  "addNote('   call MUM   ', 'personal'):",
  addNote("   call MUM   ", "personal")
);
// Expected: false

console.log(
  "addNote('Go for a morning jog', 'fitness'):",
  addNote("Go for a morning jog", "fitness")
);
// Expected: false

console.log(
  "addNote('', 'personal'):",
  addNote("", "personal")
);
// Expected: false

console.log(
  "addNote(text over 200 characters, 'study'):",
  addNote("a".repeat(201), "study")
);
// Expected: false

console.log("getSummary() after adding note:", getSummary());
// Expected: "6 notes: 2 personal, 2 work, 2 study."