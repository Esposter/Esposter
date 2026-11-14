import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "#server/trpc";
import { mockSessionOnce } from "#server/trpc/context.test";
import { scheduledMessageJobRouter } from "#server/trpc/routers/message/scheduledMessageJob";
import { setupRoomSuite } from "#server/trpc/routers/setupRoomSuite.test";
import { scheduledMessageJobsInMessage, ScheduledMessageJobType } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

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

  // Every tombstone here is stamped from `new Date()`, so a frozen clock makes them exactly assertable
  beforeEach(() => {
    vi.useFakeTimers({ now: 0 });
    roomId = getRoomId();
  });

  afterEach(async () => {
    vi.useRealTimers();
    await mockContext.db.delete(scheduledMessageJobsInMessage);
  });

  test("schedules reminder", async () => {
    expect.hasAssertions();

    const scheduledMessageJob = await scheduledMessageJobCaller.scheduleReminder({ roomId, runAt, text });

    expect(scheduledMessageJob.roomId).toBe(roomId);
    expect(scheduledMessageJob.payload).toStrictEqual({ text, type: ScheduledMessageJobType.Reminder });
  });

  test("reads my scheduled jobs", async () => {
    expect.hasAssertions();

    const scheduledMessageJob = await scheduledMessageJobCaller.scheduleReminder({ roomId, runAt, text });
    const scheduledMessageJobs = await scheduledMessageJobCaller.readMyScheduledMessageJobs();
    const myScheduledMessageJob = takeOne(scheduledMessageJobs.items);

    expect(scheduledMessageJobs.items).toHaveLength(1);
    expect(myScheduledMessageJob.id).toBe(scheduledMessageJob.id);
    expect(myScheduledMessageJob.room.id).toBe(roomId);
  });

  test("reads my scheduled jobs count", async () => {
    expect.hasAssertions();

    await scheduledMessageJobCaller.scheduleReminder({ roomId, runAt, text });
    const scheduledMessageJobCount = await scheduledMessageJobCaller.readMyScheduledMessageJobsCount();

    expect(scheduledMessageJobCount).toBe(1);
  });

  test("excludes other users from readMyScheduledMessageJobs", async () => {
    expect.hasAssertions();

    await scheduledMessageJobCaller.scheduleReminder({ roomId, runAt, text });
    const { user } = await mockSessionOnce(mockContext.db);
    const scheduledMessageJobs = await scheduledMessageJobCaller.readMyScheduledMessageJobs();
    await mockSessionOnce(mockContext.db, user);
    const scheduledMessageJobCount = await scheduledMessageJobCaller.readMyScheduledMessageJobsCount();

    expect(scheduledMessageJobs.items).toStrictEqual([]);
    expect(scheduledMessageJobCount).toBe(0);
  });

  test("cancels scheduled job", async () => {
    expect.hasAssertions();

    const scheduledMessageJob = await scheduledMessageJobCaller.scheduleReminder({ roomId, runAt, text });
    const cancelledScheduledMessageJob = await scheduledMessageJobCaller.cancelScheduledMessageJob({
      id: scheduledMessageJob.id,
    });
    const scheduledMessageJobCount = await scheduledMessageJobCaller.readMyScheduledMessageJobsCount();

    expect(cancelledScheduledMessageJob.id).toBe(scheduledMessageJob.id);
    expect(cancelledScheduledMessageJob.cancelledAt).toStrictEqual(new Date(0));
    expect(scheduledMessageJobCount).toBe(0);
  });

  test("excludes completed jobs from readMyScheduledMessageJobs", async () => {
    expect.hasAssertions();

    const scheduledMessageJob = await scheduledMessageJobCaller.scheduleReminder({ roomId, runAt, text });
    await mockContext.db
      .update(scheduledMessageJobsInMessage)
      .set({ completedAt: new Date() })
      .where(eq(scheduledMessageJobsInMessage.id, scheduledMessageJob.id));
    const scheduledMessageJobs = await scheduledMessageJobCaller.readMyScheduledMessageJobs();

    expect(scheduledMessageJobs.items).toStrictEqual([]);
  });

  test("fails to cancel another user's scheduled job", async () => {
    expect.hasAssertions();

    const scheduledMessageJob = await scheduledMessageJobCaller.scheduleReminder({ roomId, runAt, text });
    await mockSessionOnce(mockContext.db);

    await expect(
      scheduledMessageJobCaller.cancelScheduledMessageJob({ id: scheduledMessageJob.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Update, name: ScheduledMessageJob, ${scheduledMessageJob.id}]`,
    );
  });

  test("fails to schedule a reminder as non-member", async () => {
    expect.hasAssertions();

    await mockSessionOnce(mockContext.db);

    await expect(
      scheduledMessageJobCaller.scheduleReminder({ roomId, runAt, text }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });
});
