// The entry's last line, the closing brace, with the comma that says another entry follows it. AnimeStudio writes that
// Comma on every entry but the merged map's last, so the closing line's own comma is set, not added to
export const closeEntry = (entry: string[], hasNext: boolean): string[] =>
  entry.map((line, index) => (index === entry.length - 1 ? `${line.replace(/,$/u, "")}${hasNext ? "," : ""}` : line));
