import type { FriendUserIdInput } from "#shared/models/db/friend/FriendUserIdInput";
import type { User } from "@esposter/db-schema";

import { createOperationData } from "@/services/shared/createOperationData";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useFriendStore = defineStore("message/user/friend", () => {
  const { $trpc } = useNuxtApp();
  const {
    createFriend: baseStoreCreateFriend,
    deleteFriend: baseStoreDeleteFriend,
    friends,
  } = createOperationData(ref<User[]>([]), ["id"], DatabaseEntityType.Friend);

  const storeCreateFriend = (friend: User) => {
    if (!friends.value.some(({ id }) => id === friend.id)) baseStoreCreateFriend(friend);
  };

  const storeDeleteFriend = (friendId: string) => {
    baseStoreDeleteFriend({ id: friendId });
  };

  const deleteFriend = async (friendId: FriendUserIdInput) => {
    await $trpc.friend.deleteFriend.mutate(friendId);
    storeDeleteFriend(friendId);
  };

  return {
    deleteFriend,
    friends,
    storeCreateFriend,
    storeDeleteFriend,
  };
});
