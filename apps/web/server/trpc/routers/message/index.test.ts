import type { useRoomObject } from "#server/composables/realtime/useRoomObject";
import type { useUserObject } from "#server/composables/realtime/useUserObject";
import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers";
import type { RoomMessage, RoomObjectRpc, UserObjectRpc } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { MockJobQueueDatabase } from "#server/services/queue/getJobQueue.test";
import { mockBuckets } from "#server/services/storage/getBucket.test";
import { createCallerFactory } from "#server/trpc";
import { getMockSession, mockSessionOnce } from "#server/trpc/context.test";
import { createMentionMessage } from "#server/trpc/routers/createMentionMessage.test";
import { createRoomMember } from "#server/trpc/routers/createRoomMember.test";
import { messageRouter } from "#server/trpc/routers/message";
import { setupRoomSuite } from "#server/trpc/routers/setupRoomSuite.test";
import { MimeType } from "#shared/models/file/MimeType";
import { DEVICE_ID_HEADER } from "#shared/models/realtime/DeviceId";
import { getBlobName, getThumbnailBlobName } from "@esposter/db";
import { createMockBucket } from "@esposter/db-mock";
import { DatabaseEntityType, MessageType, QueueJob, StorageBucket } from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, noop, Operation } from "@esposter/shared";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

// The room and user objects are programmable: every RPC is a typed fake whose return value a test sets. Each contract
// is listed in full with `satisfies`, so a method added to either interface fails here until it has a fake
const { roomObject, useRoomObjectMock, userObject, useUserObjectMock } = vi.hoisted(() => {
  const roomObject = {
    addReaction: vi.fn<RoomObjectRpc["addReaction"]>(),
    attachMember: vi.fn<RoomObjectRpc["attachMember"]>(),
    broadcastEvent: vi.fn<RoomObjectRpc["broadcastEvent"]>(),
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
    pinMessage: vi.fn<RoomObjectRpc["pinMessage"]>(),
    readMessages: vi.fn<RoomObjectRpc["readMessages"]>(),
    readMessagesByIds: vi.fn<RoomObjectRpc["readMessagesByIds"]>(),
    readReactions: vi.fn<RoomObjectRpc["readReactions"]>(),
    readScheduledMessages: vi.fn<RoomObjectRpc["readScheduledMessages"]>(),
    readThread: vi.fn<RoomObjectRpc["readThread"]>(),
    removeMember: vi.fn<RoomObjectRpc["removeMember"]>(),
    removeReaction: vi.fn<RoomObjectRpc["removeReaction"]>(),
    searchMessages: vi.fn<RoomObjectRpc["searchMessages"]>(),
    setMemberStatus: vi.fn<RoomObjectRpc["setMemberStatus"]>(),
    unpinMessage: vi.fn<RoomObjectRpc["unpinMessage"]>(),
    updateMessage: vi.fn<RoomObjectRpc["updateMessage"]>(),
    updateScheduledMessage: vi.fn<RoomObjectRpc["updateScheduledMessage"]>(),
    votePoll: vi.fn<RoomObjectRpc["votePoll"]>(),
  } satisfies RoomObjectRpc;
  const userObject = {
    acceptFriendRequest: vi.fn<UserObjectRpc["acceptFriendRequest"]>(),
    addScheduledMessage: vi.fn<UserObjectRpc["addScheduledMessage"]>(),
    addSentMessage: vi.fn<UserObjectRpc["addSentMessage"]>(),
    closeSession: vi.fn<UserObjectRpc["closeSession"]>(),
    declineFriendRequest: vi.fn<UserObjectRpc["declineFriendRequest"]>(),
    deleteFriend: vi.fn<UserObjectRpc["deleteFriend"]>(),
    readScheduledMessages: vi.fn<UserObjectRpc["readScheduledMessages"]>(),
    readSentMessages: vi.fn<UserObjectRpc["readSentMessages"]>(),
    reconcileTodoReminders: vi.fn<UserObjectRpc["reconcileTodoReminders"]>(),
    removeScheduledMessage: vi.fn<UserObjectRpc["removeScheduledMessage"]>(),
    removeSentMessage: vi.fn<UserObjectRpc["removeSentMessage"]>(),
    replaceSession: vi.fn<UserObjectRpc["replaceSession"]>(),
    roomActivity: vi.fn<UserObjectRpc["roomActivity"]>(),
    saveResourceContent: vi.fn<UserObjectRpc["saveResourceContent"]>(),
    sendFriendRequest: vi.fn<UserObjectRpc["sendFriendRequest"]>(),
    updateAchievement: vi.fn<UserObjectRpc["updateAchievement"]>(),
    updateUsage: vi.fn<UserObjectRpc["updateUsage"]>(),
    updateUserToRoom: vi.fn<UserObjectRpc["updateUserToRoom"]>(),
    upsertStatus: vi.fn<UserObjectRpc["upsertStatus"]>(),
  } satisfies UserObjectRpc;

  return {
    roomObject,
    useRoomObjectMock: vi.fn<(roomId: string) => RoomObjectRpc>(() => roomObject),
    userObject,
    useUserObjectMock: vi.fn<(userId: string) => UserObjectRpc>(() => userObject),
  };
});

