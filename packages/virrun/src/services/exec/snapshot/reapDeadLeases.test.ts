import { VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME } from "@/services/exec/snapshot/constants";
import { reapDeadLeases } from "@/services/exec/snapshot/reapDeadLeases";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(reapDeadLeases, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  // A pid far above any real one, so its owner reads as dead (ESRCH).
  const DEAD_PID = 2 ** 30;
  let leasesDir = "";
  const seedLease = (pid: number): string => {
    const file = join(leasesDir, String(pid));
    writeFileSync(file, "");
    return file;
  };

  beforeEach(() => {
    leasesDir = create();
  });

  afterEach(cleanup);

  test(`keeps a live lease and reports a live holder`, () => {
    expect.hasAssertions();

    const live = seedLease(process.pid);

    expect(reapDeadLeases(leasesDir)).toBe(true);
    expect(existsSync(live)).toBe(true);
  });

  test(`removes a dead lease and reports no live holder`, () => {
    expect.hasAssertions();

    const dead = seedLease(DEAD_PID);

    expect(reapDeadLeases(leasesDir)).toBe(false);
    expect(existsSync(dead)).toBe(false);
  });

  test(`reports no live holder for an absent leases directory`, () => {
    expect.hasAssertions();

    expect(reapDeadLeases(join(create(), VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME))).toBe(false);
  });
});
