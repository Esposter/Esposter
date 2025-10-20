import type { WebPubSubServiceClient } from "@azure/web-pubsub";
import type { AzureWebPubSubHub } from "@esposter/db-schema";

import { getWebPubSubServiceClient as baseGetWebPubSubServiceClient } from "@esposter/db";

export const getWebPubSubServiceClient = (azureWebPubSubHub: AzureWebPubSubHub): WebPubSubServiceClient =>
  baseGetWebPubSubServiceClient(process.env.AZURE_WEB_PUBSUB_CONNECTION_STRING, azureWebPubSubHub);
