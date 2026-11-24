import type { RoomEvent, Topic, TopicRead, UserClientFrame } from "@esposter/db-schema";
import type { z } from "zod";

import { getDeviceId } from "#src/services/realtime/getDeviceId";
import { openRealtimeSocket } from "#src/services/realtime/openRealtimeSocket";
import { callEventSchema, MAX_FRAME_TOPICS, roomEventSchema, unionColumns, userEventSchema } from "@esposter/db-schema";
import { chunk, getOrCreate, jsonDateParse } from "@esposter/shared";

type EventData<TEvent extends { data: unknown; type: string }, TType extends TEvent["type"]> = Extract<
  TEvent,
  { type: TType }
>["data"];

// The handlers a scope's frames reach, keyed by the frame's type. A frame is parsed by its scope's schema before any
// Handler sees it, and a frame that fails the schema is logged and dropped. Handlers are held outside reactive state,
// Since none is read. The context is what the socket that carried the frame was opened for: a room's socket names its
// Room, since a message is named by its room and its integer id, and a frame carries neither
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
      /* oxlint-disable-next-line typescript/no-unsafe-type-assertion -- handlers are held by the frame's runtime type,
         so a handler takes the union of the frames' data it is handed, which no one handler's data type accepts */
      for (const handler of handlers.get(frame.data.type) ?? []) handler(frame.data.data as never, context);
    else console.error(frame.error);
  };

  return { dispatch, on };
};

// The frame a read's watch sends up the user socket: the read's time, its signature and its topics, as the server
// Signed them
const createWatchFrame = ({ readAt, signature, topics }: TopicRead): UserClientFrame => ({
  data: { readAt, signature, topics },
  type: "watch",
});

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
  // The reads the mounted queries watch, each as the server signed it for the person, with the refetch of the query
  // That made it. A read is watched up the user socket as its first query mounts and unwatched as its last unmounts,
  // And a frame carries one read's topics as that read signed them, never merged with another read's. The socket is
  // Sent a read only when the read adds to what it holds: a topic it does not watch, a column it does not yet name, or
  // A time before the one the topic is watched from. A reconnect sends every read again, since a new socket holds
  // Nothing, and refetches each query, since an invalidation sent while the socket was closed never arrived
  const watchedReads = new Set<{ read: TopicRead; refetch: () => void }>();
  // What the socket holds of each topic: the columns the reads sent name together, and the earliest time it is watched
  // From
  const heldTopics = new Map<Topic, { columns?: string[] | undefined; readAt: number }>();
  const sendUserFrame = (frame: UserClientFrame) => {
    sendUserSocketFrame?.(JSON.stringify(frame));
  };
  // Whether a read adds to what the socket holds: a topic it does not hold, a time before the one it holds it from, or
  // A column the held one does not name
  const checkAddsToHeld = ({ readAt, topics }: TopicRead) =>
    topics.some(({ columns, topic }) => {
      const heldTopic = heldTopics.get(topic);
      if (!heldTopic || readAt < heldTopic.readAt) return true;
      // A union only grows, so a union of the same length holds the same columns
      return unionColumns(heldTopic.columns, columns)?.length !== heldTopic.columns?.length;
    });
  const sendWatchFrame = (read: TopicRead) => {
    sendUserFrame(createWatchFrame(read));
    for (const { columns, topic } of read.topics) {
      const heldTopic = heldTopics.get(topic);
      heldTopics.set(topic, {
        columns: heldTopic ? unionColumns(heldTopic.columns, columns) : columns,
        readAt: Math.min(heldTopic?.readAt ?? read.readAt, read.readAt),
      });
    }
  };
  const watchTopics = (read: TopicRead, refetch: () => void) => {
    const watchedRead = { read, refetch };
    watchedReads.add(watchedRead);
    if (checkAddsToHeld(read)) sendWatchFrame(read);
    return () => {
      watchedReads.delete(watchedRead);
      const watchedTopics = new Set(
        [...watchedReads].flatMap(({ read: otherRead }) => otherRead.topics.map(({ topic }) => topic)),
      );
      const releasedTopics = [...new Set(read.topics.map(({ topic }) => topic))].filter(
        (topic) => !watchedTopics.has(topic),
      );
      for (const topic of releasedTopics) heldTopics.delete(topic);
      for (const frameTopics of chunk(releasedTopics, MAX_FRAME_TOPICS))
        sendUserFrame({ data: { topics: frameTopics }, type: "unwatch" });
    };
  };
  // A new socket holds nothing, so each watched read goes up again, once however many queries watch it
  const sendTopicWatchesOnOpen = () => {
    heldTopics.clear();
    const sentReads = new Set<string>();
    for (const { read } of watchedReads) {
      const sentRead = JSON.stringify(read);
      if (sentReads.has(sentRead)) continue;
      sentReads.add(sentRead);
      sendUserFrame(createWatchFrame(read));
    }
  };
  // Refetches each query with a watched read that matches, once however many of its reads match
  const refetchWatches = (checkMatch: (read: TopicRead) => boolean) => {
    const refetches = new Set([...watchedReads].flatMap(({ read, refetch }) => (checkMatch(read) ? [refetch] : [])));
    for (const refetch of refetches) refetch();
  };
  userHub.on("invalidate", ({ topic }) => {
    refetchWatches((read) => read.topics.some((columnTopic) => columnTopic.topic === topic));
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
          refetchWatches(() => true);
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
