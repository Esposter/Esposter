import { acquireProcessLock } from "#src/services/shared/acquireProcessLock";
import { releaseProcessLock } from "#src/services/shared/releaseProcessLock";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(releaseProcessLock, () => {
  const LOCK_FILE_NAME = "process.lock";
  const OTHER_PROCESS_ID = 2_000_000_000;
  let directory: string;
  let lockPath: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "process-lock-"));
    lockPath = join(directory, LOCK_FILE_NAME);
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  test("removes the lock this process holds", () => {
    expect.hasAssertions();

    acquireProcessLock(lockPath);
    releaseProcessLock(lockPath);

    expect(existsSync(lockPath)).toBe(false);
  });

  test("leaves a lock another process has taken over", () => {
    expect.hasAssertions();

    writeFileSync(lockPath, String(OTHER_PROCESS_ID));
    releaseProcessLock(lockPath);

    expect(existsSync(lockPath)).toBe(true);
  });
});
