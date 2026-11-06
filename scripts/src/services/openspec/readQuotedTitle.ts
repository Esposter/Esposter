// A quoted title at the start of a text, returned with its quotes, or `""` when no quote opens it. A title the delta
// holds is read whole, so an apostrophe inside it is part of it; any other closes at a quote that no letter follows,
// the way an apostrophe in a word does not
const QUOTED_TITLE_REGEX = /^(?:'(?:[^'\n]|'(?=\p{L}))+'|"[^"\n]+")/u;

export const readQuotedTitle = (text: string, scenarioTitles: readonly string[]): string => {
  const heldQuote = scenarioTitles
    .flatMap((title) => [`'${title}'`, `"${title}"`])
    .find((quote) => text.startsWith(quote));
  return heldQuote ?? QUOTED_TITLE_REGEX.exec(text)?.[0] ?? "";
};
