import type { execFileSync as baseExecFileSync } from "node:child_process";
import type { rmSync as baseRmSync } from "node:fs";

import { removeSnapshotDirectoryBestEffort } from "@/services/exec/snapshot/removeSnapshotDirectoryBestEffort";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { TEST_DIR, TEST_FILENAME } from "@/services/exec/util/constants.test";
import { TEST_WSL_CACHE_ROOT_LINUX } from "@/services/exec/wsl/constants.test";
import { createTestWslUnc } from "@/services/exec/wsl/createTestWslUnc.test";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { execFileSync, rmSync } = vi.hoisted(() => ({
  execFileSync: vi.fn<typeof baseExecFileSync>(),
  rmSync: vi.fn<typeof baseRmSync>(),
}));

vi.mock(import("node:child_process"), () => ({ execFileSync: execFileSync as unknown as typeof baseExecFileSync }));
// node:fs stays real except for rmSync, which delegates to the real one until a case makes the local removal throw —
// The only portable way to reach that arm, since what a doomed path raises differs per OS and `force` swallows the rest.
vi.mock(import("node:fs"), async (importOriginal) => {
  const actual = await importOriginal();
  rmSync.mockImplementation(actual.rmSync);
  return { ...actual, rmSync };
});

describe(removeSnapshotDirectoryBestEffort, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test("removes the directory tree", () => {
    expect.hasAssertions();

    const dir = create();
    mkdirSync(join(dir, TEST_FILENAME), { recursive: true });
    writeFileSync(join(dir, TEST_FILENAME, TEST_FILENAME), "");

    removeSnapshotDirectoryBestEffort(dir);

    expect(existsSync(dir)).toBe(false);
  });

  test("swallows a teardown failure so it can never displace the run's own error", () => {
    expect.hasAssertions();

    execFileSync.mockImplementation(() => {
      throw new Error("Command failed");
    });

    expect(() =>{ 
      removeSnapshotDirectoryBestEffort(createTestWslUnc(`${TEST_WSL_CACHE_ROOT_LINUX}/${TEST_FILENAME}`)); },
    ).not.toThrow();
    expect(execFileSync).toHaveBeenCalledOnce();
  });

  test("swallows a failing local removal", () => {
    expect.hasAssertions();

    rmSync.mockImplementationOnce(() => {
      throw new Error(" ");
    });

    expect(() => {
      removeSnapshotDirectoryBestEffort(join(TEST_DIR, TEST_FILENAME));
    }).not.toThrow();
    expect(rmSync).toHaveBeenCalledTimes(1);
  });
});
