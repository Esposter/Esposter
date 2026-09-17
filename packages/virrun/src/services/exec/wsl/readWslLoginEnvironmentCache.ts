import type { WslLoginEnvironment } from "#src/models/exec/wsl/WslLoginEnvironment";

import { wslLoginEnvironmentSchema } from "#src/models/exec/wsl/WslLoginEnvironment";
import { PROBE_CACHE_MAX_AGE_MS, WSL_LOGIN_ENVIRONMENT_CACHE_FILENAME } from "#src/services/exec/util/constants";
import { checkHasSandboxNode } from "#src/services/exec/wsl/checkHasSandboxNode";
import { readWslEnvironmentCache } from "#src/services/exec/wsl/readWslEnvironmentCache";
// The persisted login-environment capture stored under the given host key, or undefined when there is none to reuse
// (never captured, captured on another host, older than the age bound, or naming a node install that is gone). Split
// Out from the probe whose persisted tier it is so the filename, value schema, age bound and validity rule are stated
// Exactly once, and so a read-only consumer can reuse a capture without owning any of them.
//
// The node check is what actually closes the toolchain-switch hole the age bound only narrows: the key is
// `platform:kernel-release`, so a node manager moving to a new version leaves a capture that is the right host's, is
// Minutes old, and points every sandbox at an install the user just deleted — a PATH resolution walks past into
// Whatever answers next. Asking the filesystem costs one stat over the 9p bridge and cannot be fooled by any of it; a capture
// That fails it falls through to a fresh probe exactly like an absent one, so the recovery is the next run, not a
// Manual clean. Only a capture holding a usable node is ever persisted (readWslLoginEnvironment's `shouldPersist`), so
// `nodeDirectory` is always a real claim to check rather than sometimes "".
export const readWslLoginEnvironmentCache = (key: string): undefined | WslLoginEnvironment => {
  const cache = readWslEnvironmentCache(
    WSL_LOGIN_ENVIRONMENT_CACHE_FILENAME,
    wslLoginEnvironmentSchema,
    key,
    PROBE_CACHE_MAX_AGE_MS,
  );
  return cache !== undefined && checkHasSandboxNode(cache.nodeDirectory) ? cache : undefined;
};
