import type { UserConfig } from "tsdown";

import { getTsdownConfigurationNuxtModule } from "@esposter/configuration";

// The client models and the server's handler models ship as files the declarations import relatively, so they need no
// `exports` arm. The HTTP and WebSocket handlers stay public, as the README names them for a Nitro app without Nuxt.
// The WebSocket connection stays public too, since the app's plugin types its hook payload with it. The socket adapters
// Are `@esposter/shared-node/websocket`, so no arm of this package names them.
const tsdownConfiguration: UserConfig = getTsdownConfigurationNuxtModule([
  "runtime/client/models/**",
  "runtime/server/models/PeerWebSocketAdapter",
  "runtime/server/models/TRPCEventHandlerOptions",
  "runtime/server/models/TRPCWebSocketHandler",
  "runtime/server/models/TRPCWebSocketHandlerOptions",
]);

export default tsdownConfiguration;
