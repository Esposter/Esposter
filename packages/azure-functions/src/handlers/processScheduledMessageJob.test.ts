import type { relations, ScheduledMessageJobPayload } from "@esposter/db-schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { processScheduledMessageJob } from "@/handlers/processScheduledMessageJob";
import { InvocationContext } from "@azure/functions";
import { createMockDb } from "@esposter/db-mock";
import {
  AzureTable,
  roomsInMessage,
  scheduledMessageJobsInMessage,
  ScheduledMessageJobType,
  users,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { InvalidOperationError, takeOne } from "@esposter/shared";
import { MockTableDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: PostgresJsDatabase<typeof relations>;

vi.mock(import("@/services/db"), () => ({
  get db() {
    return mockDb;
  },
}));

vi.mock(import("@/services/getTableClient"), () => import("@/services/getTableClient.test"));
vi.mock(import("@/services/getWebPubSubServiceClient"), () => import("@/services/getWebPubSubServiceClient.test"));
vi.mock(import("@/services/webpush"), () => import("@/services/webpush.test"));

describe(processScheduledMessageJob, () => {
  const context = new InvocationContext();
  const name = "name";

  let userId: string;
  let roomId: string;

  const insertJob = async (
    payload: ScheduledMessageJobPayload,
    overrides?: { cancelledAt?: Date; completedAt?: Date },
  ) =>
    takeOne(
      await mockDb
        .insert(scheduledMessageJobsInMessage)
        .values({ payload, roomId, runAt: new Date("1970-01-01"), userId, ...overrides })
        .returning(),
    );

  beforeAll(async () => {
    mockDb = await createMockDb();
    userId = crypto.randomUUID();
    roomId = crypto.randomUUID();

    await mockDb.insert(users).values({ email: "", emailVerified: true, id: userId, name });
    await mockDb.insert(roomsInMessage).values({ id: roomId, name, userId });
    await mockDb.insert(usersToRoomsInMessage).values({ roomId, userId });
  });

  afterEach(async () => {
    await mockDb.delete(scheduledMessageJobsInMessage);
    MockTableDatabase.clear();
  });

  test("returns early when job already completed", async () => {
    expect.hasAssertions();

    const job = await insertJob(
      { text: "reminder", type: ScheduledMessageJobType.Reminder },
      { completedAt: new Date("1970-01-01") },
    );
    await processScheduledMessageJob({ id: job.id }, context);

    const messagesTable = MockTableDatabase.get(AzureTable.Messages);

    expect(messagesTable?.size ?? 0).toBe(0);
  });

  test("returns early when job cancelled", async () => {
    expect.hasAssertions();

    const job = await insertJob(
      { text: "reminder", type: ScheduledMessageJobType.Reminder },
      { cancelledAt: new Date("1970-01-01") },
    );
    await processScheduledMessageJob({ id: job.id }, context);

    const messagesTable = MockTableDatabase.get(AzureTable.Messages);

    expect(messagesTable?.size ?? 0).toBe(0);
  });

  test("claims and processes reminder job", async () => {
    expect.hasAssertions();

    const job = await insertJob({ text: "don't forget!", type: ScheduledMessageJobType.Reminder });
    await processScheduledMessageJob({ id: job.id }, context);

    const claimedScheduledMessageJob = await mockDb.query.scheduledMessageJobsInMessage.findFirst({
      where: { id: { eq: job.id } },
    });

    expect(claimedScheduledMessageJob?.completedAt).toBeInstanceOf(Date);
  });

  test("claims and creates message for scheduled message job", async () => {
    expect.hasAssertions();

    const job = await insertJob({ message: "hello world", type: ScheduledMessageJobType.ScheduledMessage });
    await processScheduledMessageJob({ id: job.id }, context);

    const claimedScheduledMessageJob = await mockDb.query.scheduledMessageJobsInMessage.findFirst({
      where: { id: { eq: job.id } },
    });

    expect(claimedScheduledMessageJob?.completedAt).toBeInstanceOf(Date);

    const messagesTable = MockTableDatabase.get(AzureTable.Messages);

    expect(messagesTable?.size).toBe(1);
  });

  test("claims job before processing so retries are idempotent even on failure", async () => {
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

    await expect(processScheduledMessageJob({ id: scheduledMessageJob.id }, context)).rejects.toBeInstanceOf(
      InvalidOperationError,
    );

    const claimedScheduledMessageJob = await mockDb.query.scheduledMessageJobsInMessage.findFirst({
      where: { id: { eq: scheduledMessageJob.id } },
    });

    expect(claimedScheduledMessageJob?.completedAt).toBeInstanceOf(Date);
  });
});
