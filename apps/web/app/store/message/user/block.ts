import type { FriendUserIdInput } from "#shared/models/db/friend/FriendUserIdInput";
import type { PublicUser } from "@esposter/db-schema";

import { useFriendStore } from "@/store/message/user/friend";
import { useFriendRequestStore } from "@/store/message/user/friendRequest";

export const useBlockStore = defineStore("message/user/block", () => {
  const { $trpc } = useNuxtApp();
  const friendStore = useFriendStore();
  const { storeCreateFriend, storeDeleteFriend } = friendStore;
  const friendRequestStore = useFriendRequestStore();
  // A block removes the requests between the two users, so it queues on the pair's executor that the friend request
  // Store owns, beside the accept and decline of those requests. An unblock of the same user shares it too, so the
  // Two cannot race over the same lists
  const {
    executeUserPairMutation,
    getFriendRequestsByUser,
    storeCreateFriendRequest,
    storeDeleteFriendRequestsByUser,
  } = friendRequestStore;
  const blockedUsers = ref<PublicUser[]>([]);
  const blockedUsersReadKey = "blockedUsers";
  const { readWithReplayedPushes, recordReadingPush } = useReadingPushes<PublicUser>();

  // The read's answer is merged with the blocks and unblocks that landed while it was in flight, so a response taken
  // Before one does not write the list back without it
  const readBlockedUsers = (read: () => Promise<PublicUser[]>) =>
    readWithReplayedPushes(blockedUsersReadKey, read, (newBlockedUsers) => {
      blockedUsers.value = newBlockedUsers;
    });

  const createBlock = async (userId: FriendUserIdInput) => {
    await executeUserPairMutation(() => $trpc.block.createBlock.mutate(userId), {
      // Only the rows this write removes — blocks of different users never queue against each other
      applyOptimistic: () => {
        const deletedFriend = friendStore.friends.find(({ id }) => id === userId);
        const deletedFriendRequests = getFriendRequestsByUser(userId);
        storeDeleteFriend(userId);
        storeDeleteFriendRequestsByUser(userId);
        return () => {
          if (deletedFriend) storeCreateFriend(deletedFriend);
          for (const deletedFriendRequest of deletedFriendRequests) storeCreateFriendRequest(deletedFriendRequest);
        };
      },
      key: userId,
      // The blocked-user row is server-resolved, so it lands in onSuccess rather than optimistically
      onSuccess: (user) => {
        recordReadingPush(blockedUsersReadKey, { item: user, type: "set" });
        if (!blockedUsers.value.some(({ id }) => id === userId)) blockedUsers.value = [user, ...blockedUsers.value];
      },
    });
  };

  const deleteBlock = async (blockedUserId: FriendUserIdInput) => {
    await executeUserPairMutation(() => $trpc.block.deleteBlock.mutate(blockedUserId), {
      // The one row this write removes — unblocks of different users never queue against each other. It comes
      // Back at the end rather than where it stood, which is a cosmetic loss
      applyOptimistic: () => {
        const deletedBlockedUser = blockedUsers.value.find(({ id }) => id === blockedUserId);
        recordReadingPush(blockedUsersReadKey, { checkIsRemoved: ({ id }) => id === blockedUserId, type: "remove" });
        blockedUsers.value = blockedUsers.value.filter(({ id }) => id !== blockedUserId);
        return () => {
          if (!deletedBlockedUser) return;

          recordReadingPush(blockedUsersReadKey, { item: deletedBlockedUser, type: "set" });
          blockedUsers.value = [...blockedUsers.value, deletedBlockedUser];
        };
      },
      key: blockedUserId,
    });
  };

  return { blockedUsers, createBlock, deleteBlock, readBlockedUsers };
});
