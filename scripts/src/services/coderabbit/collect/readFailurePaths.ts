import type { CheckRunAnnotation } from "#src/models/coderabbit/collect/CheckRunAnnotation";
import type { CodeScanningAlert } from "#src/models/coderabbit/collect/CodeScanningAlert";
import type { RunJobsView } from "#src/models/coderabbit/collect/RunJobsView";

import { CODEQL_WORKFLOW_FILE, MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { readEntries } from "#src/services/coderabbit/shared/readEntries";
import { getResult } from "@esposter/shared";

// The paths a red names, for a workflow the queue never runs: CodeQL's open alerts on `main`, read as its own gate reads
// Them back (`CodeQL.yaml`), and any other workflow's annotations on the jobs it failed. A read that fails names none,
// Which leaves the red the repairer's as before (`settleTransitGap`)
export const readFailurePaths = (workflowFile: string, failedJobs: RunJobsView["jobs"]): string[] =>
  getResult(() =>
    workflowFile === CODEQL_WORKFLOW_FILE
      ? readEntries<CodeScanningAlert>(`code-scanning/alerts?ref=refs/heads/${MAIN_BRANCH}&state=open`).map(
          (alert) => alert.most_recent_instance.location.path,
        )
      : failedJobs.flatMap(({ databaseId }) =>
          readEntries<CheckRunAnnotation>(`check-runs/${databaseId}/annotations`).map(({ path }) => path),
        ),
  )
    .orTee(console.error)
    .unwrapOr([]);
