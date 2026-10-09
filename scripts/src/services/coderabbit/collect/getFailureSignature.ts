import type { FailureSignature } from "#src/models/coderabbit/collect/FailureSignature";

import { createHash } from "node:crypto";

// A red run's signature: its workflow and the names of its failing jobs, sorted and each once, so the same jobs read the
// Same in any order a run lists them. The digest is what a marker carries, short as a sha is, since no two signatures
// Of one repository's workflows collide in a dozen hex digits
export const getFailureSignature = (workflowName: string, failedJobNames: string[]): FailureSignature => {
  const text = `${workflowName}: ${[...new Set(failedJobNames)].toSorted().join(", ")}`;
  return { hash: createHash("sha256").update(text).digest("hex").slice(0, 12), text };
};
