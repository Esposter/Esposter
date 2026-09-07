import type { FriendUserIdInput } from "#shared/models/db/friend/FriendUserIdInput";
import type { User } from "@esposter/db-schema";

import { useFriendStore } from "@/store/message/user/friend";
import { useFriendRequestStore } from "@/store/message/user/friendRequest";

export const useBlockStore = defineStore("message/user/block", () => {
  const { $trpc } = useNuxtApp();
  // One executor for both directions, because a queue lives on the instance and not on the key: on two instances
  // The shared `key: userId` reads as if a block and an unblock of the same user serialised while they in fact
  // Raced, and they write the same two lists — the unblock could put a row back that the block beside it had
  // Just removed
  const { executeMutation: executeBlockMutation } = useMutation();
  const friendStore = useFriendStore();
  const { storeCreateFriend, storeDeleteFriend } = friendStore;
  const friendRequestStore = useFriendRequestStore();
  const { getFriendRequestsByUser, storeCreateFriendRequest, storeDeleteFriendRequestsByUser } = friendRequestStore;
  const blockedUsers = ref<User[]>([]);

  const createBlock = async (userId: FriendUserIdInput) => {
    await executeBlockMutation(() => $trpc.block.createBlock.mutate(userId), {
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
        if (!blockedUsers.value.some(({ id }) => id === userId)) blockedUsers.value = [user, ...blockedUsers.value];
      },
    });
  };

  const deleteBlock = async (blockedUserId: FriendUserIdInput) => {
    await executeBlockMutation(() => $trpc.block.deleteBlock.mutate(blockedUserId), {
      // The one row this write removes — unblocks of different users never queue against each other. It comes
      // Back at the end rather than where it stood, which is a cosmetic loss
      applyOptimistic: () => {
        const deletedBlockedUser = blockedUsers.value.find(({ id }) => id === blockedUserId);
        blockedUsers.value = blockedUsers.value.filter(({ id }) => id !== blockedUserId);
        return () => {
          if (deletedBlockedUser) blockedUsers.value = [...blockedUsers.value, deletedBlockedUser];
        };
      },
      key: blockedUserId,
    });
  };

  return {
    blockedUsers,
    createBlock,
    deleteBlock,
  };
});
