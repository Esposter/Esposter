// What one side of a hierarchy comparison is: the room's owner is authoritative on its own, and everyone else
// Is ranked by the highest role position they hold
export interface RoomMemberAuthority {
  isOwner: boolean;
  topPosition: number;
}
