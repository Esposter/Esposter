import { createTemporaryDirectoryTracker } from "#src/services/exec/test/createTemporaryDirectoryTracker.test";
import { computeDirectoryByteSize } from "#src/services/exec/util/computeDirectoryByteSize";
import { TEST_FILENAME } from "#src/services/exec/util/constants.test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(computeDirectoryByteSize, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  let directory = "";

  beforeEach(() => {
    directory = create();
  });

  afterEach(cleanup);

  test("sums the byte size of every file, recursing into subdirectories", () => {
    expect.hasAssertions();

    writeFileSync(join(directory, TEST_FILENAME), " ");
    const nestedDirectory = join(directory, "b");
    mkdirSync(nestedDirectory);
    writeFileSync(join(nestedDirectory, TEST_FILENAME), "  ");

    expect(computeDirectoryByteSize(directory)).toBe(3);
  });

  test("is zero for an empty directory and a nonexistent one", () => {
    expect.hasAssertions();

    expect(computeDirectoryByteSize(directory)).toBe(0);
    expect(computeDirectoryByteSize(join(directory, TEST_FILENAME))).toBe(0);
  });
});
