import { createQueueMessage } from "#src/services/queue/createQueueMessage.test";
import { handleQueueBatch } from "#src/services/queue/handleQueueBatch";
import { MockJobQueue, MockJobQueueDatabase } from "#src/services/queue/getJobQueue.test";
import { QueueJobHandlerMap } from "#src/services/queue/QueueJobHandlerMap";
import { getBucket } from "#src/services/storage/getBucket";
import { clearMockBuckets, disposeMockBuckets, openMockBuckets } from "#src/services/storage/getBucket.test";
import {
  CloudflareAssetType,
  CloudflareEnvironment,
  getCloudflareResourceName,
  QueueJob,
  StorageBucket,
} from "@esposter/db-schema";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/queue/getJobQueue"), () => import("#src/services/queue/getJobQueue.test"));
vi.mock(import("#src/services/storage/getBucket"), () => import("#src/services/storage/getBucket.test"));

const createBatch = (messages: ReturnType<typeof createQueueMessage>[], queue: string): MessageBatch<unknown> => ({
  ackAll: vi.fn<() => void>(),
  messages,
  metadata: { metrics: { backlogBytes: 0, backlogCount: 0 } },
  queue,
  retryAll: vi.fn<() => void>(),
});

describe(handleQueueBatch, () => {
  const environment = CloudflareEnvironment.Development;
  const queueName = getCloudflareResourceName(environment, CloudflareAssetType.Queue, QueueJob.ProcessWebhook);
  const deleteAccountQueueName = getCloudflareResourceName(
    environment,
    CloudflareAssetType.Queue,
    QueueJob.DeleteAccount,
  );
  const deleteAccountDeadLetterQueueName = getCloudflareResourceName(
    environment,
    CloudflareAssetType.DeadLetterQueue,
    QueueJob.DeleteAccount,
  );
  const poisonBody = { userId: 0 };

  beforeAll(async () => {
    await openMockBuckets([StorageBucket.UserAssets]);
  });

  afterEach(async () => {
    await clearMockBuckets();
    MockJobQueueDatabase.clear();
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await disposeMockBuckets();
  });

  test("acknowledges each message its job's handler resolves", async () => {
    expect.hasAssertions();

    const handlerSpy = vi.spyOn(QueueJobHandlerMap, QueueJob.ProcessWebhook).mockResolvedValue();
    const messages = [createQueueMessage("", { first: true }), createQueueMessage("", { second: true })];

    await handleQueueBatch(createBatch(messages, queueName), environment);

    expect(handlerSpy).toHaveBeenCalledTimes(2);
    for (const message of messages) {
      expect(message.ack).toHaveBeenCalledExactlyOnceWith();
      expect(message.retry).not.toHaveBeenCalled();
    }
  });

  test("retries the message its handler throws on, logs it, and acknowledges the rest", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(QueueJobHandlerMap, QueueJob.ProcessWebhook)
      .mockRejectedValueOnce(new Error("handler failed"))
      .mockResolvedValueOnce();
    const [failedMessage, resolvedMessage] = [
      createQueueMessage("", { failed: true }),
      createQueueMessage("", { resolved: true }),
    ];

    await handleQueueBatch(createBatch([failedMessage, resolvedMessage], queueName), environment);

    expect(failedMessage.retry).toHaveBeenCalledExactlyOnceWith();
    expect(failedMessage.ack).not.toHaveBeenCalled();
    expect(resolvedMessage.ack).toHaveBeenCalledExactlyOnceWith();
    expect(console.error).toHaveBeenCalledExactlyOnceWith(`${queueName} failed: `, expect.any(Error));
  });

  // A dead-letter batch is replayed, never run through its job's handler: the poison message is quarantined and the transient one
  // republished, and both are acknowledged, so one poison message does not hold back the transient failure beside it
  test("quarantines a poison dead letter and republishes a transient one from the same batch", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(() => {});
    const handlerSpy = vi.spyOn(QueueJobHandlerMap, QueueJob.DeleteAccount).mockResolvedValue();
    const userId = crypto.randomUUID();
    const poisonMessage = createQueueMessage(crypto.randomUUID(), poisonBody);
    const transientMessage = createQueueMessage(crypto.randomUUID(), { userId });

    await handleQueueBatch(
      createBatch([poisonMessage, transientMessage], deleteAccountDeadLetterQueueName),
      environment,
    );

    expect(handlerSpy).not.toHaveBeenCalled();
    expect(MockJobQueueDatabase.get(QueueJob.DeleteAccount)).toStrictEqual([{ attempt: 1, userId }]);
    const quarantined = await getBucket(StorageBucket.UserAssets).get(
      `quarantine/${deleteAccountQueueName}/${poisonMessage.id}.json`,
    );
    expect(await quarantined?.text()).toBe(JSON.stringify(poisonBody));
    expect(poisonMessage.ack).toHaveBeenCalledExactlyOnceWith();
    expect(transientMessage.ack).toHaveBeenCalledExactlyOnceWith();
  });

  // A republish that fails must retry its dead letter, not acknowledge it: an acknowledged message that was never republished is lost
  test("retries the dead letter whose republish fails, and acknowledges the rest", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(MockJobQueue.prototype, "send").mockRejectedValueOnce(new Error(" "));
    const userId = crypto.randomUUID();
    const [failedMessage, resolvedMessage] = [
      createQueueMessage(crypto.randomUUID(), { userId }),
      createQueueMessage(crypto.randomUUID(), { userId }),
    ];

    await handleQueueBatch(
      createBatch([failedMessage, resolvedMessage], deleteAccountDeadLetterQueueName),
      environment,
    );

    expect(failedMessage.retry).toHaveBeenCalledExactlyOnceWith();
    expect(failedMessage.ack).not.toHaveBeenCalled();
    expect(resolvedMessage.ack).toHaveBeenCalledExactlyOnceWith();
    expect(MockJobQueueDatabase.get(QueueJob.DeleteAccount)).toStrictEqual([{ attempt: 1, userId }]);
  });

  // A queue this environment does not name is not one this Worker consumes, so no handler runs for its messages
  test("rejects a batch from a queue this Worker does not consume", async () => {
    expect.hasAssertions();

    const message = createQueueMessage("", {});

    await expect(handleQueueBatch(createBatch([message], "some-other-queue"), environment)).rejects.toThrowError();
    expect(message.ack).not.toHaveBeenCalled();
    expect(message.retry).not.toHaveBeenCalled();
  });
});
