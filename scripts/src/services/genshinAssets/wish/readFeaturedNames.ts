// The names a featured parameter lists, `;`-separated, each trimmed and a stray separator leaving no name
export const readFeaturedNames = (value: string): string[] =>
  value
    .split(";")
    .map((name) => name.trim())
    .filter((name) => name !== "");
