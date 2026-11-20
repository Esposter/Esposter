// The key of a membership row: the user and the room, in the order the table's composite key names them
export const getUserToRoomRowKey = (userId: string, roomId: string): [string, string] => [userId, roomId];
