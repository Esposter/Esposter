import type { TRPCWebSocketConnection } from "#src/runtime/server/models/TRPCWebSocketConnection";
import type { AnyTRPCRouter, inferRouterContext } from "@trpc/server";
import type { CreateWSSContextFnOptions, WSSHandlerOptions } from "@trpc/server/adapters/ws";
import type { BaseHandlerOptions } from "@trpc/server/http";
import type { IncomingMessage } from "node:http";
import type { Promisable } from "type-fest";

// TRPC's own WebSocket handler options, but for the server, which the handler presents itself, plus a callback for
// Each end of a connection's life. Built on the base options for the reason `TRPCEventHandlerOptions` is
export type TRPCWebSocketHandlerOptions<TRouter extends AnyTRPCRouter> = BaseHandlerOptions<TRouter, IncomingMessage> &
  Pick<WSSHandlerOptions<TRouter>, "dangerouslyDisablePong" | "experimental_encoder" | "keepAlive" | "prefix"> & {
    createContext: (options: CreateWSSContextFnOptions) => Promisable<inferRouterContext<TRouter>>;
    onClose?: (connection: TRPCWebSocketConnection<inferRouterContext<TRouter>>) => Promisable<void>;
    onOpen?: (connection: TRPCWebSocketConnection<inferRouterContext<TRouter>>) => Promisable<void>;
  };
