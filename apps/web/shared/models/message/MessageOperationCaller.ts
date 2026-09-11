// What a permission is evaluated against: whether the caller wrote the message and whether they hold
// RoomPermission.ManageMessages in its room. Both halves are answered once per message by the caller.
export interface MessageOperationCaller {
  hasManageMessages: boolean;
  isAuthor: boolean;
}
