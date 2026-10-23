import type { UserConfig } from "tsdown";

import { getTsdownConfigurationNuxtModule } from "@esposter/configuration";

// The module registers each runtime file by its resolved path, so none of these needs an `exports` arm. The two that a
// Test imports stay public.
const tsdownConfiguration: UserConfig = getTsdownConfigurationNuxtModule([
  "runtime/constants",
  "runtime/nitro/plugins/hidePoweredBy",
  "runtime/nitro/plugins/nonce",
  "runtime/nitro/plugins/securityHeaders",
  "runtime/nitro/plugins/ssgHashes",
  "runtime/nitro/plugins/subresourceIntegrity",
  "runtime/server/middleware/allowedMethodsRestricter",
  "runtime/server/middleware/basicAuth",
  "runtime/server/middleware/corsHandler",
  "runtime/server/middleware/csrf",
  "runtime/server/middleware/requestSizeLimiter",
]);

export default tsdownConfiguration;
