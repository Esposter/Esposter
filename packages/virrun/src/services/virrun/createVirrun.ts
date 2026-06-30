import type { ExecBackend } from "@/models/exec/ExecBackend";
import type { ExecOptions, ExecStdio } from "@/models/exec/ExecOptions";
import type { Virrun } from "@/models/virrun/Virrun";
import type { VirrunOptions } from "@/models/virrun/VirrunOptions";

import { SourceType } from "@/models/source/SourceType";
import { BackendType } from "@/models/virrun/BackendType";
import { createNativeBackend } from "@/services/exec/native/createNativeBackend";
import { createOsBackend } from "@/services/exec/os/createOsBackend";
import { createOsExecOptions } from "@/services/exec/os/createOsExecOptions";
import { createOsInstallOptions } from "@/services/exec/os/createOsInstallOptions";
import { createSnapshot } from "@/services/exec/snapshot/createSnapshot";
import { forkSnapshot } from "@/services/exec/snapshot/forkSnapshot";
import { persistRun } from "@/services/exec/snapshot/persistRun";
import { resolveSetupCommand } from "@/services/exec/snapshot/resolveSetupCommand";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { VIRRUN_ENV_KEY } from "@/services/exec/util/constants";
import { createVfsBackend } from "@/services/exec/vfs/createVfsBackend";
import { loadSource } from "@/services/source/loadSource";
// "auto" resolves to native until vfs beats it on the gates.
const backendFactories: Record<BackendType, () => ExecBackend> = {
  [BackendType.Auto]: createNativeBackend,
  [BackendType.Native]: createNativeBackend,
  [BackendType.Os]: createOsBackend,
  [BackendType.Vfs]: createVfsBackend,
};
// The orchestrator entrypoint: resolve the source to a working dir, pick a backend, and return a handle
// Whose exec/fork/persist route through it; dispose() tears down any temp state the source created.
export const createVirrun = async ({
  backend = BackendType.Auto,
  source = { dir: "", type: SourceType.Dir },
}: Partial<VirrunOptions> = {}): Promise<Virrun> => {
  const execBackend = backendFactories[backend]();
  const { cwd, dispose } = await loadSource(source);
  // Key off the resolved backend, not the requested enum: when Auto resolves to Os the shared store, login PATH,
  // And network re-enable must still be injected (createOsExecOptions). Non-os backends run in the caller's own
  // Shell env, so they need only the VIRRUN presence signal.
  const isOsBackend = execBackend.name === BackendType.Os;
  const toOptions = (stdio: ExecStdio): ExecOptions =>
    isOsBackend ? createOsExecOptions(cwd, stdio) : { cwd, env: { [VIRRUN_ENV_KEY]: "true" }, stdio };
  const toInstallOptions = (stdio: ExecStdio): ExecOptions =>
    isOsBackend ? createOsInstallOptions(cwd, stdio) : toOptions(stdio);
  // Provision the sandbox's dep closure once into a lockfile-hash-keyed snapshot (warm = no-op). Shared by fork
  // And persist so the two warm-snapshot paths can't drift.
  const ensureSnapshot = async (stdio: ExecStdio): Promise<void> => {
    if (!resolveSnapshotLocation(cwd).exists)
      await createSnapshot(execBackend, resolveSetupCommand(), toInstallOptions(stdio));
  };
  return {
    backend: execBackend.name,
    dispose,
    exec: (command, stdio = "pipe") => execBackend.exec(command, toOptions(stdio)),
    fork: async (command, stdio = "pipe") => {
      // Other backends have no snapshot layer, so fork falls back to a plain exec (no warm reuse).
      if (execBackend.name !== BackendType.Os) return execBackend.exec(command, toOptions(stdio));
      // A Windows host's win32 node_modules can't run inside the Linux sandbox, so the command runs over the
      // Sandbox's own frozen dep tree via forkSnapshot, never the bare source. The snapshot is deps-only (pruneSnapshotUpper),
      // So any source-derived artifact (e.g. .nuxt) is served from the host source tree stacked underneath as the
      // `--overlay-src` lower — matching native staleness, with no per-fork postinstall replay.
      await ensureSnapshot(stdio);
      return forkSnapshot(execBackend, command, toOptions(stdio));
    },
    persist: async (command, stdio = "pipe") => {
      // Other backends have no sandbox, so a plain exec writes straight to the host disk — nothing to flush.
      if (execBackend.name !== BackendType.Os) return execBackend.exec(command, toOptions(stdio));
      // Same warm-snapshot provisioning as fork (deps-only snapshot over the host source lower); persistRun then
      // tops it with a real upper and reconciles the command's writes onto the host.
      await ensureSnapshot(stdio);
      return persistRun(execBackend, command, toOptions(stdio));
    },
  };
};
