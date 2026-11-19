import type { useRoomObject } from "#server/composables/realtime/useRoomObject";
import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers/index";
import type { RoomObjectRpc } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { getMockSession } from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";
import { scheduledMessageRouter } from "#server/trpc/routers/message/scheduledMessage";
import { setupRoomSuite } from "#server/trpc/routers/setupRoomSuite.test";
import { DatabaseEntityType } from "@esposter/db-schema";
import { NotFoundError } from "@esposter/shared";
import { v7 } from "uuid";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

// The room's object is programmable: each RPC the router reaches is a typed fake a test sets, so the router's checks are
// Made through them rather than through a Durable Object that does not run here
const { roomObject, useRoomObjectMock } = vi.hoisted(() => {
  const roomFake = {
    createScheduledMessage: vi.fn<RoomObjectRpc["createScheduledMessage"]>(),
    deleteScheduledMessage: vi.fn<RoomObjectRpc["deleteScheduledMessage"]>(),
    readScheduledMessages: vi.fn<RoomObjectRpc["readScheduledMessages"]>(),
    updateScheduledMessage: vi.fn<RoomObjectRpc["updateScheduledMessage"]>(),
  };
  return { roomObject: roomFake, useRoomObjectMock: vi.fn<(roomId: string) => typeof roomFake>(() => roomFake) };
});

// The stub a Worker hands out is typed by the binding, which the web app types by no RPC, so the fake answers as the stub
// It stands in for
vi.mock(import("#server/composables/realtime/useRoomObject"), () => ({
  useRoomObject: (roomId: string) => useRoomObjectMock(roomId) as unknown as ReturnType<typeof useRoomObject>,
}));

describe("scheduledMessageRouter", () => {
  const { getMockContext, getRoomId } = setupRoomSuite();
  let mockContext: Context;
  let scheduledMessageCaller: DecorateRouterRecord<TRPCRouter["message"]["scheduledMessage"]>;
  let roomId: string;
  const message = "message";
  const runAt = new Date(0);

  beforeAll(() => {
    mockContext = getMockContext();
    scheduledMessageCaller = createCallerFactory(scheduledMessageRouter)(mockContext);
  });

  beforeEach(() => {
    roomId = getRoomId();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("schedules a message in its room's object", async () => {
    expect.hasAssertions();

    const scheduledMessage = { id: v7(), message, replyToId: null, runAt, userId: getMockSession().user.id };
    roomObject.createScheduledMessage.mockResolvedValue(scheduledMessage);

    await expect(
      scheduledMessageCaller.createScheduledMessage({ message, replyToId: null, roomId, runAt }),
    ).resolves.toStrictEqual(scheduledMessage);
  });

  test("updates a scheduled message in its room's object", async () => {
    expect.hasAssertions();

    const id = v7();
    const updatedMessage = { id, message, replyToId: null, runAt, userId: getMockSession().user.id };
    roomObject.updateScheduledMessage.mockResolvedValue(updatedMessage);

    await expect(
      scheduledMessageCaller.updateScheduledMessage({ id, message, replyToId: null, roomId, runAt }),
    ).resolves.toStrictEqual(updatedMessage);
  });

  test("deletes a scheduled message from its room's object", async () => {
    expect.hasAssertions();

    const id = v7();
    roomObject.deleteScheduledMessage.mockResolvedValue(true);

    await scheduledMessageCaller.deleteScheduledMessage({ id, roomId });

    expect(roomObject.deleteScheduledMessage).toHaveBeenCalledExactlyOnceWith(id, expect.anything());
  });

  test("fails to delete a scheduled message its room's object does not hold", async () => {
    expect.hasAssertions();

    const id = v7();
    roomObject.deleteScheduledMessage.mockResolvedValue(false);

    await expect(
      scheduledMessageCaller.deleteScheduledMessage({ id, roomId }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.ScheduledMessageJob, id).message}]`,
    );
  });

  test("fails to send a scheduled message its room's object does not hold", async () => {
    expect.hasAssertions();

    const id = v7();
    roomObject.readScheduledMessages.mockResolvedValue([]);

    await expect(
      scheduledMessageCaller.sendScheduledMessageNow({ id, roomId }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.ScheduledMessageJob, id).message}]`,
    );
  });
});
