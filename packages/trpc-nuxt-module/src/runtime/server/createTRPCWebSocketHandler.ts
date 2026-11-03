import type { TRPCWebSocketHandler } from "#src/runtime/server/models/TRPCWebSocketHandler";
import type { TRPCWebSocketHandlerOptions } from "#src/runtime/server/models/TRPCWebSocketHandlerOptions";
import type { AnyTRPCRouter, inferRouterContext } from "@trpc/server";
import type { CreateWSSContextFnOptions, WSSHandlerOptions } from "@trpc/server/adapters/ws";

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
  const { broadcastReconnectNotification } = applyWSSHandler({
    ...options,
    createContext,
    // @TODO: no upstream issue — drop the cast once tRPC types `wss` by the two members `applyWSSHandler` reads
    // TRPC types `wss` as the whole `ws.WebSocketServer`, and reads only `on` and `clients` of it
    wss: webSocketServer as WSSHandlerOptions<TRouter>["wss"],
  });
  const peerConnections = new Map<string, PeerConnection<inferRouterContext<TRouter>>>();
  return {
    broadcastReconnectNotification,
    hooks: {
      close: async (peer, { code, reason }) => {
        const peerConnection = peerConnections.get(peer.id);
        if (!peerConnection) return;
        peerConnections.delete(peer.id);
        PeerWebSocketAdapter.receiveClose(peerConnection.client, code, reason);
        // A context that never built was never opened, so this close has no onOpen to answer. Its failure is logged
        // When the peer opened
        await peerConnection.context.match(
          (context) => getResultAsync(() => Promise.resolve(onClose?.({ context, peer }))).match(noop, console.error),
          noop,
        );
      },
      error: (peer, error) => {
        const peerConnection = peerConnections.get(peer.id);
        if (peerConnection) PeerWebSocketAdapter.receiveError(peerConnection.client, error);
      },
      message: (peer, message) => {
        const peerConnection = peerConnections.get(peer.id);
        if (peerConnection) PeerWebSocketAdapter.receiveMessage(peerConnection.client, message.text());
      },
      open: async (peer) => {
        const client = new PeerWebSocketAdapter(peer);
        const request = toIncomingMessage(peer);
        // The context tRPC builds for the connection's calls stays inside tRPC, so the callbacks get one of their
        // Own from the same factory. The client is registered before it is awaited, so no message a peer sends
        // While it builds is lost
        const context = getResultAsync(() =>
          Promise.resolve(
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
              // The peer presented as the socket tRPC hands its context. The compiler cannot see that the callbacks
              // Read only the members `PeerWebSocketAdapter` declares
              res: client as CreateWSSContextFnOptions["res"],
            }),
          ),
        );
        peerConnections.set(peer.id, { client, context });
        webSocketServer.emit("connection", client, request);
        // `crossws` never awaits this hook, so a failure is logged here rather than thrown. A context that fails is
        // Answered and closed by tRPC on the same client, and takes no onOpen with it
        await context
          .andThen((value) => getResultAsync(() => Promise.resolve(onOpen?.({ context: value, peer }))))
          .match(noop, console.error);
      },
    },
  };
};
