import { TASK_CACHE_DATABASE_NAME, TASK_CACHE_PATH } from "#src/services/worktree/create/constants";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";

// When a worktree's task cache last recorded a run. A connection the database still holds open keeps its newest writes
// In the Write-ahead log beside it until a checkpoint, so the log's time counts with the database's
export const readRecordedAt = (worktreePath: string): number => {
  const cachePath = join(worktreePath, TASK_CACHE_PATH);
  return Math.max(
    ...[TASK_CACHE_DATABASE_NAME, `${TASK_CACHE_DATABASE_NAME}-wal`]
      .map((name) => join(cachePath, name))
      .filter((path) => existsSync(path))
      .map((path) => statSync(path).mtimeMs),
  );
};
