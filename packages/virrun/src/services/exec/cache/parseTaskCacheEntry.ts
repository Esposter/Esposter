import type { TaskCacheEntry } from "@/models/exec/TaskCacheEntry";

import { taskCacheEntrySchema } from "@/models/exec/TaskCacheEntry";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";
// Validate the on-disk meta.json into a typed entry. Like parseOverlayManifest, the cache file is untrusted state
// (hand-edited, corrupted, or an older shape), so it is JSON-parsed then zod-validated in one getResult; any
// Malformed content throws an InvalidOperationError rather than replaying garbage as a command's result.
export const parseTaskCacheEntry = (meta: string): TaskCacheEntry =>
  getResult(() => taskCacheEntrySchema.parse(JSON.parse(meta))).match(
    (entry) => entry,
    (error) => {
      throw new InvalidOperationError(
        Operation.Read,
        parseTaskCacheEntry.name,
        error instanceof Error ? error.message : String(error),
      );
    },
  );
