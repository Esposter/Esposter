import type { TRPCWebSocketHandler } from "#src/runtime/server/models/TRPCWebSocketHandler";
import type { TRPCWebSocketHandlerOptions } from "#src/runtime/server/models/TRPCWebSocketHandlerOptions";
import type { AnyTRPCRouter, inferRouterContext } from "@trpc/server";

import { PeerWebSocketAdapter } from "#src/runtime/server/models/PeerWebSocketAdapter";
import { WebSocketServerAdapter } from "#src/runtime/server/models/WebSocketServerAdapter";
import { toIncomingMessage } from "#src/runtime/server/services/toIncomingMessage";
import { getResultAsync, noop } from "@esposter/shared";
import { applyWSSHandler } from "@trpc/server/adapters/ws";

interface PeerConnection<TContext> {
  client: PeerWebSocketAdapter;
  // The context the callbacks take, or the error that stopped it being built
  context: ReturnType<typeof getResultAsync<TContext>>;
}
// TRPC's WebSocket adapter over crossws, the WebSocket layer Nitro serves. tRPC drives a `ws` server, so the handler
// Presents one and a `ws` client per peer, and replays each crossws hook onto the client it belongs to
export const createTRPCWebSocketHandler = <TRouter extends AnyTRPCRouter>({
  createContext,
  onClose,
  onOpen,
  ...options
}: TRPCWebSocketHandlerOptions<TRouter>): TRPCWebSocketHandler => {
  const webSocketServer = new WebSocketServerAdapter<PeerWebSocketAdapter>();
  const { broadcastReconnectNotification } = applyWSSHandler({ ...options, createContext, wss: webSocketServer });
  const peerConnections = new Map<string, PeerConnection<inferRouterContext<TRouter>>>();
  return {
    broadcastReconnectNotification,
    hooks: {
      close: async (peer, { code, reason }) => {
        const peerConnection = peerConnections.get(peer.id);
        if (!peerConnection) return;
        peerConnections.delete(peer.id);
        peerConnection.client.receiveClose(code, reason);
        // A context that never built was never opened, so this close has no onOpen to answer. Its failure is logged
        // When the peer opened
        await peerConnection.context.match(
          (context) => getResultAsync(async () => onClose?.({ context, peer })).match(noop, console.error),
          noop,
        );
      },
      error: (peer, error) => {
        peerConnections.get(peer.id)?.client.receiveError(error);
      },
      message: (peer, message) => {
        peerConnections.get(peer.id)?.client.receiveMessage(message.text());
      },
      open: async (peer) => {
        const client = new PeerWebSocketAdapter(peer);
        const request = toIncomingMessage(peer);
        // The context tRPC builds for the connection's calls stays inside tRPC, so the callbacks get one of their
        // Own from the same factory. The client is registered before it is awaited, so no message a peer sends
        // While it builds is lost
        const context = getResultAsync(async () =>
          createContext({
            info: {
              accept: null,
              calls: [],
              connectionParams: null,
              isBatchCall: false,
              signal: new AbortController().signal,
              type: "unknown",
              url: new URL(peer.request.url),
            },
            req: request,
            res: client,
          }),
        );
        peerConnections.set(peer.id, { client, context });
        webSocketServer.addConnection(client, request);
        // crossws never awaits this hook, so a failure is logged here rather than thrown. A context that fails is
        // Answered and closed by tRPC on the same client, and takes no onOpen with it
        await context
          .andThen((value) => getResultAsync(async () => onOpen?.({ context: value, peer })))
          .match(noop, console.error);
      },
    },
  };
};
