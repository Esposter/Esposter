import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { computeDirectoryByteSize } from "@/services/exec/util/computeDirectoryByteSize";
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

    writeFileSync(join(directory, "a"), "12");
    const nestedDirectory = join(directory, "nested");
    mkdirSync(nestedDirectory);
    writeFileSync(join(nestedDirectory, "b"), "345");

    expect(computeDirectoryByteSize(directory)).toBe(5);
  });

  test("is zero for an empty directory and a nonexistent one", () => {
    expect.hasAssertions();

    expect(computeDirectoryByteSize(directory)).toBe(0);
    expect(computeDirectoryByteSize(join(directory, "absent"))).toBe(0);
  });
});
