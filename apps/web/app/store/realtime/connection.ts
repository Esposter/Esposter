import type { z } from "zod";
import type { RoomEvent } from "@esposter/db-schema";

import { callEventSchema, roomEventSchema, userEventSchema } from "@esposter/db-schema";
import { openRealtimeSocket } from "@/services/realtime/openRealtimeSocket";
import { jsonDateParse } from "@esposter/shared";

type EventData<TEvent extends { data: unknown; type: string }, TType extends TEvent["type"]> = Extract<
  TEvent,
  { type: TType }
>["data"];

// The handlers a scope's frames reach, keyed by the frame's type. A frame is parsed by its scope's schema before any handler
// sees it, and a frame that fails the schema is logged and dropped. Handlers are held outside reactive state, since none is read.
// The context is what the socket that carried the frame was opened for: a room's socket names its room, since a message is
// named by its room and its integer id, and a frame carries neither
const createEventHub = <TEvent extends { data: unknown; type: string }, TContext = undefined>(
  schema: z.ZodType<TEvent>,
) => {
  const handlers = new Map<string, Set<(data: never, context: TContext) => void>>();

  const on = <TType extends TEvent["type"]>(
    type: TType,
    handler: (data: EventData<TEvent, TType>, context: TContext) => void,
  ) => {
    const typeHandlers = handlers.get(type) ?? new Set<(data: never, context: TContext) => void>();
    typeHandlers.add(handler);
    handlers.set(type, typeHandlers);
    return () => {
      typeHandlers.delete(handler);
    };
  };

  const dispatch = (text: string, context: TContext) => {
    const frame = schema.safeParse(jsonDateParse(text));
    if (!frame.success) console.error(frame.error);
    else for (const handler of handlers.get(frame.data.type) ?? []) handler(frame.data.data as never, context);
  };

  return { dispatch, on };
};

// The one place the app's live sockets are opened and closed: the person's own socket, the socket of the room a page
// shows and the socket of the call a person is in. Each frame is dispatched to the handlers registered for its type
export const useConnectionStore = defineStore("realtime/connection", () => {
  // A page's device is the browser tab that holds its sockets, so the server can name the tab an event came from
  const deviceId = crypto.randomUUID();
  const roomHub = createEventHub<RoomEvent, string>(roomEventSchema);
  const callHub = createEventHub(callEventSchema);
  const userHub = createEventHub(userEventSchema);
  let callSocketSessionId = "";
  let callSocketSettled: Promise<void> = Promise.resolve();
  let closeCallSocket: (() => void) | undefined;
  let closeRoomSocket: (() => void) | undefined;
  let closeUserSocket: (() => void) | undefined;

  const createSocketUrl = (path: string, after?: number) => {
    const url = new URL(path, window.location.href);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.searchParams.set("deviceId", deviceId);
    if (after !== undefined) url.searchParams.set("after", String(after));
    return url.href;
  };

  const closeCall = () => {
    closeCallSocket?.();
    closeCallSocket = undefined;
    callSocketSessionId = "";
  };
  const closeRoom = () => {
    closeRoomSocket?.();
    closeRoomSocket = undefined;
  };
  const closeUser = () => {
    closeUserSocket?.();
    closeUserSocket = undefined;
  };

  // A call's socket is the call's own, so it is opened by the call's id and closed when the person leaves. Opening the
  // Call the socket already holds is a no-op, so a knock that opened it is not reconnected when the knock is admitted.
  // The promise settles once the socket's first attempt opens or closes, so a read made after it misses no change
  const openCall = (callSessionId: string) => {
    if (callSessionId === callSocketSessionId) return callSocketSettled;

    closeCall();
    callSocketSessionId = callSessionId;
    const { promise, resolve } = Promise.withResolvers<void>();
    callSocketSettled = promise;
    closeCallSocket = openRealtimeSocket(
      () => createSocketUrl(`/ws/call/${callSessionId}`),
      (text) => callHub.dispatch(text, undefined),
      () => resolve(),
    );
    return promise;
  };
  // A room's socket replays what it missed after the last message the page holds, read again at every reconnect, and
  // `onReopen` runs after each reconnect, since an edit made while the socket was closed is not replayed. The promise
  // settles once the first attempt opens or closes, so a read issued after it misses no change the socket carries
  const openRoom = (roomId: string, getLastMessageId: () => number | undefined, onReopen: () => void) => {
    closeRoom();
    const { promise, resolve } = Promise.withResolvers<void>();
    closeRoomSocket = openRealtimeSocket(
      () => createSocketUrl(`/ws/room/${roomId}`, getLastMessageId()),
      (text) => roomHub.dispatch(text, roomId),
      () => resolve(),
      onReopen,
    );
    return promise;
  };
  const openUser = () => {
    closeUser();
    closeUserSocket = openRealtimeSocket(
      () => createSocketUrl("/ws/user"),
      (text) => userHub.dispatch(text, undefined),
    );
  };

  return {
    closeCall,
    closeRoom,
    closeUser,
    onCallEvent: callHub.on,
    onRoomEvent: roomHub.on,
    onUserEvent: userHub.on,
    openCall,
    openRoom,
    openUser,
  };
});
