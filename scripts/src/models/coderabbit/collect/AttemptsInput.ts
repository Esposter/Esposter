import type { CycleInput } from "#src/models/coderabbit/collect/CycleInput";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

export interface AttemptsInput extends Pick<CycleInput, "collectorSha"> {
  // The comments the record lives in — a commit's, or a pull request's — which the count is read from
  comments: GitHubEntry[];
  // What the attempts are made at: a review's id or a commit's sha (`getMarker`)
  key: number | string;
  // The failure marker the step counts under, which `getAttempts` keys by `key` and the basis
  marker: string;
  // Writes a failure to the conversation `comments` came from, so the next run counts it
  post: (body: string) => void;
  // Attempts the step counts that no marker records — the repairs already stacked at `main`'s head
  // (`readStackedRepairs`)
  stackedAttempts?: number;
  viewerLogin: string;
}
