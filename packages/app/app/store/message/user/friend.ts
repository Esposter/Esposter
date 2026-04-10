import type { FriendUserIdInput } from "#shared/models/db/friend/FriendUserIdInput";
import type { User } from "@esposter/db-schema";

export const useFriendStore = defineStore("message/user/friend", () => {
  const { $trpc } = useNuxtApp();
  const blockedUsers = ref<User[]>([]);
  const friends = ref<User[]>([]);

  const blockUser = async (userId: FriendUserIdInput) => {
    const user = await $trpc.friend.blockUser.mutate(userId);
    friends.value = friends.value.filter(({ id }) => id !== userId);
    const friendRequestStore = useFriendRequestStore();
    friendRequestStore.pendingRequests = friendRequestStore.pendingRequests.filter(({ id }) => id !== userId);
    friendRequestStore.sentRequests = friendRequestStore.sentRequests.filter(({ id }) => id !== userId);
    if (!blockedUsers.value.some(({ id }) => id === userId)) blockedUsers.value = [user, ...blockedUsers.value];
  };

  const deleteFriend = async (friendId: FriendUserIdInput) => {
    await $trpc.friend.deleteFriend.mutate(friendId);
    friends.value = friends.value.filter(({ id }) => id !== friendId);
  };

  const unblockUser = async (blockedUserId: FriendUserIdInput) => {
    await $trpc.friend.unblockUser.mutate(blockedUserId);
    blockedUsers.value = blockedUsers.value.filter(({ id }) => id !== blockedUserId);
  };

  const storeDeleteFriend = (deleterId: string) => {
    friends.value = friends.value.filter(({ id }) => id !== deleterId);
  };

  return {
    blockedUsers,
    blockUser,
    deleteFriend,
    friends,
    storeDeleteFriend,
    unblockUser,
  };
});
