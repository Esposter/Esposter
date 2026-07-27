import type { execFileSync as baseExecFileSync } from "node:child_process";

import { removeSnapshotDirectoryBestEffort } from "@/services/exec/snapshot/removeSnapshotDirectoryBestEffort";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { TEST_WSL_CACHE_ROOT_LINUX } from "@/services/exec/wsl/constants.test";
import { createTestWslUnc } from "@/services/exec/wsl/createTestWslUnc.test";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { execFileSync } = vi.hoisted(() => ({ execFileSync: vi.fn<typeof baseExecFileSync>() }));

vi.mock(import("node:child_process"), () => ({ execFileSync: execFileSync as unknown as typeof baseExecFileSync }));

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

  // One guard covers every way the delegated removal can throw, so the WSL arm stands for all of them.
  test("swallows a teardown failure so it can never displace the run's own error", () => {
    expect.hasAssertions();

    // Once, not permanently: `clearAllMocks` resets calls but keeps implementations, so a plain
    // `mockImplementation` here would hand every test added after this one a throwing `execFileSync`
    execFileSync.mockImplementationOnce(() => {
      throw new Error(" ");
    });

    expect(() => {
      removeSnapshotDirectoryBestEffort(createTestWslUnc(`${TEST_WSL_CACHE_ROOT_LINUX}/${TEST_FILENAME}`));
    }).not.toThrow();
    expect(execFileSync).toHaveBeenCalledTimes(1);
  });
});
