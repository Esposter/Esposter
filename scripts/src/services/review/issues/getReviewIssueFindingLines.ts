// The finding lines of an issue body, each without its bullet, in the order the body lists them. A finding's detail lines
// Are indented beneath its bullet, so only a bullet opening a code span is one.
export const getReviewIssueFindingLines = (body: string): string[] =>
  body
    .split("\n")
    .filter((line) => line.startsWith("- `"))
    .map((line) => line.slice("- ".length));
