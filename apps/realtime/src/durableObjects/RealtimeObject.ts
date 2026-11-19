import type { ObjectInvocationHandles } from "#src/services/durableObject/recordObjectHandle";
import type { ColumnTopic } from "@esposter/db-schema";

import { RESERVED_CLOSE_CODES } from "#src/services/durableObject/constants";
import { objectInvocationStorage } from "#src/services/durableObject/recordObjectHandle";
import { readSocketIdentity } from "#src/services/realtime/readSocketIdentity";
import { getReadTopics, getWriteTopics, publishTopicsBestEffort } from "@esposter/db";
import { getDeviceSocketTag, getSessionSocketTag, getUserSocketTag } from "@esposter/db-schema";
import { getResultAsync, noop, withFinalizerAsync } from "@esposter/shared";
import { DurableObject } from "cloudflare:workers";

// What the one entry answers: the method's result, and the read set its reads watch, which the caller merges into what it watches
export interface ObjectInvocation<TResult> {
  readSet: ColumnTopic[];
  result: TResult;
}

// The arguments and the result of one of an object's RPC methods, as its RPC interface declares them
type MethodArgs<TRpc, TMethod extends keyof TRpc> = TRpc[TMethod] extends (...args: infer TArgs) => unknown
  ? TArgs
  : never;
type MethodResult<TRpc, TMethod extends keyof TRpc> = TRpc[TMethod] extends (...args: never[]) => infer TResult
  ? Awaited<TResult>
  : never;

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
export abstract class RealtimeObject<
  TEvent extends { type: string } = { type: string },
  TRpc = object,
> extends DurableObject {
  override async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") !== "websocket")
      return new Response("Expected a WebSocket upgrade", { status: 426 });

    const identity = readSocketIdentity(request.headers);
    if (!identity) return new Response("Missing socket identity", { status: 400 });

    if ((await this.ctx.storage.get<number>(getRevokedSessionKey(identity.sessionId))) !== undefined)
      return new Response("Session revoked", { status: 401 });

    const { 0: client, 1: server } = new WebSocketPair();
    this.ctx.acceptWebSocket(server, [
      getUserSocketTag(identity.userId),
      getSessionSocketTag(identity.sessionId),
      getDeviceSocketTag(identity.deviceId),
      `${SESSION_EXPIRES_AT_TAG_PREFIX}${identity.sessionExpiresAt}`,
    ]);
    this.onSocketAccepted(server, request);
    return new Response(null, { status: 101, webSocket: client });
  }

  // The one entry a caller reaches the object's RPC methods through. The method runs in an invocation scope, so the statements
  // It awaits are recorded: its reads come back as the read set its result watches, and its writes are published best-effort
  // Once it settles, whether it succeeded or not, since a write that landed before a failure still changed rows
  async invoke<TMethod extends keyof TRpc & string>(
    method: TMethod,
    args: MethodArgs<TRpc, TMethod>,
  ): Promise<ObjectInvocation<MethodResult<TRpc, TMethod>>> {
    // The method is named by a string at run time, so the object is read by name here, and TRpc types the arguments each name takes
    // eslint-disable-next-line no-restricted-syntax -- a dispatch by a string name, which the type system cannot express: TRpc types each name's arguments
    const target = this as unknown as Record<TMethod, (...args: MethodArgs<TRpc, TMethod>) => unknown>;
    return (await this.runInvocation(`"${method}"`, () => target[method](...args))) as ObjectInvocation<
      MethodResult<TRpc, TMethod>
    >;
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
  protected broadcast(event: TEvent, { excludeTag, tag }: { excludeTag?: string | undefined; tag?: string } = {}) {
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
    this.closeSockets(getSessionSocketTag(sessionId), SESSION_ENDED_CLOSE_CODE, "Session revoked");
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

  // Runs one invocation of the object, its entry or its alarm, under the scope its handles record into. Its reads come back as
  // The read set, and its writes are published best-effort once it settles, whether it succeeded or not
  protected runInvocation<TResult>(label: string, run: () => TResult): Promise<ObjectInvocation<Awaited<TResult>>> {
    const handles: ObjectInvocationHandles = new Map();
    const statements = () => [...handles.values()].flatMap((recorded) => recorded.statements);
    return withFinalizerAsync(
      async () => {
        const result = await objectInvocationStorage.run(handles, run);
        return { readSet: await getReadTopics(statements()), result };
      },
      () =>
        publishTopicsBestEffort(
          this.env.TOPIC,
          () => getWriteTopics(statements()),
          `Failed to publish the topics of ${label}:`,
        ),
    );
  }

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
