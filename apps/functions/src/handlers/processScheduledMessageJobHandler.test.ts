import type { Database, ScheduledMessageJobPayload } from "@esposter/db-schema";

import { processScheduledMessageJobHandler } from "#src/handlers/processScheduledMessageJobHandler";
import { eventGridPublisherClient } from "#src/services/eventGridPublisherClient";
import { InvocationContext } from "@azure/functions";
import { createReplyThreadFollows } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import {
  AzureFunction,
  AzureQueue,
  AzureTable,
  DatabaseEntityType,
  roomFiltersInMessage,
  roomsInMessage,
  scheduledMessageJobsInMessage,
  ScheduledMessageJobType,
  threadFollowsInMessage,
  users,
  usersToRoomsInMessage,
  WordFilterAction,
} from "@esposter/db-schema";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { MockServiceBusDatabase, MockTableDatabase } from "azure-mock";
import { afterAll, afterEach, assert, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/db"), () => ({
  get db() {
    return mockDb;
  },
}));

// Wrapped rather than replaced, so the follow rows are still written for every test that reads them back and only
// The one asserting a failed write can reject it
vi.mock(import("@esposter/db"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    createReplyThreadFollows: vi.fn<typeof actual.createReplyThreadFollows>(actual.createReplyThreadFollows),
  };
});
vi.mock(import("#src/services/eventGridPublisherClient"), () => import("#src/services/eventGridPublisherClient.test"));
vi.mock(import("#src/services/getServiceBusSender"), () => import("#src/services/getServiceBusSender.test"));
vi.mock(import("#src/services/getTableClient"), () => import("#src/services/getTableClient.test"));
vi.mock(
  import("#src/services/getWebPubSubServiceClient"),
  () => import("#src/services/getWebPubSubServiceClient.test"),
);
vi.mock(import("#src/services/webpush"), () => import("#src/services/webpush.test"));

