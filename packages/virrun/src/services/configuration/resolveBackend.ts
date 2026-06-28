import type { VirrunConfiguration } from "@/models/virrun/VirrunConfiguration";

import { BackendType } from "@/models/virrun/BackendType";
import { isOsBackendSupported } from "@/services/exec/os/isOsBackendSupported";
// Picks the backend a `virrun -- <cmd>` invocation runs through, given the resolved config. The prefix is the
// Switch — every prefixed command is sandboxed — so this no longer gates on the command, only on the host: with
// No config it defaults to Auto (native today), and an `os` backend on a host without bubblewrap defers to
// `fallback` so adoption never errors the build (worst case "no speedup", never "broken"). Benchmark-gate and
// Differential-correctness fallbacks are config-driven too but stay future work — this slice wires the
// Host-support arm of the net.
export const resolveBackend = (configuration: undefined | VirrunConfiguration): BackendType => {
  if (configuration === undefined) return BackendType.Auto;
  if (configuration.backend === BackendType.Os && !isOsBackendSupported()) return configuration.fallback;
  return configuration.backend;
};
