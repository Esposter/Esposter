import type { AzureWebPubSubHub } from "@esposter/db-schema";

import { WebPubSubServiceClient } from "@azure/web-pubsub";

export const useWebPubSubServiceClient = (azureWebPubSubHub: AzureWebPubSubHub) => {
  const runtimeConfig = useRuntimeConfig();
  return new WebPubSubServiceClient(runtimeConfig.azure.webPubSub.connectionString, azureWebPubSubHub);
};
