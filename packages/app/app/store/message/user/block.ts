import type { FriendUserIdInput } from "#shared/models/db/friend/FriendUserIdInput";
import type { User } from "@esposter/db-schema";

import { useFriendStore } from "@/store/message/user/friend";
import { useFriendRequestStore } from "@/store/message/user/friendRequest";

export const useBlockStore = defineStore("message/user/block", () => {
  const { $trpc } = useNuxtApp();
  const { executeMutation: executeBlockUserMutation } = useMutation();
  const { executeMutation: executeUnblockUserMutation } = useMutation();
  const friendStore = useFriendStore();
  const { storeCreateFriend, storeDeleteFriend } = friendStore;
  const friendRequestStore = useFriendRequestStore();
  const { getFriendRequestsByUser, storeCreateFriendRequest, storeDeleteFriendRequestsByUser } = friendRequestStore;
  const blockedUsers = ref<User[]>([]);

  const blockUser = async (userId: FriendUserIdInput) => {
    await executeBlockUserMutation(() => $trpc.block.blockUser.mutate(userId), {
      // Only the rows this write removes, not copies of both lists: blocks are keyed per user and never queue
      // Against each other or against a removal, so reinstating the lists would resurrect a friend or a request
      // Another write already dropped — and lose whatever a subscription delivered while this one was in flight
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

  const unblockUser = async (blockedUserId: FriendUserIdInput) => {
    await executeUnblockUserMutation(() => $trpc.block.unblockUser.mutate(blockedUserId), {
      // The one row this write removes, not a copy of the list: unblocks are keyed per user and never queue
      // Against each other, so reinstating the list would resurrect a user another unblock already removed and
      // Drop whoever a block added meanwhile. Back at the end rather than where it stood — a cosmetic loss
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
    blockUser,
    unblockUser,
  };
});
