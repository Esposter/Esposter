import { MAX_DEAD_LETTER_ATTEMPTS } from "#src/services/queue/constants";
import { createQueueMessage } from "#src/services/queue/createQueueMessage.test";
import { handleDeadLetterMessage } from "#src/services/queue/handleDeadLetterMessage";
import { MockJobQueueDatabase } from "#src/services/queue/getJobQueue.test";
import { getBucket } from "#src/services/storage/getBucket";
import { clearMockBuckets, disposeMockBuckets, openMockBuckets } from "#src/services/storage/getBucket.test";
import {
  CloudflareAssetType,
  CloudflareEnvironment,
  DEAD_LETTER_CONSUMER_MAX_RETRIES,
  getCloudflareResourceName,
  QueueJob,
  StorageBucket,
} from "@esposter/db-schema";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/queue/getJobQueue"), () => import("#src/services/queue/getJobQueue.test"));
vi.mock(import("#src/services/storage/getBucket"), () => import("#src/services/storage/getBucket.test"));

describe(handleDeadLetterMessage, () => {
  const sourceQueueName = getCloudflareResourceName(
    CloudflareEnvironment.Development,
    CloudflareAssetType.Queue,
    QueueJob.DeleteAccount,
  );
  const userId = crypto.randomUUID();
  const messageId = crypto.randomUUID();
  const quarantineKey = `quarantine/${sourceQueueName}/${messageId}.json`;

  // The quarantined body, or undefined when nothing was quarantined under this message's key
  const readQuarantine = async () => {
    const object = await getBucket(StorageBucket.UserAssets).get(quarantineKey);
    return object?.text();
  };

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

  test("republishes a dead letter under the attempt cap to its job's queue, with its attempt raised", async () => {
    expect.hasAssertions();

    await handleDeadLetterMessage(
      createQueueMessage(messageId, { attempt: MAX_DEAD_LETTER_ATTEMPTS - 1, userId }),
      QueueJob.DeleteAccount,
      sourceQueueName,
    );

    expect(MockJobQueueDatabase.get(QueueJob.DeleteAccount)).toStrictEqual([
      { attempt: MAX_DEAD_LETTER_ATTEMPTS, userId },
    ]);
    expect(await readQuarantine()).toBeUndefined();
  });

  test("quarantines a dead letter at the attempt cap, and does not republish it", async () => {
    expect.hasAssertions();

    const body = { attempt: MAX_DEAD_LETTER_ATTEMPTS, userId };
    await handleDeadLetterMessage(createQueueMessage(messageId, body), QueueJob.DeleteAccount, sourceQueueName);

    expect(MockJobQueueDatabase.get(QueueJob.DeleteAccount)).toBeUndefined();
    expect(await readQuarantine()).toBe(JSON.stringify(body));
  });

  // The body is under the attempt cap, so only the delivery count can quarantine it: the last delivery is never republished
  test("quarantines a dead letter on the delivery that reaches the consumer's retry count, and does not republish it", async () => {
    expect.hasAssertions();

    const body = { userId };
    const finalDelivery = { ...createQueueMessage(messageId, body), attempts: DEAD_LETTER_CONSUMER_MAX_RETRIES };
    await handleDeadLetterMessage(finalDelivery, QueueJob.DeleteAccount, sourceQueueName);

    expect(MockJobQueueDatabase.get(QueueJob.DeleteAccount)).toBeUndefined();
    expect(await readQuarantine()).toBe(JSON.stringify(body));
  });

  test("quarantines a body its job's schema rejects, however few attempts it has, and does not republish it", async () => {
    expect.hasAssertions();

    const body = { userId: 0 };
    await handleDeadLetterMessage(createQueueMessage(messageId, body), QueueJob.DeleteAccount, sourceQueueName);

    expect(MockJobQueueDatabase.get(QueueJob.DeleteAccount)).toBeUndefined();
    expect(await readQuarantine()).toBe(JSON.stringify(body));
  });

  test("logs a quarantine once, when a redelivery of the same message finds it already written", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(() => {});
    const message = createQueueMessage(messageId, { attempt: MAX_DEAD_LETTER_ATTEMPTS, userId });
    await handleDeadLetterMessage(message, QueueJob.DeleteAccount, sourceQueueName);
    await handleDeadLetterMessage(message, QueueJob.DeleteAccount, sourceQueueName);

    expect(console.error).toHaveBeenCalledExactlyOnceWith(expect.stringContaining(quarantineKey), expect.any(String));
  });
});
