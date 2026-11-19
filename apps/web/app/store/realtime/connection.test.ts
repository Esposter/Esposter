// @vitest-environment nuxt
import type { RoomMessage, Topic } from "@esposter/db-schema";

import {
  getMockPublishedTopics,
  MockPublishedTopics,
  mockTopicNamespace,
} from "#server/services/realtime/publishTopics.test";
import { createMockAuthSession, createMockContext } from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";
import { friendRouter } from "#server/trpc/routers/friend";
import { readTopicsHeader } from "#shared/services/realtime/readTopicsHeader";
import { createId } from "#shared/util/math/random/createId";
import {
  getLastOpenRealtimeSocketCall,
  openRealtimeSocket,
  sendRealtimeFrame,
} from "#src/services/realtime/openRealtimeSocket.test";
import { useConnectionStore } from "#src/store/realtime/connection";
import {
  CALL_ID_LENGTH,
  friendsInSocial,
  getTopic,
  MAX_FRAME_TOPICS,
  MessageType,
  TopicKind,
} from "@esposter/db-schema";
import { getFriendshipId, jsonDateParse } from "@esposter/shared";
import { env } from "cloudflare:workers";
import { v7 } from "uuid";
import { describe, expect, test, vi } from "vitest";

vi.mock(
  import("#src/services/realtime/openRealtimeSocket"),
  () => import("#src/services/realtime/openRealtimeSocket.test"),
);

