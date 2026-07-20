import type { WslLoginEnvironment } from "@/models/exec/wsl/WslLoginEnvironment";

import { wslLoginEnvironmentSchema } from "@/models/exec/wsl/WslLoginEnvironment";
import { WSL_LOGIN_ENVIRONMENT_CACHE_FILENAME, WSL_LOGIN_ENVIRONMENT_MAX_AGE_MS } from "@/services/exec/util/constants";
import { getHostFingerprint } from "@/services/exec/util/getHostFingerprint";
import { readWslEnvironmentCache } from "@/services/exec/wsl/readWslEnvironmentCache";
// The persisted login-environment capture for this host, or undefined when there is none to reuse (never captured,
// Captured on another host, or older than the age bound). Shared by the probe — whose persisted tier this is — and by
// The read-only consumers that must never trigger a login-shell spawn of their own (getSandboxNodeVersion), so the
// Filename, value schema, host key and age bound are stated exactly once.
export const readWslLoginEnvironmentCache = (): undefined | WslLoginEnvironment =>
  readWslEnvironmentCache(
    WSL_LOGIN_ENVIRONMENT_CACHE_FILENAME,
    wslLoginEnvironmentSchema,
    getHostFingerprint(),
    WSL_LOGIN_ENVIRONMENT_MAX_AGE_MS,
  );
