import type { ExportReference } from "#src/models/ExportReference";

import { MODULE_NAME, WEBSOCKET_CLOSE_HOOK, WEBSOCKET_OPEN_HOOK } from "#src/runtime/constants";

// Types the two runtime hooks the WebSocket handler calls with the router's own context, so an app's Nitro plugin
// Listening on them reads its context without a cast
export const getWebSocketHooksTypeTemplate = ({ from, name }: ExportReference): string => {
  const connectionType = `TRPCWebSocketConnection<inferRouterContext<typeof import(${JSON.stringify(from)})[${JSON.stringify(name)}]>>`;
  return [
    `import type { inferRouterContext } from "@trpc/server";`,
    `import type { TRPCWebSocketConnection } from "${MODULE_NAME}/runtime/server/models/TRPCWebSocketConnection";`,
    `declare module "nitropack/types" {`,
    `  interface NitroRuntimeHooks {`,
    `    ${JSON.stringify(WEBSOCKET_CLOSE_HOOK)}: (connection: ${connectionType}) => Promise<void> | void;`,
    `    ${JSON.stringify(WEBSOCKET_OPEN_HOOK)}: (connection: ${connectionType}) => Promise<void> | void;`,
    `  }`,
    `}`,
    `export {};`,
  ].join("\n");
};
