import { createProbeCache } from "@/services/exec/util/createProbeCache";
import {
  PROBE_TIMEOUT_MS,
  WSL_ENVIRONMENT_MAX_AGE_MS,
  WSL_EXEC_NODE_VERSION_CACHE_FILENAME,
} from "@/services/exec/util/constants";
import { execWsl } from "@/services/exec/wsl/execWsl";
import { readWslEnvironmentCache } from "@/services/exec/wsl/readWslEnvironmentCache";
import { writeWslEnvironmentCache } from "@/services/exec/wsl/writeWslEnvironmentCache";
import { getResult } from "@esposter/shared";
import { z } from "zod";
// The node a sandboxed command resolves through the bare `wsl.exe --exec` the os backend spawns — i.e. the guest's
// Default-PATH node, which is what a run gets when the interactive-login capture is unavailable and no PATH is
// Injected. Exists so that degraded path still keys its caches on the node it will really run, instead of on the
// Windows host's node: a snapshot holds an installed node_modules, so replaying one under another ABI is not a cache
// Hit but a wrong answer, and mislabelling the guest's tree with the host's major is exactly how that happens.
// Age-bounded because a node upgrade changes neither the key nor the fingerprint; only a successful probe is
// Persisted, so a transient WSL failure re-probes next process rather than caching "".
export const readWslExecNodeVersion: () => string = createProbeCache({
  probe: () =>
    getResult(() => execWsl(["--exec", "node", "--version"], { timeout: PROBE_TIMEOUT_MS }))
      .map((output) => output.trim())
      .unwrapOr(""),
  readPersistedCache: (key) =>
    readWslEnvironmentCache(WSL_EXEC_NODE_VERSION_CACHE_FILENAME, z.string(), key, WSL_ENVIRONMENT_MAX_AGE_MS),
  shouldPersist: Boolean,
  writePersistedCache: (cache) => {
    writeWslEnvironmentCache(WSL_EXEC_NODE_VERSION_CACHE_FILENAME, cache);
  },
});
