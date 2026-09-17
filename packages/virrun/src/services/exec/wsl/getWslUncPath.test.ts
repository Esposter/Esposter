import { TEST_WSL_CACHE_ROOT_LINUX, TEST_WSL_STORE_LINUX } from "#src/services/exec/wsl/constants.test";
import { createTestWslUnc } from "#src/services/exec/wsl/createTestWslUnc.test";
import { getWslUncPath } from "#src/services/exec/wsl/getWslUncPath";
import { readWslPath } from "#src/services/exec/wsl/readWslPath";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/exec/wsl/getWslNativeCacheRoot"), () => ({
  getWslNativeCacheRoot: () => createTestWslUnc(TEST_WSL_CACHE_ROOT_LINUX),
}));

describe(getWslUncPath, () => {
  test("addresses the path under the distro the cache root already named", () => {
    expect.hasAssertions();

    // The distro segment is taken off the cache root rather than probed again, so a path outside that root still
    // Lands on the same distro every other UNC in the process is built from.
    expect(getWslUncPath(TEST_WSL_STORE_LINUX)).toBe(createTestWslUnc(TEST_WSL_STORE_LINUX));
  });

  test("is the inverse of readWslPath", () => {
    expect.hasAssertions();

    expect(readWslPath(getWslUncPath(TEST_WSL_STORE_LINUX))).toBe(TEST_WSL_STORE_LINUX);
  });
});
