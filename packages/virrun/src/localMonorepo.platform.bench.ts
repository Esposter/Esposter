import { BackendType } from "#src/models/virrun/BackendType";
import { createNativeBackend } from "#src/services/exec/native/createNativeBackend";
import { checkIsOsBackendSupported } from "#src/services/exec/os/checkIsOsBackendSupported";
import { createOsBackend } from "#src/services/exec/os/createOsBackend";
import { createOsExecOptions } from "#src/services/exec/os/createOsExecOptions";
import { createOsInstallOptions } from "#src/services/exec/os/createOsInstallOptions";
import { createSnapshot } from "#src/services/exec/snapshot/createSnapshot";
import { forkSnapshot } from "#src/services/exec/snapshot/forkSnapshot";
import { persistRun } from "#src/services/exec/snapshot/persistRun";
import { removeSnapshotDirectory } from "#src/services/exec/snapshot/removeSnapshotDirectory";
import { resolveSetupCommand } from "#src/services/exec/snapshot/resolveSetupCommand";
import { resolveSnapshotLocation } from "#src/services/exec/snapshot/resolveSnapshotLocation";
import { createWorkspaceCorpus } from "#src/services/exec/test/createWorkspaceCorpus.test";
import { findRepoRoot } from "#src/services/exec/test/findRepoRoot.test";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { rmSync } from "node:fs";
import { afterAll, test } from "vitest";
// End-to-end speed gate: native baseline vs os sandbox on real monorepo commands. Runs on any host that
// Supports the os backend - the sandbox runs natively on Linux (os/linux) and bridged from win32 via WSL
// (os/wsl) - so this is a `.platform.bench.ts`, writing one committed artifact per platform. Every os run goes
// Through the same option builders createVirrun uses (createOsExecOptions / createOsInstallOptions): the store
// Bind, the WSL login PATH, network, corepack home and CI=true. Routing through those builders keeps the bench from
// Drifting from production — hand-rolled options miss e.g. the WSL login PATH and die with `node: not found` (the
// WSL bridge resolves the Windows pnpm shim instead).
// Switched off, and this is the one switch for the whole file. Every task here forks a real sandbox over the whole
// Monorepo, and the module-scope `createSnapshot` below captures a full install before the first one runs — north
// Of ten minutes on win32, where each fork also pays the /mnt/c → ext4 source mirror. That is more than a `pnpm
// Bench` triggered by a change to anything else should cost, and the numbers move with the host more than with
// This repo, so the committed artifact is regenerated deliberately rather than incidentally: flip this to `true`
// When the os backend or its option builders change, run `pnpm bench` in this package, commit, flip it back.
// ANDed into the existing host gate rather than replacing it, so a flipped-on run on a host without the backend
// Still skips instead of crashing in the module-scope install.
const IS_ENABLED = false;
const isOsSupported = IS_ENABLED && checkIsOsBackendSupported();
const OS_TASK_NAME = process.platform === "win32" ? `${BackendType.Os}/wsl` : `${BackendType.Os}/linux`;
const native = createNativeBackend();
const repoRoot = isOsSupported ? findRepoRoot() : "";
// A clean manifest mirror (symlinked real manifests + lockfile, no node_modules) used solely to warm the snapshot
// Below: it shares the real repo's lockfile hash - the snapshot cache key - so the one snapshot it captures serves
// Every typecheck/build/test fork, which run over the real repo (same lockfile -> same cache entry).
const warmCorpus = isOsSupported ? createWorkspaceCorpus(repoRoot) : "";
// The real workspace command both backends are timed on. Run from the repo root with a package filter so the os
// Fork (which overlays the snapshot's root-level node_modules at the repo root) resolves the same closure the
// Native host already has. The os side forks over a fresh tmpfs upper every run, so its writes (tsbuildinfo,
// Dist) vanish and each run is cold without touching the source; the native side regenerates those gitignored
// Build artifacts in place (idempotent), so it needs no cleanup and stays realistically warm/incremental.
const getSharedCommand = (script: string): string => `pnpm --filter @esposter/shared ${script}`;
// Whether the host-global snapshot cache entry already existed before this bench ran. warmCorpus mirrors the real
// Repo's lockfile, so it resolves to the same lockfile-hash-keyed entry every real virrun run on this repo reuses.
// If it pre-existed, createSnapshot reuses it (rename-loses-race keeps the existing upper) and teardown must leave
// It — evicting it would force the next real run to pay a full reinstall for state this bench never owned.
const isSnapshotPreexisting = isOsSupported && resolveSnapshotLocation(warmCorpus).exists;

