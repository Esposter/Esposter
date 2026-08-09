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
      // The one row this write removes, not a copy of the list: removals are keyed per friend and never queue
      // Against each other, so reinstating the list would resurrect a friend another removal already dropped —
      // And lose whoever the accept echo delivered while this write was in flight
      applyOptimistic: () => {
        const deletedFriend = friends.value.find(({ id }) => id === friendId);
        storeDeleteFriend(friendId);
        return () => {
          if (deletedFriend) storeCreateFriend(deletedFriend);
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
