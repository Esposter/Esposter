import type { FriendUserIdInput } from "#shared/models/db/friend/FriendUserIdInput";
import type { User } from "@esposter/db-schema";

import { useMutation } from "@/composables/shared/useMutation";
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
    const previousFriends = [...friendStore.friends];
    const previousFriendRequests = [...friendRequestStore.friendRequests];
    await executeBlockUserMutation(() => $trpc.block.blockUser.mutate(userId), {
      applyOptimistic: () => {
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
    const previousBlockedUsers = blockedUsers.value;
    await executeUnblockUserMutation(() => $trpc.block.unblockUser.mutate(blockedUserId), {
      applyOptimistic: () => {
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
