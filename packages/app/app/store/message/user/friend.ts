import type { User } from "@esposter/db-schema";

import { createOperationData } from "@/services/shared/createOperationData";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useFriendStore = defineStore("message/user/friend", () => {
  const { $trpc } = useNuxtApp();
  const { executeMutation } = useMutation();
  const friends = ref<User[]>([]);
  // CreateFriend already dedups by id, so a repeated echo delivery is idempotent without a manual guard
  const { createFriend: storeCreateFriend, deleteFriend: baseStoreDeleteFriend } = createOperationData(
    friends,
    ["id"],
    DatabaseEntityType.Friend,
  );
  const storeDeleteFriend = (friendId: User["id"]) => {
    baseStoreDeleteFriend({ id: friendId });
  };
  const deleteFriend = async (friendId: User["id"]) => {
    await executeMutation(() => $trpc.friend.deleteFriend.mutate(friendId), {
      // Snapshotted when the write is sent rather than when it was issued: every removal writes the same list,
      // So a failed one must restore it as the removals ahead of it left it instead of resurrecting them
      applyOptimistic: () => {
        const previousFriends = [...friends.value];
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
