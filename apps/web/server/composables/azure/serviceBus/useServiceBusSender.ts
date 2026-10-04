import type { AzureQueue } from "@esposter/db-schema";

import { getServiceBusSender } from "@esposter/db";
import { useRuntimeConfig } from "nuxt/server";

export const useServiceBusSender = (azureQueue: AzureQueue) => {
  const runtimeConfig = useRuntimeConfig();
  return getServiceBusSender(runtimeConfig.azure.serviceBus.connectionString, azureQueue);
};
