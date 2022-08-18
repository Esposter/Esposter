import { AzureQueue } from "@/services/azure/types";
import { QueueClient, QueueServiceClient } from "@azure/storage-queue";

const runtimeConfig = useRuntimeConfig();

const queueServiceClient = QueueServiceClient.fromConnectionString(runtimeConfig.azureStorageAccountConnectionString);

export const getQueueClient = async (queueName: AzureQueue) => {
  const queueClient = queueServiceClient.getQueueClient(queueName);
  await queueClient.createIfNotExists();
  return queueClient;
};

export const sendMessage = async (queueClient: QueueClient, ...args: Parameters<typeof queueClient["sendMessage"]>) => {
  const cleanedArgs: typeof args = [Buffer.from(args[0]).toString("base64"), args[1]];
  const response = await queueClient.sendMessage(...cleanedArgs);
  const error = response._response.status >= 400;
  if (error) console.error(`Failed to send message for queue ${queueClient.name}`);
  return !error;
};
