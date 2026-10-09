import type { Attempts } from "#src/models/coderabbit/collect/Attempts";
import type { AttemptsInput } from "#src/models/coderabbit/collect/AttemptsInput";

import { SESSION_ATTEMPT_CAP } from "#src/services/coderabbit/collect/constants";
import { getAttemptFailure } from "#src/services/coderabbit/collect/getAttemptFailure";
import { getMarkedCount } from "#src/services/coderabbit/collect/getMarkedCount";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";

// The attempts a capped step has made at one unit of work, and the one way to record another. The marker names the
// Collector's own source as its basis (`getMarker`), and an attempt is written back to the conversation the count
// Was read from under the marker the count read — so no step can count against one basis and record against
// Another, or write its attempt where the next run does not look. Where that conversation lives is the caller's:
// A commit's comments (`readCommitAttempts`), the pull request's the drain already holds, or the repository's
// Newest commit comments a red's signature is counted over (`readSignatureAttempts`).
export const getAttempts = ({ collectorSha, comments, key, marker, post, viewerLogin }: AttemptsInput): Attempts => {
  const attemptMarker = getMarker(marker, key, [collectorSha]);
  const attempts = getMarkedCount(comments, viewerLogin, attemptMarker);
  return {
    attempts,
    recordAttempt: (note) => {
      post(`${attemptMarker}\nAttempt ${attempts + 1} of ${SESSION_ATTEMPT_CAP}: ${note}`);
    },
    recordFailure: (task, detail) => {
      post(getAttemptFailure({ attempts, detail, marker: attemptMarker, task }));
    },
  };
};
