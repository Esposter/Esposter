import type { UserConfig } from "tsdown";

import { getTsdownConfigurationNuxtModule } from "@esposter/configuration";

// The client models and the server's handler models ship as files the declarations import relatively, so they need no
// `exports` arm.
// The WebSocket connection and adapter stay public too: an app and trpc-msw import them.
const tsdownConfiguration: UserConfig = getTsdownConfigurationNuxtModule([
  "runtime/client/models/**",
  "runtime/server/createTRPCEventHandler",
  "runtime/server/createTRPCWebSocketHandler",
  "runtime/server/models/PeerWebSocketAdapter",
  "runtime/server/models/TRPCEventHandlerOptions",
  "runtime/server/models/TRPCWebSocketHandler",
  "runtime/server/models/TRPCWebSocketHandlerOptions",
]);

export default tsdownConfiguration;
