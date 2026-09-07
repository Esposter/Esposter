import type { AzureWebPubSubHub } from "@esposter/db-schema";

import { WebPubSubServiceClient } from "@azure/web-pubsub";

export const getWebPubSubServiceClient = (azureWebPubSubHub: AzureWebPubSubHub): WebPubSubServiceClient =>
  new WebPubSubServiceClient(process.env.AZURE_WEB_PUBSUB_CONNECTION_STRING, azureWebPubSubHub);
