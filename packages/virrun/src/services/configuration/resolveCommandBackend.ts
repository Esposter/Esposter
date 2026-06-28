import type { VirrunConfiguration } from "@/models/virrun/VirrunConfiguration";

import { BackendType } from "@/models/virrun/BackendType";
import { matchesRoute } from "@/services/configuration/matchesRoute";
import { isOsBackendSupported } from "@/services/exec/os/isOsBackendSupported";
// Decides which backend a command runs through, given the resolved config. The whole adoption safety net in
// One function: with no config, or a command outside the allowlist, it returns Native — virrun is a no-op and
// The command runs exactly as it would without it. A matched command routes through the configured backend,
// Except that an `os` route on a host without bubblewrap support defers to `fallback` so adoption never errors
// The build (worst case "no speedup", never "broken"). Benchmark-gate and differential-correctness fallbacks
// Are config-driven too but stay future work — this slice wires the host-support arm of the net.
export const resolveCommandBackend = (
  command: readonly string[] | string,
  configuration: undefined | VirrunConfiguration,
): BackendType => {
  if (configuration === undefined || !matchesRoute(command, configuration.route)) return BackendType.Native;
  if (configuration.backend === BackendType.Os && !isOsBackendSupported()) return configuration.fallback;
  return configuration.backend;
};
