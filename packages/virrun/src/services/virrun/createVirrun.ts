import type { ExecBackend } from "@/models/exec/ExecBackend";
import type { ExecOptions, ExecStdio } from "@/models/exec/ExecOptions";
import type { Virrun } from "@/models/virrun/Virrun";
import type { VirrunOptions } from "@/models/virrun/VirrunOptions";

import { SourceType } from "@/models/source/SourceType";
import { BackendType } from "@/models/virrun/BackendType";
import { createNativeBackend } from "@/services/exec/native/createNativeBackend";
import { createOsBackend } from "@/services/exec/os/createOsBackend";
import { createSnapshot } from "@/services/exec/snapshot/createSnapshot";
import { forkSnapshot } from "@/services/exec/snapshot/forkSnapshot";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { createSharedPackageStoreOptions } from "@/services/exec/store/createSharedPackageStoreOptions";
import { createVfsBackend } from "@/services/exec/vfs/createVfsBackend";
import { loadSource } from "@/services/source/loadSource";
// Maps each backend choice to its factory. Adding the future `os` backend is a one-line entry here
// Nothing else in the orchestrator changes. "auto" resolves to native until vfs beats it on the gates.
const backendFactories: Record<BackendType, () => ExecBackend> = {
  [BackendType.Auto]: createNativeBackend,
  [BackendType.Native]: createNativeBackend,
  [BackendType.Os]: createOsBackend,
  [BackendType.Vfs]: createVfsBackend,
};
// The orchestrator entrypoint. Resolves the source to a working directory, picks a backend, and hands
// Back a handle whose exec routes every command through it. dispose() tears down any temp state the
// Source created. Today the backend is native passthrough, so the sandbox is still a thin wrapper
// But it is the seam dogfooding and the gate harnesses are built against from day one.
export const createVirrun = async ({
  backend = BackendType.Auto,
  source = { dir: "", type: SourceType.Dir },
}: Partial<VirrunOptions> = {}): Promise<Virrun> => {
  const execBackend = backendFactories[backend]();
  const { cwd, dispose } = await loadSource(source);
  // Key off the resolved backend, not the requested enum: when Auto resolves to Os the shared store
  // (bindDirs/PNPM_CONFIG_*) must still be injected, otherwise the os path runs without its host cache.
  const sharedPackageStoreOptions = execBackend.name === BackendType.Os ? createSharedPackageStoreOptions(cwd) : {};
  const toOptions = (stdio: ExecStdio): ExecOptions => ({ ...sharedPackageStoreOptions, cwd, stdio });
  return {
    backend: execBackend.name,
    dispose,
    exec: (command, stdio = "pipe") => execBackend.exec(command, toOptions(stdio)),
    fork: async (command, stdio = "pipe") => {
      // Fork is the os backend's overlay-snapshot mechanism; other backends have no snapshot layer, so the
      // Transparent fallback is a plain exec — fork is then identical to exec with no warm reuse.
      if (execBackend.name !== BackendType.Os) return execBackend.exec(command, toOptions(stdio));
      // Capture-or-reuse, keyed by lockfile hash: the first fork for this dependency set freezes the warm
      // Post-run state into the snapshot upper, then every fork (this one included) stacks that upper
      // Read-only and re-runs the command over it — so a re-install collapses to a frozen-lockfile no-op and
      // Fork always returns the result of running in the forked, ephemeral sandbox. The cold path therefore
      // Runs `command` twice (capture then fork); this is the documented setup-command contract (see Virrun.fork)
      // And is only correct for idempotent commands like `pnpm install`, never arbitrary side-effecting ones.
      if (!resolveSnapshotLocation(cwd).exists) await createSnapshot(execBackend, command, toOptions(stdio));
      return forkSnapshot(execBackend, command, toOptions(stdio));
    },
  };
};
