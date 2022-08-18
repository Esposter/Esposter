import { AzureQueue } from "@/services/azure/types";
import { QueueClient, QueueServiceClient } from "@azure/storage-queue";

const runtimeConfig = useRuntimeConfig();

const queueServiceClient = QueueServiceClient.fromConnectionString(runtimeConfig.azureStorageAccountConnectionString);

export const getQueueClient = async (queueName: AzureQueue) => {
  const queueClient = queueServiceClient.getQueueClient(queueName);
  await queueClient.createIfNotExists();
  return queueClient;
};

/**
 *
 * @param queueClient
 * @param args
 * @returns If the transaction was successful.
 */
export const sendMessage = async (queueClient: QueueClient, ...args: Parameters<typeof queueClient["sendMessage"]>) => {
  const response = await queueClient.sendMessage(...args);
  const error = response._response.status >= 400;
  if (error) console.error(`Failed to send message for queue ${queueClient.name}`);
  return !error;
};
