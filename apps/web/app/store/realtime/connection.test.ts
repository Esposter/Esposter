// @vitest-environment nuxt
import type { ColumnTopic, RoomMessage, TopicRead } from "@esposter/db-schema";

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
  getScopeTopic,
  getTopic,
  MessageType,
  TopicKind,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { getFriendshipId, jsonDateParse, takeOne } from "@esposter/shared";
import { env } from "cloudflare:workers";
import { getTableName } from "drizzle-orm";
import { v7 } from "uuid";
import { describe, expect, onTestFinished, test, vi } from "vitest";

// A read as a query's header names it, with the signature the server made over it for the person who read it
const createRead = (topics: ColumnTopic[], begunAt: number): TopicRead => ({ readAt: begunAt, signature: "", topics });
// The frame a read's watch sends up the user socket, carrying its time, signature and topics as they were signed
const watchFrame = (read: TopicRead) => ({
  data: { readAt: read.readAt, signature: read.signature, topics: read.topics },
  type: "watch",
});
// The frames sent up the sockets so far, parsed the way the socket receives them
const readSentFrames = () => sendRealtimeFrame.mock.calls.map(([frame]) => jsonDateParse(frame));

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
    const { openCall } = connectionStore;
    const callSessionId = createId(CALL_ID_LENGTH);
    await openCall(callSessionId);
    await openCall(callSessionId);

    expect(openRealtimeSocket).toHaveBeenCalledTimes(1);
  });

  // A room's frame reaches its handler with the room its socket was opened for, since a message is named by its room
  // And Its integer id and the frame names neither
  test("dispatches a room frame to the handlers of its type with the room the socket was opened for", async () => {
    expect.hasAssertions();

    const connectionStore = useConnectionStore();
    const { onRoomEvent, openRoom } = connectionStore;
    const roomId = v7();
    const handler = vi.fn<(data: unknown, roomId: string) => void>();
    onRoomEvent("deleteMessage", handler);
    await openRoom(
      roomId,
      () => undefined,
      () => undefined,
    );
    const [, onFrame] = getLastOpenRealtimeSocketCall();

    const createdAt = new Date(0);
    const message: RoomMessage = {
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
      version: 0,
    };
    onFrame?.(JSON.stringify({ data: message, type: "deleteMessage" }));

    expect(handler).toHaveBeenCalledExactlyOnceWith(message, roomId);
  });

  // A topic is watched up the user socket once however many queries read it, an invalidation refetches each of them,
  // And the last query to unmount unwatches it
  test("watches a topic once for every query on it, refetches each on its invalidation, and unwatches after the last", () => {
    expect.hasAssertions();

    const connectionStore = useConnectionStore();
    const { openUser, watchTopics } = connectionStore;
    openUser();
    const [, onFrame] = getLastOpenRealtimeSocketCall();
    const topic = getTopic(TopicKind.Post, v7());
    const firstRefetch = vi.fn<() => void>();
    const secondRefetch = vi.fn<() => void>();
    const read = createRead([{ topic }], readAt);
    const unwatchFirst = watchTopics(read, firstRefetch);
    const unwatchSecond = watchTopics(read, secondRefetch);
    onFrame?.(JSON.stringify({ data: { topic }, type: "invalidate" }));
    unwatchFirst();
    unwatchSecond();

    expect(firstRefetch).toHaveBeenCalledTimes(1);
    expect(secondRefetch).toHaveBeenCalledTimes(1);
    expect(readSentFrames()).toStrictEqual([watchFrame(read), { data: { topics: [topic] }, type: "unwatch" }]);
  });

  // A frame carries one read's topics as that read signed them, so the columns of another read are never merged into
  // It: A merged frame would name a topic set no single read produced, and the server's signature would not cover it
  test("sends a read's frame with its own columns, never merged with the columns of another read of its topic", () => {
    expect.hasAssertions();

    const connectionStore = useConnectionStore();
    const { openUser, watchTopics } = connectionStore;
    openUser();
    const topic = getScopeTopic(getTableName(usersToRoomsInMessage), "userId", v7());
    const nameRead = createRead([{ columns: ["name"], topic }], readAt);
    const hiddenRead = createRead([{ columns: ["isHidden"], topic }], readAt);
    watchTopics(nameRead, vi.fn<() => void>());
    watchTopics(hiddenRead, vi.fn<() => void>());

    expect(readSentFrames()).toStrictEqual([watchFrame(nameRead), watchFrame(hiddenRead)]);
  });

  // A read older than the subscription a topic holds reaches back past it, since a publish between the two is one the
  // Newer subscription does not cover, so the topic subscribes again from the older read's time
  test("subscribes a topic again from the time of a read older than its subscription", () => {
    expect.hasAssertions();

    const connectionStore = useConnectionStore();
    const { openUser, watchTopics } = connectionStore;
    openUser();
    const topic = getTopic(TopicKind.Post, v7());
    const newerRead = createRead([{ topic }], newerReadAt);
    const olderRead = createRead([{ topic }], readAt);
    watchTopics(newerRead, vi.fn<() => void>());
    watchTopics(olderRead, vi.fn<() => void>());

    expect(readSentFrames()).toStrictEqual([watchFrame(newerRead), watchFrame(olderRead)]);
  });

  // A reconnect subscribes each watched read again from its own time, as it was signed, a frame per read
  test("subscribes each watched read again from its own time when the socket reconnects", () => {
    expect.hasAssertions();

    const connectionStore = useConnectionStore();
    const { openUser, watchTopics } = connectionStore;
    openUser();
    const options = vi.mocked(openRealtimeSocket).mock.lastCall?.[2];
    const newerTopic = getTopic(TopicKind.Post, v7());
    const olderTopic = getTopic(TopicKind.Post, v7());
    const newerRead = createRead([{ topic: newerTopic }], newerReadAt);
    const olderRead = createRead([{ topic: olderTopic }], readAt);
    watchTopics(newerRead, vi.fn<() => void>());
    watchTopics(olderRead, vi.fn<() => void>());
    sendRealtimeFrame.mockClear();
    options?.onOpen?.();

    expect(readSentFrames()).toStrictEqual([watchFrame(newerRead), watchFrame(olderRead)]);
  });

  // A new socket holds nothing the old one sent, so the first read a query makes after a reconnect is watched again
  // Even When its topic was watched before, since the server may have refused the stored read for its age
  test("a read taken after a reconnect is watched again", () => {
    expect.hasAssertions();

    const connectionStore = useConnectionStore();
    const { openUser, watchTopics } = connectionStore;
    openUser();
    const options = vi.mocked(openRealtimeSocket).mock.lastCall?.[2];
    const topic = getTopic(TopicKind.Post, v7());
    watchTopics(createRead([{ topic }], readAt), vi.fn<() => void>());
    options?.onOpen?.();
    sendRealtimeFrame.mockClear();
    const refetchedRead = createRead([{ topic }], newerReadAt);
    watchTopics(refetchedRead, vi.fn<() => void>());

    expect(readSentFrames()).toStrictEqual([watchFrame(refetchedRead)]);
  });

  // A friend list's read names the rows it selected, and a removal by another person publishes those rows, so the topic
  // The Read named reaches this person's socket as an invalidation and the store refetches the read through it
  test("another person's friendship removal refetches the friend list through the connection store", async () => {
    expect.hasAssertions();

    // The write's publish reads its topic binding from the workers env, which this environment does not get from the
    // Shared setup
    const previousTopic = env.TOPIC;
    onTestFinished(() => {
      Object.assign(env, { TOPIC: previousTopic });
    });
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
    const { openUser, watchTopics } = connectionStore;
    openUser();
    const [, onUserFrame] = getLastOpenRealtimeSocketCall();
    const refetch = vi.fn<() => void>();
    sendRealtimeFrame.mockClear();
    for (const read of reads) watchTopics(read, refetch);

    expect(readSentFrames()).toStrictEqual(reads.map((read) => watchFrame(read)));
    MockPublishedTopics.length = 0;
    await createCallerFactory(friendRouter)({
      ...context,
      responseHeaders: new Headers(),
      session: writer.session,
      user: writer.user,
    }).deleteFriend(reader.user.id);
    for (const topic of getMockPublishedTopics())
      onUserFrame?.(JSON.stringify({ data: { topic }, type: "invalidate" }));
    const friendships = await createCallerFactory(friendRouter)(readerContext).readFriends();

    expect(refetch).toHaveBeenCalledTimes(1);
    expect(friendships).toHaveLength(1);
    expect(takeOne(friendships).deletedAt).not.toBeNull();
  });
});
