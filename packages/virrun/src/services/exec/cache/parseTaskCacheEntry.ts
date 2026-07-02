import type { TaskCacheEntry } from "@/models/exec/TaskCacheEntry";

import { taskCacheEntrySchema } from "@/models/exec/TaskCacheEntry";
import { parseJsonWithSchema } from "@/services/exec/util/parseJsonWithSchema";
// Validate the on-disk meta.json into a typed entry. Like parseOverlayManifest, the cache file is untrusted state
// (hand-edited, corrupted, or an older shape), so parseJsonWithSchema JSON-parses then zod-validates it in one step;
// Any malformed content throws an InvalidOperationError rather than replaying garbage as a command's result.
export const parseTaskCacheEntry = (meta: string): TaskCacheEntry =>
  parseJsonWithSchema(meta, taskCacheEntrySchema, parseTaskCacheEntry.name);