describe(useConnectionStore, () => {
  // The times a read began, from the epoch: the older one is the epoch itself
  const readAt = 0;
  const newerReadAt = Temporal.Duration.from({ seconds: 1 }).total("milliseconds");

  // A knock opens its call's socket and the admission that follows opens the same call again. The socket it holds is
  // Reused, so the admitted knocker is not reconnected to the call it was already listening to
  test("opens a call's socket once when the same call is opened again", async () => {
    expect.hasAssertions();

    const connectionStore = useConnectionStore();
    const callSessionId = createId(CALL_ID_LENGTH);
    await connectionStore.openCall(callSessionId);
    await connectionStore.openCall(callSessionId);

    expect(openRealtimeSocket).toHaveBeenCalledTimes(1);
  });

  // A room's frame reaches its handler with the room its socket was opened for, since a message is named by its room and
  // Its integer id and the frame names neither
  test("dispatches a room frame to the handlers of its type with the room the socket was opened for", async () => {
    expect.hasAssertions();

    const connectionStore = useConnectionStore();
    const roomId = v7();
    const handler = vi.fn<(data: unknown, roomId: string) => void>();
    connectionStore.onRoomEvent("deleteMessage", handler);
    await connectionStore.openRoom(
      roomId,
      () => undefined,
      () => undefined,
    );
    const [, onFrame] = getLastOpenRealtimeSocketCall();

    const createdAt = new Date(0);
    const message: RoomMessage = {
      version: 0,
      appUserId: null,
      appUserImage: "",
      createdAt,
      deletedAt: createdAt,
      editedAt: null,
      files: [],
      id: 1,
      isForward: false,
      isPinned: false,
      linkPreviewResponse: null,
      mentions: [],
      message: "",
      replyToId: null,
      senderName: null,
      type: MessageType.Message,
      updatedAt: createdAt,
      userId: null,
    };
    onFrame?.(JSON.stringify({ data: message, type: "deleteMessage" }));

    expect(handler).toHaveBeenCalledExactlyOnceWith(message, roomId);
  });

  // A topic is watched up the user socket once however many queries read it, an invalidation refetches each of them,
  // And the last query to unmount unwatches it
  test("watches a topic once for every query on it, refetches each on its invalidation, and unwatches after the last", () => {
    expect.hasAssertions();

    const connectionStore = useConnectionStore();
    connectionStore.openUser();
    const [, onFrame] = getLastOpenRealtimeSocketCall();
    const topic: Topic = `post:${v7()}`;
    const firstRefetch = vi.fn<() => void>();
    const secondRefetch = vi.fn<() => void>();
    const unwatchFirst = connectionStore.watchTopics([{ topic }], readAt, firstRefetch);
    const unwatchSecond = connectionStore.watchTopics([{ topic }], readAt, secondRefetch);
    onFrame?.(JSON.stringify({ data: { topic }, type: "invalidate" }));
    unwatchFirst();
    unwatchSecond();

    expect(firstRefetch).toHaveBeenCalledTimes(1);
    expect(secondRefetch).toHaveBeenCalledTimes(1);
    expect(sendRealtimeFrame.mock.calls.map(([frame]) => jsonDateParse(frame))).toStrictEqual([
      { data: { readAt, topics: [{ topic }] }, type: "watch" },
      { data: { topics: [topic] }, type: "unwatch" },
    ]);
  });

  // A tab that reads more topics than one frame holds watches them over several frames, each within the cap, so a frame
  // Never fans its socket out past it and no topic is left unwatched
  test("watches every topic of a tab that reads more topics than one frame holds", () => {
    expect.hasAssertions();

    const connectionStore = useConnectionStore();
    connectionStore.openUser();
    const topics = Array.from({ length: MAX_FRAME_TOPICS + 1 }, () => getTopic(TopicKind.Post, v7()));
    connectionStore.watchTopics(
      topics.map((topic) => ({ topic })),
      readAt,
      vi.fn<() => void>(),
    );

    expect(sendRealtimeFrame.mock.calls.map(([frame]) => jsonDateParse(frame))).toStrictEqual([
      { data: { readAt, topics: topics.slice(0, MAX_FRAME_TOPICS).map((topic) => ({ topic })) }, type: "watch" },
      { data: { readAt, topics: topics.slice(MAX_FRAME_TOPICS).map((topic) => ({ topic })) }, type: "watch" },
    ]);
  });

  // A read older than the subscription a topic holds reaches back past it, since a publish between the two is one the
  // Newer subscription does not cover, so the topic subscribes again from the older read's time
  test("subscribes a topic again from the time of a read older than its subscription", () => {
    expect.hasAssertions();

    const connectionStore = useConnectionStore();
    connectionStore.openUser();
    const topic: Topic = `post:${v7()}`;
    connectionStore.watchTopics([{ topic }], newerReadAt, vi.fn<() => void>());
    connectionStore.watchTopics([{ topic }], readAt, vi.fn<() => void>());

    expect(sendRealtimeFrame.mock.calls.map(([frame]) => jsonDateParse(frame))).toStrictEqual([
      { data: { readAt: newerReadAt, topics: [{ topic }] }, type: "watch" },
      { data: { readAt, topics: [{ topic }] }, type: "watch" },
    ]);
  });

  // A reconnect subscribes each topic again from the time its own watch was made from, a frame per time
  test("subscribes each watched topic again from its own time when the socket reconnects", () => {
    expect.hasAssertions();

    const connectionStore = useConnectionStore();
    connectionStore.openUser();
    const options = vi.mocked(openRealtimeSocket).mock.lastCall?.[2];
    const newerTopic: Topic = `post:${v7()}`;
    const olderTopic: Topic = `post:${v7()}`;
    connectionStore.watchTopics([{ topic: newerTopic }], newerReadAt, vi.fn<() => void>());
    connectionStore.watchTopics([{ topic: olderTopic }], readAt, vi.fn<() => void>());
    sendRealtimeFrame.mockClear();
    options?.onOpen?.();

    expect(sendRealtimeFrame.mock.calls.map(([frame]) => jsonDateParse(frame))).toStrictEqual([
      { data: { readAt: newerReadAt, topics: [{ topic: newerTopic }] }, type: "watch" },
      { data: { readAt, topics: [{ topic: olderTopic }] }, type: "watch" },
    ]);
  });

  // A friend list's read names the rows it selected, and a removal by another person publishes those rows, so the topic the
  // Read named reaches this person's socket as an invalidation and the store refetches the read through it
  test("another person's friendship removal refetches the friend list through the connection store", async () => {
    expect.hasAssertions();

    // The write's publish reads its topic binding from the workers env, which this environment does not get from the shared setup
    Object.assign(env, { TOPIC: mockTopicNamespace });
    const context = await createMockContext();
    const reader = await createMockAuthSession(context.db);
    const writer = await createMockAuthSession(context.db);
    await context.db
      .insert(friendsInSocial)
      .values({
        id: getFriendshipId(reader.user.id, writer.user.id),
        receiverId: writer.user.id,
        senderId: reader.user.id,
      });
    const readerContext = { ...context, responseHeaders: new Headers(), session: reader.session, user: reader.user };
    await createCallerFactory(friendRouter)(readerContext).readFriends();
    const reads = readTopicsHeader(readerContext.responseHeaders, "readFriends");

    const connectionStore = useConnectionStore();
    connectionStore.openUser();
    const [, onUserFrame] = getLastOpenRealtimeSocketCall();
    const refetch = vi.fn<() => void>();
    sendRealtimeFrame.mockClear();
    for (const read of reads) connectionStore.watchTopics(read.topics, read.readAt, refetch);

    expect(sendRealtimeFrame.mock.calls.map(([frame]) => jsonDateParse(frame))).toStrictEqual(
      reads.map((read) => ({ data: { readAt: read.readAt, topics: read.topics }, type: "watch" })),
    );
    MockPublishedTopics.length = 0;
    await createCallerFactory(friendRouter)({
      ...context,
      responseHeaders: new Headers(),
      session: writer.session,
      user: writer.user,
    }).deleteFriend(reader.user.id);
    for (const topic of getMockPublishedTopics())
      onUserFrame?.(JSON.stringify({ data: { topic }, type: "invalidate" }));

    expect(refetch).toHaveBeenCalledTimes(1);
    await expect(createCallerFactory(friendRouter)(readerContext).readFriends()).resolves.toStrictEqual([]);
  });
});
