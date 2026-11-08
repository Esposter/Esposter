import type { AzureQueue } from "@esposter/db-schema";

import { getServiceBusSender } from "@esposter/db";

export const useServiceBusSender = (azureQueue: AzureQueue) =>
  getServiceBusSender(process.env.AZURE_SERVICE_BUS_CONNECTION_STRING, azureQueue);
