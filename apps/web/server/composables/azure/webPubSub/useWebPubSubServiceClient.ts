import type { AzureWebPubSubHub } from "@esposter/db-schema";

import { WebPubSubServiceClient } from "@azure/web-pubsub";

export const useWebPubSubServiceClient = (azureWebPubSubHub: AzureWebPubSubHub) =>
  new WebPubSubServiceClient(process.env.AZURE_WEB_PUBSUB_CONNECTION_STRING, azureWebPubSubHub);
