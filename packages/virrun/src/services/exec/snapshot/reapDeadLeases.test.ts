import { VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME } from "@/services/exec/snapshot/constants";
import { reapDeadLeases } from "@/services/exec/snapshot/reapDeadLeases";
import { DEAD_PID } from "@/services/exec/test/constants.test";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { writeLeaseFile } from "@/services/exec/test/writeLeaseFile.test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(reapDeadLeases, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  let leasesDirectory = "";
  const seedLease = (pid: number): string => writeLeaseFile(leasesDirectory, pid);

  beforeEach(() => {
    leasesDirectory = create();
  });

  afterEach(cleanup);

  test(`keeps a live lease and reports a live holder`, () => {
    expect.hasAssertions();

    const liveLease = seedLease(process.pid);

    expect(reapDeadLeases(leasesDirectory)).toBe(true);
    expect(existsSync(liveLease)).toBe(true);
  });

  test(`removes a dead lease and reports no live holder`, () => {
    expect.hasAssertions();

    const deadLease = seedLease(DEAD_PID);

    expect(reapDeadLeases(leasesDirectory)).toBe(false);
    expect(existsSync(deadLease)).toBe(false);
  });

  test(`reports no live holder for an absent leases directory`, () => {
    expect.hasAssertions();

    expect(reapDeadLeases(join(create(), VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME))).toBe(false);
  });
});
