import { TASK_CACHE_ARCHIVE_EXTENSION, TASK_CACHE_ARCHIVE_UUID_REGEX } from "#src/services/worktree/create/constants";
import { withFinalizer } from "@esposter/shared";
import { DatabaseSync } from "node:sqlite";

// The output archives a task cache's database names. A recorded run names its archive by the archive's UUID, inside a stored
// Value of the tables, so every UUID a value holds is an archive the cache expects beside it
export const readReferencedArchives = (databasePath: string): string[] => {
  const database = new DatabaseSync(databasePath, { readOnly: true });
  return withFinalizer(
    () => {
      const uuids = database
        .prepare("SELECT value FROM cache_entries UNION ALL SELECT value FROM task_fingerprints")
        .all()
        .flatMap((row) => Object.values(row))
        .flatMap((value) =>
          value instanceof Uint8Array
            ? (Buffer.from(value).toString("latin1").match(TASK_CACHE_ARCHIVE_UUID_REGEX) ?? [])
            : [],
        );
      return Array.from(new Set(uuids), (uuid) => `${uuid}${TASK_CACHE_ARCHIVE_EXTENSION}`);
    },
    () => {
      database.close();
    },
  );
};
