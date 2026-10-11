import type { HeldIssueInput } from "#src/models/coderabbit/collect/HeldIssueInput";

import { readCollectorIssues } from "#src/services/coderabbit/collect/readCollectorIssues";
import { runGh } from "#src/services/shared/runGh";

// The issue a park opened, closed once the last held branch it lists is gone: it names each one in backticks
// (`parkCommits`), so an issue still naming a branch that stands stays open for the commit on it
export const closeHeldIssue = ({ branch, heldBranches, note, viewerLogin }: HeldIssueInput): void => {
  const issue = readCollectorIssues(viewerLogin).find(({ body }) => body.includes(`\`${branch}\``));
  if (issue === undefined || [...heldBranches].some((heldBranch) => issue.body.includes(`\`${heldBranch}\``))) return;
  runGh(["issue", "close", issue.number.toString(), "--comment", note]);
  console.info(`closed issue #${issue.number}: ${note}`);
};
