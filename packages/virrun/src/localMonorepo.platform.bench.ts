import { BackendType } from "@/models/virrun/BackendType";
import { computeTaskCacheKey } from "@/services/exec/cache/computeTaskCacheKey";
import { recordTaskCache } from "@/services/exec/cache/recordTaskCache";
import { replayTaskCache } from "@/services/exec/cache/replayTaskCache";
import { resolveTaskCacheLocation } from "@/services/exec/cache/resolveTaskCacheLocation";
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
import { rmSync } from "node:fs";
import { afterAll, bench, describe } from "vitest";
// End-to-end speed gate: native baseline vs os sandbox on real monorepo commands. Runs on any host that
// Supports the os backend - the sandbox runs natively on Linux (os/linux) and bridged from win32 via WSL
// (os/wsl) - so this is a `.platform.bench.ts`, writing one committed artifact per platform. Every os run goes
// Through the same option builders createVirrun uses (createOsExecOptions / createOsInstallOptions): the store
// Bind, the WSL login PATH, network, corepack home and CI=true. Routing through those builders keeps the bench from
// Drifting from production — hand-rolled options miss e.g. the WSL login PATH and die with `node: not found` (the
// WSL bridge resolves the Windows pnpm shim instead).
const isOsSupported = isOsBackendSupported();
const isWindows = process.platform === "win32";
const OS_TASK_NAME = isWindows ? `${BackendType.Os}/wsl` : `${BackendType.Os}/linux`;
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
const SHARED_COMMAND = (script: string): string => `pnpm --filter @esposter/shared ${script}`;
// The verification command the task-cache hit group replays. `test --run` produces no persistable diff (vitest writes
// Only under node_modules, masked from the flush), so a replay is the pure "skip the sandbox" cost with an empty flush.
const TASK_CACHE_COMMAND = SHARED_COMMAND("test --run");
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
  // Evict the task-cache entry only if this bench recorded it, mirroring the snapshot rule.
  if (taskCacheKey !== null && !isTaskCachePreexisting)
    removeSnapshotDirectory(resolveTaskCacheLocation(taskCacheKey).dir);
  rmSync(warmCorpus, { force: true, recursive: true });
});
// Capture the install once into a warm snapshot the forks below reuse. There is deliberately NO install bench: the
// Os install writes node_modules only into the snapshot (for forking), never to host disk, so it is not a drop-in
// For a native `pnpm install` and a head-to-head would imply a swap that can't be made. Materializing the tree back
// To disk costs at least as much as the native install it would replace (byte-copy across the WSL/host boundary vs
// Native's same-volume hardlink, plus Defender on win32) - see out-of-scope/materialize-node-modules.md. The real,
// Cashable payoff is "run the command without reinstalling", which the typecheck/build/test fork groups below
// Measure against the native baseline. Capture at module scope, not in beforeAll: Vitest fires bench() callbacks
// Before suite hooks resolve, so a beforeAll snapshot would not exist yet when the first fork runs - forkSnapshot
// Would throw and the empty sample set yields a NaN mean. Top-level await guarantees the upper layer is materialized
// First. Keyed by the lockfile hash, this one snapshot backs every fork below (same lockfile - same cache entry).
if (isOsSupported)
  await createSnapshot(createOsBackend(), resolveSetupCommand(), createOsInstallOptions(warmCorpus, "pipe"));
// Prime one task-cache entry so the hit group below times a pure replay, isolated from the miss that recorded it.
// Record directly through persistRun's onPersist (not persistWithCache) so the entry lands regardless of the CI
// Opt-out (isTaskCacheEnabled): the bench measures the replay MECHANISM, not the on/off policy. Keyed over the real
// RepoRoot tree + command, so the native baseline and the replay are the same command over the same tree. Preserve a
// Pre-existing entry (leave it in afterAll) exactly like the warm snapshot above — it belongs to real runs on this repo.
const taskCacheKey = isOsSupported ? computeTaskCacheKey(TASK_CACHE_COMMAND, repoRoot) : null;
const isTaskCachePreexisting = taskCacheKey !== null && resolveTaskCacheLocation(taskCacheKey).exists;
if (isOsSupported && taskCacheKey !== null && !isTaskCachePreexisting)
  await persistRun(
    createOsBackend(),
    TASK_CACHE_COMMAND,
    createOsExecOptions(repoRoot, "pipe"),
    [],
    [],
    (upperDir, plan, result) => {
      recordTaskCache(taskCacheKey, upperDir, plan, result);
    },
  );

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

// The task-cache dev-loop win (specs/config-and-cache.md): re-running an unchanged verification command skips the
// Sandbox entirely — replayTaskCache reads the recorded outcome and flushes its (here empty) diff to the host, with no
// Toolchain spawn. The fork groups above measure the install-once win (still ~native per run); this is the only path
// That beats native by a wide margin, and the headline the roadmap wants visible + regression-gated. Skipped when the
// Key can't be computed (not a git repo / no lockfile) — the same fallback the real cache takes.
describe.skipIf(!isOsSupported || taskCacheKey === null)("test - task cache hit vs native (unchanged tree)", () => {
  bench(BackendType.Native, async () => {
    await native.exec(TASK_CACHE_COMMAND, { cwd: repoRoot, stdio: "pipe" });
  });

  bench(`${OS_TASK_NAME}/cache`, () => {
    replayTaskCache(taskCacheKey ?? "", repoRoot);
  });
});
