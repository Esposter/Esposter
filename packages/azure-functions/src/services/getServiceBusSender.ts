import type { ServiceBusSender } from "@azure/service-bus";
import type { AzureQueue } from "@esposter/db-schema";

import { getServiceBusSender as baseGetServiceBusSender } from "@esposter/db";

export const getServiceBusSender = (azureQueue: AzureQueue): ServiceBusSender =>
  baseGetServiceBusSender(process.env.AZURE_SERVICE_BUS_CONNECTION_STRING, azureQueue);
