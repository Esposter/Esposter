import { RESERVED_CLOSE_CODES } from "#src/services/durableObject/constants";
import { readSocketIdentity } from "#src/services/realtime/readSocketIdentity";
import { getResultAsync, noop } from "@esposter/shared";
import { DurableObject } from "cloudflare:workers";

// A revoked or expired session's sockets close with code 1008, the policy close for a credential the server does not
// Accept
const SESSION_ENDED_CLOSE_CODE = 1008;
const SESSION_EXPIRES_AT_TAG_PREFIX = "sessionExpiresAt:";
// A revoke is kept this long. An upgrade reaches the object within seconds of reading its session, so an hour outlasts
// Every upgrade a revoke can overtake. A record older than that is pruned when the next revoke is recorded
const REVOKED_SESSION_TTL_MS = Temporal.Duration.from({ hours: 1 }).total("milliseconds");
const REVOKED_SESSION_PREFIX = "revokedSession:";
const getRevokedSessionKey = (sessionId: string) => `${REVOKED_SESSION_PREFIX}${sessionId}`;

// The three objects share one socket shape.
// A socket is accepted under tags for its user, session and device, and one for its session's expiry, and hibernates
// While no message is in flight. A socket whose session has expired is closed when a write next reaches it.
// Each event is written to every socket a tag names, one JSON frame each.
// A socket is never listened to with addEventListener, which would hold the object awake for as long as it stayed open
export abstract class RealtimeObject<TEvent extends { type: string } = { type: string }> extends DurableObject {
  // An upgrade whose session was revoked on this object is refused. The revoke's close ran before the upgrade reached the
  // Object, so the close could not see the socket the upgrade was about to open
  override async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") !== "websocket")
      return new Response("Expected a WebSocket upgrade", { status: 426 });

    const identity = readSocketIdentity(request.headers);
    if (!identity) return new Response("Missing socket identity", { status: 400 });

    if ((await this.ctx.storage.get<number>(getRevokedSessionKey(identity.sessionId))) !== undefined)
      return new Response("Session revoked", { status: 401 });

    const { 0: client, 1: server } = new WebSocketPair();
    this.ctx.acceptWebSocket(server, [
      `user:${identity.userId}`,
      `session:${identity.sessionId}`,
      `device:${identity.deviceId}`,
      `${SESSION_EXPIRES_AT_TAG_PREFIX}${identity.sessionExpiresAt}`,
    ]);
    this.onSocketAccepted(server, request);
    return new Response(null, { status: 101, webSocket: client });
  }

  // A close the peer began is answered in kind, so the socket is released rather than left half open. A reserved code
  // Reports a close that already happened, such as a dropped connection, so there is nothing to answer, and sending it
  // Would throw before an object's own close work ran. An object that has its own work to do on a close may await it,
  // As the runtime's handler allows
  override webSocketClose(ws: WebSocket, code: number, reason: string): Promise<void> | void {
    if (!RESERVED_CLOSE_CODES.has(code)) ws.close(code, reason);
  }

  override webSocketError(ws: WebSocket) {
    ws.close(1011, "Socket error");
  }

  // A broadcast reaches every socket a tag names, or every socket when none is named, and
  // `excludeTag` skips the sockets that carry it, so a write's own device does not hear the echo of what it did
  protected broadcast(event: TEvent, { excludeTag, tag }: { excludeTag?: string; tag?: string } = {}) {
    const frame = JSON.stringify(event);
    for (const ws of this.ctx.getWebSockets(tag)) {
      if (excludeTag && this.ctx.getTags(ws).includes(excludeTag)) continue;
      if (this.#closeIfSessionExpired(ws)) continue;
      ws.send(frame);
    }
  }

  // A revoked session's sockets on this object close, and no other session's do. The revoke is also recorded, so an
  // Upgrade that read the session before the revoke is refused when it arrives
  protected closeRevokedSession(sessionId: string): void {
    this.closeSockets(`session:${sessionId}`, SESSION_ENDED_CLOSE_CODE, "Session revoked");
    this.ctx.waitUntil(
      getResultAsync(() => this.#recordRevokedSession(sessionId)).match(noop, (error) => {
        console.error("Revoked session failed to record", { error, sessionId });
      }),
    );
  }

  // Closes every socket a tag names with the code and reason the caller gives, so each object states its own close
  protected closeSockets(tag: string, code: number, reason: string): void {
    for (const ws of this.ctx.getWebSockets(tag)) ws.close(code, reason);
  }

  // Runs once a socket is accepted and before its upgrade is answered.
  // What it sends first is what the socket hears before anything live.
  // The synchronous work here is never interleaved with another event on the object
  protected onSocketAccepted(_server: WebSocket, _request: Request): void {}

  // One event to one socket, as the frame every socket hears
  protected sendEvent(socket: WebSocket, event: TEvent): void {
    if (this.#closeIfSessionExpired(socket)) return;
    socket.send(JSON.stringify(event));
  }

  // A socket outlives its session when it sits idle past the session's expiry, since no read deletes the row to close it.
  // Every write checks the expiry the upgrade carried, so nothing reaches a socket its session no longer covers
  #closeIfSessionExpired(ws: WebSocket): boolean {
    const expiryTag = this.ctx.getTags(ws).find((tag) => tag.startsWith(SESSION_EXPIRES_AT_TAG_PREFIX));
    if (expiryTag === undefined || Number(expiryTag.slice(SESSION_EXPIRES_AT_TAG_PREFIX.length)) > Date.now())
      return false;
    ws.close(SESSION_ENDED_CLOSE_CODE, "Session expired");
    return true;
  }

  // Records the revoke, then drops records past the TTL, so an object that outlives many revokes keeps only recent ones
  async #recordRevokedSession(sessionId: string): Promise<void> {
    const revokedAt = Date.now();
    await this.ctx.storage.put(getRevokedSessionKey(sessionId), revokedAt);
    const records = await this.ctx.storage.list<number>({ prefix: REVOKED_SESSION_PREFIX });
    await Promise.all(
      [...records]
        .filter(([, recordedAt]) => revokedAt - recordedAt > REVOKED_SESSION_TTL_MS)
        .map(([key]) => this.ctx.storage.delete(key)),
    );
  }
}
