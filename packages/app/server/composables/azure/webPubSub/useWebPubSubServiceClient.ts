import type { AzureWebPubSubHub } from "@esposter/db-schema";

import { getWebPubSubServiceClient } from "@esposter/db";
import { useRuntimeConfig } from "nitropack/runtime";

export const useWebPubSubServiceClient = (azureWebPubSubHub: AzureWebPubSubHub) => {
  const runtimeConfig = useRuntimeConfig();
  return getWebPubSubServiceClient(runtimeConfig.azure.webPubSub.connectionString, azureWebPubSubHub);
};
