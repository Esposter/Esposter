import type { useRoomObject } from "#server/composables/realtime/useRoomObject";
import type { useUserObject } from "#server/composables/realtime/useUserObject";
import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers/index";
import type { RoomMessage, RoomObjectRpc, UserObjectRpc } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { MAX_FORWARD_ROOMS, MAX_SEARCH_ROOMS } from "#server/services/message/constants";
import { createRoomMessage as baseCreateRoomMessage } from "#server/services/message/createRoomMessage.test";
import { takeBackMentionCounts } from "#server/services/message/takeBackMentionCounts";
import { mockBuckets } from "#server/services/storage/getBucket.test";
import {
  createMockAuthSession,
  createMockContext,
  createMockOtherUserCaller,
  getMockSession,
} from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";
import { getUncoveredWrites } from "#server/trpc/optimisticWriteCrossCheck.test";
import { createMentionMessage } from "#server/trpc/routers/createMentionMessage.test";
import { createRoomMember } from "#server/trpc/routers/createRoomMember.test";
import { messageRouter } from "#server/trpc/routers/message/index";
import { roomRouter } from "#server/trpc/routers/room/index";
import { setupRoomSuite } from "#server/trpc/routers/setupRoomSuite.test";
import { deleteMessageInputSchema } from "#shared/models/db/message/DeleteMessageInput";
import { pinMessageInputSchema } from "#shared/models/db/message/PinMessageInput";
import { unpinMessageInputSchema } from "#shared/models/db/message/UnpinMessageInput";
import { updateMessageInputSchema } from "#shared/models/db/message/UpdateMessageInput";
import { votePollInputSchema } from "#shared/models/db/message/VotePollInput";
import { MimeType } from "#shared/models/file/MimeType";
import { createPollMessageContent } from "#shared/models/message/poll/createPollMessageContent.test";
import { DEVICE_ID_HEADER } from "#shared/services/realtime/constants";
import { threadFollowTable } from "#src/services/message/threadFollow/constants";
import { getThreadFollowEntry } from "#src/services/message/threadFollow/getThreadFollowEntry";
import { getBlobName, getThumbnailBlobName } from "@esposter/db";
import { createMockBucket, MockJobQueueDatabase } from "@esposter/db-mock";
import {
  DatabaseEntityType,
  encodePageCursor,
  FilterType,
  MessageType,
  POLL_MAX_OPTIONS,
  POLL_MIN_OPTIONS,
  QueueJob,
  StorageBucket,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { InvalidOperationError, noop, NotFoundError, Operation } from "@esposter/shared";
import { and, eq } from "drizzle-orm";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

// The room and user objects are programmable: every RPC is a typed fake whose return value a test sets. Each contract
// Is listed in full with `satisfies`, so a method added to either interface fails here until it has a fake
const { roomObject, userObject, useRoomObjectMock, useUserObjectMock } = vi.hoisted(() => {
  const roomObjectFake = {
    addReaction: vi.fn<RoomObjectRpc["addReaction"]>(),
    attachMember: vi.fn<RoomObjectRpc["attachMember"]>(),
    broadcastEvent: vi.fn<RoomObjectRpc["broadcastEvent"]>(),
    closeSession: vi.fn<RoomObjectRpc["closeSession"]>(),
    createMessage: vi.fn<RoomObjectRpc["createMessage"]>(),
    createScheduledMessage: vi.fn<RoomObjectRpc["createScheduledMessage"]>(),
    createWebhookMessage: vi.fn<RoomObjectRpc["createWebhookMessage"]>(),
    deleteAll: vi.fn<RoomObjectRpc["deleteAll"]>(),
    deleteFile: vi.fn<RoomObjectRpc["deleteFile"]>(),
    deleteLinkPreview: vi.fn<RoomObjectRpc["deleteLinkPreview"]>(),
    deleteMessage: vi.fn<RoomObjectRpc["deleteMessage"]>(),
    deleteScheduledMessage: vi.fn<RoomObjectRpc["deleteScheduledMessage"]>(),
    deleteUserMessages: vi.fn<RoomObjectRpc["deleteUserMessages"]>(),
    deleteUserReactions: vi.fn<RoomObjectRpc["deleteUserReactions"]>(),
    detachMember: vi.fn<RoomObjectRpc["detachMember"]>(),
    exportUserMessages: vi.fn<RoomObjectRpc["exportUserMessages"]>(),
    exportUserReactions: vi.fn<RoomObjectRpc["exportUserReactions"]>(),
    notifyOnlineMembers: vi.fn<RoomObjectRpc["notifyOnlineMembers"]>(),
    pinMessage: vi.fn<RoomObjectRpc["pinMessage"]>(),
    readMessages: vi.fn<RoomObjectRpc["readMessages"]>(),
    readMessagesByIds: vi.fn<RoomObjectRpc["readMessagesByIds"]>(),
    readReactions: vi.fn<RoomObjectRpc["readReactions"]>(),
    readScheduledMessages: vi.fn<RoomObjectRpc["readScheduledMessages"]>(),
    readThread: vi.fn<RoomObjectRpc["readThread"]>(),
    readThreads: vi.fn<RoomObjectRpc["readThreads"]>(),
    removeMember: vi.fn<RoomObjectRpc["removeMember"]>(),
    removeReaction: vi.fn<RoomObjectRpc["removeReaction"]>(),
    searchMessages: vi.fn<RoomObjectRpc["searchMessages"]>(),
    setMemberStatus: vi.fn<RoomObjectRpc["setMemberStatus"]>(),
    unpinMessage: vi.fn<RoomObjectRpc["unpinMessage"]>(),
    updateMessage: vi.fn<RoomObjectRpc["updateMessage"]>(),
    updateScheduledMessage: vi.fn<RoomObjectRpc["updateScheduledMessage"]>(),
    votePoll: vi.fn<RoomObjectRpc["votePoll"]>(),
  } satisfies RoomObjectRpc;
  const userObjectFake = {
    addJoinedCall: vi.fn<UserObjectRpc["addJoinedCall"]>(),
    addReminder: vi.fn<UserObjectRpc["addReminder"]>(),
    addScheduledMessage: vi.fn<UserObjectRpc["addScheduledMessage"]>(),
    addSentMessage: vi.fn<UserObjectRpc["addSentMessage"]>(),
    broadcastEvent: vi.fn<UserObjectRpc["broadcastEvent"]>(),
    closeSession: vi.fn<UserObjectRpc["closeSession"]>(),
    countScheduledMessageJobs: vi.fn<UserObjectRpc["countScheduledMessageJobs"]>(),
    erase: vi.fn<UserObjectRpc["erase"]>(),
    invalidate: vi.fn<UserObjectRpc["invalidate"]>(),
    readJoinedCallIds: vi.fn<UserObjectRpc["readJoinedCallIds"]>(),
    readReminders: vi.fn<UserObjectRpc["readReminders"]>(),
    readScheduledMessages: vi.fn<UserObjectRpc["readScheduledMessages"]>(),
    readSentMessages: vi.fn<UserObjectRpc["readSentMessages"]>(),
    reconcileTodoReminders: vi.fn<UserObjectRpc["reconcileTodoReminders"]>(),
    removeJoinedCall: vi.fn<UserObjectRpc["removeJoinedCall"]>(),
    removeReminder: vi.fn<UserObjectRpc["removeReminder"]>(),
    removeRoomScheduledItems: vi.fn<UserObjectRpc["removeRoomScheduledItems"]>(),
    removeScheduledMessage: vi.fn<UserObjectRpc["removeScheduledMessage"]>(),
    removeSentMessages: vi.fn<UserObjectRpc["removeSentMessages"]>(),
    removeSentMessagesInRoom: vi.fn<UserObjectRpc["removeSentMessagesInRoom"]>(),
    replaceSession: vi.fn<UserObjectRpc["replaceSession"]>(),
    roomActivity: vi.fn<UserObjectRpc["roomActivity"]>(),
    updateAchievement: vi.fn<UserObjectRpc["updateAchievement"]>(),
    updateUsage: vi.fn<UserObjectRpc["updateUsage"]>(),
    updateUserToRoom: vi.fn<UserObjectRpc["updateUserToRoom"]>(),
    upsertStatus: vi.fn<UserObjectRpc["upsertStatus"]>(),
  } satisfies UserObjectRpc;

  return {
    roomObject: roomObjectFake,
    userObject: userObjectFake,
    useRoomObjectMock: vi.fn<(roomId: string) => RoomObjectRpc>(() => roomObjectFake),
    useUserObjectMock: vi.fn<(userId: string) => UserObjectRpc>(() => userObjectFake),
  };
});

// The stub a Worker hands out is typed by the binding, which the web app types by no RPC, so the fake answers as the
// Stub It stands in for. Only the calls a test makes are checked, through the typed fake above
vi.mock(import("#server/composables/realtime/useRoomObject"), () => ({
  useRoomObject: (roomId: string) => useRoomObjectMock(roomId) as unknown as ReturnType<typeof useRoomObject>,
}));
vi.mock(import("#server/composables/realtime/useUserObject"), () => ({
  useUserObject: (userId: string) => useUserObjectMock(userId) as unknown as ReturnType<typeof useUserObject>,
}));
// The take-back catches its own writes, so the only rejection that can reach the router is one a test queues here. The
// Real take-back runs unless a test says otherwise
vi.mock(import("#server/services/message/takeBackMentionCounts"), async (importOriginal) => {
  const actual = await importOriginal();

  return { ...actual, takeBackMentionCounts: vi.fn<typeof actual.takeBackMentionCounts>(actual.takeBackMentionCounts) };
});

describe("messageRouter", () => {
  const { createMember, getMockContext, getRoomCaller, getRoomId } = setupRoomSuite();
  let mockContext: Context;
  let messageCaller: DecorateRouterRecord<TRPCRouter["message"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  let roomId: string;
  let disposeMessageAssets: () => Promise<void>;
  const editedAt = new Date(Temporal.Duration.from({ seconds: 2 }).total("milliseconds"));
  const filename = "a";
  const joinedAt = new Date(Temporal.Duration.from({ seconds: 1 }).total("milliseconds"));
  const messageId = 1;
  const name = "a";
  const text = "a";
  const timeZone = "UTC";
  const updatedText = "b";
  // A word the message wrapper cannot contain on its own, so a room's filter only ever matches the text a test
  // Deliberately put in front of it
  const filteredWord = "spam";
  const filteredMessage = `<p>${filteredWord}</p>`;
  const pollOptionId = v7();
  const userId = getMockSession().user.id;
  // The message a room object holds, sent by the caller unless a test says otherwise
  const createRoomMessage = (overrides: Partial<RoomMessage> = {}): RoomMessage =>
    baseCreateRoomMessage({ id: messageId, message: text, userId, ...overrides });

  beforeAll(async () => {
    mockContext = getMockContext();
    messageCaller = createCallerFactory(messageRouter)(mockContext);
    roomCaller = getRoomCaller();
    // A forward reads the message-assets bucket before it writes anything, so the suite makes one for the bucket to
    // Answer
    const messageAssets = await createMockBucket(StorageBucket.MessageAssets);
    mockBuckets[StorageBucket.MessageAssets] = messageAssets.bucket;
    disposeMessageAssets = messageAssets.dispose;
  });

  beforeEach(() => {
    roomId = getRoomId();
  });

  afterEach(() => {
    for (const method of [...Object.values(roomObject), ...Object.values(userObject)]) method.mockReset();
    MockJobQueueDatabase.clear();
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await disposeMessageAssets();
  });

  test("creates a message as the sender, reading its mentions from the text and naming the tab that sent it", async () => {
    expect.hasAssertions();

    const createdMessage = createRoomMessage();
    const deviceId = v7();
    const tabCaller = createCallerFactory(messageRouter)({
      ...mockContext,
      headers: new Headers({ [DEVICE_ID_HEADER]: deviceId }),
    });
    roomObject.createMessage.mockResolvedValue(createdMessage);

    const message = await messageCaller.createMessage({ message: createMentionMessage(userId), roomId, timeZone });
    await tabCaller.createMessage({ message: text, roomId, timeZone });

    expect(message).toStrictEqual(createdMessage);
    expect(roomObject.createMessage.mock.calls).toStrictEqual([
      [
        {
          files: undefined,
          linkPreviewResponse: null,
          message: createMentionMessage(userId),
          replyToId: undefined,
          type: MessageType.Message,
        },
        { userId },
      ],
      [
        { files: undefined, linkPreviewResponse: null, message: text, replyToId: undefined, type: MessageType.Message },
        { deviceId, userId },
      ],
    ]);
  });

  // The sanitizer would rewrite a poll's JSON, turning an ampersand into an entity, so the room would hold a question
  // Its Sender never wrote
  test("creates a poll with its question as its sender wrote it", async () => {
    expect.hasAssertions();

    const pollMessage = JSON.stringify(createPollMessageContent(POLL_MIN_OPTIONS, { question: "Tom & Jerry <3?" }));
    roomObject.createMessage.mockResolvedValue(createRoomMessage({ type: MessageType.Poll }));

    await messageCaller.createMessage({ message: pollMessage, roomId, timeZone, type: MessageType.Poll });

    expect(roomObject.createMessage).toHaveBeenCalledExactlyOnceWith(
      {
        files: undefined,
        linkPreviewResponse: null,
        message: pollMessage,
        replyToId: undefined,
        type: MessageType.Poll,
      },
      { userId },
    );
  });

  test.each([
    { optionCount: POLL_MIN_OPTIONS - 1, title: "fewer options than a poll can offer" },
    { optionCount: POLL_MAX_OPTIONS + 1, title: "more options than a poll can offer" },
  ])("refuses a poll with $title, writing nothing", async ({ optionCount }) => {
    expect.hasAssertions();

    const pollMessage = JSON.stringify(createPollMessageContent(optionCount));

    await expect(
      messageCaller.createMessage({ message: pollMessage, roomId, timeZone, type: MessageType.Poll }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(roomObject.createMessage).not.toHaveBeenCalled();
  });

  test("sanitizes a text message's markup before the room holds it", async () => {
    expect.hasAssertions();

    roomObject.createMessage.mockResolvedValue(createRoomMessage());

    await messageCaller.createMessage({ message: "<p>a</p><script>b</script>", roomId, timeZone });

    expect(roomObject.createMessage).toHaveBeenCalledExactlyOnceWith(
      {
        files: undefined,
        linkPreviewResponse: null,
        message: "<p>a</p>",
        replyToId: undefined,
        type: MessageType.Message,
      },
      { userId },
    );
  });

  test("updates the message as its sender, with the text it is given, and answers the message the room stores", async () => {
    expect.hasAssertions();

    const updatedMessage = createRoomMessage({ editedAt: new Date(), message: updatedText, version: 1 });
    roomObject.readMessagesByIds.mockReturnValue([createRoomMessage()]);
    roomObject.updateMessage.mockReturnValue({ message: updatedMessage, previousMessage: createRoomMessage() });

    const answer = await messageCaller.updateMessage({ id: messageId, message: updatedText, roomId });

    expect(roomObject.updateMessage).toHaveBeenCalledExactlyOnceWith(
      { id: messageId, message: updatedText },
      { userId },
    );
    expect(answer).toStrictEqual(updatedMessage);
  });

  // A count a message made stands only for a member who was in the room when the message was sent. A member joins at
  // The Epoch the message is dated at unless a test dates the join
  const getMentionCount = async (memberId: string) =>
    (
      await mockContext.db
        .select({ mentionCount: usersToRoomsInMessage.mentionCount })
        .from(usersToRoomsInMessage)
        .where(and(eq(usersToRoomsInMessage.roomId, roomId), eq(usersToRoomsInMessage.userId, memberId)))
    )[0]?.mentionCount;
  const setMembership = (memberId: string, mentionCount: number, createdAt = new Date(0)) =>
    mockContext.db
      .update(usersToRoomsInMessage)
      .set({ createdAt, mentionCount })
      .where(and(eq(usersToRoomsInMessage.roomId, roomId), eq(usersToRoomsInMessage.userId, memberId)));

  test("takes back the mention count a deleted message made for the member it named", async () => {
    expect.hasAssertions();

    const member = await createMember();
    await setMembership(member.id, 1);
    const message = createRoomMessage({ message: createMentionMessage(member.id) });
    roomObject.readMessagesByIds.mockReturnValue([message]);
    roomObject.deleteMessage.mockResolvedValue(message);

    await messageCaller.deleteMessage({ id: messageId, roomId });

    await expect(getMentionCount(member.id)).resolves.toBe(0);
  });

  test("deletes the message even when its mention counts cannot be taken back", async () => {
    expect.hasAssertions();

    const error = new Error(" ");
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(noop);
    const message = createRoomMessage();
    roomObject.readMessagesByIds.mockReturnValue([message]);
    roomObject.deleteMessage.mockResolvedValue(message);
    vi.mocked(takeBackMentionCounts).mockRejectedValueOnce(error);

    await expect(messageCaller.deleteMessage({ id: messageId, roomId })).resolves.toBeUndefined();

    expect(roomObject.deleteMessage).toHaveBeenCalledExactlyOnceWith(messageId, { userId });
    expect(consoleErrorSpy).toHaveBeenCalledExactlyOnceWith(error);
  });

  test("edits the message even when its mention counts cannot be taken back", async () => {
    expect.hasAssertions();

    const error = new Error(" ");
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(noop);
    const updatedMessage = createRoomMessage({ editedAt: new Date(), message: updatedText, version: 1 });
    roomObject.readMessagesByIds.mockReturnValue([createRoomMessage()]);
    roomObject.updateMessage.mockReturnValue({ message: updatedMessage, previousMessage: createRoomMessage() });
    vi.mocked(takeBackMentionCounts).mockRejectedValueOnce(error);

    await expect(messageCaller.updateMessage({ id: messageId, message: updatedText, roomId })).resolves.toStrictEqual(
      updatedMessage,
    );

    expect(consoleErrorSpy).toHaveBeenCalledExactlyOnceWith(error);
  });

  test("moves the mention counts with an edit: a member the new text names is counted, and one the old text named is taken back", async () => {
    expect.hasAssertions();

    const member = await createMember();
    await setMembership(member.id, 0);
    const mentionedText = createMentionMessage(member.id);
    roomObject.readMessagesByIds.mockReturnValue([createRoomMessage({ message: text })]);
    roomObject.updateMessage.mockReturnValue({
      message: createRoomMessage({ editedAt: new Date(), message: mentionedText }),
      previousMessage: createRoomMessage({ message: text }),
    });

    await messageCaller.updateMessage({ id: messageId, message: mentionedText, roomId });
    await expect(getMentionCount(member.id)).resolves.toBe(1);

    roomObject.readMessagesByIds.mockReturnValue([createRoomMessage({ message: mentionedText })]);
    roomObject.updateMessage.mockReturnValue({
      message: createRoomMessage({ editedAt: new Date(), message: text }),
      previousMessage: createRoomMessage({ message: mentionedText }),
    });

    await messageCaller.updateMessage({ id: messageId, message: text, roomId });
    await expect(getMentionCount(member.id)).resolves.toBe(0);
  });

  // Two edits of one message can both be read before either is written. The text an edit replaces is the one the room
  // Held at its own write, so this edit takes back the mention the other edit left, not the text its own read saw
  test("takes back the mention an edit replaced as the room held it at the write, not as the request read it", async () => {
    expect.hasAssertions();

    const member = await createMember();
    await setMembership(member.id, 1);
    roomObject.readMessagesByIds.mockReturnValue([createRoomMessage({ message: text })]);
    roomObject.updateMessage.mockReturnValue({
      message: createRoomMessage({ editedAt: new Date(), message: text }),
      previousMessage: createRoomMessage({ message: createMentionMessage(member.id) }),
    });

    await messageCaller.updateMessage({ id: messageId, message: text, roomId });

    await expect(getMentionCount(member.id)).resolves.toBe(0);
  });

  // The edit counts the mention of a member who joined after the message was sent, so a delete takes that count back
  // Only By reading the edit's time, which is the time the count was made, rather than the send's
  test("takes back the mention count an edit made for a member who joined after the message was sent, when it is deleted", async () => {
    expect.hasAssertions();

    const member = await createMember();
    await setMembership(member.id, 0, joinedAt);
    const mentionedText = createMentionMessage(member.id);
    roomObject.readMessagesByIds.mockReturnValue([createRoomMessage({ message: text })]);
    roomObject.updateMessage.mockReturnValue({
      message: createRoomMessage({ editedAt, message: mentionedText }),
      previousMessage: createRoomMessage({ message: text }),
    });

    await messageCaller.updateMessage({ id: messageId, message: mentionedText, roomId });
    await expect(getMentionCount(member.id)).resolves.toBe(1);

    const editedMessage = createRoomMessage({ editedAt, message: mentionedText });
    roomObject.readMessagesByIds.mockReturnValue([editedMessage]);
    roomObject.deleteMessage.mockResolvedValue(editedMessage);

    await messageCaller.deleteMessage({ id: messageId, roomId });
    await expect(getMentionCount(member.id)).resolves.toBe(0);
  });

  test("fails update with NOT_FOUND once the room no longer holds the message", async () => {
    expect.hasAssertions();

    roomObject.readMessagesByIds.mockReturnValue([createRoomMessage()]);
    roomObject.updateMessage.mockReturnValue(null);

    await expect(
      messageCaller.updateMessage({ id: messageId, message: updatedText, roomId }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Message, JSON.stringify(updateMessageInputSchema.parse({ id: messageId, message: updatedText, roomId }))).message}]`,
    );
  });

  test("fails update by a member who did not write the message", async () => {
    expect.hasAssertions();

    // The member is in the room, so the guard that refuses them is authorship and not membership
    roomObject.readMessagesByIds.mockReturnValue([createRoomMessage()]);
    const member = await createMember();
    const memberCaller = await createMockOtherUserCaller(messageRouter, mockContext.db, member);

    await expect(
      memberCaller.updateMessage({ id: messageId, message: updatedText, roomId }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
    expect(roomObject.updateMessage).not.toHaveBeenCalled();
  });

  test("deletes the message and queues the blobs its files named", async () => {
    expect.hasAssertions();

    const file = { filename, hasThumbnail: true, id: v7(), isSpoiler: false, mimetype: MimeType.Png, size: 1 };
    const message = createRoomMessage({ files: [file] });
    roomObject.readMessagesByIds.mockReturnValue([message]);
    roomObject.deleteMessage.mockResolvedValue(message);

    await messageCaller.deleteMessage({ id: messageId, roomId });

    expect(roomObject.deleteMessage).toHaveBeenCalledExactlyOnceWith(messageId, { userId });
    expect(MockJobQueueDatabase.get(QueueJob.ProcessBlobDeletion)).toStrictEqual([
      {
        blobNames: [getBlobName(`${roomId}/${file.id}`, filename), getThumbnailBlobName(roomId, file.id)],
        storageBucket: StorageBucket.MessageAssets,
      },
    ]);
  });

  test("fails delete with NOT_FOUND once the room no longer holds the message, queuing no blobs", async () => {
    expect.hasAssertions();

    roomObject.readMessagesByIds.mockReturnValue([createRoomMessage()]);
    roomObject.deleteMessage.mockResolvedValue(null);

    await expect(messageCaller.deleteMessage({ id: messageId, roomId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Message, JSON.stringify(deleteMessageInputSchema.parse({ id: messageId, roomId }))).message}]`,
    );
    expect(MockJobQueueDatabase.get(QueueJob.ProcessBlobDeletion)).toBeUndefined();
  });

  test("pins the message and writes a pin line that points at it", async () => {
    expect.hasAssertions();

    const pinnedMessage = createRoomMessage({ isPinned: true });
    roomObject.readMessagesByIds.mockReturnValue([createRoomMessage()]);
    roomObject.pinMessage.mockReturnValue(pinnedMessage);

    await expect(messageCaller.pinMessage({ id: messageId, roomId })).resolves.toStrictEqual(pinnedMessage);

    expect(roomObject.pinMessage).toHaveBeenCalledExactlyOnceWith(messageId, { userId });
    expect(roomObject.createMessage).toHaveBeenCalledExactlyOnceWith(
      { message: "", replyToId: messageId, type: MessageType.PinMessage },
      { userId },
    );
  });

  test("pins the message even when its pin line cannot be written", async () => {
    expect.hasAssertions();

    const error = new Error(" ");
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(noop);
    roomObject.readMessagesByIds.mockReturnValue([createRoomMessage()]);
    const pinnedMessage = createRoomMessage({ isPinned: true });
    roomObject.pinMessage.mockReturnValue(pinnedMessage);
    roomObject.createMessage.mockRejectedValue(error);

    await expect(messageCaller.pinMessage({ id: messageId, roomId })).resolves.toStrictEqual(pinnedMessage);

    expect(consoleErrorSpy).toHaveBeenCalledExactlyOnceWith(error);
  });

  test("unpins the message and answers the message as it now stands", async () => {
    expect.hasAssertions();

    const unpinnedMessage = createRoomMessage();
    roomObject.readMessagesByIds.mockReturnValue([createRoomMessage({ isPinned: true })]);
    roomObject.unpinMessage.mockReturnValue(unpinnedMessage);

    await expect(messageCaller.unpinMessage({ id: messageId, roomId })).resolves.toStrictEqual(unpinnedMessage);

    expect(roomObject.unpinMessage).toHaveBeenCalledExactlyOnceWith(messageId, { userId });
  });

  test("removes the link preview and answers the message without it", async () => {
    expect.hasAssertions();

    const messageWithoutPreview = createRoomMessage();
    roomObject.readMessagesByIds.mockReturnValue([createRoomMessage()]);
    roomObject.deleteLinkPreview.mockReturnValue(messageWithoutPreview);

    await expect(messageCaller.deleteLinkPreviewResponse({ id: messageId, roomId })).resolves.toStrictEqual(
      messageWithoutPreview,
    );

    expect(roomObject.deleteLinkPreview).toHaveBeenCalledExactlyOnceWith(messageId, { userId });
  });

  // Each procedure has its own snapshot: the message names the room, which a test's own id makes differ per test
  test("fails pin with NOT_FOUND once the room no longer holds the message", async () => {
    expect.hasAssertions();

    roomObject.readMessagesByIds.mockReturnValue([createRoomMessage()]);
    roomObject.pinMessage.mockReturnValue(null);

    await expect(messageCaller.pinMessage({ id: messageId, roomId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Message, JSON.stringify(pinMessageInputSchema.parse({ id: messageId, roomId }))).message}]`,
    );
  });

  test("fails unpin with NOT_FOUND once the room no longer holds the message", async () => {
    expect.hasAssertions();

    roomObject.readMessagesByIds.mockReturnValue([createRoomMessage()]);
    roomObject.unpinMessage.mockReturnValue(null);

    await expect(messageCaller.unpinMessage({ id: messageId, roomId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Message, JSON.stringify(unpinMessageInputSchema.parse({ id: messageId, roomId }))).message}]`,
    );
  });

  test.each([
    { name: "votes for the option picked", optionId: pollOptionId, sent: pollOptionId },
    { name: "withdraws the member's vote when no option is picked", optionId: "", sent: undefined },
  ])("$name", async ({ optionId, sent }) => {
    expect.hasAssertions();

    const votedMessage = createRoomMessage({ type: MessageType.Poll, version: 1 });
    roomObject.readMessagesByIds.mockReturnValue([createRoomMessage({ type: MessageType.Poll })]);
    roomObject.votePoll.mockReturnValue(votedMessage);

    const answer = await messageCaller.votePoll({ id: messageId, optionId, roomId });

    expect(roomObject.votePoll).toHaveBeenCalledExactlyOnceWith({ id: messageId, optionId: sent }, { userId });
    expect(answer).toStrictEqual(votedMessage);
  });

  test("fails vote with BAD_REQUEST once the room no longer holds the poll", async () => {
    expect.hasAssertions();

    roomObject.readMessagesByIds.mockReturnValue([createRoomMessage({ type: MessageType.Poll })]);
    roomObject.votePoll.mockReturnValue(null);

    await expect(
      messageCaller.votePoll({ id: messageId, optionId: pollOptionId, roomId }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Update, DatabaseEntityType.Message, JSON.stringify(votePollInputSchema.parse({ id: messageId, optionId: pollOptionId, roomId }))).message}]`,
    );
  });

  test("follows a thread, which stays listed while its root message is gone", async () => {
    expect.hasAssertions();

    roomObject.readThreads.mockReturnValue([]);

    const followedRow = await messageCaller.followThread({ roomId, threadRootId: messageId });

    const followedThreads = await messageCaller.readFollowedThreads({ roomId });

    expect(followedThreads).toStrictEqual({ follows: [followedRow], threads: [] });
    expect(roomObject.readThreads).toHaveBeenCalledExactlyOnceWith([messageId]);
  });

  test("unfollows a thread, which leaves the followed list", async () => {
    expect.hasAssertions();

    await messageCaller.followThread({ roomId, threadRootId: messageId });
    const unfollowedRow = await messageCaller.unfollowThread({ roomId, threadRootId: messageId });

    const followedThreads = await messageCaller.readFollowedThreads({ roomId });

    expect(followedThreads).toStrictEqual({ follows: [unfollowedRow], threads: [] });
  });

  // The unfollow's row is read back with its version, so a read that lands after the unfollow cannot list the thread
  // Again
  test("reads an unfollowed thread's follow row with the version the unfollow left it at", async () => {
    expect.hasAssertions();

    const followedRow = await messageCaller.followThread({ roomId, threadRootId: messageId });
    const unfollowedRow = await messageCaller.unfollowThread({ roomId, threadRootId: messageId });

    const { follows, threads } = await messageCaller.readFollowedThreads({ roomId });

    expect(unfollowedRow.version).toBeGreaterThan(followedRow.version);
    expect(follows).toStrictEqual([unfollowedRow]);
    expect(threads).toStrictEqual([]);
  });

  // The follow's header names its row by the thread's root id as the row holds it, a number, so the entry touches the
  // Row
  test("the follow's entry covers the follow row its header names", async () => {
    expect.hasAssertions();

    const { named, uncovered } = await getUncoveredWrites({
      call: (context) => createCallerFactory(messageRouter)(context).followThread({ roomId, threadRootId: messageId }),
      context: mockContext,
      entry: getThreadFollowEntry(roomId, messageId, userId, false, new Date(0)),
      path: "followThread",
      tables: [threadFollowTable],
    });

    expect(named).toHaveLength(1);
    expect(uncovered).toStrictEqual([]);
  });

  test("the unfollow's entry covers the follow row its header names", async () => {
    expect.hasAssertions();

    await messageCaller.followThread({ roomId, threadRootId: messageId });
    const { named, uncovered } = await getUncoveredWrites({
      call: (context) =>
        createCallerFactory(messageRouter)(context).unfollowThread({ roomId, threadRootId: messageId }),
      context: mockContext,
      entry: getThreadFollowEntry(roomId, messageId, userId, true, new Date(0)),
      path: "unfollowThread",
      tables: [threadFollowTable],
    });

    expect(named).toHaveLength(1);
    expect(uncovered).toStrictEqual([]);
  });

  test("asks the room for the followed threads newest first, whichever order they were followed in", async () => {
    expect.hasAssertions();

    const newerRoot = { ...createRoomMessage({ id: messageId + 1 }), replyCount: 0 };
    roomObject.readThreads.mockReturnValue([newerRoot]);
    // Followed newer first, so a read that returns the follows latest-first hands the room the older root ahead of the
    // Newer One, and only the router's own sort puts the newer root first
    await messageCaller.followThread({ roomId, threadRootId: newerRoot.id });
    await messageCaller.followThread({ roomId, threadRootId: messageId });

    const { threads } = await messageCaller.readFollowedThreads({ roomId });

    expect(roomObject.readThreads).toHaveBeenCalledExactlyOnceWith([newerRoot.id, messageId]);
    expect(threads).toStrictEqual([newerRoot]);
  });

  test("reads one message past the limit, and continues from the last message kept when that extra one came back", async () => {
    expect.hasAssertions();

    const newerMessage = createRoomMessage({ id: messageId + 1 });
    const olderMessage = createRoomMessage({ id: messageId });
    roomObject.readMessages.mockReturnValue([newerMessage, olderMessage]);

    const page = await messageCaller.readMessages({ cursor: "", filter: { isPinned: true }, limit: 1, roomId });

    expect(roomObject.readMessages).toHaveBeenCalledExactlyOnceWith({
      cursor: { isBackward: false, values: [] },
      isPinned: true,
      limit: 2,
    });
    expect(page).toStrictEqual({
      items: [newerMessage],
      nextCursor: encodePageCursor({ isBackward: false, values: [messageId + 1] }),
    });
  });

  // A room opened at one of its messages reads the messages around it both ways: the anchor starts the older side, and
  // The Newer side reads from the anchor backward, so each side hands its own cursor on
  test("opens a room at a message, reading the messages on each side of it with a cursor each way", async () => {
    expect.hasAssertions();

    const anchorId = 10;
    const anchor = createRoomMessage({ id: anchorId });
    const olderMessage = createRoomMessage({ id: anchorId - 1 });
    const newerMessage = createRoomMessage({ id: anchorId + 1 });
    roomObject.readMessages
      .mockReturnValueOnce([anchor, olderMessage])
      .mockReturnValueOnce([newerMessage, createRoomMessage({ id: anchorId + 2 })]);

    const page = await messageCaller.readMessagesAround({ limit: 1, messageId: anchorId, roomId });

    expect(roomObject.readMessages).toHaveBeenNthCalledWith(1, {
      cursor: { isBackward: false, values: [anchorId + 1] },
      limit: 2,
    });
    expect(roomObject.readMessages).toHaveBeenNthCalledWith(2, {
      cursor: { isBackward: true, values: [anchorId] },
      limit: 2,
    });
    expect(page).toStrictEqual({
      items: [newerMessage, anchor],
      nextCursor: encodePageCursor({ isBackward: false, values: [anchorId] }),
      previousCursor: encodePageCursor({ isBackward: true, values: [anchorId + 1] }),
    });
  });

  test("reads the messages the room holds for the ids asked", async () => {
    expect.hasAssertions();

    const message = createRoomMessage();
    roomObject.readMessagesByIds.mockReturnValue([message]);

    const messages = await messageCaller.readMessagesByIds({ messageIds: [messageId], roomId });

    expect(roomObject.readMessagesByIds).toHaveBeenCalledExactlyOnceWith([messageId]);
    expect(messages).toStrictEqual([message]);
  });

  test("forwards the message to a room as the sender, then posts the note after it", async () => {
    expect.hasAssertions();

    const targetRoom = await roomCaller.createRoom({ name });
    roomObject.readMessagesByIds.mockReturnValue([createRoomMessage()]);
    roomObject.createMessage.mockResolvedValue(createRoomMessage());

    await messageCaller.forwardMessage({ id: messageId, message: updatedText, roomId, roomIds: [targetRoom.id] });

    expect(roomObject.createMessage.mock.calls).toStrictEqual([
      [{ files: [], isForward: true, message: text, type: MessageType.Message }, { userId }],
      [{ message: updatedText, type: MessageType.Message }, { userId }],
    ]);
  });

  test("fails forward to a room the sender is not in, writing to no room", async () => {
    expect.hasAssertions();

    // The room belongs to another person, so the sender is not in it and the forward is refused before any room is
    // Written
    const otherAuthSession = await createMockAuthSession(mockContext.db);
    const otherRoomCaller = createCallerFactory(roomRouter)(await createMockContext(otherAuthSession));
    const otherRoom = await otherRoomCaller.createRoom({ name });

    await expect(
      messageCaller.forwardMessage({ id: messageId, message: text, roomId, roomIds: [otherRoom.id] }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
    expect(roomObject.createMessage).not.toHaveBeenCalled();
  });

  // A forward posts to every room it names at once, so the rooms it can name are bounded before any room is written to
  test("refuses a forward to more rooms than one forward posts to, writing to none", async () => {
    expect.hasAssertions();

    const roomIds = Array.from({ length: MAX_FORWARD_ROOMS + 1 }, () => v7());

    await expect(messageCaller.forwardMessage({ id: messageId, message: text, roomId, roomIds })).rejects.toMatchObject(
      { code: "BAD_REQUEST" },
    );
    expect(roomObject.createMessage).not.toHaveBeenCalled();
  });

  test("refuses a search that names more rooms with in: than one search reads, asking none of them", async () => {
    expect.hasAssertions();

    const filters = Array.from({ length: MAX_SEARCH_ROOMS + 1 }, () => ({ type: FilterType.In, value: v7() }));

    await expect(
      messageCaller.searchMessages({ cursor: "", filters, limit: 1, query: "gate", roomId }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(roomObject.searchMessages).not.toHaveBeenCalled();
  });

  test("forwards to the room that does not block the word, and fails with the block the other room raised", async () => {
    expect.hasAssertions();

    const blockedRoom = await roomCaller.createRoom({ name });
    const openRoom = await roomCaller.createRoom({ name });
    await roomCaller.filter.upsertRoomFilter({ roomId: blockedRoom.id, words: [filteredWord] });
    // The filter never applies to someone who can manage messages, so the forward is sent by a plain member of both
    // Rooms
    const member = await createMember();
    await createRoomMember(mockContext, blockedRoom.id, member);
    await createRoomMember(mockContext, openRoom.id, member);
    // Each join writes a line to its room, which is not the forward this test is about
    useRoomObjectMock.mockClear();
    roomObject.createMessage.mockClear();
    const memberCaller = await createMockOtherUserCaller(messageRouter, mockContext.db, member);
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(noop);
    roomObject.readMessagesByIds.mockReturnValue([createRoomMessage({ message: filteredMessage })]);
    roomObject.createMessage.mockResolvedValue(createRoomMessage());

    await expect(
      memberCaller.forwardMessage({ id: messageId, message: "", roomId, roomIds: [blockedRoom.id, openRoom.id] }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: Message contains blocked content.]`);

    expect(useRoomObjectMock).not.toHaveBeenCalledWith(blockedRoom.id);
    expect(roomObject.createMessage).toHaveBeenCalledExactlyOnceWith(
      { files: [], isForward: true, message: filteredMessage, type: MessageType.Message },
      { userId: member.id },
    );
    expect(consoleErrorSpy).toHaveBeenCalledExactlyOnceWith(
      `Failed to forward message to room ${blockedRoom.id}:`,
      expect.anything(),
    );
  });
});
