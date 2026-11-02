import type { SnapshotPush } from "@/models/shared/SnapshotPush";
import type { PublicUser } from "@esposter/db-schema";

import { createOperationData } from "@/services/shared/createOperationData";
import { mergeSnapshot } from "@/services/shared/mergeSnapshot";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useFriendStore = defineStore("message/user/friend", () => {
  const { $trpc } = useNuxtApp();
  const { executeMutation, executeQuery } = useMutation();
  const friends = ref<PublicUser[]>([]);
  // The writes that land while the friends read is in flight, kept until its answer is merged with them
  let readingPushes: SnapshotPush<PublicUser>[] | undefined;
  const recordReadingPush = (push: SnapshotPush<PublicUser>) => {
    readingPushes?.push(push);
  };
  const { createFriend: baseStoreCreateFriend, deleteFriend: baseStoreDeleteFriend } = createOperationData(
    friends,
    ["id"],
    DatabaseEntityType.Friend,
  );
  const storeCreateFriend = (friend: PublicUser) => {
    recordReadingPush({ item: friend, type: "set" });
    baseStoreCreateFriend(friend);
  };
  const storeDeleteFriend = (friendId: PublicUser["id"]) => {
    recordReadingPush({ checkIsRemoved: ({ id }) => id === friendId, type: "remove" });
    baseStoreDeleteFriend({ id: friendId });
  };
  // The read's answer is merged with the friends a push added or removed while it was in flight, so a response taken
  // Before the push does not write the list back without it
  const readFriends = async (read: () => Promise<PublicUser[]>) => {
    const pushes: SnapshotPush<PublicUser>[] = [];
    readingPushes = pushes;
    await executeQuery(read, {
      key: "friends",
      onSuccess: (newFriends) => {
        friends.value = mergeSnapshot(newFriends, pushes);
      },
    });
    if (readingPushes === pushes) readingPushes = undefined;
  };
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
