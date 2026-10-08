import type { DrainStepInput } from "#src/models/coderabbit/collect/DrainStepInput";

// One merged window's drain: the reads the pass already holds, and the pull request whose findings are answered
export interface DrainWindowInput extends Pick<
  DrainStepInput,
  "collectorSha" | "cwd" | "developSha" | "isDryRun" | "pullRequest" | "queueSha" | "reviewFixesSha" | "viewerLogin"
> {
  // The `main` head the window's merge base is measured against, read after the merge that drained it
  mainSha: string;
}
