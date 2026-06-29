import type { VirrunConfiguration } from "@/models/virrun/VirrunConfiguration";

import { BackendType } from "@/models/virrun/BackendType";
import { isOsBackendSupported } from "@/services/exec/os/isOsBackendSupported";
// Picks the backend a `virrun -- <cmd>` invocation runs through, given the resolved config. The prefix is the
// Switch — every prefixed command is sandboxed — so this no longer gates on the command, only on the host: with
// No config it defaults to Auto (native today), and an `os` backend on a host without bubblewrap degrades to
// Native so adoption never errors the build (worst case "no speedup", never "broken"). Native is the only
// Universally-available backend, so it is the sole sensible degrade floor — not a configurable knob. Benchmark-
// Gate and differential-correctness degrades stay future work — this slice wires the host-support arm of the net.
export const resolveBackend = (configuration: undefined | VirrunConfiguration): BackendType => {
  if (configuration === undefined) return BackendType.Auto;
  else if (configuration.backend === BackendType.Os && !isOsBackendSupported()) return BackendType.Native;
  else return configuration.backend;
};
