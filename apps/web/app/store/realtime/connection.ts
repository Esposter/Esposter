import type { RoomEvent, Topic, UserClientFrame } from "@esposter/db-schema";
import type { z } from "zod";

import { getDeviceId } from "@/services/realtime/getDeviceId";
import { openRealtimeSocket } from "@/services/realtime/openRealtimeSocket";
import { callEventSchema, MAX_FRAME_TOPICS, roomEventSchema, userEventSchema } from "@esposter/db-schema";
import { chunk, getOrCreate, jsonDateParse } from "@esposter/shared";

type EventData<TEvent extends { data: unknown; type: string }, TType extends TEvent["type"]> = Extract<
  TEvent,
  { type: TType }
>["data"];

// The handlers a scope's frames reach, keyed by the frame's type. A frame is parsed by its scope's schema before any handler
// Sees it, and a frame that fails the schema is logged and dropped. Handlers are held outside reactive state, since none is read.
// The context is what the socket that carried the frame was opened for: a room's socket names its room, since a message is
// Named by its room and its integer id, and a frame carries neither
const createEventHub = <TEvent extends { data: unknown; type: string }, TContext = undefined>(
  schema: z.ZodType<TEvent>,
) => {
  const handlers = new Map<string, Set<(data: never, context: TContext) => void>>();

  const on = <TType extends TEvent["type"]>(
    type: TType,
    handler: (data: EventData<TEvent, TType>, context: TContext) => void,
  ) => {
    const typeHandlers = getOrCreate(handlers, type, () => new Set<(data: never, context: TContext) => void>());
    typeHandlers.add(handler);
    return () => {
      typeHandlers.delete(handler);
    };
  };

  const dispatch = (text: string, context: TContext) => {
    const frame = schema.safeParse(jsonDateParse(text));
    if (frame.success)
      for (const handler of handlers.get(frame.data.type) ?? []) handler(frame.data.data as never, context);
    else console.error(frame.error);
  };

  return { dispatch, on };
};

const createSocketUrl = (path: string, after?: number) => {
  const url = new URL(path, window.location.href);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.searchParams.set("deviceId", getDeviceId());
  if (after !== undefined) url.searchParams.set("after", String(after));
  return url.href;
};

// The one place the app's live sockets are opened and closed: the person's own socket, the socket of the room a page
// Shows and the socket of the call a person is in. Each frame is dispatched to the handlers registered for its type
export const useConnectionStore = defineStore("realtime/connection", () => {
  const roomHub = createEventHub<RoomEvent, string>(roomEventSchema);
  const callHub = createEventHub(callEventSchema);
  const userHub = createEventHub(userEventSchema);
  let callSocketSessionId = "";
  let callSocketSettled: Promise<void> = Promise.resolve();
  let closeCallSocket: (() => void) | undefined;
  let closeRoomSocket: (() => void) | undefined;
  let closeUserSocket: (() => void) | undefined;
  let sendUserSocketFrame: ((text: string) => void) | undefined;

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
    sendUserSocketFrame = undefined;
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
    ({ close: closeCallSocket } = openRealtimeSocket(
      () => createSocketUrl(`/ws/call/${callSessionId}`),
      (text) => {
        callHub.dispatch(text, undefined);
      },
      {
        onSettled: () => {
          resolve();
        },
      },
    ));
    return promise;
  };
  // A room's socket replays what it missed after the last message the page holds, read again at every reconnect, and
  // `onReopen` runs after each reconnect, since an edit made while the socket was closed is not replayed. The promise
  // Settles once the first attempt opens or closes, so a read issued after it misses no change the socket carries
  const openRoom = (roomId: string, getLastMessageId: () => number | undefined, onReopen: () => void) => {
    closeRoom();
    const { promise, resolve } = Promise.withResolvers<void>();
    ({ close: closeRoomSocket } = openRealtimeSocket(
      () => createSocketUrl(`/ws/room/${roomId}`, getLastMessageId()),
      (text) => {
        roomHub.dispatch(text, roomId);
      },
      {
        onReopen,
        onSettled: () => {
          resolve();
        },
      },
    ));
    return promise;
  };
  // The topics the mounted queries watch, each with the refetches of the queries on it. A topic is watched up the user
  // Socket as its first query mounts and unwatched as its last unmounts, and every open watches them all again, since a
  // New connection holds nothing. A reconnect refetches every watched query, since an invalidation sent while the
  // Socket was closed never arrived
  const topicRefetchesMap = new Map<Topic, Set<() => void>>();
  const sendUserFrame = (frame: UserClientFrame) => {
    sendUserSocketFrame?.(JSON.stringify(frame));
  };
  // A frame names at most so many topics, so a tab watching more sends them over several
  const sendTopicsFrames = (topics: Topic[], type: UserClientFrame["type"]) => {
    for (const frameTopics of chunk(topics, MAX_FRAME_TOPICS)) sendUserFrame({ data: { topics: frameTopics }, type });
  };
  const watchTopics = (topics: Topic[], refetch: () => void) => {
    const newTopics = topics.filter((topic) => !topicRefetchesMap.has(topic));
    for (const topic of topics) getOrCreate(topicRefetchesMap, topic, () => new Set()).add(refetch);
    sendTopicsFrames(newTopics, "watch");
    return () => {
      const releasedTopics = topics.filter((topic) => {
        const refetches = topicRefetchesMap.get(topic);
        refetches?.delete(refetch);
        if (refetches?.size !== 0) return false;
        topicRefetchesMap.delete(topic);
        return true;
      });
      sendTopicsFrames(releasedTopics, "unwatch");
    };
  };
  const refetchTopics = (topics: Iterable<Topic>) => {
    const refetches = new Set([...topics].flatMap((topic) => [...(topicRefetchesMap.get(topic) ?? [])]));
    for (const refetch of refetches) refetch();
  };
  userHub.on("invalidate", ({ topic }) => {
    refetchTopics([topic]);
  });

  const openUser = () => {
    closeUser();
    ({ close: closeUserSocket, send: sendUserSocketFrame } = openRealtimeSocket(
      () => createSocketUrl("/ws/user"),
      (text) => {
        userHub.dispatch(text, undefined);
      },
      {
        onOpen: () => {
          sendTopicsFrames([...topicRefetchesMap.keys()], "watch");
        },
        onReopen: () => {
          refetchTopics(topicRefetchesMap.keys());
        },
      },
    ));
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
    watchTopics,
  };
});
