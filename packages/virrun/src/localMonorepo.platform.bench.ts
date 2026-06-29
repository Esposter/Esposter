import type { ExecOptions } from "@/models/exec/ExecOptions";

import { BackendType } from "@/models/virrun/BackendType";
import { createNativeBackend } from "@/services/exec/native/createNativeBackend";
import { createOsBackend } from "@/services/exec/os/createOsBackend";
import { isOsBackendSupported } from "@/services/exec/os/isOsBackendSupported";
import { createSnapshot } from "@/services/exec/snapshot/createSnapshot";
import { forkSnapshot } from "@/services/exec/snapshot/forkSnapshot";
import { removeSnapshotDirectory } from "@/services/exec/snapshot/removeSnapshotDirectory";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { createWorkspaceCorpus } from "@/services/exec/test/createWorkspaceCorpus.test";
import { findRepoRoot } from "@/services/exec/test/findRepoRoot.test";
import {
  PNPM_CONFIG_PACKAGE_IMPORT_METHOD_KEY,
  PNPM_CONFIG_PACKAGE_IMPORT_METHOD_VALUE,
  PNPM_CONFIG_STORE_DIR_KEY,
} from "@/services/exec/util/constants";
import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { join } from "node:path";
import { afterAll, bench, describe } from "vitest";
// End-to-end speed gate: native baseline vs os sandbox on real monorepo commands. Runs on any host that
// Supports the os backend - the sandbox runs natively on Linux (os/linux) and bridged from win32 via WSL
// (os/wsl) - so this is a `.platform.bench.ts`, writing one committed artifact per platform. The baseline
// Is the real host shell (/bin/sh on Linux, cmd.exe on win32); the os sandbox always runs /bin/sh, so the
// Cleanup prologues below fork to cmd on the native+win32 path only (see `cold` / `cleanModulesNative`).
const isOsSupported = isOsBackendSupported();
const isWindows = process.platform === "win32";
const OS_TASK_NAME = isWindows ? `${BackendType.Os}/wsl` : `${BackendType.Os}/linux`;
const native = createNativeBackend();
const repoRoot = isOsSupported ? findRepoRoot() : "";
// Bind the warm global pnpm store writable into the os sandbox (the shipped store mechanism) so it reuses
// Downloads like native does; copy import because hardlinks can't cross from the on-disk store into the overlay.
const store = isOsSupported ? execFileSync("pnpm", ["store", "path"], { cwd: repoRoot, encoding: "utf8" }).trim() : "";
const osInstallOptions: ExecOptions = {
  bindDirs: [store],
  cwd: "",
  env: {
    [PNPM_CONFIG_PACKAGE_IMPORT_METHOD_KEY]: PNPM_CONFIG_PACKAGE_IMPORT_METHOD_VALUE,
    [PNPM_CONFIG_STORE_DIR_KEY]: store,
  },
  isNetworkEnabled: true,
  stdio: "pipe",
};
// Separate corpora so native's on-disk node_modules don't warm the os run.
const nativeCorpus = isOsSupported ? createWorkspaceCorpus(repoRoot) : "";
const osCorpus = isOsSupported ? createWorkspaceCorpus(repoRoot) : "";
const warmCorpus = isOsSupported ? createWorkspaceCorpus(repoRoot) : "";
const INSTALL = "pnpm install --frozen-lockfile --config.package-import-method=copy";
// The native baseline clears node_modules in the host shell, so the prologue forks to cmd on win32.
const cleanModulesNative = isWindows
  ? `for /d /r . %d in (node_modules) do @if exist "%d" rd /s /q "%d"`
  : "find . -name node_modules -type d -prune -exec rm -rf {} +";
