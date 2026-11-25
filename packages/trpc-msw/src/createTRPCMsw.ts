import type { ProcedureRegistration } from "#src/models/ProcedureRegistration";
import type { TRPCMsw } from "#src/models/TRPCMsw";
import type { TRPCMswOptions } from "#src/models/TRPCMswOptions";
import type { AnyTRPCRouter, TRPCError, TRPCProcedureType } from "@trpc/server";
import type { HttpHandler, WebSocketHandler } from "msw";

import { WEBSOCKET_ROUTER_REPLACED_CLOSE_CODE } from "#src/constants";
import { MswWebSocketAdapter } from "#src/models/MswWebSocketAdapter";
import { UnhandledProcedureAction } from "#src/models/UnhandledProcedureAction";
import { checkIsProcedureType } from "#src/services/checkIsProcedureType";
import { createMockRouter } from "#src/services/createMockRouter";
import { getProcedurePaths } from "#src/services/getProcedurePaths";
import { omitUndefined } from "@esposter/shared";
import { WebSocketServerAdapter } from "@esposter/shared-node/websocket";
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
  onUnhandledProcedureCall,
  responseMeta,
  router,
  t,
  webSocketUrl,
}: TRPCMswOptions<TContext>): TRPCMsw<TRouter, TContext> => {
  const registrations = new Map<string, ProcedureRegistration>();
  // Every path ever registered, which outlives `reset` so a connection's router still answers it — with NOT_FOUND
  // Until a resolver is registered again
  const procedureTypes = new Map<string, TRPCProcedureType>();
  const endpointPathname = new URL(endpoint, "http://localhost").pathname;
  // Built once and reused until a path is registered for the first time, since the router's procedures are the paths
  // Registered then; the resolvers themselves are read from `registrations` at each call
  let httpRouter: AnyTRPCRouter | undefined;
  // tRPC reports every error a call ends in, so a NOT_FOUND is told apart from a resolver's own by whether a resolver of
  // The call's type was registered for its path when it failed
  const onError = onUnhandledProcedureCall
    ? ({ error, path, type }: { error: TRPCError; path: string | undefined; type: string }) => {
        if (error.code === "NOT_FOUND" && path !== undefined && registrations.get(path)?.type !== type)
          onUnhandledProcedureCall(path);
      }
    : undefined;
  const handlers: (HttpHandler | WebSocketHandler)[] = [
    http.all(`${endpoint}/*`, ({ request }) => {
      if (
        onUnhandledProcedure === UnhandledProcedureAction.Bypass &&
        !getProcedurePaths(request.url, endpointPathname).some((path) => registrations.has(path))
      )
        return undefined;

      httpRouter ??= createMockRouter(t, procedureTypes, registrations, router);
      return fetchRequestHandler({
        ...omitUndefined({ allowMethodOverride, createContext, onError, responseMeta }),
        endpoint: endpointPathname,
        req: request,
        router: httpRouter,
      });
    }),
  ];
  const createWebSocketServer = () => {
    const webSocketServer = new WebSocketServerAdapter<MswWebSocketAdapter>();
    applyWSSHandler({
      ...omitUndefined({ createContext, onError }),
      router: createMockRouter(t, new Map(procedureTypes), registrations, router),
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
        webSocketServer.emit("connection", new MswWebSocketAdapter(client), request);
      }),
    );

  const register = (path: string, registration: ProcedureRegistration) => {
    registrations.set(path, registration);
    if (procedureTypes.get(path) === registration.type) return;
    procedureTypes.set(path, registration.type);
    httpRouter = undefined;
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
      // The proxy hands its arguments over untyped; `TRPCMsw`'s record type is what checked them at the call site.
      // The resolver is the one its procedure type names.
      // The proxy's plain string type does not carry that to the compiler.
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the variant is the one its type names
      register(path.slice(0, -1).join("."), { resolver, type } as ProcedureRegistration);
    }),
  };
};
