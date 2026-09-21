import { getBasisText } from "#src/services/coderabbit/collect/getBasisText";

// A hidden marker in a pull request or commit comment is the collector's memory for a fact no commit can carry — a review
// Whose body-only findings are answered, a drain that failed, a queue commit whose conflict could not be resolved.
// An HTML comment renders as nothing. A number keys a review, a string keys a commit. An attempt's marker also
// Names what the attempt was made against — the collector's own source, and for a cut the `main` head — and a
// Count reads only the markers naming the same basis: a fix to the collector, or a `main` that moved, is a fresh
// Turn for the work by itself, where a count that outlived the code that failed it left every fix waiting on a
// Person to reset it.
export const getMarker = (marker: string, key: number | string, basisShas: string[] = []): string => {
  const keyText = `${typeof key === "number" ? "review" : "commit"}:${key}`;
  return `<!-- ${marker} ${keyText}${getBasisText(basisShas)} -->`;
};
