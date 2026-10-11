import { EN_US_SEGMENTER } from "#shared/services/intl/constants";

// A palindrome needs a letter or digit to mirror against another, so a message of fewer has none
const MIN_PALINDROME_GRAPHEMES = 2;
// Every script's letters and digits, with the combining marks that belong to them, so an accented letter stays whole
const NON_TEXT_REGEX = /[^\p{L}\p{M}\p{N}]/gu;

// The value's letters and digits read the same reversed, case and punctuation ignored, compared grapheme by grapheme
export const checkIsPalindrome = (value: string | undefined): boolean => {
  if (value === undefined) return false;

  const graphemes = Array.from(
    EN_US_SEGMENTER.segment(value.toLowerCase().replaceAll(NON_TEXT_REGEX, "")),
    ({ segment }) => segment,
  );
  return graphemes.length >= MIN_PALINDROME_GRAPHEMES && graphemes.join("") === graphemes.toReversed().join("");
};
