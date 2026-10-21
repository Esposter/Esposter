import type { MemberInRoom } from "#shared/models/db/room/MemberInRoom";
import type { PublicUser } from "@esposter/db-schema";

import { useRoomStore } from "@/store/message/room";

export const useUserStore = defineStore("message/user", () => {
  const roomStore = useRoomStore();
  const userMap = ref(new Map<string, PublicUser>());
  // Each room's member rows as the room's reads returned them, keyed by user id. A user's name differs from room to
  // Room, so the row carries the name its own room gave it and nothing here derives one
  const { getData: getRoomMemberMap, setData: setRoomMemberMap } = useDataMap(
    () => roomStore.currentRoomId,
    () => new Map<string, MemberInRoom>(),
  );
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

  return { getRoomMemberMap, storeRoomMembers, storeUser, storeUsers, userMap };
});
