import { VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME } from "@/services/exec/snapshot/constants";
import { hasLiveLease } from "@/services/exec/snapshot/hasLiveLease";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(hasLiveLease, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  // A pid far above any real one, so its owner reads as dead (ESRCH).
  const DEAD_PID = 2 ** 30;
  let hashDir = "";
  const seedLease = (pid: number): string => {
    const leasesDir = join(hashDir, VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME);
    mkdirSync(leasesDir, { recursive: true });
    const file = join(leasesDir, String(pid));
    writeFileSync(file, "");
    return file;
  };

  beforeEach(() => {
    hashDir = create();
  });

  afterEach(cleanup);

  test(`is true while a live run holds a lease`, () => {
    expect.hasAssertions();

    seedLease(process.pid);

    expect(hasLiveLease(hashDir)).toBe(true);
  });

  test(`is false once only dead leases remain, reaping them`, () => {
    expect.hasAssertions();

    const dead = seedLease(DEAD_PID);

    expect(hasLiveLease(hashDir)).toBe(false);
    expect(existsSync(dead)).toBe(false);
  });

  test(`is false when the hash dir has no leases directory`, () => {
    expect.hasAssertions();

    expect(hasLiveLease(hashDir)).toBe(false);
  });
});
