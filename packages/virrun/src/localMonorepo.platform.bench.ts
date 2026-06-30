import { BackendType } from "@/models/virrun/BackendType";
import { createNativeBackend } from "@/services/exec/native/createNativeBackend";
import { createOsBackend } from "@/services/exec/os/createOsBackend";
import { createOsExecOptions } from "@/services/exec/os/createOsExecOptions";
import { createOsInstallOptions } from "@/services/exec/os/createOsInstallOptions";
import { isOsBackendSupported } from "@/services/exec/os/isOsBackendSupported";
import { createSnapshot } from "@/services/exec/snapshot/createSnapshot";
import { forkSnapshot } from "@/services/exec/snapshot/forkSnapshot";
import { persistRun } from "@/services/exec/snapshot/persistRun";
import { removeSnapshotDirectory } from "@/services/exec/snapshot/removeSnapshotDirectory";
import { resolveSetupCommand } from "@/services/exec/snapshot/resolveSetupCommand";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { createWorkspaceCorpus } from "@/services/exec/test/createWorkspaceCorpus.test";
import { findRepoRoot } from "@/services/exec/test/findRepoRoot.test";
import { globSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterAll, bench, describe } from "vitest";
// End-to-end speed gate: native baseline vs os sandbox on real monorepo commands. Runs on any host that
// Supports the os backend - the sandbox runs natively on Linux (os/linux) and bridged from win32 via WSL
// (os/wsl) - so this is a `.platform.bench.ts`, writing one committed artifact per platform. Every os run goes
// Through the same option builders createVirrun uses (createOsExecOptions / createOsInstallOptions): the store
// Bind, the WSL login PATH, network, corepack home and CI=true. Hand-rolling those here is what previously made
// The bench drift from production and die with `node: not found` (the WSL bridge resolved the Windows pnpm shim).
const isOsSupported = isOsBackendSupported();
const isWindows = process.platform === "win32";
const OS_TASK_NAME = isWindows ? `${BackendType.Os}/wsl` : `${BackendType.Os}/linux`;
const native = createNativeBackend();
const repoRoot = isOsSupported ? findRepoRoot() : "";
// Separate corpora so native's on-disk node_modules don't warm the os run. The corpora symlink the real
// Manifests + lockfile, so they share the real repo's lockfile hash - which is the snapshot cache key, letting
// The single warm snapshot below serve both the warm-fork group and the typecheck/build/test forks over the repo.
const nativeCorpus = isOsSupported ? createWorkspaceCorpus(repoRoot) : "";
const warmCorpus = isOsSupported ? createWorkspaceCorpus(repoRoot) : "";
// The native baseline reuses one corpus across iterations, so it must clear node_modules before each run to stay
// Cold. Done in-process with fs (not a shell command) so it's platform-agnostic and rmSync throws on a failed
// Delete - chaining the delete into the install via cmd's `for` loop would swallow the errorlevel, silently
// Warming the install and recording it as cold.
const cleanNativeModules = (corpus: string): void => {
  for (const dir of globSync(join(corpus, "**/node_modules"))) rmSync(dir, { force: true, recursive: true });
};
// The real workspace command both backends are timed on. Run from the repo root with a package filter so the os
// Fork (which overlays the snapshot's root-level node_modules at the repo root) resolves the same closure the
// Native host already has. The os side forks over a fresh tmpfs upper every run, so its writes (tsbuildinfo,
// Dist) vanish and each run is cold without touching the source; the native side regenerates those gitignored
// Build artifacts in place (idempotent), so it needs no cleanup and stays realistically warm/incremental.
const SHARED_COMMAND = (script: string): string => `pnpm --filter @esposter/shared ${script}`;

afterAll(() => {
  // Resolve the snapshot before removing warmCorpus (its lockfile keys the cache entry), then clear it.
  if (isOsSupported) removeSnapshotDirectory(resolveSnapshotLocation(warmCorpus).dir);
  for (const corpus of [nativeCorpus, warmCorpus]) if (corpus) rmSync(corpus, { force: true, recursive: true });
});

