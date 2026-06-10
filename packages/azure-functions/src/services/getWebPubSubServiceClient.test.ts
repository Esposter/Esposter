import type { WebPubSubServiceClient } from "@azure/web-pubsub";
import type { AzureWebPubSubHub } from "@esposter/db-schema";

import { MockWebPubSubServiceClient } from "azure-mock";
import { describe } from "vitest";

export const getWebPubSubServiceClient = (_hub: AzureWebPubSubHub): WebPubSubServiceClient =>
  new MockWebPubSubServiceClient() as unknown as WebPubSubServiceClient;

describe.todo("getWebPubSubServiceClient");
