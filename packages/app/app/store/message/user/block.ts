import type { FriendUserIdInput } from "#shared/models/db/friend/FriendUserIdInput";
import type { User } from "@esposter/db-schema";

import { useFriendStore } from "@/store/message/user/friend";
import { useFriendRequestStore } from "@/store/message/user/friendRequest";

export const useBlockStore = defineStore("message/user/block", () => {
  const { $trpc } = useNuxtApp();
  const friendStore = useFriendStore();
  const { storeDeleteFriend } = friendStore;
  const friendRequestStore = useFriendRequestStore();
  const { storeDeleteFriendRequestsByUser } = friendRequestStore;
  const blockedUsers = ref<User[]>([]);

  const blockUser = async (userId: FriendUserIdInput) => {
    const user = await $trpc.block.blockUser.mutate(userId);
    storeDeleteFriend(userId);
    storeDeleteFriendRequestsByUser(userId);
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
