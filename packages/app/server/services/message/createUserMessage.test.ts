import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { Context } from "@@/server/trpc/context";

import { createUserMessage } from "@@/server/services/message/createUserMessage";
import { readFollowedThreadRootRowKeys } from "@@/server/services/message/thread/readFollowedThreadRootRowKeys";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { MessageType, roomsInMessage, users, usersToRoomsInMessage } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { MockEventGridDatabase, MockTableDatabase } from "azure-mock";
import { eq } from "drizzle-orm";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";

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

  // Discord notifies you when someone replies to your message, so the root's author follows their own thread
  // The moment it becomes one — otherwise the thread pipeline reaches everyone who replied and never the one
  // Person the thread belongs to
  test("a reply follows the thread for the root's author as well as the replier", async () => {
    expect.hasAssertions();

    const room = takeOne(
      await mockContext.db.insert(roomsInMessage).values({ name, userId: rootAuthor.user.id }).returning(),
    );
    await mockContext.db.insert(usersToRoomsInMessage).values([
      { roomId: room.id, userId: rootAuthor.user.id },
      { roomId: room.id, userId: replier.user.id },
    ]);
    const root = await createUserMessage(mockContext.db, rootAuthor, {
      files: [],
      message,
      roomId: room.id,
      type: MessageType.Message,
    });
    await createUserMessage(mockContext.db, replier, {
      files: [],
      message,
      replyRowKey: root.rowKey,
      roomId: room.id,
      type: MessageType.Message,
    });
    const rootAuthorFollows = await readFollowedThreadRootRowKeys(mockContext.db, room.id, rootAuthor.user.id);
    const replierFollows = await readFollowedThreadRootRowKeys(mockContext.db, room.id, replier.user.id);

    expect(rootAuthorFollows).toStrictEqual([root.rowKey]);
    expect(replierFollows).toStrictEqual([root.rowKey]);
  });
});
