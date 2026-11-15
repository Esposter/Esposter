import type { useRoomObject } from "#server/composables/realtime/useRoomObject";
import type { useUserObject } from "#server/composables/realtime/useUserObject";
import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers/index";
import type { RoomObjectRpc, UserObjectRpc } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createMockAuthSession, createMockContext, getMockSession } from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";
import { scheduledMessageJobRouter } from "#server/trpc/routers/message/scheduledMessageJob";
import { setupRoomSuite } from "#server/trpc/routers/setupRoomSuite.test";
import { encodePageCursor, ScheduledMessageJobType, usersToRoomsInMessage } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { and, eq } from "drizzle-orm";
import { v7 } from "uuid";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

// The person's object and the room's are programmable: each RPC the router reaches is a typed fake a test sets, so the
// Router's reads and writes are checked through them rather than through a Durable Object that does not run here
const { roomObject, userObject, useRoomObjectMock, useUserObjectMock } = vi.hoisted(() => {
  const roomFake = {
    deleteScheduledMessage: vi.fn<RoomObjectRpc["deleteScheduledMessage"]>(),
    readScheduledMessages: vi.fn<RoomObjectRpc["readScheduledMessages"]>(),
  };
  const userFake = {
    addJoinedCall: vi.fn<UserObjectRpc["addJoinedCall"]>(),
    addReminder: vi.fn<UserObjectRpc["addReminder"]>(),
    countScheduledMessageJobs: vi.fn<UserObjectRpc["countScheduledMessageJobs"]>(),
    readJoinedCallIds: vi.fn<UserObjectRpc["readJoinedCallIds"]>(),
    readReminders: vi.fn<UserObjectRpc["readReminders"]>(),
    readScheduledMessages: vi.fn<UserObjectRpc["readScheduledMessages"]>(),
    removeJoinedCall: vi.fn<UserObjectRpc["removeJoinedCall"]>(),
    removeReminder: vi.fn<UserObjectRpc["removeReminder"]>(),
    removeScheduledMessage: vi.fn<UserObjectRpc["removeScheduledMessage"]>(),
  };
  return {
    roomObject: roomFake,
    userObject: userFake,
    useRoomObjectMock: vi.fn<(roomId: string) => typeof roomFake>(() => roomFake),
    useUserObjectMock: vi.fn<(userId: string) => typeof userFake>(() => userFake),
  };
});

// The stub a Worker hands out is typed by the binding, which the web app types by no RPC, so the fake answers as the stub
// It stands in for
vi.mock(import("#server/composables/realtime/useRoomObject"), () => ({
  useRoomObject: (roomId: string) => useRoomObjectMock(roomId) as unknown as ReturnType<typeof useRoomObject>,
}));
vi.mock(import("#server/composables/realtime/useUserObject"), () => ({
  useUserObject: (userId: string) => useUserObjectMock(userId) as unknown as ReturnType<typeof useUserObject>,
}));

