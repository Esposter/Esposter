// A run ending at a terminator that closes a sentence rather than sitting inside a number or an abbreviation —
// One followed by white space or by nothing — and, for a tail the reply never terminated, whatever is left
const SENTENCE_REGEX = /.*?[.!?](?=\s|$)|.+$/gu;
// The engine reads English only: a sentence with no Latin letter reaches its tokenizer as unknown tokens and comes
// Back as near-silence, which the device ladder would take for a broken provider. The gate is per sentence because
// The synthesis is: one unreadable sentence inside a readable reply would walk the ladder down on its own
const LATIN_LETTER_REGEX = /\p{Script=Latin}/u;

// The prose cut into the units the engine is asked for one at a time, the ones it cannot read left out. One
// Sentence each and deliberately not packed into longer runs: the first chunk is the whole of what the person
// Waits for before hearing anything, and every chunk after it is generated while the one before it plays, so a
// Longer first chunk buys nothing back
export const splitSentences = (prose: string): string[] =>
  (prose.match(SENTENCE_REGEX) ?? [])
    .map((sentence) => sentence.trim())
    .filter((sentence) => LATIN_LETTER_REGEX.test(sentence));
