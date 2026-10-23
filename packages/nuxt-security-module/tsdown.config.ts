import type { UserConfig } from "tsdown";

import { getTsdownConfigurationNuxtModule } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

// The module registers each runtime file by its resolved path, so none of these needs an `exports` arm. The two that a
// Test imports stay public. mergeConfig replaces the factory's exclude list, so its services pattern is repeated here.
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationNuxtModule(), {
  exports: {
    exclude: [
      "runtime/**/services/**",
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
    ],
  },
});

export default tsdownConfiguration;
