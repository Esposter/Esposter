import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { rooms } from "#shared/db/schema/rooms";
import { MockTableClientMap } from "@@/server/composables/azure/useTableClient.test";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { messageRouter } from "@@/server/trpc/routers/message";
import { roomRouter } from "@@/server/trpc/routers/room";
import { NIL } from "@esposter/shared";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("message", () => {
  let messageCaller: DecorateRouterRecord<TRPCRouter["message"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  let mockContext: Context;
  const name = "name";
  const message = "message";

  beforeAll(async () => {
    const createRoomCaller = createCallerFactory(roomRouter);
    const createMessageCaller = createCallerFactory(messageRouter);
    mockContext = await createMockContext();
    roomCaller = createRoomCaller(mockContext);
    messageCaller = createMessageCaller(mockContext);
  });

  afterEach(async () => {
    MockTableClientMap.clear();
    await mockContext.db.delete(rooms);
  });

  test("creates", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });

    expect(newMessage.message).toBe(message);
  });

  test("reads empty messages", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const readMessages = await messageCaller.readMessages({ roomId: newRoom.id });

    expect(readMessages).toStrictEqual(getCursorPaginationData([], 0, []));
  });

  test("fails read messages with non-existent room id", async () => {
    expect.hasAssertions();

    await expect(messageCaller.readMessages({ roomId: NIL })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Room is not found for id: 00000000-0000-0000-0000-000000000000]`,
    );
  });
});
