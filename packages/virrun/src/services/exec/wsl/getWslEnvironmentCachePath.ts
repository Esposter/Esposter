import { getLocalCacheDirectory } from "#src/services/exec/util/getLocalCacheDirectory";
import { join } from "node:path";
// Where a persisted win32 WSL environment probe (`filename`) lives: Windows-side (getLocalCacheDirectory), to avoid a
// Circular "resolve the cache directory by spawning the very probe the cache exists to skip". The reader, the writer
// And `cache clean --all` all resolve it here, so none of the three can go on looking in a directory the others left.
export const getWslEnvironmentCachePath = (filename: string): string => join(getLocalCacheDirectory(), filename);
