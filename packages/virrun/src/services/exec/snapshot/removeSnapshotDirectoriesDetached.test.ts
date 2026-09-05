import type { spawn as baseSpawn, ChildProcess } from "node:child_process";
import type { rmSync as baseRmSync, writeFileSync as baseWriteFileSync } from "node:fs";

import { VIRRUN_PREPARE_DIRECTORY_NAME } from "#src/services/exec/snapshot/constants";
import { removeSnapshotDirectoriesDetached } from "#src/services/exec/snapshot/removeSnapshotDirectoriesDetached";
import { createTemporaryDirectoryTracker } from "#src/services/exec/test/createTemporaryDirectoryTracker.test";
import { TEST_DIR, TEST_FILENAME } from "#src/services/exec/util/constants.test";
import { VIRRUN_REMOVE_LIST_TEMP_PREFIX, WSL_REMOVE_LIST_SCRIPT } from "#src/services/exec/wsl/constants";
import { TEST_WSL_CACHE_ROOT_LINUX, TEST_WSL_LEGACY_UNC_PREFIX } from "#src/services/exec/wsl/constants.test";
import { createTestWslUnc } from "#src/services/exec/wsl/createTestWslUnc.test";
import { joinNullDelimited } from "#src/services/exec/wsl/joinNullDelimited";
import { noop, takeOne } from "@esposter/shared";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { cacheRootHolder, rmSync, spawn, writeFileSync } = vi.hoisted(() => ({
  cacheRootHolder: { value: "" },
  rmSync: vi.fn<typeof baseRmSync>(),
  spawn: vi.fn<typeof baseSpawn>(),
  writeFileSync: vi.fn<typeof baseWriteFileSync>(),
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
  return { ...actual, rmSync, writeFileSync };
});
// The cache root is a `\\wsl.localhost` UNC in production and nothing else maps back to a Linux path, so the mock
// Returns one too — the staged list's own path goes through readWslPath exactly like the dirs it holds. Writes to a
// UNC cannot land on a test machine, so the sweep cases capture the staged bytes through the writeFileSync mock
// Instead of reading them back off disk.
vi.mock(import("#src/services/exec/wsl/getWslNativeCacheRoot"), () => ({
  getWslNativeCacheRoot: () => cacheRootHolder.value,
}));

describe(removeSnapshotDirectoriesDetached, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  // A background child never blocks — assert its lifecycle hooks are wired (error swallowed, unref'd so it outlives us).
  const child = { on: vi.fn<() => void>(), unref: vi.fn<() => void>() };

  // What the launched script will read: the staged list is the sweep's only channel for the paths
  const readStagedList = () => takeOne(writeFileSync.mock.calls)[1];

  beforeEach(() => {
    vi.clearAllMocks();
    spawn.mockReturnValue(child as unknown as ChildProcess);
    // The staged list is written to a UNC no test machine can reach, so the write is captured rather than performed
    writeFileSync.mockImplementation(noop);
    cacheRootHolder.value = createTestWslUnc(TEST_WSL_CACHE_ROOT_LINUX);
  });

  afterEach(() => {
    cleanup();
  });

  test("removes a plain directory tree in-process without spawning a background process", () => {
    expect.hasAssertions();

    const directory = create();
    mkdirSync(join(directory, TEST_FILENAME, TEST_FILENAME), { recursive: true });

    removeSnapshotDirectoriesDetached([directory]);

    expect(existsSync(directory)).toBe(false);
    expect(spawn).not.toHaveBeenCalled();
  });

  test("tears down every WSL-UNC dir in ONE hidden, unref'd WSL process off the critical path", () => {
    expect.hasAssertions();

    const linuxDirectories = [TEST_FILENAME, `${TEST_FILENAME}/${TEST_FILENAME}`].map(
      (name) => `${TEST_WSL_CACHE_ROOT_LINUX}/${VIRRUN_PREPARE_DIRECTORY_NAME}/${name}`,
    );

    removeSnapshotDirectoriesDetached(
      linuxDirectories.map((directory) => createTestWslUnc(directory, TEST_WSL_LEGACY_UNC_PREFIX)),
    );

    // One launch for the whole sweep however many dirs it holds, because the paths ride in a list file rather than
    // The argv: each wsl.exe launch is a service RPC plus a relay process, and a fan-out wedges the WSL service
    // Outright, while an argv-sized batch would reintroduce that fan-out one launch at a time. Never `detached`
    // Either: on win32 that flag makes Windows ignore windowsHide and flash an empty console (nodejs#21825).
    expect(spawn).toHaveBeenCalledExactlyOnceWith(
      "wsl.exe",
      ["--exec", "sh", "-c", WSL_REMOVE_LIST_SCRIPT, "sh", expect.stringContaining(VIRRUN_REMOVE_LIST_TEMP_PREFIX)],
      { stdio: "ignore", windowsHide: true },
    );
    expect(readStagedList()).toBe(joinNullDelimited(linuxDirectories));
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

    // `spawnBackground` deliberately lets a synchronous spawn throw reach its caller (EAGAIN/EMFILE) — here that
    // Caller is cache hygiene for dirs this run never touches, so it must not fail the user's command.
    spawn.mockImplementation(() => {
      throw new Error(" ");
    });

    expect(() => {
      removeSnapshotDirectoriesDetached([createTestWslUnc(`${TEST_WSL_CACHE_ROOT_LINUX}/${TEST_FILENAME}`)]);
    }).not.toThrow();
    expect(spawn).toHaveBeenCalledTimes(1);
  });

  test("swallows a failing local removal and still tears down the WSL dirs", () => {
    expect.hasAssertions();

    rmSync.mockImplementationOnce(() => {
      throw new Error(" ");
    });
    const linuxDirectory = `${TEST_WSL_CACHE_ROOT_LINUX}/${VIRRUN_PREPARE_DIRECTORY_NAME}/${TEST_FILENAME}`;

    removeSnapshotDirectoriesDetached([
      join(TEST_DIR, TEST_FILENAME),
      createTestWslUnc(linuxDirectory, TEST_WSL_LEGACY_UNC_PREFIX),
    ]);

    expect(rmSync).toHaveBeenCalledTimes(1);
    expect(spawn).toHaveBeenCalledTimes(1);
    expect(takeOne(spawn.mock.calls)[0]).toBe("wsl.exe");
    expect(readStagedList()).toBe(joinNullDelimited([linuxDirectory]));
  });
});
