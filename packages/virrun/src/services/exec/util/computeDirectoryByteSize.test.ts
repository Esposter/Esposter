import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { computeDirectoryByteSize } from "@/services/exec/util/computeDirectoryByteSize";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(computeDirectoryByteSize, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  let dir = "";

  beforeEach(() => {
    dir = create();
  });

  afterEach(cleanup);

  test("sums the byte size of every file, recursing into subdirectories", () => {
    expect.hasAssertions();

    writeFileSync(join(dir, "a"), "12");
    const nested = join(dir, "nested");
    mkdirSync(nested);
    writeFileSync(join(nested, "b"), "345");

    expect(computeDirectoryByteSize(dir)).toBe(5);
  });

  test("is zero for an empty directory and a nonexistent one", () => {
    expect.hasAssertions();

    expect(computeDirectoryByteSize(dir)).toBe(0);
    expect(computeDirectoryByteSize(join(dir, "absent"))).toBe(0);
  });
});
