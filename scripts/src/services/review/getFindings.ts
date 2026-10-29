import type { ReviewBatchOutcome } from "#src/models/review/ReviewBatchOutcome";
import type { ReviewFinding } from "#src/models/review/ReviewFinding";

export const getFindings = (outcomes: ReviewBatchOutcome[]): ReviewFinding[] =>
  outcomes.flatMap((outcome) => ("findings" in outcome ? outcome.findings : []));
