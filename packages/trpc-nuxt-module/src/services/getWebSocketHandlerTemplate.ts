import type { ExportReference } from "#src/models/ExportReference";
import type { WebSocketOptions } from "#src/models/WebSocketOptions";

import { MODULE_NAME } from "#src/runtime/constants";
import { getImportStatement } from "#src/services/getImportStatement";

// Nitro's shutdown is its `close` hook, so every open connection is told to reconnect before the server goes. The
// Handler is registered lazily, which is what lets it reach the Nitro app at the top of the module. The hook names are
// Imported from the runtime rather than written into the source, so no string of ours is spliced into generated code
export const getWebSocketHandlerTemplate = (
  router: ExportReference,
  { keepAlive }: WebSocketOptions,
  createContext?: ExportReference,
): string =>
  [
    `import { defineWebSocketHandler } from "h3";`,
    `import { useNitroApp } from "nitropack/runtime";`,
    `import { WEBSOCKET_CLOSE_HOOK, WEBSOCKET_OPEN_HOOK } from "${MODULE_NAME}/runtime/constants";`,
    `import { createTRPCWebSocketHandler } from "${MODULE_NAME}/runtime/server/createTRPCWebSocketHandler";`,
    getImportStatement(router, "router"),
    createContext ? getImportStatement(createContext, "createContext") : "const createContext = () => ({});",
    `const { hooks: nitroHooks } = useNitroApp();`,
    `const { broadcastReconnectNotification, hooks } = createTRPCWebSocketHandler({`,
    `  createContext,`,
    `  keepAlive: ${JSON.stringify(keepAlive)},`,
    `  onClose: (connection) => nitroHooks.callHook(WEBSOCKET_CLOSE_HOOK, connection),`,
    `  onOpen: (connection) => nitroHooks.callHook(WEBSOCKET_OPEN_HOOK, connection),`,
    `  router,`,
    `});`,
    `nitroHooks.hook("close", broadcastReconnectNotification);`,
    `export default defineWebSocketHandler(hooks);`,
  ].join("\n");
