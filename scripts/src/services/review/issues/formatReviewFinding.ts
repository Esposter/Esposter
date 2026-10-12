import type { ReviewFinding } from "#src/models/review/ReviewFinding";

// A finding's location, lane and summary as one line, which the issue body lists and the outcome comment names
export const formatReviewFinding = ({ file, lane, line, summary }: ReviewFinding): string =>
  `\`${file}:${line}\` (${lane}): ${summary}`;
