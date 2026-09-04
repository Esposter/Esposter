import type { VirrunConfiguration } from "#src/models/virrun/VirrunConfiguration";

import { BackendType } from "#src/models/virrun/BackendType";
import { checkIsVirrunEnabled } from "#src/services/configuration/checkIsVirrunEnabled";
import { resolveRequestedBackend } from "#src/services/configuration/resolveRequestedBackend";
import { isOsBackendSupported } from "#src/services/exec/os/isOsBackendSupported";
// An unset backend (no config file, or a config that omits `backend`) defaults to `os` — the isolating sandbox is the
// Intended way to run the toolchain now. An `os` backend on a host without bubblewrap degrades to Native so adoption
// Never errors the build (worst case "no speedup", never "broken"). A nested run — one already inside a virrun
// Sandbox, so the injected `VIRRUN` signal is set — degrades to Native unconditionally: the outer sandbox already
// Isolates the command, and an inner os backend would try to write its snapshot/persist overlay layers into the now
// Read-only `~/.virrun` (the outer `--ro-bind / /`), failing with EROFS. Running the inner command in-place instead
// Lets its writes land in the outer RAM overlay. So a script that itself shells out to virrun (e.g. the root
// `typecheck` running `virrun -- tsc`) still works when the whole script is wrapped in another `virrun -- …`.
export const resolveBackend = (
  configuration: undefined | VirrunConfiguration,
  env: NodeJS.ProcessEnv = process.env,
): BackendType => {
  if (checkIsVirrunEnabled(env)) return BackendType.Native;
  const backend = resolveRequestedBackend(configuration);
  if (backend === BackendType.Os && !isOsBackendSupported()) return BackendType.Native;
  return backend;
};
