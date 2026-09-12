import { DEAD_PID } from "#src/services/exec/test/constants.test";
import { createTemporaryDirectoryTracker } from "#src/services/exec/test/createTemporaryDirectoryTracker.test";
import { seedFile } from "#src/services/exec/test/seedFile.test";
import { checkIsOwnerAlive } from "#src/services/exec/util/checkIsOwnerAlive";
import { utimesSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

// The parent is a live process this one did not start, so it stands in for a concurrent run — and, once the entry is
// Dated before it existed, for a stranger holding a recycled pid.
describe(checkIsOwnerAlive, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  let entryPath = "";

  beforeEach(() => {
    entryPath = seedFile(join(create(), `${process.ppid.toString()}.entry`));
  });

  afterEach(cleanup);

  test("a live pid that started before the entry is its owner", () => {
    expect.hasAssertions();

    expect(checkIsOwnerAlive(process.ppid, entryPath)).toBe(true);
  });

  test("a live pid that started after the entry is a stranger holding a recycled pid", () => {
    expect.hasAssertions();

    utimesSync(entryPath, 0, 0);

    expect(checkIsOwnerAlive(process.ppid, entryPath)).toBe(false);
  });

  test("a dead pid is never an owner", () => {
    expect.hasAssertions();

    expect(checkIsOwnerAlive(DEAD_PID, entryPath)).toBe(false);
  });
});
