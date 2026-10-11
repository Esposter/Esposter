import type { ProfanityOptions } from "#src/models/profanity/ProfanityOptions";

import { englishProfaneWords } from "#src/services/profanity/englishProfaneWords";

// A letter, a number or a combining mark is part of a word, so a profane word that touches one is not whole. An
// Underscore, a hyphen, a space, punctuation and an emoji all end a word, which is why `butt_face` and `butt-head` count
const WORD_CHARACTER_CLASS = String.raw`\p{L}\p{N}\p{M}`;
const PROFANE_WORD_ALTERNATION = englishProfaneWords
  .map((word) => word.replaceAll(/[.*+?^${}()|[\]\\]/gu, String.raw`\$&`))
  .join("|");
const WHOLE_WORD_PROFANITY_REGEX = new RegExp(
  `(?<![${WORD_CHARACTER_CLASS}])(?:${PROFANE_WORD_ALTERNATION})(?![${WORD_CHARACTER_CLASS}])`,
  "iu",
);
const SUBSTRING_PROFANITY_REGEX = new RegExp(PROFANE_WORD_ALTERNATION, "iu");

export const checkContainsProfanity = (
  text: unknown,
  { isWholeWord = true }: Partial<ProfanityOptions> = {},
): boolean => {
  if (typeof text !== "string") return false;
  return (isWholeWord ? WHOLE_WORD_PROFANITY_REGEX : SUBSTRING_PROFANITY_REGEX).test(text);
};
