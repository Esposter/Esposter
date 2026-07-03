import { SourceType } from "@/models/source/SourceType";
import { BackendType } from "@/models/virrun/BackendType";
import { Environment } from "@/models/virrun/Environment";
import { createOsBackend } from "@/services/exec/os/createOsBackend";
import { createOsInstallOptions } from "@/services/exec/os/createOsInstallOptions";
import { createSnapshot } from "@/services/exec/snapshot/createSnapshot";
import { removeSnapshotDirectory } from "@/services/exec/snapshot/removeSnapshotDirectory";
import { resolveSetupCommand } from "@/services/exec/snapshot/resolveSetupCommand";
import { findRepoRoot } from "@/services/exec/test/findRepoRoot.test";
import { isSandboxInstallSupported } from "@/services/exec/test/isSandboxInstallSupported.test";
import { VIRRUN_CACHE_DIRECTORY_NAME, VIRRUN_CACHE_HOME_KEY } from "@/services/exec/util/constants";
import { getWslNativeCacheRoot } from "@/services/exec/wsl/getWslNativeCacheRoot";
import { createVirrun } from "@/services/virrun/createVirrun";
import { homedir } from "node:os";
import { join } from "node:path";
import { afterAll, bench, describe } from "vitest";
// End-to-end value of the os backend's warm-cache LAYERS, as a 3-way comparison on a real nuxt command:
// Cold (empty cache) vs +snapshot (deps warm, prepare cold) vs +snapshot+prepare (both warm). Complements
// LocalMonorepo.platform.bench.ts (native vs os), which answers the orthogonal "is the warm sandbox competitive
// With native?"; this one answers "what is each cache layer worth?". Baseline = cold (declared first, no `native`
// Task), so the reporter renders each warm layer as a speedup multiplier: cold − (+snapshot) is the install the
// SNAPSHOT layer saves, (+snapshot) − (+snapshot+prepare) is the `nuxt prepare` the PREPARE layer saves. Gated on
// IsSandboxInstallSupported (stronger than isOsBackendSupported — cold performs a real install, so node/pnpm must be
// Reachable and $HOME writable). A `.platform.bench.ts`: the os backend runs os/linux natively and os/wsl bridged
// From win32, so each host writes its own committed artifact.

// The command must exercise the framework's generated `.nuxt`, or +snapshot and +snapshot+prepare would be
// Identical — a `@esposter/shared` command never reads `.nuxt`. `typecheck` consumes it and is lighter than a full
// Nuxt build; a type error doesn't skew timing (forkSnapshot returns an ExecResult on nonzero, never throws).
const APP_TYPECHECK_COMMAND = "pnpm --filter @esposter/app typecheck";
const repoRoot = isSandboxInstallSupported ? findRepoRoot() : "";
// Two throwaway cache homes on the same filesystem getGlobalCacheDirectory picks (win32 → WSL ext4, never /mnt/c
// V9fs where snapshot capture stalls; else ~/.virrun), under a bench-owned leaf so eviction can never touch the
// Developer's real cache. COLD_HOME stays empty (cold path installs + prepares into it); SNAPSHOT_HOME is pre-seeded
// With the deps snapshot only, then grows its prepare layer during the +snapshot task and reuses it in +snapshot+prepare.
const cacheRoot = process.platform === "win32" ? getWslNativeCacheRoot() : join(homedir(), VIRRUN_CACHE_DIRECTORY_NAME);
const COLD_HOME = join(cacheRoot, "bench-cache", "cold");
const SNAPSHOT_HOME = join(cacheRoot, "bench-cache", "snapshot");
// Restore the caller's env after each redirect: `pnpm test`/`pnpm bench` run under `virrun -- vitest`, so the real
// Process env may already carry a cache home the other bench file relies on.
const previousCacheHome = process.env[VIRRUN_CACHE_HOME_KEY];
// One createVirrun run over the real repo through the production fork path (ensureSnapshot → ensurePrepareLayer →
// ForkSnapshot), so each state is realized purely from what its cache home holds — and the per-invocation lease/
// Prune/loadSource cost a real `virrun -- <cmd>` pays is inside the timing.
const run = async (home: string): Promise<void> => {
  process.env[VIRRUN_CACHE_HOME_KEY] = home;
  const virrun = await createVirrun({
    backend: BackendType.Os,
    environment: Environment.Nuxt,
    source: { dir: repoRoot, type: SourceType.Dir },
  });
  try {
    await virrun.fork(APP_TYPECHECK_COMMAND, "pipe");
  } finally {
    await virrun.dispose();
  }
};
// Pre-seed SNAPSHOT_HOME with the DEPS layer only (one full install). createSnapshot directly — not createVirrun.fork
// — so no prepare layer is built here, leaving the +snapshot task to build it as its measured work. Module scope, not
// BeforeAll: Vitest fires bench() before suite hooks resolve, so a beforeAll seed would not exist when the first task
// Runs. Top-level await guarantees the deps snapshot is materialized first.
if (isSandboxInstallSupported) {
  process.env[VIRRUN_CACHE_HOME_KEY] = SNAPSHOT_HOME;
  await createSnapshot(createOsBackend(), resolveSetupCommand(), createOsInstallOptions(repoRoot, "pipe"));
  if (previousCacheHome === undefined) delete process.env[VIRRUN_CACHE_HOME_KEY];
  else process.env[VIRRUN_CACHE_HOME_KEY] = previousCacheHome;
}

afterAll(() => {
  if (!isSandboxInstallSupported) return;
  if (previousCacheHome === undefined) delete process.env[VIRRUN_CACHE_HOME_KEY];
  else process.env[VIRRUN_CACHE_HOME_KEY] = previousCacheHome;
  // RemoveSnapshotDirectory (not rmSync) handles the mode-000 overlay work dir and, on win32, the \\wsl.localhost
  // UNC teardown. Safe unconditionally: these homes are bench-owned leaves, never the developer's real cache.
  removeSnapshotDirectory(COLD_HOME);
  removeSnapshotDirectory(SNAPSHOT_HOME);
});

describe.skipIf(!isSandboxInstallSupported)("app typecheck - cache layers", () => {
  // Cold and +snapshot each mutate global cache state (install / prepare build), so a second iteration would be warm:
  // Run exactly once (iterations 1, no warmup, no time budget). +snapshot must precede +snapshot+prepare — it builds
  // The prepare layer the latter reuses (tasks run sequentially in declaration order).
  bench("cold", () => run(COLD_HOME), { iterations: 1, time: 0, warmupIterations: 0, warmupTime: 0 });
  bench("+snapshot", () => run(SNAPSHOT_HOME), { iterations: 1, time: 0, warmupIterations: 0, warmupTime: 0 });
  // The steady-state hot path: both layers warm, so every fork is read-only over the frozen overlay. Repeatable, so a
  // Small sample gives a stable mean/rme.
  bench("+snapshot+prepare", () => run(SNAPSHOT_HOME), { iterations: 3, time: 0, warmupIterations: 0 });
});
