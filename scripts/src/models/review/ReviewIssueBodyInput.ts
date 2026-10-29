import type { ReviewIssueBodyItem } from "#src/models/review/ReviewIssueBodyItem";

export interface ReviewIssueBodyInput {
  base: string;
  end: string;
  items: ReviewIssueBodyItem[];
  runId: string;
}
