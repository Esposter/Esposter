const FRONTMATTER_REGEX = /^---[\s\S]*?^---/mu;
const URL_REGEX = /https?:\/\/[^\s)>\]]+/gu;
const NON_WORD_REGEX = /[^a-z0-9']+/gu;
// The words a run is measured in: frontmatter is a page's own metadata rather than prose it shares, a URL is the one
// String a citation of its source has to be, and dropping punctuation and case is what lets a sentence requoted with
// Different emphasis still read as the copy it is.
export const getProseWords = (text: string): string[] =>
  text.replace(FRONTMATTER_REGEX, "").replaceAll(URL_REGEX, " ").toLowerCase().split(NON_WORD_REGEX).filter(Boolean);
