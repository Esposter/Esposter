// The key of an assignment row: the member, the room and the role, in the order the table's composite key names them
export const getUserToRoomRoleRowKey = (userId: string, roomId: string, roleId: string): [string, string, string] => [
  userId,
  roomId,
  roleId,
];
