import type { relations, ScheduledMessageJobPayload } from "@esposter/db-schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { processScheduledMessageJobHandler } from "@/handlers/processScheduledMessageJobHandler";
import { InvocationContext } from "@azure/functions";
import { dayjs } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import {
  AzureQueue,
  AzureTable,
  DatabaseEntityType,
  roomsInMessage,
  scheduledMessageJobsInMessage,
  ScheduledMessageJobType,
  users,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { MockServiceBusDatabase, MockTableDatabase } from "azure-mock";
import { randomUUID } from "node:crypto";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: PostgresJsDatabase<typeof relations>;

vi.mock(import("@/services/db"), () => ({
  get db() {
    return mockDb;
  },
}));

vi.mock(import("@/services/getServiceBusSender"), () => import("@/services/getServiceBusSender.test"));
vi.mock(import("@/services/getTableClient"), () => import("@/services/getTableClient.test"));
vi.mock(import("@/services/getWebPubSubServiceClient"), () => import("@/services/getWebPubSubServiceClient.test"));
vi.mock(import("@/services/webpush"), () => import("@/services/webpush.test"));

describe(processScheduledMessageJobHandler, () => {
  const context = new InvocationContext({ logHandler: () => {} });
  const name = "name";
  const otherRoomId = randomUUID();
  const reminderPayload: ScheduledMessageJobPayload = { text: "text", type: ScheduledMessageJobType.Reminder };
  const roomId = randomUUID();
  const scheduledMessagePayload: ScheduledMessageJobPayload = {
    message: "message",
    type: ScheduledMessageJobType.ScheduledMessage,
  };
  const userId = randomUUID();

  const getJob = (id: string) => mockDb.query.scheduledMessageJobsInMessage.findFirst({ where: { id: { eq: id } } });
  const insertJob = async (
    payload: ScheduledMessageJobPayload,
    overrides?: { cancelledAt?: Date; completedAt?: Date; roomId?: string; runAt?: Date },
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
    await mockDb.insert(roomsInMessage).values([
      { id: roomId, name, userId },
      { id: otherRoomId, name, userId },
    ]);
    await mockDb.insert(usersToRoomsInMessage).values({ roomId, userId });
  });

  afterEach(async () => {
    await mockDb.delete(scheduledMessageJobsInMessage);
    MockServiceBusDatabase.clear();
    MockTableDatabase.clear();
  });

  afterAll(async () => {
    await mockDb.delete(users);
  });

  test("skips when no active job exists", async () => {
    expect.hasAssertions();

    await processScheduledMessageJobHandler({ id: randomUUID() }, context);

    expect(MockTableDatabase.get(AzureTable.Messages)).toBeUndefined();
    expect(MockServiceBusDatabase.get(AzureQueue.ScheduledMessageJobs)).toBeUndefined();
  });

  test("skips when job already completed", async () => {
    expect.hasAssertions();

    const job = await insertJob(reminderPayload, { completedAt: new Date("1970-01-01") });
    await processScheduledMessageJobHandler({ id: job.id }, context);

    const skippedJob = await getJob(job.id);

    expect(skippedJob?.processingStartedAt).toBeNull();
    expect(MockServiceBusDatabase.get(AzureQueue.ScheduledMessageJobs)).toBeUndefined();
  });

  test("skips when job cancelled", async () => {
    expect.hasAssertions();

    const job = await insertJob(reminderPayload, { cancelledAt: new Date("1970-01-01") });
    await processScheduledMessageJobHandler({ id: job.id }, context);

    const skippedJob = await getJob(job.id);

    expect(skippedJob?.processingStartedAt).toBeNull();
    expect(MockServiceBusDatabase.get(AzureQueue.ScheduledMessageJobs)).toBeUndefined();
  });

  test("requeues when job is visible before runAt", async () => {
    expect.hasAssertions();

    const job = await insertJob(reminderPayload, { runAt: dayjs().add(1, "day").toDate() });
    await processScheduledMessageJobHandler({ id: job.id }, context);

    const requeuedJob = await getJob(job.id);

    expect(requeuedJob?.completedAt).toBeNull();
    expect(requeuedJob?.processingStartedAt).toBeNull();
    expect(MockServiceBusDatabase.get(AzureQueue.ScheduledMessageJobs)).toStrictEqual([
      { body: { id: job.id }, scheduledEnqueueTimeUtc: job.runAt },
    ]);
  });

  test("records processing start and processes reminder job", async () => {
    expect.hasAssertions();

    const job = await insertJob(reminderPayload);
    await processScheduledMessageJobHandler({ id: job.id }, context);

    const processedJob = await getJob(job.id);

    expect(processedJob?.completedAt).toBeInstanceOf(Date);
    expect(processedJob?.processingStartedAt).toBeInstanceOf(Date);
    expect(MockTableDatabase.get(AzureTable.Messages)).toBeUndefined();
  });

  test("records processing start and creates message for scheduled message job", async () => {
    expect.hasAssertions();

    const job = await insertJob(scheduledMessagePayload);
    await processScheduledMessageJobHandler({ id: job.id }, context);

    const processedJob = await getJob(job.id);

    expect(processedJob?.completedAt).toBeInstanceOf(Date);
    expect(processedJob?.processingStartedAt).toBeInstanceOf(Date);
    expect(MockTableDatabase.get(AzureTable.Messages)?.size).toBe(1);
  });

  test("leaves job incomplete when processing fails", async () => {
    expect.hasAssertions();

    const job = await insertJob(scheduledMessagePayload, { roomId: otherRoomId });

    await expect(processScheduledMessageJobHandler({ id: job.id }, context)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.ScheduledMessageJob, otherRoomId).message}]`,
    );

    const failedJob = await getJob(job.id);

    expect(failedJob?.completedAt).toBeNull();
    expect(failedJob?.processingStartedAt).toBeInstanceOf(Date);
  });
});
