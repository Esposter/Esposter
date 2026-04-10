import type { FriendUserIdInput } from "#shared/models/db/friend/FriendUserIdInput";
import type { User } from "@esposter/db-schema";

import { useFriendStore } from "@/store/message/user/friend";
import { useFriendRequestStore } from "@/store/message/user/friendRequest";

export const useBlockStore = defineStore("message/user/block", () => {
  const { $trpc } = useNuxtApp();
  const blockedUsers = ref<User[]>([]);
  const friendStore = useFriendStore();
  const friendRequestStore = useFriendRequestStore();
  const { storeDeleteFriend } = friendStore;
  const { storeDeleteSentFriendRequest } = friendRequestStore;

  const blockUser = async (userId: FriendUserIdInput) => {
    const user = await $trpc.block.blockUser.mutate(userId);
    storeDeleteFriend(userId);
    friendRequestStore.storeDeleteFriendRequest({ id: userId });
    storeDeleteSentFriendRequest(userId);
    if (!blockedUsers.value.some(({ id }) => id === userId)) blockedUsers.value = [user, ...blockedUsers.value];
  };

  const unblockUser = async (blockedUserId: FriendUserIdInput) => {
    await $trpc.block.unblockUser.mutate(blockedUserId);
    blockedUsers.value = blockedUsers.value.filter(({ id }) => id !== blockedUserId);
  };

  return {
    blockedUsers,
    blockUser,
    unblockUser,
  };
});
