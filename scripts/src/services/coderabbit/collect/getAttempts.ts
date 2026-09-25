import type { Attempts } from "#src/models/coderabbit/collect/Attempts";
import type { AttemptsInput } from "#src/models/coderabbit/collect/AttemptsInput";

import { getAttemptFailure } from "#src/services/coderabbit/collect/getAttemptFailure";
import { getMarkedCount } from "#src/services/coderabbit/collect/getMarkedCount";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";

// The attempts a capped step has made at one unit of work, and the one way to record another. The marker names the
// Collector's own source as its basis (`getMarker`), and a failure is written back to the conversation the count
// Was read from under the marker the count read — so no step can count against one basis and record against
// Another, or write its failure where the next run does not look. Where that conversation lives is the caller's:
// A commit's comments (`readCommitAttempts`), or the pull request's the drain already holds.
export const getAttempts = ({
  collectorSha,
  comments,
  key,
  marker,
  post,
  stackedAttempts = 0,
  viewerLogin,
}: AttemptsInput): Attempts => {
  const attemptMarker = getMarker(marker, key, [collectorSha]);
  const attempts = getMarkedCount(comments, viewerLogin, attemptMarker) + stackedAttempts;
  return {
    attempts,
    recordFailure: (task, detail) => {
      post(getAttemptFailure({ attempts, detail, marker: attemptMarker, task }));
    },
  };
};
