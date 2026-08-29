import {
  TASK_CACHE_MAX_AGE_DAYS,
  TASK_CACHE_META_FILENAME,
  TASK_CACHE_TEMP_PREFIX,
} from "#src/services/exec/cache/constants";
import { sweepStaleEntries } from "#src/services/exec/snapshot/sweepStaleEntries";
import { DAY, getResult } from "@esposter/shared";
import { statSync } from "node:fs";
import { join } from "node:path";

const TASK_CACHE_MAX_AGE_MS = TASK_CACHE_MAX_AGE_DAYS * DAY;
// Age-prune published `tasks/<key>` entries: the tasks root is the one cache surface with no superseded-entry sweep
// (a branch switch flips the working-tree hash back, so an "old" key can become current again — there is no superseded
// Set, only recency). An entry whose `meta.json` has not been touched within TASK_CACHE_MAX_AGE_DAYS is dead weight;
// Losing a still-live one costs a single re-run, the cache being a pure accelerator. Runs beside the temp reap on
// Record — detached, best-effort, off the critical path, exactly like the snapshot prunes. Temps (the `.tmp.` prefix)
// Are skipped: they carry no `meta.json` and are the recorder's own live/corpse scratch, reaped by reapStaleTemps.
export const pruneStaleTaskCacheEntries = (tasksRoot: string): void => {
  const cutoffMs = Date.now() - TASK_CACHE_MAX_AGE_MS;
  sweepStaleEntries(tasksRoot, (name) => {
    if (name.startsWith(TASK_CACHE_TEMP_PREFIX)) return false;
    // A published entry always has a meta file; if it can't be read, keep it rather than evict on a blind guess.
    const mtimeMs = getResult(() => statSync(join(tasksRoot, name, TASK_CACHE_META_FILENAME)).mtimeMs).unwrapOr(
      undefined,
    );
    return mtimeMs !== undefined && mtimeMs < cutoffMs;
  });
};
