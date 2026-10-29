import type { ReviewFinding } from "#src/models/review/ReviewFinding";

export interface ReviewIssueBodyItem {
  finding: ReviewFinding;
  // The reason a fixer left the finding open, which the rewritten body states beside its trigger
  reason?: string;
}
