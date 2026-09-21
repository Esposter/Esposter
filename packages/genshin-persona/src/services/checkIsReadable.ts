// The engine reads English only: a line its tokenizer cannot read comes back as near-silence, which the device
// Ladder would take for a broken provider, and a line in another script with one Latin word in it — a code
// Identifier inside a Japanese reply — is read from unknown tokens the model finds no end for, so one letter of
// Another script rules a line out
const LATIN_LETTER_REGEX = /\p{Script=Latin}/u;
const OTHER_SCRIPT_LETTER_REGEX = /(?!\p{Script=Latin})\p{L}/u;

export const checkIsReadable = (text: string): boolean =>
  LATIN_LETTER_REGEX.test(text) && !OTHER_SCRIPT_LETTER_REGEX.test(text);
