import type { GameDataLock } from "genshin-world";

import { GAME_DATA_LOCK_REPOSITORY_PATH, GAME_DATA_RETENTION_MS } from "#src/services/gameData/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";
import { gameDataLockSchema } from "genshin-world";

const checkHasLockAt = (revision: string): boolean =>
  getResult(() => runGit(["cat-file", "-e", `${revision}:${GAME_DATA_LOCK_REPOSITORY_PATH}`])).match(
    () => true,
    () => false,
  );

// A lock that exists but does not parse throws, since skipping it would let a prune take what it names
const readLockAt = (revision: string): GameDataLock =>
  gameDataLockSchema.parse(parseMachineJson(runGit(["show", `${revision}:${GAME_DATA_LOCK_REPOSITORY_PATH}`])));

const getCommitsOf = (args: string[]): string[] =>
  runGit(["log", ...args, "--format=%H", "--", GAME_DATA_LOCK_REPOSITORY_PATH])
    .split("\n")
    .filter(Boolean);

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
