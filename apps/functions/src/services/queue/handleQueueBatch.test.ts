import { QueueJobHandlerMap } from "#src/services/queue/QueueJobHandlerMap";
import { handleQueueBatch } from "#src/services/queue/handleQueueBatch";
import { CloudflareAssetType, CloudflareEnvironment, getCloudflareResourceName, QueueJob } from "@esposter/db-schema";
import { afterEach, describe, expect, test, vi } from "vitest";

const queueName = getCloudflareResourceName(
  CloudflareEnvironment.Development,
  CloudflareAssetType.Queue,
  QueueJob.ProcessWebhook,
);

const createMessage = (body: unknown) => ({
  ack: vi.fn<() => void>(),
  attempts: 1,
  body,
  id: "",
  retry: vi.fn<() => void>(),
  timestamp: new Date(0),
});

const createBatch = (messages: ReturnType<typeof createMessage>[], queue = queueName): MessageBatch<unknown> => ({
  ackAll: vi.fn<() => void>(),
  messages,
  metadata: { metrics: { backlogBytes: 0, backlogCount: 0 } },
  queue,
  retryAll: vi.fn<() => void>(),
});

describe(handleQueueBatch, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("acknowledges each message its job's handler resolves", async () => {
    expect.hasAssertions();

    const handlerSpy = vi.spyOn(QueueJobHandlerMap, QueueJob.ProcessWebhook).mockResolvedValue();
    const messages = [createMessage({ first: true }), createMessage({ second: true })];

    await handleQueueBatch(createBatch(messages), CloudflareEnvironment.Development);

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
    const [failedMessage, resolvedMessage] = [createMessage({ failed: true }), createMessage({ resolved: true })];

    await handleQueueBatch(createBatch([failedMessage, resolvedMessage]), CloudflareEnvironment.Development);

    expect(failedMessage.retry).toHaveBeenCalledExactlyOnceWith();
    expect(failedMessage.ack).not.toHaveBeenCalled();
    expect(resolvedMessage.ack).toHaveBeenCalledExactlyOnceWith();
    expect(console.error).toHaveBeenCalledExactlyOnceWith(`${QueueJob.ProcessWebhook} failed: `, expect.any(Error));
  });

  // A queue this environment does not name is not one this Worker consumes, so no handler runs for its messages
  test("rejects a batch from a queue this Worker does not consume", async () => {
    expect.hasAssertions();

    const message = createMessage({});

    await expect(
      handleQueueBatch(createBatch([message], "some-other-queue"), CloudflareEnvironment.Development),
    ).rejects.toThrowError();
    expect(message.ack).not.toHaveBeenCalled();
    expect(message.retry).not.toHaveBeenCalled();
  });
});
