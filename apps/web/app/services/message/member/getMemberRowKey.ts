// The key of a member's row in the membership table: the user, then the room, in the table's key order. This is the one
// place a member key is built
export const getMemberRowKey = (userId: string, roomId: string): [string, string] => [userId, roomId];
