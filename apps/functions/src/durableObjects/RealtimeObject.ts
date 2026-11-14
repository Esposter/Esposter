import { DurableObject } from "cloudflare:workers";

import { readSocketIdentity } from "#src/services/realtime/readSocketIdentity";

// The socket shape the three objects share: a socket accepted under tags for its user, session and device, hibernated
// while no message is in flight, and an event written to every socket a tag names, one JSON frame each. A socket is
// never listened to with addEventListener, which would hold the object awake for as long as it stayed open
export abstract class RealtimeObject<
  TEvent extends { type: string } = { type: string },
> extends DurableObject<Cloudflare.Env> {
  override async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") !== "websocket")
      return new Response("Expected a WebSocket upgrade", { status: 426 });

    const identity = readSocketIdentity(request.headers);
    if (!identity) return new Response("Missing socket identity", { status: 400 });

    const { 0: client, 1: server } = new WebSocketPair();
    this.ctx.acceptWebSocket(server, [
      `user:${identity.userId}`,
      `session:${identity.sessionId}`,
      `device:${identity.deviceId}`,
    ]);
    return new Response(null, { status: 101, webSocket: client });
  }

  // A close the peer began is answered in kind, so the socket is released rather than left half open
  override webSocketClose(ws: WebSocket, code: number, reason: string) {
    ws.close(code, reason);
  }

  override webSocketError(ws: WebSocket) {
    ws.close(1011, "Socket error");
  }

  protected broadcast(event: TEvent, tag?: string) {
    const frame = JSON.stringify(event);
    for (const ws of this.ctx.getWebSockets(tag)) ws.send(frame);
  }
}
