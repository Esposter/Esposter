import type { UserConfig } from "tsdown";

import { getTsdownConfigurationNuxtModule } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

// The client models and the server's handler models ship as files the declarations import relatively, so they need no
// `exports` arm. The websocket connection and adapter stay public: an app and trpc-msw import them. mergeConfig replaces
// the factory's exclude list rather than extending it, so its services pattern is repeated here.
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationNuxtModule(), {
  exports: {
    exclude: [
      "runtime/**/services/**",
      "runtime/client/models/**",
      "runtime/server/createTRPCEventHandler",
      "runtime/server/createTRPCWebSocketHandler",
      "runtime/server/models/PeerWebSocketAdapter",
      "runtime/server/models/TRPCEventHandlerOptions",
      "runtime/server/models/TRPCWebSocketHandler",
      "runtime/server/models/TRPCWebSocketHandlerOptions",
    ],
  },
});

export default tsdownConfiguration;
