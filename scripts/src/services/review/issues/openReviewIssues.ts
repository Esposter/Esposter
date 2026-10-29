import type { ReviewFinding } from "#src/models/review/ReviewFinding";
import type { ReviewIssueFindings } from "#src/models/review/ReviewIssueFindings";

import { REVIEW_ISSUE_FINDING_CAP, REVIEW_ISSUE_LABEL } from "#src/services/review/constants";
import { chunkReviewFindings } from "#src/services/review/issues/chunkReviewFindings";
import { getIssueNumber } from "#src/services/review/issues/getIssueNumber";
import { renderReviewIssueBody } from "#src/services/review/issues/renderReviewIssueBody";
import { runGhWithBody } from "#src/services/review/issues/runGhWithBody";

// Opens the issues a window's findings are owed in, one per chunk of at most `REVIEW_ISSUE_FINDING_CAP` findings, and
// Returns each one's findings file content. The run ID is the workflow's, so the settle job can tell a live run's issue.
export const openReviewIssues = (
  base: string,
  end: string,
  findings: ReviewFinding[],
  runId: string,
): ReviewIssueFindings[] => {
  const chunks = chunkReviewFindings(findings, REVIEW_ISSUE_FINDING_CAP);
  return chunks.map((chunk, index) => {
    const part = chunks.length > 1 ? ` (part ${index + 1} of ${chunks.length})` : "";
    const title = `Review ${base.slice(0, 12)}..${end.slice(0, 12)}: ${chunk.length} finding(s)${part}`;
    const body = renderReviewIssueBody({ base, end, items: chunk.map((finding) => ({ finding })), runId });
    const url = runGhWithBody(["issue", "create", "--title", title, "--label", REVIEW_ISSUE_LABEL], body);
    return { base, end, findings: chunk, issue: getIssueNumber(url) };
  });
};
