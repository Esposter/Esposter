import { BUILD_CACHE_KEEP_COUNT, BUILD_CACHE_TEMPORARY_PREFIX } from "#src/services/buildCache/constants";
import { readdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";

// Keeps the newest keys of one package's cache, by when each was stored or last restored, and removes the rest
export const pruneBuildCache = (packageCacheDirectory: string): void => {
  const keys = readdirSync(packageCacheDirectory)
    .filter((name) => !name.startsWith(BUILD_CACHE_TEMPORARY_PREFIX))
    .map((name) => ({
      modified: statSync(join(packageCacheDirectory, name)).mtimeMs,
      path: join(packageCacheDirectory, name),
    }))
    .toSorted((left, right) => right.modified - left.modified);
  for (const { path } of keys.slice(BUILD_CACHE_KEEP_COUNT)) rmSync(path, { force: true, recursive: true });
};
