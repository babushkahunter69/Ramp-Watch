// Lightweight heuristics to catch junk submissions ("hh", "asdasd", "jhh")
// before they hit Firestore. Not bulletproof, paired with the moderation
// queue in admin which is the real backstop.

const MIN_NAME_LENGTH = 4;

export function isGibberish(text) {
  const t = (text || "").trim().toLowerCase();
  if (!t) return false;

  // No vowels at all in a word of any real length: "hh", "jhh", "bcdfg"
  const letters = t.replace(/[^a-z]/g, "");
  if (letters.length >= 3) {
    const vowels = (letters.match(/[aeiou]/g) || []).length;
    if (vowels === 0) return true;
    if (vowels / letters.length < 0.15) return true;
  }

  // Same character repeated through most of the string: "aaaa", "hhhh"
  const longestRun = (t.match(/(.)\1*/g) || []).reduce(
    (max, run) => Math.max(max, run.length),
    0
  );
  if (longestRun >= 4 && longestRun / t.length > 0.5) return true;

  // Keyboard-mash patterns: alternating same 2-3 chars, e.g. "hjhjhj"
  if (/^([a-z]{1,3})\1{2,}$/.test(t)) return true;

  return false;
}

// Returns an error string, or null if the name passes.
export function validateName(name) {
  const t = (name || "").trim();
  if (!t) return "Enter the establishment name.";
  if (t.length < MIN_NAME_LENGTH) {
    return `Name must be at least ${MIN_NAME_LENGTH} characters.`;
  }
  if (isGibberish(t)) {
    return "Enter a real establishment name.";
  }
  return null;
}

// Notes are optional, but if someone types something, it has to be real.
export function validateNote(note) {
  const t = (note || "").trim();
  if (!t) return null;
  if (t.length < 5) return "Note is too short, add more detail or leave it blank.";
  if (isGibberish(t)) return "Enter a real description, or leave the note blank.";
  return null;
}
