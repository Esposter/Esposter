import type { useRoomObject } from "#server/composables/realtime/useRoomObject";
import type { useUserObject } from "#server/composables/realtime/useUserObject";
import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers";
import type { RoomObjectRpc, UserObjectRpc } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "#server/trpc";
import { getMockSession, mockSessionOnce } from "#server/trpc/context.test";
import { scheduledMessageJobRouter } from "#server/trpc/routers/message/scheduledMessageJob";
import { setupRoomSuite } from "#server/trpc/routers/setupRoomSuite.test";
import { ScheduledMessageJobType } from "@esposter/db-schema";
import { v7 } from "uuid";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

// The person's object and the room's are programmable: each RPC the router reaches is a typed fake a test sets, so the
// router's reads and writes are checked through them rather than through a Durable Object that does not run here
const { roomObject, useRoomObjectMock, userObject, useUserObjectMock } = vi.hoisted(() => {
  const roomObject = { deleteScheduledMessage: vi.fn<RoomObjectRpc["deleteScheduledMessage"]>() };
  const userObject = {
    addReminder: vi.fn<UserObjectRpc["addReminder"]>(),
    readReminders: vi.fn<UserObjectRpc["readReminders"]>(),
    readScheduledMessages: vi.fn<UserObjectRpc["readScheduledMessages"]>(),
    removeReminder: vi.fn<UserObjectRpc["removeReminder"]>(),
  };
  return {
    roomObject,
    useRoomObjectMock: vi.fn(() => roomObject),
    userObject,
    useUserObjectMock: vi.fn(() => userObject),
  };
});

// The stub a Worker hands out is typed by the binding, which the web app types by no RPC, so the fake answers as the stub
// it stands in for
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
    expect(reminder).toStrictEqual({ id: expect.any(String), roomId, runAt, text });
  });

  test("reads my scheduled jobs as reminders, joined to the room they were set in", async () => {
    expect.hasAssertions();

    const reminder = await scheduledMessageJobCaller.scheduleReminder({ roomId, runAt, text });
    userObject.readReminders.mockResolvedValue([reminder]);
    const scheduledMessageJobs = await scheduledMessageJobCaller.readMyScheduledMessageJobs();

    expect(scheduledMessageJobs.items).toStrictEqual([
      {
        id: reminder.id,
        payload: { text, type: ScheduledMessageJobType.Reminder },
        room: expect.objectContaining({ id: roomId }),
        roomId,
        runAt,
      },
    ]);
  });

  test("counts my reminders and scheduled messages together", async () => {
    expect.hasAssertions();

    const reminder = await scheduledMessageJobCaller.scheduleReminder({ roomId, runAt, text });
    userObject.readReminders.mockResolvedValue([reminder]);
    userObject.readScheduledMessages.mockResolvedValue([{ roomId, runAt, scheduledId: v7() }]);
    const scheduledMessageJobCount = await scheduledMessageJobCaller.readMyScheduledMessageJobsCount();

    expect(scheduledMessageJobCount).toBe(2);
  });

  test("cancels a reminder in the person's own object without asking its room", async () => {
    expect.hasAssertions();

    userObject.removeReminder.mockResolvedValue(true);
    await scheduledMessageJobCaller.cancelScheduledMessageJob({ id: v7(), roomId });

    expect(userObject.removeReminder).toHaveBeenCalledExactlyOnceWith(expect.any(String));
    expect(roomObject.deleteScheduledMessage).not.toHaveBeenCalled();
  });

  test("cancels a scheduled message in its room when no reminder has the id", async () => {
    expect.hasAssertions();

    const id = v7();
    userObject.removeReminder.mockResolvedValue(false);
    roomObject.deleteScheduledMessage.mockResolvedValue(true);
    await scheduledMessageJobCaller.cancelScheduledMessageJob({ id, roomId });

    expect(roomObject.deleteScheduledMessage).toHaveBeenCalledExactlyOnceWith(
      id,
      expect.objectContaining({ userId: getMockSession().user.id }),
    );
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

    await mockSessionOnce(mockContext.db);

    await expect(
      scheduledMessageJobCaller.scheduleReminder({ roomId, runAt, text }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
    expect(userObject.addReminder).not.toHaveBeenCalled();
  });
});
