// A closing delimiter preceded by a space is not right-flanking, so the edge whitespace is written outside the
// Delimiters
export const wrapEmphasis = (delimiter: string) => (text: string) => {
  const start = text.length - text.trimStart().length;
  const end = text.trimEnd().length;
  const core = text.slice(start, end);
  // oxlint-disable-next-line selector-ban/no-restricted-syntax -- a markdown run, whose spaces are content
  if (core === "") return text;

  return `${text.slice(0, start)}${delimiter}${core}${delimiter}${text.slice(end)}`;
};
