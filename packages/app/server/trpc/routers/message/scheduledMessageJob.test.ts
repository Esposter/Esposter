// @vitest-environment nuxt

import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { scheduledMessageJobRouter } from "@@/server/trpc/routers/message/scheduledMessageJob";
import { roomRouter } from "@@/server/trpc/routers/room";
import { roomsInMessage, scheduledMessageJobsInMessage, ScheduledMessageJobType } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("scheduledMessageJob", () => {
  let mockContext: Context;
  let scheduledMessageJobCaller: DecorateRouterRecord<TRPCRouter["message"]["scheduledMessageJob"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  const name = "name";
  const message = "message";
  const text = "text";
  const runAt = new Date("1970-01-01");

  beforeAll(async () => {
    mockContext = await createMockContext();
    scheduledMessageJobCaller = createCallerFactory(scheduledMessageJobRouter)(mockContext);
    roomCaller = createCallerFactory(roomRouter)(mockContext);
  });

  afterEach(async () => {
    await mockContext.db.delete(scheduledMessageJobsInMessage);
    await mockContext.db.delete(roomsInMessage);
  });

  test("schedules reminder", async () => {
    expect.hasAssertions();

    const room = await roomCaller.createRoom({ name });
    const scheduledMessageJob = await scheduledMessageJobCaller.scheduleReminder({ roomId: room.id, runAt, text });

    expect(scheduledMessageJob.roomId).toBe(room.id);
    expect(scheduledMessageJob.payload).toStrictEqual({ text, type: ScheduledMessageJobType.Reminder });
  });

  test("schedules message", async () => {
    expect.hasAssertions();

    const room = await roomCaller.createRoom({ name });
    const scheduledMessageJob = await scheduledMessageJobCaller.scheduleMessage({ message, roomId: room.id, runAt });

    expect(scheduledMessageJob.roomId).toBe(room.id);
    expect(scheduledMessageJob.payload).toStrictEqual({ message, type: ScheduledMessageJobType.ScheduledMessage });
  });

  test("reads scheduled jobs", async () => {
    expect.hasAssertions();

    const room = await roomCaller.createRoom({ name });
    const scheduledMessageJob = await scheduledMessageJobCaller.scheduleReminder({ roomId: room.id, runAt, text });
    const scheduledMessageJobs = await scheduledMessageJobCaller.readScheduledJobs({ roomId: room.id });

    expect(scheduledMessageJobs).toHaveLength(1);
    expect(takeOne(scheduledMessageJobs).id).toBe(scheduledMessageJob.id);
  });

  test("reads my scheduled jobs", async () => {
    expect.hasAssertions();

    const room = await roomCaller.createRoom({ name });
    const scheduledMessageJob = await scheduledMessageJobCaller.scheduleReminder({ roomId: room.id, runAt, text });
    const scheduledMessageJobs = await scheduledMessageJobCaller.readMyScheduledJobs();

    expect(scheduledMessageJobs.items).toHaveLength(1);
    expect(scheduledMessageJobs.hasMore).toBe(false);
    expect(takeOne(scheduledMessageJobs.items).id).toBe(scheduledMessageJob.id);
    expect(takeOne(scheduledMessageJobs.items).room.id).toBe(room.id);
  });

  test("reads my scheduled jobs count", async () => {
    expect.hasAssertions();

    const room = await roomCaller.createRoom({ name });
    await scheduledMessageJobCaller.scheduleReminder({ roomId: room.id, runAt, text });
    const scheduledMessageJobCount = await scheduledMessageJobCaller.readMyScheduledJobsCount();

    expect(scheduledMessageJobCount).toBe(1);
  });

  test("excludes other users from readMyScheduledJobs", async () => {
    expect.hasAssertions();

    const room = await roomCaller.createRoom({ name });
    await scheduledMessageJobCaller.scheduleReminder({ roomId: room.id, runAt, text });
    await mockSessionOnce(mockContext.db);
    const scheduledMessageJobs = await scheduledMessageJobCaller.readMyScheduledJobs();
    const scheduledMessageJobCount = await scheduledMessageJobCaller.readMyScheduledJobsCount();

    expect(scheduledMessageJobs.items).toStrictEqual([]);
    expect(scheduledMessageJobs.hasMore).toBe(false);
    expect(scheduledMessageJobCount).toBe(0);
  });

  test("cancels scheduled job", async () => {
    expect.hasAssertions();

    const room = await roomCaller.createRoom({ name });
    const scheduledMessageJob = await scheduledMessageJobCaller.scheduleReminder({ roomId: room.id, runAt, text });
    const cancelledScheduledMessageJob = await scheduledMessageJobCaller.cancelScheduledJob({
      id: scheduledMessageJob.id,
    });
    const scheduledMessageJobs = await scheduledMessageJobCaller.readScheduledJobs({ roomId: room.id });

    expect(cancelledScheduledMessageJob.id).toBe(scheduledMessageJob.id);
    expect(cancelledScheduledMessageJob.cancelledAt).toBeInstanceOf(Date);
    expect(scheduledMessageJobs).toStrictEqual([]);
  });

  test("excludes completed jobs from readScheduledJobs", async () => {
    expect.hasAssertions();

    const room = await roomCaller.createRoom({ name });
    const scheduledMessageJob = await scheduledMessageJobCaller.scheduleReminder({ roomId: room.id, runAt, text });
    await mockContext.db
      .update(scheduledMessageJobsInMessage)
      .set({ completedAt: new Date() })
      .where(eq(scheduledMessageJobsInMessage.id, scheduledMessageJob.id));
    const scheduledMessageJobs = await scheduledMessageJobCaller.readScheduledJobs({ roomId: room.id });

    expect(scheduledMessageJobs).toStrictEqual([]);
  });

  test("fails to cancel another user's scheduled job", async () => {
    expect.hasAssertions();

    const room = await roomCaller.createRoom({ name });
    const scheduledMessageJob = await scheduledMessageJobCaller.scheduleReminder({ roomId: room.id, runAt, text });
    await mockSessionOnce(mockContext.db);

    await expect(
      scheduledMessageJobCaller.cancelScheduledJob({ id: scheduledMessageJob.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Update, name: ScheduledMessageJob, ${scheduledMessageJob.id}]`,
    );
  });

  test("fails to schedule reminder as non-member", async () => {
    expect.hasAssertions();

    const room = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(
      scheduledMessageJobCaller.scheduleReminder({ roomId: room.id, runAt, text }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("fails to schedule message as non-member", async () => {
    expect.hasAssertions();

    const room = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(
      scheduledMessageJobCaller.scheduleMessage({ message, roomId: room.id, runAt }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("fails read scheduled jobs with non-member", async () => {
    expect.hasAssertions();

    const room = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(
      scheduledMessageJobCaller.readScheduledJobs({ roomId: room.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });
});
