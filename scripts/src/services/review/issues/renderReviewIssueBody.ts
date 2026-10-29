import type { ReviewIssueBodyInput } from "#src/models/review/ReviewIssueBodyInput";

import { formatReviewFinding } from "#src/services/review/issues/formatReviewFinding";

// The body every review issue carries, from its findings in the order given. The fixer rewrites a body through this same
// Function, so the run line and the findings keep one shape the settle job can read.
export const renderReviewIssueBody = ({ base, end, items, runId }: ReviewIssueBodyInput): string => {
  const itemLines = items.flatMap(({ finding, reason }) => [
    `- ${formatReviewFinding(finding)}`,
    `  - Trigger: ${finding.trigger}`,
    ...(reason === undefined ? [] : [`  - Why deferred: ${reason}`]),
  ]);
  return [
    "The automated review owes these findings until its settle job closes this issue.",
    "",
    `Run: ${runId}`,
    `Range: \`${base}..${end}\``,
    "",
    ...itemLines,
    "",
  ].join("\n");
};
