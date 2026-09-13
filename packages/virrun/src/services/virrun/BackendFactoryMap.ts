import type { ExecBackend } from "#src/models/exec/ExecBackend";
import type { Environment } from "#src/models/virrun/Environment";

import { BackendType } from "#src/models/virrun/BackendType";
import { createNativeBackend } from "#src/services/exec/native/createNativeBackend";
import { createOsBackend } from "#src/services/exec/os/createOsBackend";
import { createVfsBackend } from "#src/services/exec/vfs/createVfsBackend";
// "auto" resolves to native until vfs beats it on the gates. Every factory takes the run's `environment` so the one
// Backend that narrows what the sandbox can see (os on win32, via the source mirror) derives its exclude set from the
// Same preset `maskedPaths` below does; the others have no mirror and ignore it.
export const BackendFactoryMap: Record<BackendType, (environment?: Environment) => ExecBackend> = {
  [BackendType.Auto]: createNativeBackend,
  [BackendType.Native]: createNativeBackend,
  [BackendType.Os]: createOsBackend,
  [BackendType.Vfs]: createVfsBackend,
};
