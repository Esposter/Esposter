// A quoted title at the start of a text, returned with its quotes, or `""` when no quote opens it.
// A title the delta holds is read whole, so an apostrophe inside it is part of it.
// Any other title closes at a quote that no letter follows, the way an apostrophe in a word does not.
// Where a held title and that reading both match, the longer one is the quote.
// A held title that ends at an apostrophe inside a longer quote does not cut it short.
const QUOTED_TITLE_REGEX = /^(?:'(?:[^'\n]|'(?=\p{L}))+'|"[^"\n]+")/u;

export const readQuotedTitle = (text: string, scenarioTitles: readonly string[]): string => {
  const heldQuotes = scenarioTitles
    .flatMap((title) => [`'${title}'`, `"${title}"`])
    .filter((quote) => text.startsWith(quote));
  const quotes = [...heldQuotes, QUOTED_TITLE_REGEX.exec(text)?.[0] ?? ""];
  return quotes.reduce((longest, quote) => (quote.length > longest.length ? quote : longest));
};
