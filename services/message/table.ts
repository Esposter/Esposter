import { getReverseTickedDay } from "@/services/azure/table";

export const getMessagesPartitionKey = (roomId: string, createdAt: Date) =>
  `${roomId}-${getReverseTickedDay(createdAt)}`;

export const getMessagesPartitionKeyFilter = (roomId: string) =>
  `PartitionKey gt '${roomId}' and PartitionKey lt '${roomId}😆'`;
