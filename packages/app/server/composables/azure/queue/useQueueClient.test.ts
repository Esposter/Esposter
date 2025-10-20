import type { useQueueClient } from "@@/server/composables/azure/queue/useQueueClient";
import type { QueueClient } from "@azure/storage-queue";

import { MockQueueClient } from "azure-mock";
import { describe } from "vitest";

export const useQueueClientMock: typeof useQueueClient = (queueName) =>
  Promise.resolve(new MockQueueClient("", queueName) as unknown as QueueClient);

describe.todo("useQueueClient");
