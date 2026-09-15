// A hidden marker in a pull request or commit comment is the collector's memory for a fact no commit can carry — a review
// Whose body-only findings are answered, a drain that failed, a queue commit whose conflict could not be resolved.
// An HTML comment renders as nothing. A number keys a review, a string keys a commit.
export const getMarker = (marker: string, key: number | string): string =>
  `<!-- ${marker} ${typeof key === "number" ? "review" : "commit"}:${key} -->`;
