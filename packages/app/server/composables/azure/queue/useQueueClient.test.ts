import type { QueueClient } from "@azure/storage-queue";
import type { AzureQueue } from "@esposter/db-schema";

import { MockQueueClient } from "azure-mock";
import { describe } from "vitest";

export const useQueueClient = (azureQueue: AzureQueue): QueueClient =>
  new MockQueueClient("", azureQueue) as unknown as QueueClient;

describe.todo("useQueueClient");
