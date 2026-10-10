import type { RedMainCheck } from "#src/models/coderabbit/collect/RedMainCheck";
import type { RepairInput } from "#src/models/coderabbit/collect/RepairInput";
import type { RunJobsView } from "#src/models/coderabbit/collect/RunJobsView";

export interface TransitGapInput extends Pick<RepairInput, "cwd" | "isDryRun" | "mainSha" | "viewerLogin"> {
  // A red run on `main`'s head, or the reviewed head's standing in for it (`readRedMainChecks`)
  check: RedMainCheck;
  failedJobs: RunJobsView["jobs"];
}
