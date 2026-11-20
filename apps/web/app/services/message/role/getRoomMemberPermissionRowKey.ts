// The key of an override row: the member and the room, in the order the table's composite key names them
export const getRoomMemberPermissionRowKey = (userId: string, roomId: string): [string, string] => [userId, roomId];
