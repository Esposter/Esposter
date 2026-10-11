import { acquireProcessLock } from "#src/services/shared/acquireProcessLock";
import { PROCESS_LOCK_WRITE_GRACE_MILLISECONDS } from "#src/services/shared/constants";
import { existsSync, mkdtempSync, readFileSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(acquireProcessLock, () => {
  const LOCK_FILE_NAME = "process.lock";
  const DEAD_PROCESS_ID = 2_000_000_000;
  let directory: string;
  let lockPath: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "process-lock-"));
    lockPath = join(directory, LOCK_FILE_NAME);
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  test("refuses a lock a live process holds", () => {
    expect.hasAssertions();

    expect(acquireProcessLock(lockPath)).toBe(true);
    expect(acquireProcessLock(lockPath)).toBe(false);
  });

  test("takes a lock whose process is gone", () => {
    expect.hasAssertions();

    writeFileSync(lockPath, String(DEAD_PROCESS_ID));

    expect(acquireProcessLock(lockPath)).toBe(true);
    expect(readFileSync(lockPath, "utf8")).toBe(String(process.pid));
  });

  test("takes a lock written before the machine booted, though its process id is live again", () => {
    expect.hasAssertions();

    writeFileSync(lockPath, String(process.pid));
    utimesSync(lockPath, 0, 0);

    expect(acquireProcessLock(lockPath)).toBe(true);
  });

  test("refuses an empty lock its holder is still writing", () => {
    expect.hasAssertions();

    writeFileSync(lockPath, "");

    expect(acquireProcessLock(lockPath)).toBe(false);
  });

  test("takes an empty lock past the grace its holder had to write it in", () => {
    expect.hasAssertions();

    writeFileSync(lockPath, "");
    const writtenSeconds =
      (Temporal.Now.instant().epochMilliseconds - PROCESS_LOCK_WRITE_GRACE_MILLISECONDS * 2) / 1000;
    utimesSync(lockPath, writtenSeconds, writtenSeconds);

    expect(acquireProcessLock(lockPath)).toBe(true);
  });

  test("refuses a stale lock a live process is taking over", () => {
    expect.hasAssertions();

    writeFileSync(lockPath, String(DEAD_PROCESS_ID));
    writeFileSync(`${lockPath}.takeover`, String(process.pid));

    expect(acquireProcessLock(lockPath)).toBe(false);
  });

  test("takes a stale lock over past a takeover its taker died in", () => {
    expect.hasAssertions();

    writeFileSync(lockPath, String(DEAD_PROCESS_ID));
    writeFileSync(`${lockPath}.takeover`, String(DEAD_PROCESS_ID));

    expect(acquireProcessLock(lockPath)).toBe(true);
    expect(existsSync(`${lockPath}.takeover`)).toBe(false);
  });
});
