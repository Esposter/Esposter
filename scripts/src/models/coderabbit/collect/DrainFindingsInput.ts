import type { DrainInput } from "#src/models/coderabbit/collect/DrainInput";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

export interface DrainFindingsInput extends DrainInput {
  // The tree the drain works on, decided by the caller from what the fixes branch still owes develop
  baseSha: string;
  // The basis the drain's attempts, and the quarantine past them, are counted against (`getMarker`)
  collectorSha: string;
  // The pull request's issue comments, read once by the caller — the markers live in them
  issueComments: GitHubEntry[];
  // The newest review's id, the unit a drain attempt is counted against
  newestReviewId: number;
  reviewFixesSha?: string;
  viewerLogin: string;
}
