import { copyTaskCache } from "#src/services/worktree/create/copyTaskCache";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(copyTaskCache, () => {
  const ARCHIVE_UUID = "5d3c2b1a-0f9e-4d8c-8b7a-6f5e4d3c2b1a";
  const ARCHIVE_NAME = `${ARCHIVE_UUID}.tar.zst`;
  const CACHE_DATABASE_NAME = "cache.db";

  // A task cache whose one recorded run names the archive, the way a run's stored value does, beside the archives given
  const createCache = (directory: string, archives: string[]): void => {
    mkdirSync(directory, { recursive: true });
    const database = new DatabaseSync(join(directory, CACHE_DATABASE_NAME));
    database.exec(
      "CREATE TABLE cache_entries (key TEXT PRIMARY KEY, value BLOB); CREATE TABLE task_fingerprints (key TEXT PRIMARY KEY, value BLOB);",
    );
    database.prepare("INSERT INTO cache_entries (key, value) VALUES (?, ?)").run("run", Buffer.from(ARCHIVE_UUID));
    database.close();
    for (const archive of archives) writeFileSync(join(directory, archive), "archive");
  };

  let root: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "copy-task-cache-"));
  });

  afterEach(() => {
    rmSync(root, { force: true, recursive: true });
  });

  test("refuses a copy whose database names an archive its source no longer holds", async () => {
    expect.hasAssertions();

    const source = join(root, "source");
    const destination = join(root, "destination");
    createCache(source, []);
    mkdirSync(destination);

    await expect(copyTaskCache(source, destination)).rejects.toStrictEqual(
      new InvalidOperationError(
        Operation.Create,
        destination,
        `the copied task cache names archives its source no longer holds: ${ARCHIVE_NAME}`,
      ),
    );
  });

  test("copies the database and each archive beside it", async () => {
    expect.hasAssertions();

    const source = join(root, "source");
    const destination = join(root, "destination");
    createCache(source, [ARCHIVE_NAME]);
    mkdirSync(destination);

    await copyTaskCache(source, destination);

    expect(existsSync(join(destination, CACHE_DATABASE_NAME))).toBe(true);
    expect(existsSync(join(destination, ARCHIVE_NAME))).toBe(true);
  });
});
