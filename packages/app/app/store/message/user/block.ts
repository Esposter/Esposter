import type { FriendUserIdInput } from "#shared/models/db/friend/FriendUserIdInput";
import type { User } from "@esposter/db-schema";

import { useFriendStore } from "@/store/message/user/friend";
import { useFriendRequestStore } from "@/store/message/user/friendRequest";

export const useBlockStore = defineStore("message/user/block", () => {
  const { $trpc } = useNuxtApp();
  const { executeMutation: executeBlockUserMutation } = useMutation();
  const { executeMutation: executeUnblockUserMutation } = useMutation();
  const friendStore = useFriendStore();
  const { storeDeleteFriend } = friendStore;
  const friendRequestStore = useFriendRequestStore();
  const { storeDeleteFriendRequestsByUser } = friendRequestStore;
  const blockedUsers = ref<User[]>([]);

  const blockUser = async (userId: FriendUserIdInput) => {
    await executeBlockUserMutation(() => $trpc.block.blockUser.mutate(userId), {
      // Snapshotted when the write is sent rather than when it was issued, so a failed block restores the friend
      // And request lists as the writes ahead of it left them instead of resurrecting what they removed
      applyOptimistic: () => {
        const previousFriends = [...friendStore.friends];
        const previousFriendRequests = [...friendRequestStore.friendRequests];
        storeDeleteFriend(userId);
        storeDeleteFriendRequestsByUser(userId);
        return () => {
          friendStore.friends = previousFriends;
          friendRequestStore.friendRequests = previousFriendRequests;
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
      // Snapshotted when the write is sent rather than when it was issued: unblocks share one list, so a failed
      // One must restore it as the unblocks ahead of it left it rather than resurrecting the users they removed
      applyOptimistic: () => {
        const previousBlockedUsers = blockedUsers.value;
        blockedUsers.value = blockedUsers.value.filter(({ id }) => id !== blockedUserId);
        return () => {
          blockedUsers.value = previousBlockedUsers;
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
