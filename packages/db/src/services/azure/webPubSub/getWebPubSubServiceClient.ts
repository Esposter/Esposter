import type { AzureWebPubSubHub } from "@esposter/db-schema";

import { WebPubSubServiceClient } from "@azure/web-pubsub";

export const getWebPubSubServiceClient = (connectionString: string, azureWebPubSubHub: AzureWebPubSubHub) =>
  new WebPubSubServiceClient(connectionString, azureWebPubSubHub);
