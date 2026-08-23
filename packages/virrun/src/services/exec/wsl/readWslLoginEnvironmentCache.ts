import type { WslLoginEnvironment } from "#src/models/exec/wsl/WslLoginEnvironment";

import { wslLoginEnvironmentSchema } from "#src/models/exec/wsl/WslLoginEnvironment";
import { PROBE_CACHE_MAX_AGE_MS, WSL_LOGIN_ENVIRONMENT_CACHE_FILENAME } from "#src/services/exec/util/constants";
import { readWslEnvironmentCache } from "#src/services/exec/wsl/readWslEnvironmentCache";
// The persisted login-environment capture stored under the given host key, or undefined when there is none to reuse
// (never captured, captured on another host, or older than the age bound). Split out from the probe whose persisted
// Tier it is so the filename, value schema and age bound are stated exactly once, and so a read-only consumer can
// Reuse a capture without owning any of them.
export const readWslLoginEnvironmentCache = (key: string): undefined | WslLoginEnvironment =>
  readWslEnvironmentCache(WSL_LOGIN_ENVIRONMENT_CACHE_FILENAME, wslLoginEnvironmentSchema, key, PROBE_CACHE_MAX_AGE_MS);
