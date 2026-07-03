import { VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME } from "@/services/exec/snapshot/constants";
import { hasLiveLease } from "@/services/exec/snapshot/hasLiveLease";
import { DEAD_PID } from "@/services/exec/test/constants.test";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { writeLeaseFile } from "@/services/exec/test/writeLeaseFile.test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(hasLiveLease, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  let hashDir = "";
  const seedLease = (pid: number): string =>
    writeLeaseFile(join(hashDir, VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME), pid);

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
