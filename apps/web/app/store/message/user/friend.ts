import type { PublicUser } from "@esposter/db-schema";

import { createOperationData } from "#src/services/shared/createOperationData";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useFriendStore = defineStore("message/user/friend", () => {
  const { $trpc } = useNuxtApp();
  // Unfriending, accepting, declining, blocking and unblocking all write the one other party's rows, so they share one
  // Executor keyed by that party. A queue lives on the instance and not on the key, so on two instances a rejected
  // Write's rollback could put back a row another write had already removed on the server
  const { executeMutation: executeUserPairMutation } = useMutation();
  const friends = ref<PublicUser[]>([]);
  const friendsReadKey = "friends";
  const { readWithReplayedPushes, recordReadingPush } = useReadingPushes<PublicUser>();
  const { createFriend: baseStoreCreateFriend, deleteFriend: baseStoreDeleteFriend } = createOperationData(
    friends,
    ["id"],
    DatabaseEntityType.Friend,
  );
  const storeCreateFriend = (friend: PublicUser) => {
    recordReadingPush(friendsReadKey, { item: friend, type: "set" });
    baseStoreCreateFriend(friend);
  };
  const storeDeleteFriend = (friendId: PublicUser["id"]) => {
    recordReadingPush(friendsReadKey, { checkIsRemoved: ({ id }) => id === friendId, type: "remove" });
    baseStoreDeleteFriend({ id: friendId });
  };
  const readFriends = (read: () => Promise<PublicUser[]>) =>
    readWithReplayedPushes(friendsReadKey, read, (newFriends) => {
      friends.value = newFriends;
    });
  // Single source of truth for "is this user already a friend" — every surface offering the add-friend
  // Affordance asks it, and each one deriving its own predicate is how the profile card and the search
  // Results end up disagreeing about the same pair
  const checkIsFriend = (userId: PublicUser["id"]) => friends.value.some(({ id }) => id === userId);
  const deleteFriend = (friendId: PublicUser["id"]) => {
    executeUserPairMutation(() => $trpc.friend.deleteFriend.mutate(friendId), {
      // The one row this write removes, and a block of the same user queues behind it on the pair's executor
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
    executeUserPairMutation,
    friends,
    readFriends,
    storeCreateFriend,
    storeDeleteFriend,
  };
});
