import { VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME } from "@/services/exec/snapshot/constants";
import { createLease } from "@/services/exec/snapshot/createLease";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(createLease, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  // A pid far above any real one, so a pre-existing lease reads as a dead owner's corpse.
  const DEAD_PID = 2 ** 30;
  let hashDir = "";
  const leaseFileFor = (pid: number): string => join(hashDir, VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME, String(pid));

  beforeEach(() => {
    hashDir = create();
  });

  afterEach(cleanup);

  test(`writes a lease for the current pid and releases it on demand`, () => {
    expect.hasAssertions();

    const lease = createLease(hashDir);
    const leaseFile = leaseFileFor(process.pid);
    expect(existsSync(leaseFile)).toBe(true);
    lease.release();
    expect(existsSync(leaseFile)).toBe(false);
  });

  test(`self-heals a dead lease left in the live dir`, () => {
    expect.hasAssertions();

    const leasesDir = join(hashDir, VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME);
    mkdirSync(leasesDir, { recursive: true });
    const deadLease = leaseFileFor(DEAD_PID);
    writeFileSync(deadLease, "");

    createLease(hashDir);

    expect(existsSync(deadLease)).toBe(false);
    expect(existsSync(leaseFileFor(process.pid))).toBe(true);
  });

  test(`release does not throw when the lease is already gone`, () => {
    expect.hasAssertions();

    const lease = createLease(hashDir);
    lease.release();

    expect(() => lease.release()).not.toThrow();
  });
});
