// We can grab all the messages for a particular room
// that has the special partition key of starting with the roomId
// by filtering with > roomId and < roomId{some high value unicode character}
export const getMessagesPartitionKeyFilter = (roomId: string) =>
  `PartitionKey gt '${roomId}' and PartitionKey lt '${roomId}😆'`;