describe("scheduledMessageJobRouter", () => {
  const { getMockContext, getRoomId } = setupRoomSuite();
  let mockContext: Context;
  let scheduledMessageJobCaller: DecorateRouterRecord<TRPCRouter["message"]["scheduledMessageJob"]>;
  let roomId: string;
  const text = "text";
  const runAt = new Date(0);

  beforeAll(() => {
    mockContext = getMockContext();
    scheduledMessageJobCaller = createCallerFactory(scheduledMessageJobRouter)(mockContext);
  });

  beforeEach(() => {
    roomId = getRoomId();
    userObject.readReminders.mockResolvedValue([]);
    userObject.readScheduledMessages.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("schedules a reminder in the person's own object", async () => {
    expect.hasAssertions();

    const reminder = await scheduledMessageJobCaller.scheduleReminder({ roomId, runAt, text });

    expect(useUserObjectMock).toHaveBeenCalledExactlyOnceWith(getMockSession().user.id);
    expect(userObject.addReminder).toHaveBeenCalledExactlyOnceWith(reminder);
    expect(reminder).toStrictEqual({ id: reminder.id, roomId, runAt, text });
    expect(reminder.id).toBeTypeOf("string");
  });

  test("reads my scheduled jobs as reminders, joined to the room they were set in", async () => {
    expect.hasAssertions();

    const reminder = await scheduledMessageJobCaller.scheduleReminder({ roomId, runAt, text });
    userObject.readReminders.mockResolvedValue([reminder]);
    const scheduledMessageJobs = await scheduledMessageJobCaller.readMyScheduledMessageJobs();

    const scheduledMessageJob = takeOne(scheduledMessageJobs.items);
    expect(scheduledMessageJob.room.id).toBe(roomId);
    expect(scheduledMessageJob).toStrictEqual({
      id: reminder.id,
      payload: { text, type: ScheduledMessageJobType.Reminder },
      room: scheduledMessageJob.room,
      roomId,
      runAt,
    });
  });

  test("counts my reminders and scheduled messages together, in the person's object", async () => {
    expect.hasAssertions();

    userObject.countScheduledMessageJobs.mockResolvedValue(2);
    const scheduledMessageJobCount = await scheduledMessageJobCaller.readMyScheduledMessageJobsCount();

    expect(userObject.countScheduledMessageJobs).toHaveBeenCalledExactlyOnceWith();
    expect(scheduledMessageJobCount).toBe(2);
  });

  // The person's reminders and scheduled messages are one list, soonest first. Each kind is read from its own keyset, and a
  // Scheduled message's text is read from its room for the page alone
  test("merges my reminders and scheduled messages soonest first, reading the page's messages from their rooms", async () => {
    expect.hasAssertions();

    const scheduledMessageId = v7();
    const soonerRunAt = new Date(0);
    const laterRunAt = new Date(1);
    const reminder = { id: v7(), roomId, runAt: laterRunAt, text };
    userObject.readReminders.mockResolvedValue([reminder]);
    userObject.readScheduledMessages.mockResolvedValue([{ id: scheduledMessageId, roomId, runAt: soonerRunAt }]);
    roomObject.readScheduledMessages.mockResolvedValue([
      { id: scheduledMessageId, message: "later", replyToId: null, runAt: soonerRunAt, userId: v7() },
    ]);
    const { items, nextCursor } = await scheduledMessageJobCaller.readMyScheduledMessageJobs({ limit: 1 });

    expect(roomObject.readScheduledMessages).toHaveBeenCalledExactlyOnceWith({
      ids: [scheduledMessageId],
      userId: getMockSession().user.id,
    });
    expect(items.map(({ id, payload }) => [id, payload.type])).toStrictEqual([
      [scheduledMessageId, ScheduledMessageJobType.ScheduledMessage],
    ]);
    expect(nextCursor).toBe(encodePageCursor({ isBackward: false, values: [0, scheduledMessageId] }));
  });

  // A scheduled message stays in its room after the person leaves it, and the room is not asked for it once they have
  test("leaves out a scheduled message in a room I have left, and asks that room for nothing", async () => {
    expect.hasAssertions();

    userObject.readScheduledMessages.mockResolvedValue([{ id: v7(), roomId, runAt }]);
    await mockContext.db
      .delete(usersToRoomsInMessage)
      .where(and(eq(usersToRoomsInMessage.roomId, roomId), eq(usersToRoomsInMessage.userId, getMockSession().user.id)));
    const { items } = await scheduledMessageJobCaller.readMyScheduledMessageJobs({ limit: 10 });

    expect(items).toStrictEqual([]);
    expect(roomObject.readScheduledMessages).not.toHaveBeenCalled();
  });

  // The index names a scheduled message its room no longer holds only when its send or cancel missed the index, so the
  // Read removes the stale row and lists none of it
  test("prunes from my index a scheduled message its room no longer holds, and lists none of it", async () => {
    expect.hasAssertions();

    const id = v7();
    userObject.readScheduledMessages.mockResolvedValue([{ id, roomId, runAt }]);
    roomObject.readScheduledMessages.mockResolvedValue([]);
    const { items } = await scheduledMessageJobCaller.readMyScheduledMessageJobs({ limit: 10 });

    expect(items).toStrictEqual([]);
    expect(userObject.removeScheduledMessage).toHaveBeenCalledExactlyOnceWith(id);
  });

  test("cancels a reminder in the person's own object without asking its room", async () => {
    expect.hasAssertions();

    const id = v7();
    userObject.removeReminder.mockResolvedValue(true);
    await scheduledMessageJobCaller.cancelScheduledMessageJob({ id, roomId });

    expect(userObject.removeReminder).toHaveBeenCalledExactlyOnceWith(id);
    expect(roomObject.deleteScheduledMessage).not.toHaveBeenCalled();
  });

  test("cancels a scheduled message in its room when no reminder has the id", async () => {
    expect.hasAssertions();

    const id = v7();
    userObject.removeReminder.mockResolvedValue(false);
    roomObject.deleteScheduledMessage.mockResolvedValue(true);
    await scheduledMessageJobCaller.cancelScheduledMessageJob({ id, roomId });

    expect(roomObject.deleteScheduledMessage).toHaveBeenCalledExactlyOnceWith(id, { userId: getMockSession().user.id });
  });

  test("fails to cancel what neither object holds", async () => {
    expect.hasAssertions();

    const id = v7();
    userObject.removeReminder.mockResolvedValue(false);
    roomObject.deleteScheduledMessage.mockResolvedValue(false);

    await expect(
      scheduledMessageJobCaller.cancelScheduledMessageJob({ id, roomId }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: ScheduledMessageJob is not found for id: ${id}]`);
  });

  test("fails to schedule a reminder as non-member", async () => {
    expect.hasAssertions();

    const nonMemberAuthSession = await createMockAuthSession(mockContext.db);
    const nonMemberScheduledMessageJobCaller = createCallerFactory(scheduledMessageJobRouter)(
      await createMockContext(nonMemberAuthSession),
    );

    await expect(
      nonMemberScheduledMessageJobCaller.scheduleReminder({ roomId, runAt, text }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
    expect(userObject.addReminder).not.toHaveBeenCalled();
  });
});
