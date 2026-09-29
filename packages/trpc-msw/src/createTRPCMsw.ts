import type { ProcedureRegistration } from "#src/models/ProcedureRegistration";
import type { SubscriptionRegistration } from "#src/models/SubscriptionRegistration";
import type { TRPCMsw } from "#src/models/TRPCMsw";
import type { TRPCMswOptions } from "#src/models/TRPCMswOptions";
import type { AnyTRPCRouter, TRPCProcedureType } from "@trpc/server";
import type { HttpHandler, WebSocketHandler } from "msw";

import { WEBSOCKET_ROUTER_REPLACED_CLOSE_CODE } from "#src/constants";
import { MswWebSocketAdapter } from "#src/models/MswWebSocketAdapter";
import { UnhandledProcedureAction } from "#src/models/UnhandledProcedureAction";
import { WebSocketServerAdapter } from "#src/models/WebSocketServerAdapter";
import { checkIsProcedureType } from "#src/services/checkIsProcedureType";
import { createMockRouter } from "#src/services/createMockRouter";
import { getProcedurePaths } from "#src/services/getProcedurePaths";
import { createTRPCRecursiveProxy } from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { http, ws } from "msw";
import { IncomingMessage } from "node:http";
import { Socket } from "node:net";

export const createTRPCMsw = <TRouter extends AnyTRPCRouter, TContext extends object = object>({
  allowMethodOverride,
  createContext,
  endpoint,
  onUnhandledProcedure = UnhandledProcedureAction.Error,
  t,
  webSocketUrl,
}: TRPCMswOptions<TContext>): TRPCMsw<TRouter, TContext> => {
  const registrations = new Map<string, ProcedureRegistration>();
  // Every path ever registered, which outlives `reset` so a connection's router still answers it — with NOT_FOUND
  // Until a resolver is registered again
  const procedureTypes = new Map<string, TRPCProcedureType>();
  const endpointPathname = new URL(endpoint, "http://localhost").pathname;
  const handlers: (HttpHandler | WebSocketHandler)[] = [
    http.all(`${endpoint}/*`, ({ request }) => {
      if (
        onUnhandledProcedure === UnhandledProcedureAction.Bypass &&
        !getProcedurePaths(request.url, endpointPathname).some((path) => registrations.has(path))
      )
        return undefined;

      return fetchRequestHandler({
        allowMethodOverride,
        createContext,
        endpoint: endpointPathname,
        req: request,
        router: createMockRouter(t, procedureTypes, registrations),
      });
    }),
  ];
  const createWebSocketServer = () => {
    const webSocketServer = new WebSocketServerAdapter<MswWebSocketAdapter>();
    applyWSSHandler({
      createContext,
      router: createMockRouter(t, new Map(procedureTypes), registrations),
      wss: webSocketServer,
    });
    return webSocketServer;
  };
  // TRPC binds a WebSocket connection to the router it was accepted with, so a procedure first registered after a
  // Connection opened is served by a fresh server, and the connections on the old one are closed on the spot. A
  // Close rather than tRPC's reconnect notification, because the client reads a notification only on its next
  // Turn, and a call it sends before then would reach the old router; closed, it queues the call, reconnects and
  // Resubscribes on the new one
  let webSocketServer: undefined | WebSocketServerAdapter<MswWebSocketAdapter>;

  if (webSocketUrl)
    handlers.push(
      ws.link(webSocketUrl).addEventListener("connection", (connection) => {
        const { client } = connection;
        const request = new IncomingMessage(new Socket());
        request.url = `${client.url.pathname}${client.url.search}`;
        webSocketServer ??= createWebSocketServer();
        webSocketServer.addConnection(new MswWebSocketAdapter(client), request);
      }),
    );

  const register = (path: string, registration: ProcedureRegistration) => {
    registrations.set(path, registration);
    if (procedureTypes.get(path) === registration.type) return;
    procedureTypes.set(path, registration.type);
    if (!webSocketServer) return;
    for (const client of webSocketServer.clients) client.close(WEBSOCKET_ROUTER_REPLACED_CLOSE_CODE);
    webSocketServer = undefined;
  };

  return {
    handlers,
    reset: () => {
      registrations.clear();
    },
    trpc: createTRPCRecursiveProxy(({ args: [resolver], path }) => {
      const type = path.at(-1);
      if (!checkIsProcedureType(type) || typeof resolver !== "function")
        throw new TypeError(
          `Expected a resolver registered with query, mutation or subscription at "${path.join(".")}"`,
        );
      // The proxy hands its arguments over untyped; `TRPCMsw`'s record type is what checked them at the call site
      register(
        path.slice(0, -1).join("."),
        type === "subscription"
          ? { resolver: resolver as SubscriptionRegistration["resolver"], type }
          : { resolver: resolver as Exclude<ProcedureRegistration, SubscriptionRegistration>["resolver"], type },
      );
    }),
  };
};