afterAll(() => {
  if (!isOsSupported) return;
  // Evict the snapshot only if this bench captured it. Resolve before removing warmCorpus (its lockfile keys the
  // Cache entry), then clear the private temp mirror unconditionally.
  if (!isSnapshotPreexisting) removeSnapshotDirectory(resolveSnapshotLocation(warmCorpus).dir);
  rmSync(warmCorpus, { force: true, recursive: true });
});
// Capture the install once into a warm snapshot the forks below reuse. There is deliberately NO install bench: the
// Os install writes node_modules only into the snapshot (for forking), never to host disk, so it is not a drop-in
// For a native `pnpm install` and a head-to-head would imply a swap that can't be made. Materializing the tree back
// To disk costs at least as much as the native install it would replace (byte-copy across the WSL/host boundary vs
// Native's same-volume hardlink, plus Defender on win32) - see
// Apps/web/content/docs/virrun/rejected/materialize-node-modules.md. The real, cashable payoff is "run the command
// Without reinstalling", which the typecheck/build/test fork groups below measure against the native baseline.
// Captured at module scope rather than in a hook: one snapshot backs every fork below, so it is the file's setup
// Rather than any one test's. Top-level await materializes the upper layer first. Keyed by the lockfile hash (same
// Lockfile - same cache entry).
if (isOsSupported)
  await createSnapshot(createOsBackend(), resolveSetupCommand(), createOsInstallOptions(warmCorpus, "pipe"));

test.skipIf(!isOsSupported)("typecheck - packages/shared (cold)", async ({ bench }) => {
  const command = getSharedCommand("typecheck");
  await bench.compare(
    bench(BackendType.Native, async () => {
      await native.exec(command, { cwd: repoRoot, stdio: "pipe" });
    }),
    bench(OS_TASK_NAME, async () => {
      await forkSnapshot(createOsBackend(), command, createOsExecOptions(repoRoot, "pipe"));
    }),
    BENCHMARK_RUN_OPTIONS,
  );
});

test.skipIf(!isOsSupported)("build - packages/shared (cold)", async ({ bench }) => {
  const command = getSharedCommand("build");
  await bench.compare(
    bench(BackendType.Native, async () => {
      await native.exec(command, { cwd: repoRoot, stdio: "pipe" });
    }),
    bench(OS_TASK_NAME, async () => {
      await forkSnapshot(createOsBackend(), command, createOsExecOptions(repoRoot, "pipe"));
    }),
    BENCHMARK_RUN_OPTIONS,
  );
});

// Write-back: the same build run through persistRun, which forks the warm snapshot and flushes the produced dist
// Back to the host (apps/web/content/docs/virrun/write-back.md). vs native shows the net win, and vs the `build`
// Fork above isolates the flush cost — both must stay below the native baseline for write-back to be worth adopting
// On a mutation command.
test.skipIf(!isOsSupported)("build - write-back persist vs native (produces dist)", async ({ bench }) => {
  const command = getSharedCommand("build");
  await bench.compare(
    bench(BackendType.Native, async () => {
      await native.exec(command, { cwd: repoRoot, stdio: "pipe" });
    }),
    bench(`${OS_TASK_NAME}/persist`, async () => {
      await persistRun(createOsBackend(), command, createOsExecOptions(repoRoot, "pipe"));
    }),
    BENCHMARK_RUN_OPTIONS,
  );
});

test.skipIf(!isOsSupported)("vitest - packages/shared", async ({ bench }) => {
  const command = getSharedCommand("test --run");
  await bench.compare(
    bench(BackendType.Native, async () => {
      await native.exec(command, { cwd: repoRoot, stdio: "pipe" });
    }),
    bench(OS_TASK_NAME, async () => {
      await forkSnapshot(createOsBackend(), command, createOsExecOptions(repoRoot, "pipe"));
    }),
    BENCHMARK_RUN_OPTIONS,
  );
});
