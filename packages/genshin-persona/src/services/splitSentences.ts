// A run ending at a terminator that closes a sentence rather than sitting inside a number or an abbreviation —
// One followed by white space or by nothing — and, for a tail the reply never terminated, whatever is left
const SENTENCE_REGEX = /.*?[.!?](?=\s|$)|.+$/gu;
// The engine reads English only: a sentence its tokenizer cannot read comes back as near-silence, which the device
// Ladder would take for a broken provider — gated per sentence, since the synthesis is
const LATIN_LETTER_REGEX = /\p{Script=Latin}/u;

// One sentence per unit and deliberately not packed into longer runs: the first is the whole of what the person
// Waits for, and every one after it is generated while the one before plays, so a longer first unit buys nothing
export const splitSentences = (prose: string): string[] =>
  (prose.match(SENTENCE_REGEX) ?? [])
    .map((sentence) => sentence.trim())
    .filter((sentence) => LATIN_LETTER_REGEX.test(sentence));
