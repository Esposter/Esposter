// The names a featured parameter lists, `;`-separated, each trimmed and a stray separator leaving no name
export const readFeaturedNames = (value: string): string[] =>
  value
    .split(";")
    .map((name) => name.trim())
    // A featured
    // oxlint-disable-next-line selector-ban/no-restricted-syntax -- name from the wiki, empty between separators
    .filter((name) => name !== "");
