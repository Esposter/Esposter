import type { CycleInput } from "#src/models/coderabbit/collect/CycleInput";

export interface CommitAttemptsInput extends Pick<CycleInput, "collectorSha"> {
  // The failure marker the step counts under, which `readCommitAttempts` keys by the commit and the basis
  marker: string;
  // The commit the attempts are recorded on
  sha: string;
  // Attempts the step counts that no marker records — the repairs already stacked at `main`'s head
  // (`readStackedRepairs`)
  stackedAttempts?: number;
  viewerLogin: string;
}
