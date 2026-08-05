import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { Context } from "@@/server/trpc/context";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { createUserMessage } from "@@/server/services/message/createUserMessage";
import { createThreadFollow } from "@@/server/services/message/thread/createThreadFollow";
import { createThreadUnfollow } from "@@/server/services/message/thread/createThreadUnfollow";
import { readFollowedThreadRootRowKeys } from "@@/server/services/message/thread/readFollowedThreadRootRowKeys";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { createMessage } from "@esposter/db";
import { AzureTable, MessageType, roomsInMessage, users, usersToRoomsInMessage } from "@esposter/db-schema";
import { noop, takeOne } from "@esposter/shared";
import { MockEventGridDatabase, MockTableDatabase } from "azure-mock";
import { eq } from "drizzle-orm";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

describe(createUserMessage, () => {
  let mockContext: Context;
  let rootAuthor: GetSessionPayload;
  let replier: GetSessionPayload;
  const name = "name";
  const message = "message";

  beforeAll(async () => {
    mockContext = await createMockContext();
    rootAuthor = getMockSession();
    replier = await mockSessionOnce(mockContext.db);
  });

  afterEach(async () => {
    MockEventGridDatabase.clear();
    MockTableDatabase.clear();
    await mockContext.db.delete(roomsInMessage);
  });

  afterAll(async () => {
    await mockContext.db.delete(users).where(eq(users.id, replier.user.id));
  });

  const createRoom = async () => {
    const room = takeOne(
      await mockContext.db.insert(roomsInMessage).values({ name, userId: rootAuthor.user.id }).returning(),
    );
    await mockContext.db.insert(usersToRoomsInMessage).values([
      { roomId: room.id, userId: rootAuthor.user.id },
      { roomId: room.id, userId: replier.user.id },
    ]);
    return room;
  };
  const createReply = (roomId: string, replyRowKey: string) =>
    createUserMessage(mockContext.db, replier, { files: [], message, replyRowKey, roomId, type: MessageType.Message });

  // Discord notifies you when someone replies to your message, so the root's author follows their own thread
  // The moment it becomes one — otherwise the thread pipeline reaches everyone who replied and never the one
  // Person the thread belongs to
  test("a reply follows the thread for the root's author as well as the replier", async () => {
    expect.hasAssertions();

    const room = await createRoom();
    const root = await createUserMessage(mockContext.db, rootAuthor, {
      files: [],
      message,
      roomId: room.id,
      type: MessageType.Message,
    });
    await createReply(room.id, root.rowKey);
    const rootAuthorFollows = await readFollowedThreadRootRowKeys(mockContext.db, room.id, rootAuthor.user.id);
    const replierFollows = await readFollowedThreadRootRowKeys(mockContext.db, room.id, replier.user.id);

    expect(rootAuthorFollows).toStrictEqual([root.rowKey]);
    expect(replierFollows).toStrictEqual([root.rowKey]);
  });

  // The root author's follow is the one nobody performs themselves, so it is the one that can undo a decision
  // They did make. Their unfollow is recorded rather than deleted precisely so the next reply by somebody else
  // Finds it — otherwise the bell can never be turned off on your own thread while anyone keeps replying
  test("a reply does not re-follow a root author who unfollowed", async () => {
    expect.hasAssertions();

    const room = await createRoom();
    const root = await createUserMessage(mockContext.db, rootAuthor, {
      files: [],
      message,
      roomId: room.id,
      type: MessageType.Message,
    });
    await createReply(room.id, root.rowKey);
    await createThreadUnfollow(mockContext.db, {
      roomId: room.id,
      threadRootRowKey: root.rowKey,
      userId: rootAuthor.user.id,
    });
    await createReply(room.id, root.rowKey);
    const rootAuthorFollows = await readFollowedThreadRootRowKeys(mockContext.db, room.id, rootAuthor.user.id);

    expect(rootAuthorFollows).toStrictEqual([]);
    // The bell still turns it back on: that IS the author's own decision, so it clears what they recorded
    await createThreadFollow(
      mockContext.db,
      { roomId: room.id, threadRootRowKey: root.rowKey, userId: rootAuthor.user.id },
      true,
    );

    await expect(readFollowedThreadRootRowKeys(mockContext.db, room.id, rootAuthor.user.id)).resolves.toStrictEqual([
      root.rowKey,
    ]);
  });

  // A webhook message has no author at all, and the follow row's userId is NOT NULL — so the root-author follow
  // Is guarded on the id existing rather than on the root having been read
  test("a reply to a webhook root follows only the replier", async () => {
    expect.hasAssertions();

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(noop);
    const room = await createRoom();
    const messageClient = await useTableClient(AzureTable.Messages);
    const messageAscendingClient = await useTableClient(AzureTable.MessagesAscending);
    const root = await createMessage(messageClient, messageAscendingClient, {
      appUser: { id: crypto.randomUUID() },
      message,
      roomId: room.id,
      type: MessageType.Webhook,
    });
    await createReply(room.id, root.rowKey);
    const replierFollows = await readFollowedThreadRootRowKeys(mockContext.db, room.id, replier.user.id);

    expect(replierFollows).toStrictEqual([root.rowKey]);
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
