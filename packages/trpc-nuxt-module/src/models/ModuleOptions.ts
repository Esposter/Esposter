import type { ExportReference } from "#src/models/ExportReference";
import type { WebSocketOptions } from "#src/models/WebSocketOptions";

export interface ModuleOptions {
  // Called with the event for an HTTP request, and with tRPC's WebSocket context options for a connection
  createContext?: ExportReference;
  // The route the HTTP handler is registered under
  endpoint: string;
  router: ExportReference;
  // No WebSocket handler is registered without it
  webSocket?: WebSocketOptions;
}
