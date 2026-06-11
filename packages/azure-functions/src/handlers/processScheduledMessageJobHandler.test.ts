import type { relations, ScheduledMessageJobPayload } from "@esposter/db-schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { processScheduledMessageJobHandler } from "@/handlers/processScheduledMessageJobHandler";
import { InvocationContext } from "@azure/functions";
import { MAX_QUEUE_VISIBILITY_TIMEOUT_MS } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import {
  AzureQueue,
  AzureTable,
  roomsInMessage,
  scheduledMessageJobsInMessage,
  ScheduledMessageJobType,
  users,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { InvalidOperationError, takeOne } from "@esposter/shared";
import { MockQueueDatabase, MockTableDatabase } from "azure-mock";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: PostgresJsDatabase<typeof relations>;

vi.mock(import("@/services/db"), () => ({
  get db() {
    return mockDb;
  },
}));

vi.mock(import("@/services/getQueueClient"), () => import("@/services/getQueueClient.test"));
vi.mock(import("@/services/getTableClient"), () => import("@/services/getTableClient.test"));
vi.mock(import("@/services/getWebPubSubServiceClient"), () => import("@/services/getWebPubSubServiceClient.test"));
vi.mock(import("@/services/webpush"), () => import("@/services/webpush.test"));

describe(processScheduledMessageJobHandler, () => {
  const context = new InvocationContext({ logHandler: () => {} });
  const message = "message";
  const name = "name";
  const roomId = crypto.randomUUID();
  const text = "text";
  const userId = crypto.randomUUID();

  const insertJob = async (
    payload: ScheduledMessageJobPayload,
    overrides?: { cancelledAt?: Date; completedAt?: Date; runAt?: Date },
  ) =>
    takeOne(
      await mockDb
        .insert(scheduledMessageJobsInMessage)
        .values({ payload, roomId, runAt: new Date("1970-01-01"), userId, ...overrides })
        .returning(),
    );

  beforeAll(async () => {
    mockDb = await createMockDb();
    await mockDb.insert(users).values({ email: "", emailVerified: true, id: userId, name });
    await mockDb.insert(roomsInMessage).values({ id: roomId, name, userId });
    await mockDb.insert(usersToRoomsInMessage).values({ roomId, userId });
  });

  afterEach(async () => {
    await mockDb.delete(scheduledMessageJobsInMessage);
    MockQueueDatabase.clear();
    MockTableDatabase.clear();
  });

  afterAll(async () => {
    await mockDb.delete(users);
  });

  test("returns early when job already completed", async () => {
    expect.hasAssertions();

    const job = await insertJob(
      { text, type: ScheduledMessageJobType.Reminder },
      { completedAt: new Date("1970-01-01") },
    );
    await processScheduledMessageJobHandler({ id: job.id }, context);

    const messagesTable = MockTableDatabase.get(AzureTable.Messages);

    expect(messagesTable?.size ?? 0).toBe(0);
  });

  test("returns early when job cancelled", async () => {
    expect.hasAssertions();

    const job = await insertJob(
      { text, type: ScheduledMessageJobType.Reminder },
      { cancelledAt: new Date("1970-01-01") },
    );
    await processScheduledMessageJobHandler({ id: job.id }, context);

    const messagesTable = MockTableDatabase.get(AzureTable.Messages);

    expect(messagesTable?.size ?? 0).toBe(0);
  });

  test("requeues when job is visible before runAt", async () => {
    expect.hasAssertions();

    const job = await insertJob(
      { text, type: ScheduledMessageJobType.Reminder },
      {
        runAt: new Date(Date.now() + MAX_QUEUE_VISIBILITY_TIMEOUT_MS + 1000),
      },
    );
    await processScheduledMessageJobHandler({ id: job.id }, context);

    const scheduledMessageJob = await mockDb.query.scheduledMessageJobsInMessage.findFirst({
      where: { id: { eq: job.id } },
    });
    const queueMessages = MockQueueDatabase.get(AzureQueue.ScheduledMessageJobs);

    expect(scheduledMessageJob?.completedAt).toBeNull();
    expect(scheduledMessageJob?.processingStartedAt).toBeNull();
    expect(queueMessages).toStrictEqual([JSON.stringify({ id: job.id })]);
  });

  test("records processing start and processes reminder job", async () => {
    expect.hasAssertions();

    const job = await insertJob({ text, type: ScheduledMessageJobType.Reminder });
    await processScheduledMessageJobHandler({ id: job.id }, context);

    const processedScheduledMessageJob = await mockDb.query.scheduledMessageJobsInMessage.findFirst({
      where: { id: { eq: job.id } },
    });

    expect(processedScheduledMessageJob?.completedAt).toBeInstanceOf(Date);
    expect(processedScheduledMessageJob?.processingStartedAt).toBeInstanceOf(Date);
  });

  test("records processing start and creates message for scheduled message job", async () => {
    expect.hasAssertions();

    const job = await insertJob({ message, type: ScheduledMessageJobType.ScheduledMessage });
    await processScheduledMessageJobHandler({ id: job.id }, context);

    const processedScheduledMessageJob = await mockDb.query.scheduledMessageJobsInMessage.findFirst({
      where: { id: { eq: job.id } },
    });

    expect(processedScheduledMessageJob?.completedAt).toBeInstanceOf(Date);
    expect(processedScheduledMessageJob?.processingStartedAt).toBeInstanceOf(Date);

    const messagesTable = MockTableDatabase.get(AzureTable.Messages);

    expect(messagesTable?.size).toBe(1);
  });

  test("leaves job incomplete when processing fails", async () => {
    expect.hasAssertions();

    const otherRoomId = crypto.randomUUID();
    await mockDb.insert(roomsInMessage).values({ id: otherRoomId, name, userId });
    const scheduledMessageJob = takeOne(
      await mockDb
        .insert(scheduledMessageJobsInMessage)
        .values({
          payload: { message: "hello", type: ScheduledMessageJobType.ScheduledMessage },
          roomId: otherRoomId,
          runAt: new Date("1970-01-01"),
          userId,
        })
        .returning(),
    );

    await expect(processScheduledMessageJobHandler({ id: scheduledMessageJob.id }, context)).rejects.toBeInstanceOf(
      InvalidOperationError,
    );

    const failedScheduledMessageJob = await mockDb.query.scheduledMessageJobsInMessage.findFirst({
      where: { id: { eq: scheduledMessageJob.id } },
    });

    expect(failedScheduledMessageJob?.completedAt).toBeNull();
    expect(failedScheduledMessageJob?.processingStartedAt).toBeInstanceOf(Date);
  });
});
