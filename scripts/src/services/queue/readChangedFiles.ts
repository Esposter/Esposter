import type { ChangedFile } from "#src/models/queue/ChangedFile";

import { ChangeStatus } from "#src/models/queue/ChangeStatus";
import { parseNameStatus } from "#src/services/queue/parseNameStatus";
import {
  CHILD_PROCESS_TIMEOUT_MS,
  QUEUE_BRANCH,
  REMOTE_NAME,
  REMOTE_QUEUE_REF,
  REPOSITORY_ROOT,
} from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";

// Every file the checkout changes against the queue's merge base, committed or not: the tracked ones with their status,
// And the untracked ones, each an addition. The queue is fetched first, so the base is its current tip; a stale one would
// List other sessions' commits as this checkout's changes. The fetch is the one call here that reaches the network, so
// It is bounded; the local reads after it cannot wait on anything outside the checkout
export const readChangedFiles = (): ChangedFile[] => {
  runGit(["fetch", "--quiet", REMOTE_NAME, QUEUE_BRANCH], REPOSITORY_ROOT, undefined, CHILD_PROCESS_TIMEOUT_MS);
  const mergeBase = runGit(["merge-base", "HEAD", REMOTE_QUEUE_REF]).trim();
  const trackedFiles = parseNameStatus(runGit(["diff", "--name-status", "--no-renames", "-z", mergeBase]));
  const untrackedPaths = runGit(["ls-files", "--others", "--exclude-standard", "-z"]).split("\0");
  return [
    ...trackedFiles,
    ...untrackedPaths.filter((path) => path !== "").map((path) => ({ path, status: ChangeStatus.Added })),
  ];
};
