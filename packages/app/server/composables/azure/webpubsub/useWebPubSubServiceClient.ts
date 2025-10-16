import type { AzureWebPubSubHub } from "@esposter/db-schema";

import { getWebPubSubServiceClient } from "@esposter/db";

export const useWebPubSubServiceClient = (azureWebPubSubHub: AzureWebPubSubHub) => {
  const runtimeConfig = useRuntimeConfig();
  return getWebPubSubServiceClient(runtimeConfig.azure.webpubsub.connectionString, azureWebPubSubHub);
};
