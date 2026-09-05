import type { User } from "@esposter/db-schema";

import { createOperationData } from "@/services/shared/createOperationData";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useFriendStore = defineStore("message/user/friend", () => {
  const { $trpc } = useNuxtApp();
  const { executeMutation } = useMutation();
  const friends = ref<User[]>([]);
  const { createFriend: storeCreateFriend, deleteFriend: baseStoreDeleteFriend } = createOperationData(
    friends,
    ["id"],
    DatabaseEntityType.Friend,
  );
  const storeDeleteFriend = (friendId: User["id"]) => {
    baseStoreDeleteFriend({ id: friendId });
  };
  // Single source of truth for "is this user already a friend" — every surface offering the add-friend
  // Affordance asks it, and each one deriving its own predicate is how the profile card and the search
  // Results end up disagreeing about the same pair
  const checkIsFriend = (userId: User["id"]) => friends.value.some(({ id }) => id === userId);
  const deleteFriend = async (friendId: User["id"]) => {
    await executeMutation(() => $trpc.friend.deleteFriend.mutate(friendId), {
      // The one row this write removes — removals are keyed per friend and never queue against each other
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
    checkIsFriend,
    deleteFriend,
    friends,
    storeCreateFriend,
    storeDeleteFriend,
  };
});