const installNative = isWindows ? `${cleanModulesNative} & ${INSTALL}` : `${cleanModulesNative}; ${INSTALL}`;
const SHARED = join(repoRoot, "packages/shared");
// Clear caches before each timed run so neither side benefits from incremental state. The os sandbox is
// Always POSIX (/bin/sh); the native baseline forks its cleanup to cmd syntax on win32.
const cold = (cleanPosix: string, cleanCmd: string, command: string): { native: string; os: string } => ({
  native: isWindows ? `${cleanCmd} 2>nul & ${command}` : `${cleanPosix} 2>/dev/null; ${command}`,
  os: `${cleanPosix} 2>/dev/null; ${command}`,
});

afterAll(() => {
  // Resolve the snapshot before removing warmCorpus (its lockfile keys the cache entry), then clear it.
  if (isOsSupported) removeSnapshotDirectory(resolveSnapshotLocation(warmCorpus).dir);
  for (const corpus of [nativeCorpus, osCorpus, warmCorpus])
    if (corpus) rmSync(corpus, { force: true, recursive: true });
});

describe.skipIf(!isOsSupported)("install - real workspace dependency closure (cold)", () => {
  bench(BackendType.Native, async () => {
    await native.exec(installNative, { cwd: nativeCorpus, stdio: "pipe" });
  });

  bench(OS_TASK_NAME, async () => {
    await createOsBackend().exec(INSTALL, { ...osInstallOptions, cwd: osCorpus });
  });
});

// The snapshot payoff: capture the install once, then a forked run reuses the dep tree instead of
// Reinstalling. `cold` is the os backend reinstalling from a fresh tmpfs upper every run; `warm` forks the
// Captured snapshot, so it should dwarf the cold baseline - that gap is the entire reason this layer exists.
// Capture the warm snapshot at module scope, not in beforeAll: Vitest fires bench() callbacks before suite
// Hooks resolve, so a beforeAll snapshot wouldn't exist yet when the warm fork runs - forkSnapshot would throw
// And the empty sample set yields a NaN mean. Top-level await guarantees the upper layer is materialized first.
if (isOsSupported) await createSnapshot(createOsBackend(), INSTALL, { ...osInstallOptions, cwd: warmCorpus });

describe.skipIf(!isOsSupported)("install - warm fork vs cold reinstall", () => {
  bench("cold", async () => {
    await createOsBackend().exec(INSTALL, { ...osInstallOptions, cwd: warmCorpus });
  });

  bench("warm", async () => {
    await forkSnapshot(createOsBackend(), INSTALL, { ...osInstallOptions, cwd: warmCorpus });
  });
});

describe.skipIf(!isOsSupported)("typecheck - packages/shared (cold)", () => {
  const { native: nativeCommand, os: osCommand } = cold(
    "rm -f *.tsbuildinfo",
    "del /f /q *.tsbuildinfo",
    "pnpm typecheck",
  );
  bench(BackendType.Native, async () => {
    await native.exec(nativeCommand, { cwd: SHARED, stdio: "pipe" });
  });

  bench(OS_TASK_NAME, async () => {
    await createOsBackend().exec(osCommand, { cwd: SHARED, stdio: "pipe" });
  });
});

describe.skipIf(!isOsSupported)("build - packages/shared (cold)", () => {
  const { native: nativeCommand, os: osCommand } = cold(
    "rm -rf dist *.tsbuildinfo",
    "(if exist dist rd /s /q dist) & del /f /q *.tsbuildinfo",
    "pnpm build",
  );
  bench(BackendType.Native, async () => {
    await native.exec(nativeCommand, { cwd: SHARED, stdio: "pipe" });
  });

  bench(OS_TASK_NAME, async () => {
    await createOsBackend().exec(osCommand, { cwd: SHARED, stdio: "pipe" });
  });
});

describe.skipIf(!isOsSupported)("test - packages/shared", () => {
  const command = "pnpm test --run";
  bench(BackendType.Native, async () => {
    await native.exec(command, { cwd: SHARED, stdio: "pipe" });
  });

  bench(OS_TASK_NAME, async () => {
    await createOsBackend().exec(command, { cwd: SHARED, stdio: "pipe" });
  });
});
