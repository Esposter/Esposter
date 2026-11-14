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
    this.onSocketAccepted(server, request);
    return new Response(null, { status: 101, webSocket: client });
  }

  // Runs once a socket is accepted and before its upgrade is answered, so what it sends first is what the socket hears
  // before anything live. The synchronous work here is never interleaved with another event on the object
  protected onSocketAccepted(_server: WebSocket, _request: Request): void {}

  // A close the peer began is answered in kind, so the socket is released rather than left half open
  override webSocketClose(ws: WebSocket, code: number, reason: string) {
    ws.close(code, reason);
  }

  override webSocketError(ws: WebSocket) {
    ws.close(1011, "Socket error");
  }

  // A broadcast reaches every socket a tag names, or every socket when none is named, and `excludeTag` skips the
  // sockets that carry it, so a write's own device does not hear the echo of what it did
  protected broadcast(event: TEvent, { excludeTag, tag }: { excludeTag?: string; tag?: string } = {}) {
    const frame = JSON.stringify(event);
    for (const ws of this.ctx.getWebSockets(tag)) {
      if (excludeTag && this.ctx.getTags(ws).includes(excludeTag)) continue;
      ws.send(frame);
    }
  }
}
