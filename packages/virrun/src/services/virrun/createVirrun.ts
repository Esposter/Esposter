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
import { resolveSetupCommand } from "@/services/exec/snapshot/resolveSetupCommand";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
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
  // Key off the resolved backend, not the requested enum: when Auto resolves to Os the shared store, login PATH,
  // And network re-enable must still be injected (see createOsExecOptions), otherwise the os path runs without
  // Its host cache. A non-os backend runs in the caller's own shell env, so it needs none of that wiring — only
  // The vitest-style VIRRUN presence signal, which both backends apply to the child so a command can detect it.
  const isOsBackend = execBackend.name === BackendType.Os;
  const toOptions = (stdio: ExecStdio): ExecOptions =>
    isOsBackend ? createOsExecOptions(cwd, stdio) : { cwd, env: { [VIRRUN_ENV_KEY]: "true" }, stdio };
  const toInstallOptions = (stdio: ExecStdio): ExecOptions =>
    isOsBackend ? createOsInstallOptions(cwd, stdio) : toOptions(stdio);
  return {
    backend: execBackend.name,
    dispose,
    exec: (command, stdio = "pipe") => execBackend.exec(command, toOptions(stdio)),
    fork: async (command, stdio = "pipe") => {
      // Fork is the os backend's overlay-snapshot mechanism; other backends have no snapshot layer, so the
      // Transparent fallback is a plain exec — fork is then identical to exec with no warm reuse.
      if (execBackend.name !== BackendType.Os) return execBackend.exec(command, toOptions(stdio));
      // The os backend is a Linux sandbox. We cannot tell from outside whether any dependency ships a
      // Platform-specific binary, and on a Windows host the host's win32 node_modules can't run inside it — so
      // Always provision the sandbox's own dep closure once, frozen into a lockfile-hash-keyed snapshot, then run
      // The command over it. Cold: capture the frozen install (its node_modules persist into the upper). Warm:
      // Reuse it. Either way `command` runs over a populated dep tree via forkSnapshot, never the bare source.
      if (!resolveSnapshotLocation(cwd).exists)
        await createSnapshot(execBackend, resolveSetupCommand(), toInstallOptions(stdio));
      return forkSnapshot(execBackend, command, toOptions(stdio));
    },
  };
};
