import type { ReviewDisposition } from "#src/models/review/ReviewDisposition";
import type { ReviewFinding } from "#src/models/review/ReviewFinding";

import { REVIEW_DEFERRED_LABEL } from "#src/services/review/constants";
import { runGh } from "#src/services/shared/runGh";
import { rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

// The body lists each deferred finding with the reason its disposition gives, in the order the reviewers wrote them
const getDeferredBody = (
  deferred: { disposition: ReviewDisposition; finding: ReviewFinding }[],
  base: string,
  end: string,
): string => {
  const items = deferred.map(
    ({ disposition, finding }) =>
      `- \`${finding.file}:${finding.line}\` (${finding.lane}): ${finding.summary}\n  - Trigger: ${finding.trigger}\n  - Why deferred: ${disposition.reason}`,
  );
  return `The automated review of \`${base}..${end}\` deferred these findings, for a later session to settle.\n\n${items.join("\n")}`;
};

// One issue per run for the findings it deferred, labelled for an agent to take. The body goes through a file, since
// `gh` takes it from one without a length limit on the command line.
export const createDeferredIssue = (
  deferred: { disposition: ReviewDisposition; finding: ReviewFinding }[],
  base: string,
  end: string,
): string => {
  const bodyPath = join(tmpdir(), `esposter-review-issue-${randomUUID()}.md`);
  writeFileSync(bodyPath, getDeferredBody(deferred, base, end));
  try {
    return runGh([
      "issue",
      "create",
      "--title",
      `Review ${base.slice(0, 12)}..${end.slice(0, 12)}: ${deferred.length} finding(s) deferred`,
      "--body-file",
      bodyPath,
      "--label",
      REVIEW_DEFERRED_LABEL,
    ]).trim();
  } finally {
    rmSync(bodyPath, { force: true });
  }
};
