import type { useRoomObject } from "#server/composables/realtime/useRoomObject";
import type { Context } from "#server/trpc/context";
import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { RoomObjectRpc } from "@esposter/db-schema";

import { createRoomMessage } from "#server/services/message/createRoomMessage.test";
import { createUserMessage } from "#server/services/message/createUserMessage";
import { readFollowedThreadRootIds } from "#server/services/message/thread/readFollowedThreadRootIds";
import { upsertThreadUnfollow } from "#server/services/message/thread/upsertThreadUnfollow";
import { MockJobQueueDatabase } from "#server/services/queue/getJobQueue.test";
import { createMockContext, getMockSession, mockSessionOnce } from "#server/trpc/context.test";
import { createThreadFollow } from "@esposter/db";
import {
  MessageType,
  RoomPermission,
  roomRolesInMessage,
  roomsInMessage,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { noop, takeOne } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

// The room's object writes the message and answers for the root a reply names, so both are faked here: the thread
// Follows are real rows, made from whichever author the object reports
const { roomObject } = vi.hoisted(() => ({
  roomObject: {
    createMessage: vi.fn<RoomObjectRpc["createMessage"]>(),
    readMessagesByIds: vi.fn<RoomObjectRpc["readMessagesByIds"]>(),
  },
}));
vi.mock(import("#server/composables/realtime/useRoomObject"), () => ({
  useRoomObject: () => roomObject as unknown as ReturnType<typeof useRoomObject>,
}));

describe(createUserMessage, () => {
  let mockContext: Context;
  let rootAuthor: GetSessionPayload;
  let replier: GetSessionPayload;
  const name = "name";
  const message = "message";
  const rootId = 1;
  const replyId = 2;

  beforeAll(async () => {
    mockContext = await createMockContext();
    rootAuthor = getMockSession();
    replier = await mockSessionOnce(mockContext.db);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    MockJobQueueDatabase.clear();
    await mockContext.db.delete(roomsInMessage);
  });

  afterAll(async () => {
    await mockContext.db.delete(usersInAuth).where(eq(usersInAuth.id, replier.user.id));
  });

  const createRoom = async () => {
    const room = takeOne(
      await mockContext.db.insert(roomsInMessage).values({ name, userId: rootAuthor.user.id }).returning(),
    );
    await mockContext.db.insert(usersToRoomsInMessage).values([
      { roomId: room.id, userId: rootAuthor.user.id },
      { roomId: room.id, userId: replier.user.id },
    ]);
    // The @everyone role the replier holds, seeded with the send permission `createRoom` gives it
    await mockContext.db
      .insert(roomRolesInMessage)
      .values({ isEveryone: true, name, permissions: RoomPermission.SendMessages, roomId: room.id });
    return room;
  };
  // The room answers the write with the message it stored, which is the root the replies below name
  const postRoot = (roomId: string) => {
    roomObject.createMessage.mockResolvedValueOnce(createRoomMessage({ id: rootId, userId: rootAuthor.user.id }));
    return createUserMessage(
      mockContext.db,
      { userId: rootAuthor.user.id },
      { files: [], message, roomId, type: MessageType.Message },
    );
  };
  const createReply = (roomId: string, replyToId: number) => {
    roomObject.createMessage.mockResolvedValueOnce(
      createRoomMessage({ id: replyId, replyToId, userId: replier.user.id }),
    );
    return createUserMessage(
      mockContext.db,
      { userId: replier.user.id },
      { files: [], message, replyToId, roomId, type: MessageType.Message },
    );
  };

  // Discord notifies you when someone replies to your message, so the root's author follows their own thread
  // The moment it becomes one — otherwise the thread pipeline reaches everyone who replied and never the one
  // Person the thread belongs to
  test("a reply follows the thread for the root's author as well as the replier", async () => {
    expect.hasAssertions();

    const room = await createRoom();
    const root = await postRoot(room.id);
    roomObject.readMessagesByIds.mockResolvedValue([root]);
    await createReply(room.id, root.id);
    const rootAuthorFollows = await readFollowedThreadRootIds(mockContext.db, room.id, rootAuthor.user.id);
    const replierFollows = await readFollowedThreadRootIds(mockContext.db, room.id, replier.user.id);

    expect(rootAuthorFollows).toStrictEqual([root.id]);
    expect(replierFollows).toStrictEqual([root.id]);
  });

  // The root author's follow is the one nobody performs themselves, so it is the one that can undo a decision
  // They did make. Their unfollow is recorded rather than deleted precisely so the next reply by somebody else
  // Finds it — otherwise the bell can never be turned off on your own thread while anyone keeps replying
  test("a reply does not re-follow a root author who unfollowed", async () => {
    expect.hasAssertions();

    const room = await createRoom();
    const root = await postRoot(room.id);
    roomObject.readMessagesByIds.mockResolvedValue([root]);
    await createReply(room.id, root.id);
    await upsertThreadUnfollow(mockContext.db, { roomId: room.id, threadRootId: root.id, userId: rootAuthor.user.id });
    await createReply(room.id, root.id);
    const rootAuthorFollows = await readFollowedThreadRootIds(mockContext.db, room.id, rootAuthor.user.id);

    expect(rootAuthorFollows).toStrictEqual([]);
    // The bell still turns it back on: that IS the author's own decision, so it clears what they recorded
    await createThreadFollow(
      mockContext.db,
      { roomId: room.id, threadRootId: root.id, userId: rootAuthor.user.id },
      true,
    );

    await expect(readFollowedThreadRootIds(mockContext.db, room.id, rootAuthor.user.id)).resolves.toStrictEqual([
      root.id,
    ]);
  });

  // A webhook message has no author at all, and the follow row's userId is NOT NULL — so the root-author follow
  // Is guarded on the id existing rather than on the root having been read
  test("a reply to a webhook root follows only the replier", async () => {
    expect.hasAssertions();

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(noop);
    const room = await createRoom();
    const webhookRoot = createRoomMessage({ appUserId: v7(), type: MessageType.Webhook });
    roomObject.readMessagesByIds.mockResolvedValue([webhookRoot]);
    await createReply(room.id, webhookRoot.id);
    const replierFollows = await readFollowedThreadRootIds(mockContext.db, room.id, replier.user.id);

    expect(replierFollows).toStrictEqual([webhookRoot.id]);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
