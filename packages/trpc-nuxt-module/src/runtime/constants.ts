// Where the HTTP handler is registered and where the client's links send, unless configured otherwise
export const DEFAULT_ENDPOINT = "/api/trpc";
// The package's name, which is also the module's `meta.name` and the prefix every runtime hook it calls is named under
export const MODULE_NAME = "trpc-nuxt-module";
// The Nitro runtime hooks the WebSocket handler calls as a connection opens and closes, with the connection's context.
// Annotated with the template literal type rather than `string`, which `isolatedDeclarations` would otherwise demand,
// So a hook map keyed by them stays keyed by the literal names
export const WEBSOCKET_CLOSE_HOOK: `${typeof MODULE_NAME}:webSocket:close` = `${MODULE_NAME}:webSocket:close`;

export const WEBSOCKET_OPEN_HOOK: `${typeof MODULE_NAME}:webSocket:open` = `${MODULE_NAME}:webSocket:open`;
