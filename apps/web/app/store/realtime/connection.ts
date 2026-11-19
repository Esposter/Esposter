import type { ColumnTopic, RoomEvent, Topic, UserClientFrame } from "@esposter/db-schema";
import type { z } from "zod";

import { getDeviceId } from "#src/services/realtime/getDeviceId";
import { openRealtimeSocket } from "#src/services/realtime/openRealtimeSocket";
import {
  callEventSchema,
  getColumnTopic,
  MAX_FRAME_TOPICS,
  roomEventSchema,
  unionColumns,
  userEventSchema,
} from "@esposter/db-schema";
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
  // The topics the mounted queries watch, each with the columns the watching queries read of it, the refetches of those
  // Queries and the server time its subscription was made from. A read older than that reaches back past the subscription,
  // So the topic subscribes again from its time. A topic is watched up the user socket as its first query mounts and
  // Unwatched as its last unmounts. A reconnect subscribes every topic again from its own time, then refetches every watched
  // Query. An invalidation sent while the socket was closed never arrived
  const topicWatchMap = new Map<
    Topic,
    { columns?: string[] | undefined; readAt: number; refetches: Set<() => void> }
  >();
  const sendUserFrame = (frame: UserClientFrame) => {
    sendUserSocketFrame?.(JSON.stringify(frame));
  };
  // A frame names at most so many topics, so a tab watching more sends them over several
  const sendWatchFrames = (topics: ColumnTopic[], readAt: number) => {
    for (const frameTopics of chunk(topics, MAX_FRAME_TOPICS))
      sendUserFrame({ data: { readAt, topics: frameTopics }, type: "watch" });
  };
  const sendUnwatchFrames = (topics: Topic[]) => {
    for (const frameTopics of chunk(topics, MAX_FRAME_TOPICS))
      sendUserFrame({ data: { topics: frameTopics }, type: "unwatch" });
  };
  const watchTopics = (topics: ColumnTopic[], readAt: number, refetch: () => void) => {
    const subscribedTopics = topics.flatMap(({ columns, topic }) => {
      const topicWatch = topicWatchMap.get(topic);
      if (!topicWatch) {
        topicWatchMap.set(topic, { columns, readAt, refetches: new Set([refetch]) });
        return [getColumnTopic(topic, columns)];
      }

      topicWatch.refetches.add(refetch);
      const mergedColumns = unionColumns(topicWatch.columns, columns);
      // A union only grows, so a union of the same length holds the same columns
      const isWidened = mergedColumns?.length !== topicWatch.columns?.length;
      topicWatch.columns = mergedColumns;
      if (readAt >= topicWatch.readAt && !isWidened) return [];

      topicWatch.readAt = Math.min(topicWatch.readAt, readAt);
      return [getColumnTopic(topic, mergedColumns)];
    });
    sendWatchFrames(subscribedTopics, readAt);
    return () => {
      const releasedTopics = topics.filter(({ topic }) => {
        const topicWatch = topicWatchMap.get(topic);
        topicWatch?.refetches.delete(refetch);
        if (topicWatch?.refetches.size !== 0) return false;
        topicWatchMap.delete(topic);
        return true;
      });
      sendUnwatchFrames(releasedTopics.map(({ topic }) => topic));
    };
  };
  // Each topic is subscribed again from the time its own watch was made from, a frame per time.
  // A new connection holds nothing, so every watch goes up again
  const sendTopicWatchesOnOpen = () => {
    const readAtTopicsMap = new Map<number, ColumnTopic[]>();
    for (const [topic, { columns, readAt }] of topicWatchMap)
      getOrCreate(readAtTopicsMap, readAt, () => []).push(getColumnTopic(topic, columns));
    for (const [readAt, topics] of readAtTopicsMap) sendWatchFrames(topics, readAt);
  };
  const refetchTopics = (topics: Iterable<Topic>) => {
    const refetches = new Set([...topics].flatMap((topic) => [...(topicWatchMap.get(topic)?.refetches ?? [])]));
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
          sendTopicWatchesOnOpen();
        },
        onReopen: () => {
          refetchTopics(topicWatchMap.keys());
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
