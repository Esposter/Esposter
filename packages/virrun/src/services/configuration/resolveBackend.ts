import type { VirrunConfiguration } from "@/models/virrun/VirrunConfiguration";

import { BackendType } from "@/models/virrun/BackendType";
import { isVirrunEnabled } from "@/services/configuration/isVirrunEnabled";
import { isOsBackendSupported } from "@/services/exec/os/isOsBackendSupported";
import process from "node:process";
// No config defaults to Auto (native today); an `os` backend on a host without bubblewrap degrades to Native so
// Adoption never errors the build (worst case "no speedup", never "broken"). A nested run — one already inside a
// Virrun sandbox, so the injected `VIRRUN` signal is set — degrades to Native unconditionally: the outer sandbox
// Already isolates the command, and an inner os backend would try to write its snapshot/persist overlay layers into
// The now read-only `~/.virrun` (the outer `--ro-bind / /`), failing with EROFS. Running the inner command in-place
// Instead lets its writes land in the outer RAM overlay. So a script that itself shells out to virrun (e.g. the root
// `typecheck` running `virrun -- tsgo`) still works when the whole script is wrapped in another `virrun -- …`.
export const resolveBackend = (
  configuration: undefined | VirrunConfiguration,
  env: NodeJS.ProcessEnv = process.env,
): BackendType => {
  if (isVirrunEnabled(env)) return BackendType.Native;
  else if (configuration === undefined) return BackendType.Auto;
  else if (configuration.backend === BackendType.Os && !isOsBackendSupported()) return BackendType.Native;
  else return configuration.backend;
};
