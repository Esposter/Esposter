// A run ending at a terminator that closes a sentence rather than sitting inside a number or an abbreviation —
// One followed by white space or by nothing — and, for a tail the reply never terminated, whatever is left
const SENTENCE_REGEX = /.*?[.!?](?=\s|$)|.+$/gu;

// The prose cut into the units the engine is asked for one at a time. One sentence each and deliberately not
// Packed into longer runs: the first chunk is the whole of what the person waits for before hearing anything, and
// Every chunk after it is generated while the one before it plays, so a longer first chunk buys nothing back
export const splitSentences = (prose: string): string[] =>
  (prose.match(SENTENCE_REGEX) ?? []).map((sentence) => sentence.trim()).filter(Boolean);
