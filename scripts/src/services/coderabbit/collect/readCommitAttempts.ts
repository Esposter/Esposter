import type { CommitAttempts } from "#src/models/coderabbit/collect/CommitAttempts";
import type { CommitAttemptsInput } from "#src/models/coderabbit/collect/CommitAttemptsInput";

import { getAttemptFailure } from "#src/services/coderabbit/collect/getAttemptFailure";
import { getMarkedCount } from "#src/services/coderabbit/collect/getMarkedCount";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { postCommitComment } from "#src/services/coderabbit/collect/postCommitComment";
import { readCommitComments } from "#src/services/coderabbit/collect/readCommitComments";

// The attempts a capped step has made at one commit, and the one way to record another. The marker names the
// Collector's own source as its basis (`getMarker`), and a failure is written to the commit the count is read
// From under the marker the count read — so no step can count against one basis and record against another, or
// Write its failure where the next run does not look.
export const readCommitAttempts = ({
  collectorSha,
  marker,
  sha,
  stackedAttempts = 0,
  viewerLogin,
}: CommitAttemptsInput): CommitAttempts => {
  const attemptMarker = getMarker(marker, sha, [collectorSha]);
  const comments = readCommitComments(sha);
  const attempts = getMarkedCount(comments, viewerLogin, attemptMarker) + stackedAttempts;
  return {
    attempts,
    comments,
    recordFailure: (task, detail) => {
      postCommitComment(sha, getAttemptFailure({ attempts, detail, marker: attemptMarker, task }));
    },
  };
};
