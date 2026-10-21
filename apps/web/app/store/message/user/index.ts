import type { MemberInRoom } from "#shared/models/db/room/MemberInRoom";
import type { PublicUser } from "@esposter/db-schema";

import { useRoomStore } from "@/store/message/room";

export const useUserStore = defineStore("message/user", () => {
  const roomStore = useRoomStore();
  const userMap = ref(new Map<string, PublicUser>());
  // Each room's member rows as the room's reads returned them, keyed by user id
  // A user's name differs by room, so each row carries the name its own room gave it; nothing here derives a room name
  const { getData: getRoomMemberMap, setData: setRoomMemberMap } = useDataMap(
    () => roomStore.currentRoomId,
    () => new Map<string, MemberInRoom>(),
  );
  // The one rule for a name shown in a room: the room's display name, else the account name. A caller that holds the
  // account name passes it, so the map is only read for a user it has no row for
  const getRoomMemberName = (roomId: string, userId: string, accountName = userMap.value.get(userId)?.name ?? "") =>
    getRoomMemberMap(roomId)?.get(userId)?.displayName ?? accountName;
  const storeUser = (user: PublicUser) => {
    userMap.value.set(user.id, user);
  };
  const storeUsers = (users: PublicUser[]) => {
    for (const user of users) storeUser(user);
  };
  const storeRoomMembers = (roomId: string, members: MemberInRoom[]) => {
    const roomMemberMap = getRoomMemberMap(roomId) ?? new Map<string, MemberInRoom>();
    for (const member of members) roomMemberMap.set(member.id, member);
    setRoomMemberMap(roomId, roomMemberMap);
  };

  return { getRoomMemberMap, getRoomMemberName, storeRoomMembers, storeUser, storeUsers, userMap };
});
