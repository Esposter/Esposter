import type { CycleInput } from "#src/models/coderabbit/collect/CycleInput";
import type { FailureSignature } from "#src/models/coderabbit/collect/FailureSignature";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

export interface AttemptsInput extends Pick<CycleInput, "collectorSha"> {
  // The comments the record lives in — a commit's, a pull request's, or the repository's newest commit comments — which
  // The count is read from
  comments: GitHubEntry[];
  // What the attempts are made at: a review's id, a commit's sha or a red's failure signature (`getMarker`)
  key: FailureSignature | number | string;
  // The failure marker the step counts under, which `getAttempts` keys by `key` and the basis
  marker: string;
  // Writes an attempt to the conversation `comments` came from, so the next run counts it
  post: (body: string) => void;
  viewerLogin: string;
}
