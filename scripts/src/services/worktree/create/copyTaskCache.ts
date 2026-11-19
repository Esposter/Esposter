import { TASK_CACHE_ARCHIVE_EXTENSION, TASK_CACHE_DATABASE_NAME } from "#src/services/worktree/create/constants";
import { readReferencedArchives } from "#src/services/worktree/create/readReferencedArchives";
import { InvalidOperationError, Operation, withFinalizerAsync } from "@esposter/shared";
import { copyFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { backup, DatabaseSync } from "node:sqlite";

// Copies a sibling's task cache into a fresh one. The database goes first: each archive it names was written before the row
// That names it, so every archive copied after the snapshot is on disk. A copy whose database still names an archive the
// Source lacks would fail that run's restore, so it is refused, and the caller removes it
export const copyTaskCache = async (sourceCachePath: string, destinationCachePath: string): Promise<void> => {
  const source = new DatabaseSync(join(sourceCachePath, TASK_CACHE_DATABASE_NAME), { readOnly: true });
  await withFinalizerAsync(
    () => backup(source, join(destinationCachePath, TASK_CACHE_DATABASE_NAME)),
    () => {
      source.close();
    },
  );
  for (const name of readdirSync(sourceCachePath))
    if (name.endsWith(TASK_CACHE_ARCHIVE_EXTENSION))
      copyFileSync(join(sourceCachePath, name), join(destinationCachePath, name));
  const missing = readReferencedArchives(join(destinationCachePath, TASK_CACHE_DATABASE_NAME)).filter(
    (name) => !existsSync(join(destinationCachePath, name)),
  );
  if (missing.length > 0)
    throw new InvalidOperationError(
      Operation.Create,
      destinationCachePath,
      `the copied task cache names archives its source no longer holds: ${missing.join(", ")}`,
    );
};
