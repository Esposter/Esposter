import {
  PROBE_TIMEOUT_MS,
  WSL_ENVIRONMENT_MAX_AGE_MS,
  VIRRUN_FORCE_PROBE_KEY,
  WSL_EXEC_NODE_VERSION_CACHE_FILENAME,
} from "@/services/exec/util/constants";
import { execFileHidden } from "@/services/exec/util/execFileHidden";
import { getHostFingerprint } from "@/services/exec/util/getHostFingerprint";
import { readWslEnvironmentCache } from "@/services/exec/wsl/readWslEnvironmentCache";
import { writeWslEnvironmentCache } from "@/services/exec/wsl/writeWslEnvironmentCache";
import { getResult } from "@esposter/shared";
import { z } from "zod";
// The node a sandboxed command resolves through the bare `wsl.exe --exec` the os backend spawns — i.e. the guest's
// Default-PATH node, which is what a run gets when the interactive-login capture is unavailable and no PATH is
// Injected. Exists so that degraded path still keys its caches on the node it will really run, instead of on the
// Windows host's node: a snapshot holds an installed node_modules, so replaying one under another ABI is not a cache
// Hit but a wrong answer, and mislabelling the guest's tree with the host's major is exactly how that happens.
// Three-tier like readWslLoginEnvironment / getWslNativeCacheRoot — in-process memo, persisted Windows-side cache
// (getHostFingerprint-keyed, age-bounded because a node upgrade changes neither the key nor the fingerprint,
// VIRRUN_FORCE_PROBE bypass), then the probe. Only a successful probe is persisted, so a transient WSL failure
// Re-probes next process rather than caching "".
let wslExecNodeVersion = "";

export const readWslExecNodeVersion = (): string => {
  if (wslExecNodeVersion) return wslExecNodeVersion;
  const key = getHostFingerprint();
  if (process.env[VIRRUN_FORCE_PROBE_KEY] === undefined) {
    const cached = readWslEnvironmentCache(
      WSL_EXEC_NODE_VERSION_CACHE_FILENAME,
      z.string(),
      key,
      WSL_ENVIRONMENT_MAX_AGE_MS,
    );
    if (cached !== undefined) {
      wslExecNodeVersion = cached;
      return cached;
    }
  }
  wslExecNodeVersion = getResult(() =>
    execFileHidden("wsl.exe", ["--exec", "node", "--version"], { timeout: PROBE_TIMEOUT_MS }),
  )
    .map((output) => output.trim())
    .unwrapOr("");
  if (wslExecNodeVersion)
    writeWslEnvironmentCache(WSL_EXEC_NODE_VERSION_CACHE_FILENAME, { key, value: wslExecNodeVersion });
  return wslExecNodeVersion;
};
