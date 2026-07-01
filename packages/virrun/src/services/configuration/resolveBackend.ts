import type { VirrunConfiguration } from "@/models/virrun/VirrunConfiguration";

import { BackendType } from "@/models/virrun/BackendType";
import { isOsBackendSupported } from "@/services/exec/os/isOsBackendSupported";
// No config defaults to Auto (native today); an `os` backend on a host without bubblewrap degrades to Native so
// Adoption never errors the build (worst case "no speedup", never "broken").
export const resolveBackend = (configuration: undefined | VirrunConfiguration): BackendType => {
  if (configuration === undefined) return BackendType.Auto;
  else if (configuration.backend === BackendType.Os && !isOsBackendSupported()) return BackendType.Native;
  else return configuration.backend;
};
