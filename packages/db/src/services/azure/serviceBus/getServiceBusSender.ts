import type { ServiceBusSender } from "@azure/service-bus";
import type { AzureQueue } from "@esposter/db-schema";

import { ServiceBusClient } from "@azure/service-bus";
import { getOrCreate } from "@esposter/shared";
// Service Bus clients hold a long-lived AMQP connection.
// Cache clients and senders per process instead of recreating (and leaking) them on every send.
const serviceBusClients = new Map<string, ServiceBusClient>();
const serviceBusSenders = new Map<string, ServiceBusSender>();

export const getServiceBusSender = (connectionString: string, azureQueue: AzureQueue): ServiceBusSender => {
  const serviceBusClient = getOrCreate(
    serviceBusClients,
    connectionString,
    () => new ServiceBusClient(connectionString),
  );
  return getOrCreate(serviceBusSenders, `${connectionString}/${azureQueue}`, () =>
    serviceBusClient.createSender(azureQueue),
  );
};
