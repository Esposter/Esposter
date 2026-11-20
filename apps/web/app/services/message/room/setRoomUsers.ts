import type { UserInRoom } from "#shared/models/db/room/UserInRoom";

import { useUserStore } from "#src/store/message/user/index";

// The users a read answered for a room are held as users, and the members among them as the room's members. Each row is
// Applied on its own, so a row the read did not return keeps what the room held for it
export const setRoomUsers = (roomId: string, users: UserInRoom[]) => {
  const userStore = useUserStore();
  const { storeRoomMembers, storeUser } = userStore;
  for (const user of users) {
    storeUser(user);
    if (user.isMember) storeRoomMembers(roomId, [user]);
  }
};
