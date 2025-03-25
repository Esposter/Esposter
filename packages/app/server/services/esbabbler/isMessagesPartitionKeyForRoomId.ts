export const isMessagesPartitionKeyForRoomId = (partitionKey: string, roomId: string) =>
  partitionKey.startsWith(roomId);
