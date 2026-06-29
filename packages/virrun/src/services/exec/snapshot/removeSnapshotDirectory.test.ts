import type { execFileSync as baseExecFileSync } from "node:child_process";

import { removeSnapshotDirectory } from "@/services/exec/snapshot/removeSnapshotDirectory";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import {
  VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME,
  VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME,
  VIRRUN_SNAPSHOTS_DIRECTORY_NAME,
} from "@/services/exec/snapshot/constants";
import {
  TEST_WSL_CACHE_ROOT_LINUX,
  TEST_WSL_LEGACY_UNC_PREFIX,
  TEST_WSL_UNC_PREFIX,
} from "@/services/exec/wsl/constants.test";
import { createTestWslUnc } from "@/services/exec/wsl/createTestWslUnc.test";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { execFileSync } = vi.hoisted(() => ({ execFileSync: vi.fn<typeof baseExecFileSync>() }));

vi.mock(import("node:child_process"), () => ({ execFileSync: execFileSync as unknown as typeof baseExecFileSync }));

// A snapshot leaf on the distro's ext4 (`/home/user/.virrun/snapshots/<hash>/<leaf>`); `h` is a stand-in hash.
const snapshotLeaf = (leaf: string): string =>
  `${TEST_WSL_CACHE_ROOT_LINUX}/${VIRRUN_SNAPSHOTS_DIRECTORY_NAME}/h/${leaf}`;
// The WSL-side teardown removeSnapshotDirectory shells out for a UNC snapshot dir: chmod traversable, then rm -rf.
// The path is passed as a positional arg ($1), never interpolated, so a quote in it can't break the shell quoting.
const expectWslRemoval = (linuxDir: string) => {
  expect(execFileSync).toHaveBeenCalledExactlyOnceWith(
    "wsl.exe",
    ["--exec", "sh", "-c", 'chmod -R u+rwx -- "$1" 2>/dev/null; rm -rf -- "$1"', "sh", linuxDir],
    { stdio: "pipe" },
  );
};

describe(removeSnapshotDirectory, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test("removes a plain directory tree in-process without invoking WSL", () => {
    expect.hasAssertions();

    const dir = create();
    mkdirSync(join(dir, "nested"), { recursive: true });
    writeFileSync(join(dir, "nested", "f.txt"), "x");

    removeSnapshotDirectory(dir);

    expect(existsSync(dir)).toBe(false);
    expect(execFileSync).not.toHaveBeenCalled();
  });

  test(`tears down a ${TEST_WSL_UNC_PREFIX} UNC snapshot dir inside WSL via a chmod + rm -rf`, () => {
    expect.hasAssertions();

    const linuxDir = snapshotLeaf(`${VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME}.x`);

    removeSnapshotDirectory(createTestWslUnc(linuxDir));

    expectWslRemoval(linuxDir);
  });

  test(`tears down a ${TEST_WSL_LEGACY_UNC_PREFIX} UNC snapshot dir inside WSL`, () => {
    expect.hasAssertions();

    const linuxDir = snapshotLeaf(`${VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME}.y`);

    removeSnapshotDirectory(createTestWslUnc(linuxDir, TEST_WSL_LEGACY_UNC_PREFIX));

    expectWslRemoval(linuxDir);
  });
});
