import type { ChildProcess, spawn as baseSpawn } from "node:child_process";

import { VIRRUN_PREPARE_DIRECTORY_NAME } from "@/services/exec/snapshot/constants";
import { removeSnapshotDirectoryDetached } from "@/services/exec/snapshot/removeSnapshotDirectoryDetached";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { WSL_REMOVE_SCRIPT } from "@/services/exec/wsl/constants";
import { TEST_WSL_CACHE_ROOT_LINUX, TEST_WSL_LEGACY_UNC_PREFIX } from "@/services/exec/wsl/constants.test";
import { createTestWslUnc } from "@/services/exec/wsl/createTestWslUnc.test";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { spawn } = vi.hoisted(() => ({ spawn: vi.fn<typeof baseSpawn>() }));

// Only spawn (the detached teardown) is mocked; readWslPath maps a UNC via its regex without a subprocess, and the
// Local branch's removeSnapshotDirectory uses node:fs, so no other child_process export is exercised here.
vi.mock(import("node:child_process"), () => ({ spawn: spawn as unknown as typeof baseSpawn }));

describe(removeSnapshotDirectoryDetached, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  // A detached child never blocks — assert its lifecycle hooks are wired (error swallowed, unref'd so it outlives us).
  const child = { on: vi.fn<() => void>(), unref: vi.fn<() => void>() };

  beforeEach(() => {
    vi.clearAllMocks();
    spawn.mockReturnValue(child as unknown as ChildProcess);
  });

  afterEach(() => {
    cleanup();
  });

  test("removes a plain directory tree in-process without spawning a detached process", () => {
    expect.hasAssertions();

    const dir = create();
    mkdirSync(join(dir, TEST_FILENAME), { recursive: true });
    writeFileSync(join(dir, TEST_FILENAME, TEST_FILENAME), "");

    removeSnapshotDirectoryDetached(dir);

    expect(existsSync(dir)).toBe(false);
    expect(spawn).not.toHaveBeenCalled();
  });

  test("tears down a WSL-UNC snapshot dir in a detached, unref'd WSL process off the critical path", () => {
    expect.hasAssertions();

    const linuxDir = `${TEST_WSL_CACHE_ROOT_LINUX}/${VIRRUN_PREPARE_DIRECTORY_NAME}/stale`;

    removeSnapshotDirectoryDetached(createTestWslUnc(linuxDir, TEST_WSL_LEGACY_UNC_PREFIX));

    expect(spawn).toHaveBeenCalledExactlyOnceWith(
      "wsl.exe",
      ["--exec", "sh", "-c", WSL_REMOVE_SCRIPT, "sh", linuxDir],
      { detached: true, stdio: "ignore" },
    );
    expect(child.on).toHaveBeenCalledWith("error", expect.any(Function));
    expect(child.unref).toHaveBeenCalledOnce();
  });
});
