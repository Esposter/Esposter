import type { User } from "@esposter/db-schema";

import { createOperationData } from "@/services/shared/createOperationData";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useFriendStore = defineStore("message/user/friend", () => {
  const friends = ref<User[]>([]);
  const { createFriend: baseStoreCreateFriend, deleteFriend: baseStoreDeleteFriend } = createOperationData(
    friends,
    ["id"],
    DatabaseEntityType.Friend,
  );
  const storeCreateFriend = (friend: User) => {
    if (!friends.value.some(({ id }) => id === friend.id)) baseStoreCreateFriend(friend);
  };
  const storeDeleteFriend = (friendId: string) => {
    baseStoreDeleteFriend({ id: friendId });
  };
  return {
    friends,
    storeCreateFriend,
    storeDeleteFriend,
  };
});
