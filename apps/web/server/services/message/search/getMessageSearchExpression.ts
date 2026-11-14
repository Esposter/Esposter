// The user's text as one FTS5 MATCH expression that finds each word literally. Every word is a quoted string with any
// `"` inside it doubled, so no word can close its quote and `OR`, `NEAR`, `*`, `:` or `-` are words to find rather than
// operators. The words are or-joined, which is the match the search has always made, and the last word is a prefix so
// a word still being typed finds its completions. No words is no expression at all
export const getMessageSearchExpression = (query: string): string => {
  const words = query.split(/\s+/u).filter(Boolean);
  return words
    .map((word, index) => `"${word.replaceAll('"', '""')}"${index === words.length - 1 ? "*" : ""}`)
    .join(" OR ");
};
