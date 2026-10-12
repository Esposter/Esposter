import type { ReviewFinding } from "#src/models/review/ReviewFinding";

// The findings cut into consecutive chunks of at most `cap`, in order, so each chunk is one issue's part
export const chunkReviewFindings = (findings: ReviewFinding[], cap: number): ReviewFinding[][] =>
  Array.from({ length: Math.ceil(findings.length / cap) }, (_value, index) =>
    findings.slice(index * cap, (index + 1) * cap),
  );
