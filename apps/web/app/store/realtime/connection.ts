import type { z } from "zod";

import { callEventSchema } from "#shared/models/realtime/CallEvent";
import { roomEventSchema } from "#shared/models/realtime/RoomEvent";
import { userEventSchema } from "#shared/models/realtime/UserEvent";
import { openRealtimeSocket } from "@/services/realtime/openRealtimeSocket";
import { jsonDateParse } from "@esposter/shared";

type EventData<TEvent extends { data: unknown; type: string }, TType extends TEvent["type"]> = Extract<
  TEvent,
  { type: TType }
>["data"];

// The handlers a scope's frames reach, keyed by the frame's type. A frame is parsed by its scope's schema before any handler
// sees it, and a frame that fails the schema is logged and dropped. Handlers are held outside reactive state, since none is read
const createEventHub = <TEvent extends { data: unknown; type: string }>(schema: z.ZodType<TEvent>) => {
  const handlers = new Map<string, Set<(data: never) => void>>();

  const on = <TType extends TEvent["type"]>(type: TType, handler: (data: EventData<TEvent, TType>) => void) => {
    const typeHandlers = handlers.get(type) ?? new Set<(data: never) => void>();
    typeHandlers.add(handler);
    handlers.set(type, typeHandlers);
    return () => {
      typeHandlers.delete(handler);
    };
  };

  const dispatch = (text: string) => {
    const frame = schema.safeParse(jsonDateParse(text));
    if (!frame.success) console.error(frame.error);
    else for (const handler of handlers.get(frame.data.type) ?? []) handler(frame.data.data as never);
  };

  return { dispatch, on };
};

// The one place the app's live sockets are opened and closed: the person's own socket, the socket of the room a page
// shows and the socket of the call a person is in. Each frame is dispatched to the handlers registered for its type
export const useConnectionStore = defineStore("realtime/connection", () => {
  // A page's device is the browser tab that holds its sockets, so the server can name the tab an event came from
  const deviceId = crypto.randomUUID();
  const roomHub = createEventHub(roomEventSchema);
  const callHub = createEventHub(callEventSchema);
  const userHub = createEventHub(userEventSchema);
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
  };
  const closeRoom = () => {
    closeRoomSocket?.();
    closeRoomSocket = undefined;
  };
  const closeUser = () => {
    closeUserSocket?.();
    closeUserSocket = undefined;
  };

  // A call's socket is the call's own, so it is opened by the call's id and closed when the person leaves
  const openCall = (callSessionId: string) => {
    closeCall();
    closeCallSocket = openRealtimeSocket(() => createSocketUrl(`/ws/call/${callSessionId}`), callHub.dispatch);
  };
  // A room's socket replays what it missed after the last message the page holds, read again at every reconnect
  const openRoom = (roomId: string, getLastMessageId: () => number | undefined) => {
    closeRoom();
    closeRoomSocket = openRealtimeSocket(
      () => createSocketUrl(`/ws/room/${roomId}`, getLastMessageId()),
      roomHub.dispatch,
    );
  };
  const openUser = () => {
    closeUser();
    closeUserSocket = openRealtimeSocket(() => createSocketUrl("/ws/user"), userHub.dispatch);
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
