import { getReverseTickedDay } from "@/services/azure/table";

// For the best of both worlds of efficiency and scalability
// the partition key is not only just the roomId
// but also the concatenation of a reverse ticked day based on createdAt
// to ensure that the messages are sorted in Azure table storage (the reverse tick part)
// and that each partition has only a day's worth of records (the day part)
export const getMessagesPartitionKey = (roomId: string, createdAt: Date) =>
  `${roomId}-${getReverseTickedDay(createdAt)}`;

// We can grab all the messages for a particular room
// that has the special partition key of starting with the roomId
// by filtering with > roomId and < roomId{some high value unicode character}
export const getMessagesPartitionKeyFilter = (roomId: string) =>
  `PartitionKey gt '${roomId}' and PartitionKey lt '${roomId}😆'`;
