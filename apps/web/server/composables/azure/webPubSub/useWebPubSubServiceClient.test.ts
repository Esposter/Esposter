import type { WebPubSubServiceClient } from "@azure/web-pubsub";
import type { AzureWebPubSubHub } from "@esposter/db-schema";

import { MockWebPubSubServiceClient } from "azure-mock";
import { describe } from "vitest";

// Group membership lives in `MockWebPubSubDatabase`, not on the instance, so every client handed out reads the same groups
export const useWebPubSubServiceClient = (_azureWebPubSubHub: AzureWebPubSubHub): WebPubSubServiceClient =>
  new MockWebPubSubServiceClient() as unknown as WebPubSubServiceClient;

describe.todo("useWebPubSubServiceClient");
