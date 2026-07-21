import type { execFileSync as baseExecFileSync } from "node:child_process";

import {
    VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME,
    VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME,
    VIRRUN_SNAPSHOTS_DIRECTORY_NAME,
} from "@/services/exec/snapshot/constants";
import { removeSnapshotDirectory } from "@/services/exec/snapshot/removeSnapshotDirectory";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { CACHE_CLEAN_TIMEOUT_MS, WSL_WORK_TIMEOUT_MS } from "@/services/exec/util/constants";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { WSL_REMOVE_SCRIPT } from "@/services/exec/wsl/constants";
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
// Paths are passed as positional args, never interpolated, so a quote in one can't break the shell quoting — and the
// Bound is the work timeout, not the probe's: unlinking a node_modules closure is minutes of real work, while an
// Unbounded call against a wedged WSL service would never return at all.
const expectWslRemoval = (linuxDir: string, timeoutMs: number = WSL_WORK_TIMEOUT_MS) => {
  expect(execFileSync).toHaveBeenCalledExactlyOnceWith(
    "wsl.exe",
    ["--exec", "sh", "-c", WSL_REMOVE_SCRIPT, "sh", linuxDir],
    { encoding: "buffer", stdio: "pipe", timeout: timeoutMs, windowsHide: true },
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
    mkdirSync(join(dir, TEST_FILENAME), { recursive: true });
    writeFileSync(join(dir, TEST_FILENAME, TEST_FILENAME), "");

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

  // A whole-cache clean unlinks tens of GB of small files on ext4 — minutes past the per-entry work cap — and a
  // SIGTERM mid-`rm -rf` would leave a half-swept cache, so the caller drops the bound entirely.
  test("removes under the caller's timeout override so a cache clean runs to completion", () => {
    expect.hasAssertions();

    const linuxDir = snapshotLeaf(VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME);

    removeSnapshotDirectory(createTestWslUnc(linuxDir), CACHE_CLEAN_TIMEOUT_MS);

    expectWslRemoval(linuxDir, CACHE_CLEAN_TIMEOUT_MS);
  });

  // A file or symlink is not traversable, so the top-down +rwx restore must be skipped rather than ENOTDIR on it.
  test("removes a path that is a file rather than a directory", () => {
    expect.hasAssertions();

    const file = join(create(), TEST_FILENAME);
    writeFileSync(file, "");

    removeSnapshotDirectory(file);

    expect(existsSync(file)).toBe(false);
    expect(execFileSync).not.toHaveBeenCalled();
  });

  test("removeSnapshotDirectory is idempotent", () => {
    expect.hasAssertions();

    const dir = join(create(), TEST_FILENAME);
    mkdirSync(dir);

    removeSnapshotDirectory(dir);
    removeSnapshotDirectory(dir);

    expect(existsSync(dir)).toBe(false);
    expect(execFileSync).not.toHaveBeenCalled();
  });
});
