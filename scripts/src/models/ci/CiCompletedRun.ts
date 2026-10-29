import type { CiJob } from "#src/models/ci/CiJob";

// One workflow run once it settles, as `gh run view --json conclusion,jobs` gives the fields the watch reads
export interface CiCompletedRun {
  conclusion: string;
  jobs: CiJob[];
}
