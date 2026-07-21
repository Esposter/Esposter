import type { spawn as baseSpawn, ChildProcess } from "node:child_process";

import { VIRRUN_PREPARE_DIRECTORY_NAME } from "@/services/exec/snapshot/constants";
import { removeSnapshotDirectoriesDetached } from "@/services/exec/snapshot/removeSnapshotDirectoriesDetached";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { WSL_REMOVE_SCRIPT } from "@/services/exec/wsl/constants";
import { TEST_WSL_CACHE_ROOT_LINUX, TEST_WSL_LEGACY_UNC_PREFIX } from "@/services/exec/wsl/constants.test";
import { createTestWslUnc } from "@/services/exec/wsl/createTestWslUnc.test";
import { noop } from "@esposter/shared";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { spawn } = vi.hoisted(() => ({ spawn: vi.fn<typeof baseSpawn>() }));

// Only spawn (the background teardown) is mocked; readWslPath maps a UNC via its regex without a subprocess, and the
// Local branch's removeSnapshotDirectory uses node:fs, so no other child_process export is exercised here.
vi.mock(import("node:child_process"), () => ({ spawn: spawn as unknown as typeof baseSpawn }));

describe(removeSnapshotDirectoriesDetached, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  // A background child never blocks — assert its lifecycle hooks are wired (error swallowed, unref'd so it outlives us).
  const child = { on: vi.fn<() => void>(), unref: vi.fn<() => void>() };

  beforeEach(() => {
    vi.clearAllMocks();
    spawn.mockReturnValue(child as unknown as ChildProcess);
  });

  afterEach(() => {
    cleanup();
  });

  test("removes a plain directory tree in-process without spawning a background process", () => {
    expect.hasAssertions();

    const dir = create();
    mkdirSync(join(dir, TEST_FILENAME), { recursive: true });
    writeFileSync(join(dir, TEST_FILENAME, TEST_FILENAME), "");

    removeSnapshotDirectoriesDetached([dir]);

    expect(existsSync(dir)).toBe(false);
    expect(spawn).not.toHaveBeenCalled();
  });

  test("tears down every WSL-UNC dir in ONE hidden, unref'd WSL process off the critical path", () => {
    expect.hasAssertions();

    const linuxDirs = ["stale", "superseded"].map(
      (name) => `${TEST_WSL_CACHE_ROOT_LINUX}/${VIRRUN_PREPARE_DIRECTORY_NAME}/${name}`,
    );

    removeSnapshotDirectoriesDetached(linuxDirs.map((dir) => createTestWslUnc(dir, TEST_WSL_LEGACY_UNC_PREFIX)));

    // One launch for the whole sweep, never one per dir: each wsl.exe launch is a service RPC plus a relay process,
    // And a per-entry fan-out wedges the WSL service outright (WSL_REMOVE_SCRIPT loops over these args for that
    // Reason). Never `detached` either: on win32 that flag makes Windows ignore windowsHide and flash an empty
    // Console (see spawnBackground / nodejs#21825).
    expect(spawn).toHaveBeenCalledExactlyOnceWith(
      "wsl.exe",
      ["--exec", "sh", "-c", WSL_REMOVE_SCRIPT, "sh", ...linuxDirs],
      { stdio: "ignore", windowsHide: true },
    );
    expect(child.on).toHaveBeenCalledExactlyOnceWith("error", noop);
    expect(child.unref).toHaveBeenCalledExactlyOnceWith();
  });

  test("spawns nothing when no dir is a WSL UNC", () => {
    expect.hasAssertions();

    removeSnapshotDirectoriesDetached([]);

    expect(spawn).not.toHaveBeenCalled();
  });
});
