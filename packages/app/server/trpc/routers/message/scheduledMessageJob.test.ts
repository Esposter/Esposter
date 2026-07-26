// @vitest-environment nuxt
import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { mockSessionOnce } from "@@/server/trpc/context.test";
import { scheduledMessageJobRouter } from "@@/server/trpc/routers/message/scheduledMessageJob";
import { setupRoomSuite } from "@@/server/trpc/routers/setupRoomSuite.test";
import {
  AzureTable,
  roomFiltersInMessage,
  scheduledMessageJobsInMessage,
  ScheduledMessageJobType,
  WordFilterAction,
} from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { MockTableDatabase } from "azure-mock";
import { eq } from "drizzle-orm";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

// Send-now checks the guards, claims the job, then `createUserMessage` checks them again — a filter arriving in
// That gap is the only way the second check can reject where the first passed, and no caller can land one there.
// So the seam itself is the hook: a one-shot callback runs after a guard pass, and the real guard runs again
const { onAssertCanCreateMessage } = vi.hoisted(() => ({
  onAssertCanCreateMessage: {} as { current?: () => Promise<void> },
}));

vi.mock(import("@@/server/services/message/moderation/assertCanCreateMessage"), async (importOriginal) => {
  const { assertCanCreateMessage } = await importOriginal();
  return {
    assertCanCreateMessage: async (...args: Parameters<typeof assertCanCreateMessage>) => {
      await assertCanCreateMessage(...args);
      const callback = onAssertCanCreateMessage.current;
      onAssertCanCreateMessage.current = undefined;
      if (callback) await callback();
    },
  };
});

