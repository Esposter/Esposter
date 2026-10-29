import { QUEUE_BRANCH, REMOTE_NAME, REMOTE_QUEUE_REF } from "#src/services/shared/constants";
import { spawnGit } from "#src/services/shared/spawnGit";

// The push reported success, so origin's queue must now hold HEAD as an ancestor. The queue is fetched first, so the
// Check reads the remote's answer rather than the remote-tracking ref the push itself moved
export const verifyLanded = (): boolean => {
  spawnGit(["fetch", "--quiet", REMOTE_NAME, QUEUE_BRANCH]);
  return spawnGit(["merge-base", "--is-ancestor", "HEAD", REMOTE_QUEUE_REF]).status === 0;
};
