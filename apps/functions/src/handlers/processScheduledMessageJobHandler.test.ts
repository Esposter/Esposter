import type { Database, ScheduledJob, ScheduledMessageJobPayload } from "@esposter/db-schema";

import { processScheduledMessageJobHandler } from "#src/handlers/processScheduledMessageJobHandler";
import { MockJobQueue } from "#src/services/queue/getJobQueue.test";
import { createUser } from "#src/services/shared/createUser.test";
import { createMockDb } from "@esposter/db-mock";
import {
  QueueJob,
  roomsInMessage,
  scheduledMessageJobsInMessage,
  ScheduledMessageJobType,
  usersInAuth,
} from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({ schedule: vi.fn<(runAt: number, job: ScheduledJob) => Promise<void>>() }));

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));
vi.mock(import("#src/services/queue/getJobQueue"), () => import("#src/services/queue/getJobQueue.test"));
vi.mock(import("#src/services/scheduler/getScheduler"), () => ({ getScheduler: () => ({ schedule: mocks.schedule }) }));

const getJob = (id: string) => mockDb.query.scheduledMessageJobsInMessage.findFirst({ where: { id: { eq: id } } });

describe(processScheduledMessageJobHandler, () => {
  const error = new Error(" ");
  const name = "name";
  const reminderPayload: ScheduledMessageJobPayload = { text: "text", type: ScheduledMessageJobType.Reminder };
  const roomId = crypto.randomUUID();
  const scheduledMessagePayload: ScheduledMessageJobPayload = {
    message: "message",
    replyRowKey: "",
    type: ScheduledMessageJobType.ScheduledMessage,
  };
  const userId = crypto.randomUUID();

  const insertJob = async (
    payload: ScheduledMessageJobPayload,
    overrides?: { cancelledAt?: Date; completedAt?: Date; processingStartedAt?: Date; runAt?: Date },
  ) =>
    takeOne(
      await mockDb
        .insert(scheduledMessageJobsInMessage)
        .values({ payload, roomId, runAt: new Date(0), userId, ...overrides })
        .returning(),
    );

  beforeAll(async () => {
    mockDb = (await createMockDb()).db;
    await mockDb.insert(usersInAuth).values(createUser(userId));
    await mockDb.insert(roomsInMessage).values({ id: roomId, name, userId });
  });

  // Every timestamp this handler writes comes from `new Date()`, so a frozen clock is what lets them be asserted
  // Exactly rather than as "some Date"
  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(async () => {
    vi.useRealTimers();
    await mockDb.delete(scheduledMessageJobsInMessage);
    mocks.schedule.mockClear();
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await mockDb.delete(usersInAuth);
  });

  test("skips when no active job exists", async () => {
    expect.hasAssertions();

    await processScheduledMessageJobHandler({ id: crypto.randomUUID() });

    expect(mocks.schedule).not.toHaveBeenCalled();
  });

  test("skips when job already completed", async () => {
    expect.hasAssertions();

    const job = await insertJob(reminderPayload, { completedAt: new Date(0) });
    await processScheduledMessageJobHandler({ id: job.id });

    const skippedJob = await getJob(job.id);

    expect(skippedJob?.processingStartedAt).toBeNull();
    expect(mocks.schedule).not.toHaveBeenCalled();
  });

  test("skips when job cancelled", async () => {
    expect.hasAssertions();

    const job = await insertJob(reminderPayload, { cancelledAt: new Date(0) });
    await processScheduledMessageJobHandler({ id: job.id });

    const skippedJob = await getJob(job.id);

    expect(skippedJob?.processingStartedAt).toBeNull();
    expect(mocks.schedule).not.toHaveBeenCalled();
  });

  // The head read settles a claimed job, so a redelivery that lands after the claim finds nothing to do and sends nothing
  test("skips a claimed job", async () => {
    expect.hasAssertions();

    const logSpy = vi.spyOn(console, "log");
    const job = await insertJob(reminderPayload, { processingStartedAt: new Date(0) });
    await processScheduledMessageJobHandler({ id: job.id });

    expect(logSpy).toHaveBeenCalledWith(`${QueueJob.ProcessScheduledMessageJob} skipped: no active job`, {
      id: job.id,
    });
  });

  test("requeues when job is visible before runAt", async () => {
    expect.hasAssertions();

    const job = await insertJob(reminderPayload, { runAt: new Date(Date.now() + 1) });
    await processScheduledMessageJobHandler({ id: job.id });

    const requeuedJob = await getJob(job.id);

    expect(requeuedJob?.completedAt).toBeNull();
    expect(requeuedJob?.processingStartedAt).toBeNull();
    expect(mocks.schedule).toHaveBeenCalledExactlyOnceWith(job.runAt.getTime(), {
      payload: { id: job.id },
      queueJob: QueueJob.ProcessScheduledMessageJob,
    });
  });

  test("records processing start and processes reminder job", async () => {
    expect.hasAssertions();

    const job = await insertJob(reminderPayload);
    await processScheduledMessageJobHandler({ id: job.id });

    const processedJob = await getJob(job.id);

    expect(processedJob?.completedAt).toStrictEqual(new Date(0));
    expect(processedJob?.processingStartedAt).toStrictEqual(new Date(0));
  });

  test("completes job when notifying the reminder fails", async () => {
    expect.hasAssertions();

    vi.spyOn(MockJobQueue.prototype, "send").mockRejectedValueOnce(error);
    const job = await insertJob(reminderPayload);
    await processScheduledMessageJobHandler({ id: job.id });

    const processedJob = await getJob(job.id);

    expect(processedJob?.completedAt).toStrictEqual(new Date(0));
  });

  // A chat message is sent by its room's object, so its job is left as it is: unclaimed, uncompleted and not notified
  test("leaves a scheduled chat message job untouched for the room that sends it", async () => {
    expect.hasAssertions();

    const sendSpy = vi.spyOn(MockJobQueue.prototype, "send");
    const job = await insertJob(scheduledMessagePayload);
    await processScheduledMessageJobHandler({ id: job.id });

    const untouchedJob = await getJob(job.id);

    expect(untouchedJob?.processingStartedAt).toBeNull();
    expect(untouchedJob?.completedAt).toBeNull();
    expect(sendSpy).not.toHaveBeenCalled();
  });
});
