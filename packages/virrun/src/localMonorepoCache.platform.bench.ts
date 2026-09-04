import { SourceType } from "#src/models/source/SourceType";
import { BackendType } from "#src/models/virrun/BackendType";
import { Environment } from "#src/models/virrun/Environment";
import { createOsBackend } from "#src/services/exec/os/createOsBackend";
import { createOsInstallOptions } from "#src/services/exec/os/createOsInstallOptions";
import { createSnapshot } from "#src/services/exec/snapshot/createSnapshot";
import { removeSnapshotDirectory } from "#src/services/exec/snapshot/removeSnapshotDirectory";
import { resolveSetupCommand } from "#src/services/exec/snapshot/resolveSetupCommand";
import { createCleanRepositoryCheckout } from "#src/services/exec/test/createCleanRepositoryCheckout.test";
import { findRepoRoot } from "#src/services/exec/test/findRepoRoot.test";
import { isSandboxInstallSupported } from "#src/services/exec/test/isSandboxInstallSupported.test";
import { VIRRUN_CACHE_DIRECTORY_NAME, VIRRUN_CACHE_HOME_KEY } from "#src/services/exec/util/constants";
import { getWslNativeCacheRoot } from "#src/services/exec/wsl/getWslNativeCacheRoot";
import { createVirrun } from "#src/services/virrun/createVirrun";
import { withFinalizerAsync } from "@esposter/shared";
import { rmSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { afterAll, bench, describe } from "vitest";
// End-to-end value of the os backend's warm-cache LAYERS, as a 3-way comparison on a real workspace command:
// Cold (empty cache) vs +snapshot (deps warm, prepare cold) vs +snapshot+prepare (both warm). Complements
// LocalMonorepo.platform.bench.ts (native vs os), which answers the orthogonal "is the warm sandbox competitive
// With native?"; this one answers "what is each cache layer worth?". Baseline = cold (declared first, no `native`
// Task), so the reporter renders each warm layer as a speedup multiplier: cold − (+snapshot) is the install the
// SNAPSHOT layer saves, (+snapshot) − (+snapshot+prepare) is the `nuxt prepare` the PREPARE layer saves. Gated on
// IsSandboxInstallSupported (stronger than checkIsOsBackendSupported — cold performs a real install, so node/pnpm must be
// Reachable and $HOME writable). A `.platform.bench.ts`: the os backend runs os/linux natively and os/wsl bridged
// From win32, so each host writes its own committed artifact.
//
// Cold is measured over a CLEAN CHECKOUT (cleanSource), not the live repo: overlaying an install on the developer's
// Populated node_modules is a warm no-op, so a repo-source cold would measure the same warm typecheck as the warm
// Tasks (the bug the committed pre-fix results showed — cold clocking in AT or FASTER than +snapshot by pure noise).
// It is "store-warm cold": the SNAPSHOT_HOME seed below also warms the checkout's pnpm store, so cold installs from it
// Offline and measures the real node_modules-materialise cost, not a flaky network download.

// The prepare-layer delta does NOT depend on the command reading `.nuxt`: createVirrun.fork builds the prepare layer
// From the `environment` preset (ensurePrepareLayer gates on prepareStep, set by resolvePrepareStep(environment)),
// Independent of the command it then forks — so with environment: Nuxt, +snapshot builds `.nuxt` and +snapshot+prepare
// Reuses it whatever the command is. A lightweight `@esposter/shared typecheck` is therefore the better probe: it
// Isolates the layer-provisioning costs (install, prepare) instead of drowning them in a heavy app typecheck, and it
// Mirrors this repo's global environment: nuxt config, under which every virrun command warms the prepare layer. A
// Type error doesn't skew timing (forkSnapshot returns an ExecResult on nonzero, never throws).
const SHARED_TYPECHECK_COMMAND = "pnpm --filter @esposter/shared typecheck";
const repoRoot = isSandboxInstallSupported ? findRepoRoot() : "";
// The source ALL three tasks run over is a clean checkout of the repo's HEAD, NOT the live `repoRoot`. The live repo
// Already has a populated node_modules, so a snapshot install overlaid on it (the overlay lower IS the source) is a
// Warm no-op — pnpm sees every dep present and writes nothing, so "cold" measured the same warm typecheck as the warm
// Tasks and could even clock in faster by noise. A gitignored-free checkout gives cold an empty tree its install must
// Actually materialise, so the layer deltas mean what they claim. Built once at module scope (untimed).
const cleanSource = isSandboxInstallSupported ? createCleanRepositoryCheckout(repoRoot) : "";
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
const restoreCacheHome = (): void => {
  if (previousCacheHome === undefined) delete process.env[VIRRUN_CACHE_HOME_KEY];
  else process.env[VIRRUN_CACHE_HOME_KEY] = previousCacheHome;
};
// One createVirrun run over the clean checkout through the production fork path (ensureSnapshot → ensurePrepareLayer →
// ForkSnapshot), so each state is realized purely from what its cache home holds — and the per-invocation lease/
// Prune/loadSource cost a real `virrun -- <cmd>` pays is inside the timing. The cache-home redirect is restored in the
// Finalizer so a throw mid-run (createVirrun/fork) can't strand the wrong home for the next task or bench file.
const run = async (home: string): Promise<void> => {
  process.env[VIRRUN_CACHE_HOME_KEY] = home;
  const virrun = await createVirrun({
    backend: BackendType.Os,
    environment: Environment.Nuxt,
    source: { dir: cleanSource, type: SourceType.Dir },
  });
  await withFinalizerAsync(
    () => virrun.fork(SHARED_TYPECHECK_COMMAND, "pipe"),
    async () => {
      await virrun.dispose();
      restoreCacheHome();
    },
  );
};
// Pre-seed SNAPSHOT_HOME with the DEPS layer only (one full install). createSnapshot directly — not createVirrun.fork
// — so no prepare layer is built here, leaving the +snapshot task to build it as its measured work. This same install
// Also warms the checkout's repo-local pnpm store (<cleanSource>/.virrun/store), so the later cold task installs from
// The warm store OFFLINE — "store-warm cold": cold measures the real cost of materialising node_modules into the
// Overlay upper, isolated from network-download flakiness (which would make a committed benchmark non-deterministic).
// Module scope, not beforeAll: Vitest fires bench() before suite hooks resolve, so a beforeAll seed would not exist
// When the first task runs. Top-level await guarantees the deps snapshot + warm store are materialized first.
if (isSandboxInstallSupported) {
  process.env[VIRRUN_CACHE_HOME_KEY] = SNAPSHOT_HOME;
  await createSnapshot(createOsBackend(), resolveSetupCommand(), createOsInstallOptions(cleanSource, "pipe"));
  restoreCacheHome();
}

afterAll(() => {
  if (!isSandboxInstallSupported) return;
  restoreCacheHome();
  // RemoveSnapshotDirectory (not rmSync) handles the mode-000 overlay work dir and, on win32, the \\wsl.localhost
  // UNC teardown. Safe unconditionally: these homes are bench-owned leaves, never the developer's real cache.
  removeSnapshotDirectory(COLD_HOME);
  removeSnapshotDirectory(SNAPSHOT_HOME);
  // The checkout is a plain $HOME-staged dir (no overlay internals); rmSync clears it and its warm store.
  if (cleanSource) rmSync(cleanSource, { force: true, recursive: true });
});

describe.skipIf(!isSandboxInstallSupported)("shared typecheck - cache layers", () => {
  // Cold and +snapshot each BUILD a layer (install / prepare), so they can only be measured ONCE — a second run would
  // Hit the warm layer, and vitest's bench options expose no per-iteration reset hook (tinybench's beforeEach) to wipe
  // It between samples, while wiping inside the timed callback would fold the (install-sized) teardown into cold's
  // Number. So both are single-sample: iterations: 1 + warmupIterations: 0 (a warmup would build the layer first and
  // Make the "cold" run warm). Consequence: their means carry a full run's variance, so cold − (+snapshot) is only
  // Trustworthy when it exceeds that variance — clean on a native Linux host, but on win32 the per-run source-mirror
  // Tax (/mnt/c → ext4, seconds) swamps the small store-warm install delta and the two can invert by noise. Read the
  // Linux artifact as the layer-value reference; the win32 one is dominated by the mirror, not the cache layers.
  // +snapshot must precede +snapshot+prepare — it builds the prepare layer the latter reuses (declaration order).
  bench("cold", () => run(COLD_HOME), { iterations: 1, warmupIterations: 0 });
  bench("+snapshot", () => run(SNAPSHOT_HOME), { iterations: 1, warmupIterations: 0 });
  // The steady-state hot path: both layers warm, so every fork is read-only over the frozen overlay. Repeatable, so a
  // Small sample gives a stable mean/rme; warmupIterations: 0 skips 5 wasted read-only typecheck runs.
  bench("+snapshot+prepare", () => run(SNAPSHOT_HOME), { iterations: 3, warmupIterations: 0 });
});
