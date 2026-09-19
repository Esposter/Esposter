import type { AttemptFailureInput } from "#src/models/coderabbit/collect/AttemptFailureInput";

import { SESSION_ATTEMPT_CAP } from "#src/services/coderabbit/collect/constants";

// The comment a capped step writes when its session failed, in one shape for every step: the marker the next run
// counts, the attempt against the cap that decides whether there is another, and the run to read. A person meets
// these on a pull request and on a commit in the same hour, and a count without its cap says nothing about
// whether anyone will try again.
export const getAttemptFailure = ({ attempts, detail, marker, task }: AttemptFailureInput): string =>
  `${marker}\nAttempt ${attempts + 1} of ${SESSION_ATTEMPT_CAP} to ${task} failed${
    detail === undefined ? "" : ` — the session ${detail}`
  }. See the collector run.`;
