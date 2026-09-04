import { checkHasLiveLease } from "#src/services/exec/snapshot/checkHasLiveLease";
import { VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME } from "#src/services/exec/snapshot/constants";
import { DEAD_PID } from "#src/services/exec/test/constants.test";
import { createTemporaryDirectoryTracker } from "#src/services/exec/test/createTemporaryDirectoryTracker.test";
import { writeLeaseFile } from "#src/services/exec/test/writeLeaseFile.test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(checkHasLiveLease, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  let hashDirectory = "";
  const seedLease = (pid: number): string =>
    writeLeaseFile(join(hashDirectory, VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME), pid);

  beforeEach(() => {
    hashDirectory = create();
  });

  afterEach(cleanup);

  test(`is true while a live run holds a lease`, () => {
    expect.hasAssertions();

    seedLease(process.pid);

    expect(checkHasLiveLease(hashDirectory)).toBe(true);
  });

  test(`is false once only dead leases remain, reaping them`, () => {
    expect.hasAssertions();

    const deadLeaseFile = seedLease(DEAD_PID);

    expect(checkHasLiveLease(hashDirectory)).toBe(false);
    expect(existsSync(deadLeaseFile)).toBe(false);
  });

  test(`is false when the hash dir has no leases directory`, () => {
    expect.hasAssertions();

    expect(checkHasLiveLease(hashDirectory)).toBe(false);
  });
});