// The stub a Worker hands out is typed by the binding, which the web app types by no RPC, so the fake answers as the stub
// it stands in for. Only the calls a test makes are checked, through the typed fake above
vi.mock(import("#server/composables/realtime/useRoomObject"), () => ({
  useRoomObject: (roomId: string) => useRoomObjectMock(roomId) as unknown as ReturnType<typeof useRoomObject>,
}));
vi.mock(import("#server/composables/realtime/useUserObject"), () => ({
  useUserObject: (userId: string) => useUserObjectMock(userId) as unknown as ReturnType<typeof useUserObject>,
}));

describe("messageRouter", () => {
  const { createMember, getMockContext, getRoomCaller, getRoomId } = setupRoomSuite();
  let mockContext: Context;
  let messageCaller: DecorateRouterRecord<TRPCRouter["message"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  let roomId: string;
  let disposeMessageAssets: () => Promise<void>;
  const filename = "a";
  const messageId = 1;
  const name = "a";
  const text = "a";
  const timeZone = "UTC";
  const updatedText = "b";
  // A word the message wrapper cannot contain on its own, so a room's filter only ever matches the text a test
  // deliberately put in front of it
  const filteredWord = "spam";
  const filteredMessage = `<p>${filteredWord}</p>`;
  const pollOptionId = v7();
  const userId = getMockSession().user.id;
  // The message a room object holds, sent by the caller unless a test says otherwise
  const createRoomMessage = (overrides: Partial<RoomMessage> = {}): RoomMessage => ({
    appUserId: null,
    appUserImage: "",
    createdAt: new Date(0),
    deletedAt: null,
    files: [],
    id: messageId,
    isEdited: false,
    isForward: false,
    isPinned: false,
    linkPreviewResponse: null,
    mentions: [],
    message: text,
    replyToId: null,
    senderName: null,
    type: MessageType.Message,
    updatedAt: new Date(0),
    userId,
    ...overrides,
  });

  beforeAll(async () => {
    mockContext = getMockContext();
    messageCaller = createCallerFactory(messageRouter)(mockContext);
    roomCaller = getRoomCaller();
    // A forward reads the message-assets bucket before it writes anything, so the suite makes one for the bucket to answer
    const messageAssets = await createMockBucket(StorageBucket.MessageAssets);
    mockBuckets[StorageBucket.MessageAssets] = messageAssets.bucket;
    disposeMessageAssets = messageAssets.dispose;
  });

  afterAll(async () => {
    await disposeMessageAssets();
  });

  beforeEach(() => {
    roomId = getRoomId();
  });

  afterEach(() => {
    for (const method of [...Object.values(roomObject), ...Object.values(userObject)]) method.mockReset();
    MockJobQueueDatabase.clear();
    vi.restoreAllMocks();
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
          mentions: [userId],
          message: createMentionMessage(userId),
          replyToId: undefined,
          type: MessageType.Message,
        },
        { userId },
      ],
      [
        {
          files: undefined,
          linkPreviewResponse: null,
          mentions: [],
          message: text,
          replyToId: undefined,
          type: MessageType.Message,
        },
        { deviceId, userId },
      ],
    ]);
  });

  test("updates the message with the mentions its new text names", async () => {
    expect.hasAssertions();

    const mentionedUserId = v7();
    const mentionedText = createMentionMessage(mentionedUserId);
    roomObject.readMessagesByIds.mockReturnValue([createRoomMessage({ mentions: [userId] })]);
    roomObject.updateMessage.mockReturnValue(createRoomMessage({ isEdited: true, message: mentionedText }));

    await messageCaller.updateMessage({ id: messageId, message: mentionedText, roomId });

    expect(roomObject.updateMessage).toHaveBeenCalledExactlyOnceWith(
      { id: messageId, mentions: [mentionedUserId], message: mentionedText },
      { userId },
    );
  });

  test("fails update with NOT_FOUND once the room no longer holds the message", async () => {
    expect.hasAssertions();

    roomObject.readMessagesByIds.mockReturnValue([createRoomMessage()]);
    roomObject.updateMessage.mockReturnValue(null);

    await expect(
      messageCaller.updateMessage({ id: messageId, message: updatedText, roomId }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Message, JSON.stringify({ roomId, id: messageId, message: updatedText })).message}]`,
    );
  });

  test("fails update by a member who did not write the message", async () => {
    expect.hasAssertions();

    // The member is in the room, so the guard that refuses them is authorship and not membership
    roomObject.readMessagesByIds.mockReturnValue([createRoomMessage()]);
    const member = await createMember();
    await mockSessionOnce(mockContext.db, member);

    await expect(
      messageCaller.updateMessage({ id: messageId, message: updatedText, roomId }),
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
        containerName: StorageBucket.MessageAssets,
      },
    ]);
  });

  test("fails delete with NOT_FOUND once the room no longer holds the message, queuing no blobs", async () => {
    expect.hasAssertions();

    roomObject.readMessagesByIds.mockReturnValue([createRoomMessage()]);
    roomObject.deleteMessage.mockResolvedValue(null);

    await expect(messageCaller.deleteMessage({ id: messageId, roomId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Message, JSON.stringify({ roomId, id: messageId })).message}]`,
    );
    expect(MockJobQueueDatabase.get(QueueJob.ProcessBlobDeletion)).toBeUndefined();
  });

  test("pins the message and writes a pin line that points at it", async () => {
    expect.hasAssertions();

    roomObject.readMessagesByIds.mockReturnValue([createRoomMessage()]);
    roomObject.pinMessage.mockReturnValue(createRoomMessage({ isPinned: true }));

    await messageCaller.pinMessage({ id: messageId, roomId });

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
    roomObject.pinMessage.mockReturnValue(createRoomMessage({ isPinned: true }));
    roomObject.createMessage.mockRejectedValue(error);

    await expect(messageCaller.pinMessage({ id: messageId, roomId })).resolves.toBeUndefined();

    expect(consoleErrorSpy).toHaveBeenCalledExactlyOnceWith(error);
  });

  test("unpins the message", async () => {
    expect.hasAssertions();

    roomObject.readMessagesByIds.mockReturnValue([createRoomMessage({ isPinned: true })]);
    roomObject.unpinMessage.mockReturnValue(createRoomMessage());

    await messageCaller.unpinMessage({ id: messageId, roomId });

    expect(roomObject.unpinMessage).toHaveBeenCalledExactlyOnceWith(messageId, { userId });
  });

  // Each procedure has its own snapshot: the message names the room, which a test's own id makes differ per test
  test("fails pin with NOT_FOUND once the room no longer holds the message", async () => {
    expect.hasAssertions();

    roomObject.readMessagesByIds.mockReturnValue([createRoomMessage()]);
    roomObject.pinMessage.mockReturnValue(null);

    await expect(messageCaller.pinMessage({ id: messageId, roomId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Message, JSON.stringify({ roomId, id: messageId })).message}]`,
    );
  });

  test("fails unpin with NOT_FOUND once the room no longer holds the message", async () => {
    expect.hasAssertions();

    roomObject.readMessagesByIds.mockReturnValue([createRoomMessage()]);
    roomObject.unpinMessage.mockReturnValue(null);

    await expect(messageCaller.unpinMessage({ id: messageId, roomId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Message, JSON.stringify({ roomId, id: messageId })).message}]`,
    );
  });

  test.each([
    { name: "votes for the option picked", optionId: pollOptionId, sent: pollOptionId },
    { name: "withdraws the member's vote when no option is picked", optionId: "", sent: undefined },
  ])("$name", async ({ optionId, sent }) => {
    expect.hasAssertions();

    roomObject.readMessagesByIds.mockReturnValue([createRoomMessage({ type: MessageType.Poll })]);
    roomObject.votePoll.mockReturnValue(createRoomMessage({ type: MessageType.Poll }));

    await messageCaller.votePoll({ id: messageId, optionId, roomId });

    expect(roomObject.votePoll).toHaveBeenCalledExactlyOnceWith({ id: messageId, optionId: sent }, { userId });
  });

  test("fails vote with BAD_REQUEST once the room no longer holds the poll", async () => {
    expect.hasAssertions();

    roomObject.readMessagesByIds.mockReturnValue([createRoomMessage({ type: MessageType.Poll })]);
    roomObject.votePoll.mockReturnValue(null);

    await expect(
      messageCaller.votePoll({ id: messageId, optionId: pollOptionId, roomId }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Update, DatabaseEntityType.Message, JSON.stringify({ optionId: pollOptionId, roomId, id: messageId })).message}]`,
    );
  });

  test("follows a thread, which stays listed while its root message is gone", async () => {
    expect.hasAssertions();

    roomObject.readMessagesByIds.mockReturnValue([]);

    await messageCaller.followThread({ roomId, threadRootId: messageId });

    const followedThreads = await messageCaller.readFollowedThreads({ roomId });

    expect(followedThreads).toStrictEqual({ threadRootIds: [messageId], threads: [] });
    expect(roomObject.readMessagesByIds).toHaveBeenCalledExactlyOnceWith([messageId]);
  });

  test("unfollows a thread, which leaves the followed list", async () => {
    expect.hasAssertions();

    await messageCaller.followThread({ roomId, threadRootId: messageId });
    await messageCaller.unfollowThread({ roomId, threadRootId: messageId });

    const followedThreads = await messageCaller.readFollowedThreads({ roomId });

    expect(followedThreads).toStrictEqual({ threadRootIds: [], threads: [] });
  });

  test("asks the room for the followed threads newest first, whichever order they were followed in", async () => {
    expect.hasAssertions();

    const newerRoot = createRoomMessage({ id: messageId + 1 });
    roomObject.readMessagesByIds.mockReturnValue([newerRoot]);
    // Followed newer first, so a read that returns the follows latest-first hands the room the older root ahead of the newer
    // one, and only the router's own sort puts the newer root first
    await messageCaller.followThread({ roomId, threadRootId: newerRoot.id });
    await messageCaller.followThread({ roomId, threadRootId: messageId });

    const { threads } = await messageCaller.readFollowedThreads({ roomId });

    expect(roomObject.readMessagesByIds).toHaveBeenCalledExactlyOnceWith([newerRoot.id, messageId]);
    expect(threads).toStrictEqual([newerRoot]);
  });

  test("reads one message past the limit, and reports more only when that extra message came back", async () => {
    expect.hasAssertions();

    const newerMessage = createRoomMessage({ id: messageId + 1 });
    const olderMessage = createRoomMessage({ id: messageId });
    roomObject.readMessages.mockReturnValue([newerMessage, olderMessage]);

    const page = await messageCaller.readMessages({
      before: messageId + 2,
      filter: { isPinned: true },
      limit: 1,
      roomId,
    });

    expect(roomObject.readMessages).toHaveBeenCalledExactlyOnceWith({
      before: messageId + 2,
      isPinned: true,
      limit: 2,
    });
    expect(page).toStrictEqual({ hasMore: true, items: [newerMessage] });
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

    // The room belongs to another person, so the sender is not in it and the forward is refused before any room is written
    await mockSessionOnce(mockContext.db);
    const otherRoom = await roomCaller.createRoom({ name });

    await expect(
      messageCaller.forwardMessage({ id: messageId, message: text, roomId, roomIds: [otherRoom.id] }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
    expect(roomObject.createMessage).not.toHaveBeenCalled();
  });

  test("forwards to the room that does not block the word, and fails with the block the other room raised", async () => {
    expect.hasAssertions();

    const blockedRoom = await roomCaller.createRoom({ name });
    const openRoom = await roomCaller.createRoom({ name });
    await roomCaller.filter.upsertRoomFilter({ roomId: blockedRoom.id, words: [filteredWord] });
    // The filter never applies to someone who can manage messages, so the forward is sent by a plain member of both rooms
    const member = await createMember();
    await createRoomMember(mockContext, blockedRoom.id, member);
    await createRoomMember(mockContext, openRoom.id, member);
    // Each join writes a line to its room, which is not the forward this test is about
    useRoomObjectMock.mockClear();
    roomObject.createMessage.mockClear();
    await mockSessionOnce(mockContext.db, member);
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(noop);
    roomObject.readMessagesByIds.mockReturnValue([createRoomMessage({ message: filteredMessage })]);
    roomObject.createMessage.mockResolvedValue(createRoomMessage());

    await expect(
      messageCaller.forwardMessage({ id: messageId, message: "", roomId, roomIds: [blockedRoom.id, openRoom.id] }),
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
