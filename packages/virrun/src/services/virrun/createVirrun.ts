import type { ExecBackend } from "@/models/exec/ExecBackend";
import type { Virrun } from "@/models/virrun/Virrun";
import type { VirrunOptions } from "@/models/virrun/VirrunOptions";

import { SourceType } from "@/models/source/SourceType";
import { BackendType } from "@/models/virrun/BackendType";
import { createNativeBackend } from "@/services/exec/createNativeBackend";
import { createOsBackend } from "@/services/exec/createOsBackend";
import { createSharedPackageStoreOptions } from "@/services/exec/createSharedPackageStoreOptions";
import { createVfsBackend } from "@/services/exec/createVfsBackend";
import { loadSource } from "@/services/source/loadSource";
// Maps each backend choice to its factory. Adding the future `os` backend is a one-line entry here —
// Nothing else in the orchestrator changes. "auto" resolves to native until vfs beats it on the gates.
const backendFactories: Record<BackendType, () => ExecBackend> = {
  [BackendType.Auto]: createNativeBackend,
  [BackendType.Native]: createNativeBackend,
  [BackendType.Os]: createOsBackend,
  [BackendType.Vfs]: createVfsBackend,
};
// The orchestrator entrypoint. Resolves the source to a working directory, picks a backend, and hands
// Back a handle whose exec routes every command through it. dispose() tears down any temp state the
// Source created. Today the backend is native passthrough, so the sandbox is still a thin wrapper —
// But it is the seam dogfooding and the gate harnesses are built against from day one.
export const createVirrun = async (options: Partial<VirrunOptions> = {}): Promise<Virrun> => {
  const { backend = BackendType.Auto, source = { dir: "", type: SourceType.Dir } } = options;
  const execBackend = backendFactories[backend]();
  const { cwd, dispose } = await loadSource(source);
  return {
    backend: execBackend.name,
    dispose,
    exec: (command, stdio = "pipe") => {
      const sharedPackageStoreOptions = backend === BackendType.Os ? createSharedPackageStoreOptions(cwd) : {};
      return execBackend.exec(command, { ...sharedPackageStoreOptions, cwd, stdio });
    },
  };
};
