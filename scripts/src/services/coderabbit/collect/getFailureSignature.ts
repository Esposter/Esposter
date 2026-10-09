import type { FailureSignature } from "#src/models/coderabbit/collect/FailureSignature";

import { createHash } from "node:crypto";

// A red run's signature: its workflow and the names of its failing jobs, sorted and each once, so the same jobs read the
// Same in any order a run lists them — or, for a red collector run the guard reads, its failed step and error line.
// The digest is what a marker carries, short as a sha is, since no two signatures of one repository's workflows
// Collide in a dozen hex digits
export const getFailureSignature = (workflowName: string, failedJobNames: string[]): FailureSignature => {
  const text = `${workflowName}: ${[...new Set(failedJobNames)].toSorted().join(", ")}`;
  return { hash: createHash("sha256").update(text).digest("hex").slice(0, 12), text };
};
