import type { ExecBackend } from "#src/models/exec/ExecBackend";
import type { ExecOptions, ExecStdio } from "#src/models/exec/ExecOptions";
import type { Lease } from "#src/models/exec/snapshot/Lease";
import type { Environment } from "#src/models/virrun/Environment";
import type { Virrun } from "#src/models/virrun/Virrun";
import type { VirrunOptions } from "#src/models/virrun/VirrunOptions";

import { SourceType } from "#src/models/source/SourceType";
import { BackendType } from "#src/models/virrun/BackendType";
import { resolvePrepareStep } from "#src/services/configuration/resolvePrepareStep";
import { persistWithCache } from "#src/services/exec/cache/persistWithCache";
import { createNativeBackend } from "#src/services/exec/native/createNativeBackend";
import { createOsBackend } from "#src/services/exec/os/createOsBackend";
import { createOsExecOptions } from "#src/services/exec/os/createOsExecOptions";
import { createOsInstallOptions } from "#src/services/exec/os/createOsInstallOptions";
import { VIRRUN_SNAPSHOT_TEMP_PREFIXES } from "#src/services/exec/snapshot/constants";
import { createLease } from "#src/services/exec/snapshot/createLease";
import { createPrepareLayer } from "#src/services/exec/snapshot/createPrepareLayer";
import { createSnapshot } from "#src/services/exec/snapshot/createSnapshot";
import { forkSnapshot } from "#src/services/exec/snapshot/forkSnapshot";
import { pruneStalePrepareLayers } from "#src/services/exec/snapshot/pruneStalePrepareLayers";
import { pruneStaleSnapshots } from "#src/services/exec/snapshot/pruneStaleSnapshots";
import { reapStaleTemps } from "#src/services/exec/snapshot/reapStaleTemps";
import { resolvePrepareLocation } from "#src/services/exec/snapshot/resolvePrepareLocation";
import { resolveSetupCommand } from "#src/services/exec/snapshot/resolveSetupCommand";
import { resolveSnapshotLocation } from "#src/services/exec/snapshot/resolveSnapshotLocation";
import { VIRRUN_ENV_KEY } from "#src/services/exec/util/constants";
import { toRootAnchoredExclude } from "#src/services/exec/util/toRootAnchoredExclude";
import { withColorEnv } from "#src/services/exec/util/withColorEnv";
import { createVfsBackend } from "#src/services/exec/vfs/createVfsBackend";
import { readWslLoginEnvironment } from "#src/services/exec/wsl/readWslLoginEnvironment";
import { resolveMirrorExcludes } from "#src/services/exec/wsl/resolveMirrorExcludes";
import { loadSource } from "#src/services/source/loadSource";
import { existsSync } from "node:fs";
// "auto" resolves to native until vfs beats it on the gates. Every factory takes the run's `environment` so the one
// Backend that narrows what the sandbox can see (os on win32, via the source mirror) derives its exclude set from the
// Same preset `maskedPaths` below does; the others have no mirror and ignore it.
const BACKEND_FACTORY_MAP: Record<BackendType, (environment?: Environment) => ExecBackend> = {
  [BackendType.Auto]: createNativeBackend,
  [BackendType.Native]: createNativeBackend,
  [BackendType.Os]: createOsBackend,
  [BackendType.Vfs]: createVfsBackend,
};
// The orchestrator entrypoint: resolve the source to a working dir, pick a backend, and return a handle whose
// Exec/fork/persist route through it; dispose() tears down any temp state the source created.
export const createVirrun = async ({
  backend = BackendType.Auto,
  environment,
  source = { dir: "", type: SourceType.Dir },
}: Partial<VirrunOptions> = {}): Promise<Virrun> => {
  const execBackend = BACKEND_FACTORY_MAP[backend](environment);
  const { cwd, dispose: disposeSource } = await loadSource(source);
  // Leases this run holds on the snapshot/prepare hash dirs it mounts — released on dispose so pruneStale* can reclaim
  // A superseded layer once no live run is reading it.
  const leases: Lease[] = [];
  // Key off the resolved backend, not the requested enum: when Auto resolves to Os the shared store, login PATH, and
  // Network re-enable must still be injected (createOsExecOptions). Non-os backends need only the VIRRUN signal.
  const isOsBackend = execBackend.name === BackendType.Os;
  // Capture the WSL login environment up front on win32, before any cache location is resolved. Every sandboxed
  // Command needs its PATH anyway, and the capture is what tells getSandboxNodeVersion which node the guest runs — so
  // Taking it first is what stops a cold host keying its very first snapshot on the Windows node's major and then
  // Re-provisioning under the guest's on the next run.
  if (isOsBackend && process.platform === "win32") readWslLoginEnvironment();
  // Resolve the framework prepare step once (preset-driven, no overrides). Only the os backend has overlay layers;
  // Other backends run in-place with the host's own artifacts, so there is nothing to regenerate. Throws loudly if
  // `environment` is set to a framework whose config file is absent — a misconfiguration, not a silent skip.
  const prepareStep = isOsBackend ? resolvePrepareStep(environment, cwd) : undefined;
  // What a persist run may never write back to the host. On native Linux the sandbox reads the real working tree, so
  // Only the prepare layer's outputs are masked — everything else the command wrote is a genuine native-equivalent
  // Mutation. On win32 the sandbox reads the WSL source mirror instead, which the mirror excludes were filtered out
  // Of (resolveMirrorExcludes, which the backend above resolves from this same `environment`, so neither direction
  // Can answer for a preset the other did not see):
  // A path that never entered the mirror has no legitimate host origin, so an upper entry under one can only be a
  // Ghost of stale mirror content — flushing it resurrects a tree the host already deleted (`.agents/worktrees`) or
  // Clobbers host-only state (`.git`). Either way the outputs are root-anchored (toRootAnchoredExclude): they name one
  // Directory, and a root-level one (`.nuxt`) left bare would mask that name at every depth in the repo.
  const prepareOutputs = prepareStep?.outputs ?? [];
  const maskedPaths =
    isOsBackend && process.platform === "win32"
      ? resolveMirrorExcludes(cwd, prepareOutputs)
      : prepareOutputs.map((output) => toRootAnchoredExclude(output));
  const toOptions = (stdio: ExecStdio): ExecOptions =>
    withColorEnv(isOsBackend ? createOsExecOptions(cwd, stdio) : { cwd, env: { [VIRRUN_ENV_KEY]: "true" }, stdio });
  // Provisioning (deps install / prepare) always pipes: its output must never land on the host's stdout, or a piped
  // Caller (`virrun -- depcruise | dot`) gets its stdout stream poisoned by setup logs on a cold build. An interactive
  // Caller ("inherit") still sees the build live via a stderr tee, so a multi-minute install is never a silent stall.
  const toInstallOptions = (stdio: ExecStdio): ExecOptions => {
    // Only the os backend provisions (fork/persist fall back to plain exec elsewhere), and tee is os-only — so any
    // Other backend just honors the requested stdio.
    if (!isOsBackend) return toOptions(stdio);
    const options = withColorEnv(createOsInstallOptions(cwd, "pipe"));
    return stdio === "inherit" ? { ...options, tee: "stderr" } : options;
  };
  // Provision the sandbox's dep closure once into a lockfile-hash-keyed snapshot (warm = no-op). Shared by fork and
  // Persist so the two warm-cache paths can't drift.
  const ensureSnapshot = async (stdio: ExecStdio): Promise<void> => {
    const { dir, exists, hash } = resolveSnapshotLocation(cwd);
    // Announce this process as a live user of the snapshot BEFORE the prune/mint — a concurrent run on a different
    // Lockfile hash prunes every dir that isn't its own hash and holds no live lease, so leasing first is what stops it
    // Reclaiming this dir in the window between minting it and mounting it. Released on dispose; a hard-killed run's
    // Lease is reaped later. createLease mkdirs the leases dir, so the lease exists even on a cold (not-yet-minted) run.
    leases.push(createLease(dir));
    // Sweep superseded snapshots, then reap any temp a hard-killed run stranded in the live dir (its finalizer never
    // Ran), before hitting or minting this one — so the cache never grows past the live entry plus its published layers.
    pruneStaleSnapshots(hash);
    reapStaleTemps(dir, VIRRUN_SNAPSHOT_TEMP_PREFIXES);
    if (!exists) await createSnapshot(execBackend, resolveSetupCommand(), toInstallOptions(stdio));
  };
  // Provision the source-keyed prepare layer (the framework's Linux-generated artifacts, e.g. .nuxt) once per source
  // State, forked over the deps snapshot, and return the read-only lower(s) fork/persist stacks above the deps
  // Snapshot so its fresh Linux artifacts shadow the host's copy (and, being last, shadow the deps lower and source
  // Too). The location is resolved exactly once here and threaded into createPrepareLayer and the returned lower, so
  // The path we guarantee exists is the path that gets mounted — never a second resolve that could key off a shifted
  // Source hash and mount a layer that was never built. existsSync is re-read after the prune (not the location.exists
  // Snapshot taken before it) so a layer the sweep reclaimed is rebuilt rather than assumed present. A no-op ([] ) when
  // There is no environment preset.
  const ensurePrepareLayer = async (stdio: ExecStdio): Promise<readonly string[]> => {
    if (prepareStep === undefined) return [];
    const location = resolvePrepareLocation(cwd, prepareStep);
    // Same live-user lease as the deps snapshot, on the source-keyed prepare dir, and taken FIRST for the same reason:
    // A concurrent run on a different key prunes any layer that isn't its own key and has no live lease, so leasing
    // Before the prune/materialize is what stops it reclaiming this freshly-built layer in the window before we mount it.
    leases.push(createLease(location.dir));
    pruneStalePrepareLayers(location.key);
    reapStaleTemps(location.dir, VIRRUN_SNAPSHOT_TEMP_PREFIXES);
    if (!existsSync(location.upperDir))
      await createPrepareLayer(execBackend, prepareStep, toInstallOptions(stdio), location);
    return [location.upperDir];
  };
  return {
    backend: execBackend.name,
    dispose: async () => {
      // Drop every lease this run took before tearing down the source; a hard kill skips this and the dead-pid reap
      // Reclaims the lease later.
      for (const lease of leases) lease.release();
      await disposeSource();
    },
    exec: (command, stdio = "pipe") => execBackend.exec(command, toOptions(stdio)),
    fork: async (command, stdio = "pipe") => {
      // Other backends have no snapshot layer, so fork falls back to a plain exec (no warm reuse).
      if (execBackend.name !== BackendType.Os) return execBackend.exec(command, toOptions(stdio));
      // A Windows host's win32 node_modules can't run inside the Linux sandbox, so the command runs over the
      // Sandbox's own frozen dep tree (forkSnapshot) plus, when an environment is set, a source-keyed prepare layer
      // Holding the framework's Linux-generated artifacts (e.g. .nuxt) that shadow the host's platform-specific copy.
      await ensureSnapshot(stdio);
      const prepareLowerDirs = await ensurePrepareLayer(stdio);
      return forkSnapshot(execBackend, command, toOptions(stdio), prepareLowerDirs);
    },
    persist: async (command, stdio = "pipe") => {
      // Other backends have no sandbox, so a plain exec writes straight to the host disk — nothing to flush.
      if (execBackend.name !== BackendType.Os) return execBackend.exec(command, toOptions(stdio));
      // Same warm-snapshot + prepare-layer provisioning as fork; persistWithCache tops it with a real upper and
      // Reconciles the command's writes onto the host, masking the paths the sandbox's source view never carried
      // (maskedPaths) and short-circuiting to a recorded result when the task cache holds the run.
      await ensureSnapshot(stdio);
      const prepareLowerDirs = await ensurePrepareLayer(stdio);
      return persistWithCache(execBackend, command, toOptions(stdio), prepareLowerDirs, maskedPaths);
    },
  };
};
