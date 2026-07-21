import type { spawn as baseSpawn, ChildProcess } from "node:child_process";
import type { rmSync as baseRmSync } from "node:fs";

import { VIRRUN_PREPARE_DIRECTORY_NAME } from "@/services/exec/snapshot/constants";
import { removeSnapshotDirectoriesDetached } from "@/services/exec/snapshot/removeSnapshotDirectoriesDetached";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { TEST_DIR, TEST_FILENAME } from "@/services/exec/util/constants.test";
import { WSL_REMOVE_SCRIPT } from "@/services/exec/wsl/constants";
import { TEST_WSL_CACHE_ROOT_LINUX, TEST_WSL_LEGACY_UNC_PREFIX } from "@/services/exec/wsl/constants.test";
import { createTestWslUnc } from "@/services/exec/wsl/createTestWslUnc.test";
import { noop } from "@esposter/shared";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { rmSync, spawn } = vi.hoisted(() => ({
  rmSync: vi.fn<typeof baseRmSync>(),
  spawn: vi.fn<typeof baseSpawn>(),
}));

// Only spawn (the background teardown) is mocked; readWslPath maps a UNC via its regex without a subprocess, and the
// Local branch's removeSnapshotDirectory uses node:fs, so no other child_process export is exercised here.
vi.mock(import("node:child_process"), () => ({ spawn: spawn as unknown as typeof baseSpawn }));
// Node:fs stays real except for rmSync, which delegates to the real one until a case makes a single local removal
// Throw — the only portable way to reach that arm, since what a doomed path raises (ENOTDIR/EPERM) differs per OS and
// Rm's `force` swallows the rest.
vi.mock(import("node:fs"), async (importOriginal) => {
  const actual = await importOriginal();
  rmSync.mockImplementation(actual.rmSync);
  return { ...actual, rmSync };
});

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

    const linuxDirs = [TEST_FILENAME, `${TEST_FILENAME}/${TEST_FILENAME}`].map(
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

  test("swallows a failing background spawn so the detached sweep never blocks the command", () => {
    expect.hasAssertions();

    // SpawnBackground deliberately lets a synchronous spawn throw reach its caller (EAGAIN/EMFILE, an argv past the
    // Win32 command-line limit once a sweep batches hundreds of entries) — here that caller is cache hygiene for dirs
    // This run never touches, so it must not fail the user's command.
    spawn.mockImplementation(() => {
      throw new Error(" ");
    });

    expect(() => {
      removeSnapshotDirectoriesDetached([createTestWslUnc(`${TEST_WSL_CACHE_ROOT_LINUX}/${TEST_FILENAME}`)]);
    }).not.toThrow();
    expect(spawn).toHaveBeenCalledTimes(1);
  });

  test("swallows a failing local removal and still batches the WSL dirs", () => {
    expect.hasAssertions();

    rmSync.mockImplementationOnce(() => {
      throw new Error(" ");
    });
    const linuxDir = `${TEST_WSL_CACHE_ROOT_LINUX}/${VIRRUN_PREPARE_DIRECTORY_NAME}/${TEST_FILENAME}`;

    removeSnapshotDirectoriesDetached([
      join(TEST_DIR, TEST_FILENAME),
      createTestWslUnc(linuxDir, TEST_WSL_LEGACY_UNC_PREFIX),
    ]);

    expect(rmSync).toHaveBeenCalledTimes(1);
    expect(spawn).toHaveBeenCalledExactlyOnceWith(
      "wsl.exe",
      ["--exec", "sh", "-c", WSL_REMOVE_SCRIPT, "sh", linuxDir],
      { stdio: "ignore", windowsHide: true },
    );
  });
});
