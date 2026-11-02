import type { PublicUser } from "@esposter/db-schema";

import { createOperationData } from "@/services/shared/createOperationData";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useFriendStore = defineStore("message/user/friend", () => {
  const { $trpc } = useNuxtApp();
  const { executeMutation } = useMutation();
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
  const deleteFriend = async (friendId: PublicUser["id"]) => {
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
  return { checkIsFriend, deleteFriend, friends, readFriends, storeCreateFriend, storeDeleteFriend };
});
