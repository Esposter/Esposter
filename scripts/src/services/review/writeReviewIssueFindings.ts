import type { ReviewIssueFindings } from "#src/models/review/ReviewIssueFindings";

import { toJson } from "#src/services/shared/toJson";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Hands one review issue's findings to its fixer as `issue-<number>.json` in the findings directory, the file `ai:review:fix`
// Reads. The matrix names the same number, so each fix job finds its own issue's file.
export const writeReviewIssueFindings = (directory: string, findings: ReviewIssueFindings): void => {
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, `issue-${findings.issue}.json`), toJson(findings));
};
