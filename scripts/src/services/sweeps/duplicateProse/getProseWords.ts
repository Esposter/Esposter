const FRONTMATTER_REGEX = /^---[\s\S]*?^---/mu;
const NON_WORD_REGEX = /[^a-z0-9']+/gu;
// The words a run is measured in: frontmatter is a page's own metadata rather than prose it shares, and dropping
// Punctuation and case is what lets a sentence requoted with different emphasis still read as the copy it is.
export const getProseWords = (text: string): string[] =>
  text.replace(FRONTMATTER_REGEX, "").toLowerCase().split(NON_WORD_REGEX).filter(Boolean);