describe.skipIf(!isOsSupported)("install - real workspace dependency closure (cold)", () => {
  bench(BackendType.Native, async () => {
    cleanNativeModules(nativeCorpus);
    await native.exec(resolveSetupCommand(), { cwd: nativeCorpus, stdio: "pipe" });
  });

  bench(OS_TASK_NAME, async () => {
    await createOsBackend().exec(resolveSetupCommand(), createOsInstallOptions(warmCorpus, "pipe"));
  });
});

// The snapshot payoff: capture the install once, then a forked run reuses the dep tree instead of reinstalling.
// `cold` is the os backend reinstalling from a fresh tmpfs upper every run; `warm` forks the captured snapshot,
// So it should dwarf the cold baseline - that gap is the entire reason this layer exists. Capture at module scope,
// Not in beforeAll: Vitest fires bench() callbacks before suite hooks resolve, so a beforeAll snapshot wouldn't
// Exist yet when the warm fork runs - forkSnapshot would throw and the empty sample set yields a NaN mean. Top
// Level await guarantees the upper layer is materialized first. Keyed by the lockfile hash, this one snapshot also
// Backs the typecheck/build/test forks below, which run over the real repo (same lockfile - same cache entry).
if (isOsSupported)
  await createSnapshot(createOsBackend(), resolveSetupCommand(), createOsInstallOptions(warmCorpus, "pipe"));

describe.skipIf(!isOsSupported)("install - warm fork vs cold reinstall", () => {
  bench("cold", async () => {
    await createOsBackend().exec(resolveSetupCommand(), createOsInstallOptions(warmCorpus, "pipe"));
  });

  bench("warm", async () => {
    await forkSnapshot(createOsBackend(), resolveSetupCommand(), createOsInstallOptions(warmCorpus, "pipe"));
  });
});

describe.skipIf(!isOsSupported)("typecheck - packages/shared (cold)", () => {
  const command = SHARED_COMMAND("typecheck");
  bench(BackendType.Native, async () => {
    await native.exec(command, { cwd: repoRoot, stdio: "pipe" });
  });

  bench(OS_TASK_NAME, async () => {
    await forkSnapshot(createOsBackend(), command, createOsExecOptions(repoRoot, "pipe"));
  });
});

describe.skipIf(!isOsSupported)("build - packages/shared (cold)", () => {
  const command = SHARED_COMMAND("build");
  bench(BackendType.Native, async () => {
    await native.exec(command, { cwd: repoRoot, stdio: "pipe" });
  });

  bench(OS_TASK_NAME, async () => {
    await forkSnapshot(createOsBackend(), command, createOsExecOptions(repoRoot, "pipe"));
  });
});

// Write-back: the same build run through persistRun, which forks the warm snapshot and flushes the produced dist
// Back to the host (specs/write-back.md). vs native shows the net win, and vs the `build` fork above isolates the
// Flush cost — both must stay below the native baseline for write-back to be worth adopting on a mutation command.
describe.skipIf(!isOsSupported)("build - write-back persist vs native (produces dist)", () => {
  const command = SHARED_COMMAND("build");
  bench(BackendType.Native, async () => {
    await native.exec(command, { cwd: repoRoot, stdio: "pipe" });
  });

  bench(`${OS_TASK_NAME}/persist`, async () => {
    await persistRun(createOsBackend(), command, createOsExecOptions(repoRoot, "pipe"));
  });
});

describe.skipIf(!isOsSupported)("test - packages/shared", () => {
  const command = SHARED_COMMAND("test --run");
  bench(BackendType.Native, async () => {
    await native.exec(command, { cwd: repoRoot, stdio: "pipe" });
  });

  bench(OS_TASK_NAME, async () => {
    await forkSnapshot(createOsBackend(), command, createOsExecOptions(repoRoot, "pipe"));
  });
});
