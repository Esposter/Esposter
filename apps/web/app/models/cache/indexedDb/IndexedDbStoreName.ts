export const IndexedDbStoreName = {
  Members: "Members",
  Messages: "Messages",
  Rooms: "Rooms",
  UserToRooms: "UserToRooms",
} as const;
export type IndexedDbStoreName = (typeof IndexedDbStoreName)[keyof typeof IndexedDbStoreName];