describe(processScheduledMessageJobHandler, () => {
  const context = new InvocationContext({ logHandler: () => {} });
  const name = "name";
  const otherRoomId = crypto.randomUUID();
  const reminderPayload: ScheduledMessageJobPayload = { text: "text", type: ScheduledMessageJobType.Reminder };
  const roomId = crypto.randomUUID();
  const scheduledMessagePayload: ScheduledMessageJobPayload = {
    message: "message",
    replyRowKey: "",
    type: ScheduledMessageJobType.ScheduledMessage,
  };
  const userId = crypto.randomUUID();
  // The room owner bypasses every moderation guard, so anything asserting one must send as a plain member
  const memberUserId = crypto.randomUUID();

  const getJob = (id: string) => mockDb.query.scheduledMessageJobsInMessage.findFirst({ where: { id: { eq: id } } });
  const insertJob = async (
    payload: ScheduledMessageJobPayload,
    overrides?: {
      cancelledAt?: Date;
      completedAt?: Date;
      processingStartedAt?: Date;
      roomId?: string;
      runAt?: Date;
      userId?: string;
    },
  ) =>
    takeOne(
      await mockDb
        .insert(scheduledMessageJobsInMessage)
        .values({ payload, roomId, runAt: new Date("1970-01-01"), userId, ...overrides })
        .returning(),
    );

  beforeAll(async () => {
    mockDb = await createMockDb();
    await mockDb.insert(users).values([
      { email: "", emailVerified: true, id: userId, name },
      { email: "a", emailVerified: true, id: memberUserId, name },
    ]);
    await mockDb.insert(roomsInMessage).values([
      { id: roomId, name, userId },
      { id: otherRoomId, name, userId },
    ]);
    await mockDb.insert(usersToRoomsInMessage).values([
      { roomId, userId },
      { roomId, userId: memberUserId },
    ]);
  });

  // Every timestamp this handler writes comes from `new Date()`, so a frozen clock is what lets them be asserted
  // Exactly rather than as "some Date"
  beforeEach(() => {
    vi.useFakeTimers({ now: 0 });
  });

  afterEach(async () => {
    vi.useRealTimers();
    await mockDb.delete(scheduledMessageJobsInMessage);
    await mockDb.delete(roomFiltersInMessage);
    await mockDb.delete(threadFollowsInMessage);
    MockServiceBusDatabase.clear();
    MockTableDatabase.clear();
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await mockDb.delete(users);
  });

  test("skips when no active job exists", async () => {
    expect.hasAssertions();

    await processScheduledMessageJobHandler({ id: crypto.randomUUID() }, context);

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

  // The claim is authoritative, but a claimed job must be skipped by the head read — everything between the two
  // Runs guards with side effects (the word filter times the user out and writes an audit row), so reaching the
  // Claim to lose the race means a redelivery punishes the user a second time for one message
  test("skips a claimed job before running any guard", async () => {
    expect.hasAssertions();

    const logSpy = vi.spyOn(context, "log");
    const job = await insertJob(scheduledMessagePayload, { processingStartedAt: new Date("1970-01-01") });
    await processScheduledMessageJobHandler({ id: job.id }, context);

    expect(logSpy).toHaveBeenCalledWith(`${AzureFunction.ProcessScheduledMessageJob} skipped: no active job`, {
      id: job.id,
    });
    expect(MockTableDatabase.get(AzureTable.Messages)).toBeUndefined();
  });

  test("requeues when job is visible before runAt", async () => {
    expect.hasAssertions();

    const job = await insertJob(reminderPayload, {
      runAt: new Date(Date.now() + Temporal.Duration.from({ days: 1 }).total("milliseconds")),
    });
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

    expect(processedJob?.completedAt).toStrictEqual(new Date(0));
    expect(processedJob?.processingStartedAt).toStrictEqual(new Date(0));
    expect(MockTableDatabase.get(AzureTable.Messages)).toBeUndefined();
  });

  test("records processing start and creates message for scheduled message job", async () => {
    expect.hasAssertions();

    const job = await insertJob(scheduledMessagePayload);
    await processScheduledMessageJobHandler({ id: job.id }, context);

    const processedJob = await getJob(job.id);

    expect(processedJob?.completedAt).toStrictEqual(new Date(0));
    expect(processedJob?.processingStartedAt).toStrictEqual(new Date(0));
    expect(MockTableDatabase.get(AzureTable.Messages)?.size).toBe(1);
  });

  // Thread placement is the whole point of the payload's replyRowKey, and every other case here sends the
  // Room-level empty one
  test("creates the message under the thread root the payload names", async () => {
    expect.hasAssertions();

    const replyRowKey = "replyRowKey";
    const job = await insertJob({ ...scheduledMessagePayload, replyRowKey });
    await processScheduledMessageJobHandler({ id: job.id }, context);

    const messagesTable = MockTableDatabase.get(AzureTable.Messages);
    assert.exists(messagesTable);

    expect(takeOne([...messagesTable.values()]).replyRowKey).toBe(replyRowKey);
  });

  // The follow rows are what ProcessNotification resolves a reply's recipients from, so a scheduled reply that
  // Skipped them would notify the thread as if nobody had ever replied to it
  test("follows the thread it replies into", async () => {
    expect.hasAssertions();

    const replyRowKey = "replyRowKey";
    const job = await insertJob({ ...scheduledMessagePayload, replyRowKey });
    await processScheduledMessageJobHandler({ id: job.id }, context);

    const follows = await mockDb
      .select({
        isUnfollowed: threadFollowsInMessage.isUnfollowed,
        roomId: threadFollowsInMessage.roomId,
        threadRootRowKey: threadFollowsInMessage.threadRootRowKey,
        userId: threadFollowsInMessage.userId,
      })
      .from(threadFollowsInMessage);

    expect(follows).toStrictEqual([{ isUnfollowed: false, roomId, threadRootRowKey: replyRowKey, userId }]);
  });

  // Each step of the best-effort tail owns its own Result, so the one that failed is the only one skipped —
  // Sharing one made the notification and the room's sort order conditional on a follow write nothing waits for
  test("notifies when following the thread fails after the message is created", async () => {
    expect.hasAssertions();

    const sendSpy = vi.spyOn(eventGridPublisherClient, "send");
    vi.mocked(createReplyThreadFollows).mockRejectedValueOnce(new Error(" "));
    const job = await insertJob({ ...scheduledMessagePayload, replyRowKey: "replyRowKey" });
    await processScheduledMessageJobHandler({ id: job.id }, context);

    const room = await mockDb.query.roomsInMessage.findFirst({
      columns: { updatedAt: true },
      where: { id: { eq: roomId } },
    });

    expect(sendSpy).toHaveBeenCalledTimes(1);
    expect(room?.updatedAt).toStrictEqual(new Date(0));
  });

  test("completes job when notifying fails after the message is created", async () => {
    expect.hasAssertions();

    vi.spyOn(eventGridPublisherClient, "send").mockRejectedValueOnce(new Error(" "));
    const job = await insertJob(scheduledMessagePayload);
    await processScheduledMessageJobHandler({ id: job.id }, context);

    const processedJob = await getJob(job.id);

    expect(processedJob?.completedAt).toStrictEqual(new Date(0));
    expect(MockTableDatabase.get(AzureTable.Messages)?.size).toBe(1);
  });

  // The slowmode clock gates the NEXT send, so it advances with the guards rather than inside the best-effort
  // Tail: swallowed behind a failed push it would stay stale, keep passing, and slowmode would stop applying
  test("advances the slowmode clock when notifying fails after the message is created", async () => {
    expect.hasAssertions();

    vi.spyOn(eventGridPublisherClient, "send").mockRejectedValueOnce(new Error(" "));
    const job = await insertJob(scheduledMessagePayload);
    await processScheduledMessageJobHandler({ id: job.id }, context);

    const member = await mockDb.query.usersToRoomsInMessage.findFirst({
      columns: { lastMessageAt: true },
      where: { roomId: { eq: roomId }, userId: { eq: userId } },
    });

    expect(member?.lastMessageAt).toStrictEqual(new Date(0));
  });

  // The word filter applies the room's automod action and the tombstone recording it is a second write, so the
  // Guard runs INSIDE the claim: unclaimed, a failure between those two writes lets the redelivery punish twice
  test("claims the job before applying the word filter's automod action", async () => {
    expect.hasAssertions();

    const timeoutDurationMs = 1;
    await mockDb
      .insert(roomFiltersInMessage)
      .values({ action: WordFilterAction.Timeout, roomId, timeoutDurationMs, words: ["message"] });
    const job = await insertJob(scheduledMessagePayload, { userId: memberUserId });
    await processScheduledMessageJobHandler({ id: job.id }, context);

    const cancelledJob = await getJob(job.id);
    const member = await mockDb.query.usersToRoomsInMessage.findFirst({
      columns: { timeoutUntil: true },
      where: { roomId: { eq: roomId }, userId: { eq: memberUserId } },
    });

    expect(cancelledJob?.processingStartedAt).toStrictEqual(new Date(0));
    expect(cancelledJob?.cancelledAt).toStrictEqual(new Date(0));
    expect(member?.timeoutUntil).toStrictEqual(new Date(timeoutDurationMs));
    expect(MockTableDatabase.get(AzureTable.Messages)).toBeUndefined();
  });

  test("releases the claim when delivery precondition rejects", async () => {
    expect.hasAssertions();

    const job = await insertJob(scheduledMessagePayload, { roomId: otherRoomId });

    await expect(processScheduledMessageJobHandler({ id: job.id }, context)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.ScheduledMessageJob, otherRoomId).message}]`,
    );

    const failedJob = await getJob(job.id);

    expect(failedJob?.completedAt).toBeNull();
    expect(failedJob?.processingStartedAt).toBeNull();
    expect(MockTableDatabase.get(AzureTable.Messages)).toBeUndefined();
  });
});
