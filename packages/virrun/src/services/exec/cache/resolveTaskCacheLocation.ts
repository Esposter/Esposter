import type { TaskCacheLocation } from "#src/models/exec/cache/TaskCacheLocation";

import {
  TASK_CACHE_META_FILENAME,
  TASK_CACHE_PAYLOAD_DIRECTORY_NAME,
  VIRRUN_TASKS_DIRECTORY_NAME,
} from "#src/services/exec/cache/constants";
import { getGlobalCacheDirectory } from "#src/services/exec/util/getGlobalCacheDirectory";
import { existsSync } from "node:fs";
import { join } from "node:path";
// Resolve a task key to its host-global cache address (getGlobalCacheDirectory()/tasks/<key>/) without touching the
// Filesystem beyond the `exists` probe. Mirrors resolveSnapshotLocation: the entry lives outside the repo so it is
// Shared across checkouts/CI, and `exists` keys off the meta file — an entry is only replayable once meta.json has
// Been atomically published, so a half-written payload never reads as a hit.
export const resolveTaskCacheLocation = (key: string): TaskCacheLocation => {
  const directory = join(getGlobalCacheDirectory(), VIRRUN_TASKS_DIRECTORY_NAME, key);
  const metaFile = join(directory, TASK_CACHE_META_FILENAME);
  return {
    directory,
    exists: existsSync(metaFile),
    metaFile,
    payloadDirectory: join(directory, TASK_CACHE_PAYLOAD_DIRECTORY_NAME),
  };
};
