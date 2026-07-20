import type { User } from "@esposter/db-schema";

import { useMutation } from "@/composables/shared/useMutation";
import { createOperationData } from "@/services/shared/createOperationData";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useFriendStore = defineStore("message/user/friend", () => {
  const { $trpc } = useNuxtApp();
  const { executeMutation } = useMutation();
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
  const deleteFriend = async (friendId: string) => {
    const previousFriends = [...friends.value];
    await executeMutation(() => $trpc.friend.deleteFriend.mutate(friendId), {
      applyOptimistic: () => {
        storeDeleteFriend(friendId);
        return () => {
          friends.value = previousFriends;
        };
      },
      key: friendId,
    });
  };
  return {
    deleteFriend,
    friends,
    storeCreateFriend,
    storeDeleteFriend,
  };
});