describe("scheduledMessageJob", () => {
  const { createMember, getMockContext, getRoomCaller, getRoomId } = setupRoomSuite();
  let mockContext: Context;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  let scheduledMessageJobCaller: DecorateRouterRecord<TRPCRouter["message"]["scheduledMessageJob"]>;
  let roomId: string;
  const message = "message";
  const text = "text";
  const runAt = new Date("1970-01-01");

  beforeAll(() => {
    mockContext = getMockContext();
    roomCaller = getRoomCaller();
    scheduledMessageJobCaller = createCallerFactory(scheduledMessageJobRouter)(mockContext);
  });

  beforeEach(() => {
    roomId = getRoomId();
  });

  afterEach(async () => {
    onAssertCanCreateMessage.current = undefined;
    MockTableDatabase.clear();
    await mockContext.db.delete(roomFiltersInMessage);
    await mockContext.db.delete(scheduledMessageJobsInMessage);
  });

  test("schedules reminder", async () => {
    expect.hasAssertions();

    const scheduledMessageJob = await scheduledMessageJobCaller.scheduleReminder({ roomId, runAt, text });

    expect(scheduledMessageJob.roomId).toBe(roomId);
    expect(scheduledMessageJob.payload).toStrictEqual({ text, type: ScheduledMessageJobType.Reminder });
  });

  test("schedules message", async () => {
    expect.hasAssertions();

    const scheduledMessageJob = await scheduledMessageJobCaller.scheduleMessage({ message, roomId, runAt });

    expect(scheduledMessageJob.roomId).toBe(roomId);
    expect(scheduledMessageJob.payload).toStrictEqual({ message, type: ScheduledMessageJobType.ScheduledMessage });
  });

  test("reads scheduled jobs", async () => {
    expect.hasAssertions();

    const scheduledMessageJob = await scheduledMessageJobCaller.scheduleReminder({ roomId, runAt, text });
    const scheduledMessageJobs = await scheduledMessageJobCaller.readScheduledJobs({ roomId });

    expect(scheduledMessageJobs).toHaveLength(1);
    expect(takeOne(scheduledMessageJobs).id).toBe(scheduledMessageJob.id);
  });

  test("reads my scheduled jobs", async () => {
    expect.hasAssertions();

    const scheduledMessageJob = await scheduledMessageJobCaller.scheduleReminder({ roomId, runAt, text });
    const scheduledMessageJobs = await scheduledMessageJobCaller.readMyScheduledJobs();

    expect(scheduledMessageJobs.items).toHaveLength(1);
    expect(scheduledMessageJobs.hasMore).toBe(false);
    expect(takeOne(scheduledMessageJobs.items).id).toBe(scheduledMessageJob.id);
    expect(takeOne(scheduledMessageJobs.items).room.id).toBe(roomId);
  });

  test("reads my scheduled jobs count", async () => {
    expect.hasAssertions();

    await scheduledMessageJobCaller.scheduleReminder({ roomId, runAt, text });
    const scheduledMessageJobCount = await scheduledMessageJobCaller.readMyScheduledJobsCount();

    expect(scheduledMessageJobCount).toBe(1);
  });

  test("excludes other users from readMyScheduledJobs", async () => {
    expect.hasAssertions();

    await scheduledMessageJobCaller.scheduleReminder({ roomId, runAt, text });
    const { user } = await mockSessionOnce(mockContext.db);
    const scheduledMessageJobs = await scheduledMessageJobCaller.readMyScheduledJobs();
    await mockSessionOnce(mockContext.db, user);
    const scheduledMessageJobCount = await scheduledMessageJobCaller.readMyScheduledJobsCount();

    expect(scheduledMessageJobs.items).toStrictEqual([]);
    expect(scheduledMessageJobs.hasMore).toBe(false);
    expect(scheduledMessageJobCount).toBe(0);
  });

  test("cancels scheduled job", async () => {
    expect.hasAssertions();

    const scheduledMessageJob = await scheduledMessageJobCaller.scheduleReminder({ roomId, runAt, text });
    const cancelledScheduledMessageJob = await scheduledMessageJobCaller.cancelScheduledJob({
      id: scheduledMessageJob.id,
    });
    const scheduledMessageJobs = await scheduledMessageJobCaller.readScheduledJobs({ roomId });

    expect(cancelledScheduledMessageJob.id).toBe(scheduledMessageJob.id);
    expect(cancelledScheduledMessageJob.cancelledAt).toBeInstanceOf(Date);
    expect(scheduledMessageJobs).toStrictEqual([]);
  });

  test("excludes completed jobs from readScheduledJobs", async () => {
    expect.hasAssertions();

    const scheduledMessageJob = await scheduledMessageJobCaller.scheduleReminder({ roomId, runAt, text });
    await mockContext.db
      .update(scheduledMessageJobsInMessage)
      .set({ completedAt: new Date() })
      .where(eq(scheduledMessageJobsInMessage.id, scheduledMessageJob.id));
    const scheduledMessageJobs = await scheduledMessageJobCaller.readScheduledJobs({ roomId });

    expect(scheduledMessageJobs).toStrictEqual([]);
  });

  test("fails to cancel another user's scheduled job", async () => {
    expect.hasAssertions();

    const scheduledMessageJob = await scheduledMessageJobCaller.scheduleReminder({ roomId, runAt, text });
    await mockSessionOnce(mockContext.db);

    await expect(
      scheduledMessageJobCaller.cancelScheduledJob({ id: scheduledMessageJob.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Update, name: ScheduledMessageJob, ${scheduledMessageJob.id}]`,
    );
  });

  test("fails to schedule reminder as non-member", async () => {
    expect.hasAssertions();

    await mockSessionOnce(mockContext.db);

    await expect(
      scheduledMessageJobCaller.scheduleReminder({ roomId, runAt, text }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("fails to schedule message as non-member", async () => {
    expect.hasAssertions();

    await mockSessionOnce(mockContext.db);

    await expect(
      scheduledMessageJobCaller.scheduleMessage({ message, roomId, runAt }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("fails send scheduled message now with read-only room", async () => {
    expect.hasAssertions();

    const member = await createMember();
    await mockSessionOnce(mockContext.db, member);
    const scheduledMessageJob = await scheduledMessageJobCaller.scheduleMessage({ message, roomId, runAt });
    await roomCaller.updateRoom({ id: roomId, isReadOnly: true });
    await mockSessionOnce(mockContext.db, member);

    await expect(
      scheduledMessageJobCaller.sendScheduledMessageNow({ id: scheduledMessageJob.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: FORBIDDEN]`);

    await mockSessionOnce(mockContext.db, member);
    const scheduledMessageJobCount = await scheduledMessageJobCaller.readMyScheduledJobsCount();

    expect(scheduledMessageJobCount).toBe(1);
  });

  // The two features that meet here shipped separately: guards run before the claim so a rejection leaves the
  // Job schedulable, and the word-filter guard applies the room's automod action. Only the word filter is
  // Non-idempotent, so it is the one rejection that must burn the job — a job left scheduled hands the worker
  // The same block at runAt, and the user serves a second timeout and a second audit row for one message
  test("burns the job when send scheduled message now is word filtered", async () => {
    expect.hasAssertions();

    const member = await createMember();
    await mockSessionOnce(mockContext.db, member);
    const scheduledMessageJob = await scheduledMessageJobCaller.scheduleMessage({ message, roomId, runAt });
    // The filter arrives after the job is scheduled — the only way a stored message can be blocked at delivery
    await mockContext.db.insert(roomFiltersInMessage).values({
      action: WordFilterAction.Timeout,
      roomId,
      timeoutDurationMs: 1,
      words: [message],
    });
    await mockSessionOnce(mockContext.db, member);

    await expect(
      scheduledMessageJobCaller.sendScheduledMessageNow({ id: scheduledMessageJob.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: Message contains blocked content.]`);

    const timedOutMembership = await mockContext.db.query.usersToRoomsInMessage.findFirst({
      columns: { timeoutUntil: true },
      where: { roomId: { eq: roomId }, userId: { eq: member.id } },
    });

    expect(timedOutMembership?.timeoutUntil).not.toBeNull();

    await mockSessionOnce(mockContext.db, member);
    const scheduledMessageJobCount = await scheduledMessageJobCaller.readMyScheduledJobsCount();

    expect(scheduledMessageJobCount).toBe(0);
  });

  // The same non-idempotence, one guard deeper: `createUserMessage` re-checks, so a filter that arrives after the
  // Pre-check passed is applied there instead. Rescheduling that rejection is the same double punishment the
  // Pre-check burns the job to avoid — the worker would trip the filter again at runAt
  test("burns the job when send scheduled message now is word filtered after the claim", async () => {
    expect.hasAssertions();

    const member = await createMember();
    await mockSessionOnce(mockContext.db, member);
    const scheduledMessageJob = await scheduledMessageJobCaller.scheduleMessage({ message, roomId, runAt });
    await mockSessionOnce(mockContext.db, member);
    onAssertCanCreateMessage.current = async () => {
      await mockContext.db.insert(roomFiltersInMessage).values({
        action: WordFilterAction.Timeout,
        roomId,
        timeoutDurationMs: 1,
        words: [message],
      });
    };

    await expect(
      scheduledMessageJobCaller.sendScheduledMessageNow({ id: scheduledMessageJob.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: Message contains blocked content.]`);

    await mockSessionOnce(mockContext.db, member);
    const scheduledMessageJobCount = await scheduledMessageJobCaller.readMyScheduledJobsCount();

    expect(scheduledMessageJobCount).toBe(0);
  });

  test("fails send scheduled message now with job claimed for delivery", async () => {
    expect.hasAssertions();

    const scheduledMessageJob = await scheduledMessageJobCaller.scheduleMessage({ message, roomId, runAt });
    await mockContext.db
      .update(scheduledMessageJobsInMessage)
      .set({ processingStartedAt: new Date() })
      .where(eq(scheduledMessageJobsInMessage.id, scheduledMessageJob.id));

    await expect(
      scheduledMessageJobCaller.sendScheduledMessageNow({ id: scheduledMessageJob.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Update, name: ScheduledMessageJob, ${scheduledMessageJob.id}]`,
    );

    expect(MockTableDatabase.get(AzureTable.Messages)).toBeUndefined();
  });

  test("fails read scheduled jobs with non-member", async () => {
    expect.hasAssertions();

    await mockSessionOnce(mockContext.db);

    await expect(scheduledMessageJobCaller.readScheduledJobs({ roomId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });
});
