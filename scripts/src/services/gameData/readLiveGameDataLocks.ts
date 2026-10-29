import type { GameDataLock } from "genshin-world";

import { checkHasLockAt } from "#src/services/gameData/checkHasLockAt";
import { GAME_DATA_RETENTION_MS } from "#src/services/gameData/constants";
import { getCommitsOf } from "#src/services/gameData/getCommitsOf";
import { readLockAt } from "#src/services/gameData/readLockAt";
import { runGit } from "#src/services/shared/runGit";

// Every lock a stored object may still be reached by: the working tree's, HEAD's, each remote branch's head, every
// Version origin/main committed within the retention window, and the one in force when the window opened. The git
// History is the one place a revert's lock is still written, so a revert within the window still resolves
export const readLiveGameDataLocks = (workingTreeLock: GameDataLock): GameDataLock[] => {
  const cutoff = new Date(Date.now() - GAME_DATA_RETENTION_MS).toISOString();
  const revisions = [
    ...(checkHasLockAt("HEAD") ? ["HEAD"] : []),
    ...runGit(["for-each-ref", "--format=%(objectname)", "refs/remotes/origin"]).split("\n").filter(Boolean),
    ...getCommitsOf(["origin/main", `--since=${cutoff}`]),
    ...getCommitsOf(["-1", "origin/main", `--before=${cutoff}`]),
  ];
  const remoteLocks = [...new Set(revisions)]
    .filter((revision) => checkHasLockAt(revision))
    .map((revision) => readLockAt(revision));
  return [workingTreeLock, ...remoteLocks];
};
