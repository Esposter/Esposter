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
import { VIRRUN_ENV_KEY } from "@/services/exec/util/constants";
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
  const isOsBackend = execBackend.name === BackendType.Os;
  const sharedPackageStoreOptions: Pick<ExecOptions, "bindDirs" | "env"> = isOsBackend
    ? createSharedPackageStoreOptions(cwd)
    : {};
  // Inject the vitest-style presence signal (VIRRUN_ENV_KEY) into every command virrun runs, merged over any
  // Store env the os backend needs. Both the native backend and the bwrap sandbox apply options.env to the
  // Child, so the command — and its tests/config/tooling — can detect it runs under virrun via process.env.
  //
  // Re-enable network for the os backend (`--unshare-all` drops it): the os backend's guarantee is *filesystem*
  // Isolation, not network isolation (specs/exec-isolation.md → "deps download once"). Without it pnpm cannot
  // Reach the registry to bootstrap its config dependencies/deps, so every `virrun -- pnpm …` dies with
  // "fetch failed" before the real command runs — the typecheck/lint output never appears and CI fails opaquely.
  const toOptions = (stdio: ExecStdio): ExecOptions => ({
    ...sharedPackageStoreOptions,
    cwd,
    env: { ...sharedPackageStoreOptions.env, [VIRRUN_ENV_KEY]: "true" },
    isNetworkEnabled: isOsBackend,
    stdio,
  });
  return {
    backend: execBackend.name,
    dispose,
    exec: (command, stdio = "pipe") => execBackend.exec(command, toOptions(stdio)),
    fork: async (command, stdio = "pipe") => {
      // Fork is the os backend's overlay-snapshot mechanism; other backends have no snapshot layer, so the
      // Transparent fallback is a plain exec — fork is then identical to exec with no warm reuse.
      if (execBackend.name !== BackendType.Os) return execBackend.exec(command, toOptions(stdio));
      // Capture-or-reuse, keyed by lockfile hash. On a cold cache the capture run is the command's one real
      // Execution: its writes freeze into the snapshot upper and its result is returned directly, so `command`
      // Runs exactly once. Every later fork stacks that frozen upper read-only and re-runs over it — so a
      // Re-install collapses to a frozen-lockfile no-op and the run's own writes vanish in the ephemeral upper.
      if (!resolveSnapshotLocation(cwd).exists)
        return (await createSnapshot(execBackend, command, toOptions(stdio))).result;
      return forkSnapshot(execBackend, command, toOptions(stdio));
    },
  };
};
