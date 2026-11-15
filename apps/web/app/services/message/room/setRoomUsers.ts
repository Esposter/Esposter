import type { UserInRoom } from "#shared/models/db/room/UserInRoom";

import { useUserStore } from "#src/store/message/user/index";

// The users a read answered for a room are held as users, and the members among them as the room's members
export const setRoomUsers = (roomId: string, users: UserInRoom[]) => {
  const userStore = useUserStore();
  const { storeRoomMembers, storeUsers } = userStore;
  storeUsers(users);
  storeRoomMembers(
    roomId,
    users.filter(({ isMember }) => isMember),
  );
};
