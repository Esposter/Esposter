import type { WslLoginEnvironment } from "@/models/exec/wsl/WslLoginEnvironment";

import { wslLoginEnvironmentSchema } from "@/models/exec/wsl/WslLoginEnvironment";
import { WSL_ENVIRONMENT_MAX_AGE_MS, WSL_LOGIN_ENVIRONMENT_CACHE_FILENAME } from "@/services/exec/util/constants";
import { getHostFingerprint } from "@/services/exec/util/getHostFingerprint";
import { readWslEnvironmentCache } from "@/services/exec/wsl/readWslEnvironmentCache";
// The persisted login-environment capture for this host, or undefined when there is none to reuse (never captured,
// Captured on another host, or older than the age bound). Split out from the probe whose persisted tier it is so the
// Filename, value schema, host key and age bound are stated exactly once, and so a read-only consumer can reuse a
// Capture without owning any of them.
export const readWslLoginEnvironmentCache = (): undefined | WslLoginEnvironment =>
  readWslEnvironmentCache(
    WSL_LOGIN_ENVIRONMENT_CACHE_FILENAME,
    wslLoginEnvironmentSchema,
    getHostFingerprint(),
    WSL_ENVIRONMENT_MAX_AGE_MS,
  );
