import type { ExecBackend } from "@/models/exec/ExecBackend";
import type { ExecOptions, ExecStdio } from "@/models/exec/ExecOptions";
import type { Virrun } from "@/models/virrun/Virrun";
import type { VirrunOptions } from "@/models/virrun/VirrunOptions";

import { SourceType } from "@/models/source/SourceType";
import { BackendType } from "@/models/virrun/BackendType";
import { Environment } from "@/models/virrun/Environment";
import { persistWithCache } from "@/services/exec/cache/persistWithCache";
import { createNativeBackend } from "@/services/exec/native/createNativeBackend";
import { createOsBackend } from "@/services/exec/os/createOsBackend";
import { createOsExecOptions } from "@/services/exec/os/createOsExecOptions";
import { createOsInstallOptions } from "@/services/exec/os/createOsInstallOptions";
import { createPrepareLayer } from "@/services/exec/snapshot/createPrepareLayer";
import { createSnapshot } from "@/services/exec/snapshot/createSnapshot";
import { forkSnapshot } from "@/services/exec/snapshot/forkSnapshot";
import { pruneStalePrepareLayers } from "@/services/exec/snapshot/pruneStalePrepareLayers";
import { pruneStaleSnapshots } from "@/services/exec/snapshot/pruneStaleSnapshots";
import { resolvePrepareLocation } from "@/services/exec/snapshot/resolvePrepareLocation";
import { resolveSetupCommand } from "@/services/exec/snapshot/resolveSetupCommand";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { resolvePrepareStep } from "@/services/configuration/resolvePrepareStep";
import { VIRRUN_ENV_KEY } from "@/services/exec/util/constants";
import { withColorEnv } from "@/services/exec/util/withColorEnv";
import { createVfsBackend } from "@/services/exec/vfs/createVfsBackend";
import { loadSource } from "@/services/source/loadSource";
import { existsSync } from "node:fs";
// "auto" resolves to native until vfs beats it on the gates.
const backendFactories: Record<BackendType, () => ExecBackend> = {
  [BackendType.Auto]: createNativeBackend,
  [BackendType.Native]: createNativeBackend,
  [BackendType.Os]: createOsBackend,
  [BackendType.Vfs]: createVfsBackend,
};
// The orchestrator entrypoint: resolve the source to a working dir, pick a backend, and return a handle whose
// Exec/fork/persist route through it; dispose() tears down any temp state the source created.
export const createVirrun = async ({
  backend = BackendType.Auto,
  environment = Environment.None,
  source = { dir: "", type: SourceType.Dir },
}: Partial<VirrunOptions> = {}): Promise<Virrun> => {
  const execBackend = backendFactories[backend]();
  const { cwd, dispose } = await loadSource(source);
  // Key off the resolved backend, not the requested enum: when Auto resolves to Os the shared store, login PATH, and
  // Network re-enable must still be injected (createOsExecOptions). Non-os backends need only the VIRRUN signal.
  const isOsBackend = execBackend.name === BackendType.Os;
  // Resolve the framework prepare step once (preset-driven, no overrides). Only the os backend has overlay layers;
  // Other backends run in-place with the host's own artifacts, so there is nothing to regenerate. Throws loudly if
  // `environment` is set to a framework whose config file is absent — a misconfiguration, not a silent skip.
  const prepareStep = isOsBackend ? resolvePrepareStep(environment, cwd) : undefined;
  const toOptions = (stdio: ExecStdio): ExecOptions =>
    withColorEnv(isOsBackend ? createOsExecOptions(cwd, stdio) : { cwd, env: { [VIRRUN_ENV_KEY]: "true" }, stdio });
  const toInstallOptions = (stdio: ExecStdio): ExecOptions =>
    isOsBackend ? withColorEnv(createOsInstallOptions(cwd, stdio)) : toOptions(stdio);
  // Provision the sandbox's dep closure once into a lockfile-hash-keyed snapshot (warm = no-op). Shared by fork and
  // Persist so the two warm-snapshot paths can't drift.
  const ensureSnapshot = async (stdio: ExecStdio): Promise<void> => {
    const { exists, hash } = resolveSnapshotLocation(cwd);
    // Sweep superseded snapshots before hitting or minting this one, so the cache never grows past the live entry.
    pruneStaleSnapshots(hash);
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
    pruneStalePrepareLayers(location.key);
    if (!existsSync(location.upperDir))
      await createPrepareLayer(execBackend, prepareStep, toInstallOptions(stdio), location);
    return [location.upperDir];
  };
  return {
    backend: execBackend.name,
    dispose,
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
      // Reconciles the command's writes onto the host, masking the prepare outputs (they are cache-owned, never
      // Flushed) and short-circuiting to a recorded result when the task cache holds the run.
      await ensureSnapshot(stdio);
      const prepareLowerDirs = await ensurePrepareLayer(stdio);
      return persistWithCache(execBackend, command, toOptions(stdio), prepareLowerDirs, prepareStep?.outputs ?? []);
    },
  };
};
