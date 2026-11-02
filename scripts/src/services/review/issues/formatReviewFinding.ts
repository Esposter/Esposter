import type { ReviewFinding } from "#src/models/review/ReviewFinding";

import { toSingleLine } from "#src/services/review/issues/toSingleLine";

// A finding's location, lane and summary as one line, which the issue body lists and the outcome comment names
export const formatReviewFinding = ({ file, lane, line, summary }: ReviewFinding): string =>
  toSingleLine(`\`${file}:${line}\` (${lane}): ${summary}`);
