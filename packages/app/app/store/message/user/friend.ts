import type { FriendUserIdInput } from "#shared/models/db/friend/FriendUserIdInput";
import type { User } from "@esposter/db-schema";

export const useFriendStore = defineStore("message/user/friend", () => {
  const { $trpc } = useNuxtApp();
  const blockedUsers = ref<User[]>([]);
  const friends = ref<User[]>([]);
  const pendingRequests = ref<User[]>([]);
  const sentRequests = ref<User[]>([]);

  const acceptFriendRequest = async (senderId: FriendUserIdInput) => {
    await $trpc.friend.acceptFriendRequest.mutate(senderId);
    const sender = pendingRequests.value.find(({ id }) => id === senderId);
    pendingRequests.value = pendingRequests.value.filter(({ id }) => id !== senderId);
    if (sender) friends.value = [sender, ...friends.value];
  };

  const blockUser = async (userId: FriendUserIdInput) => {
    const user = await $trpc.friend.blockUser.mutate(userId);
    friends.value = friends.value.filter(({ id }) => id !== userId);
    pendingRequests.value = pendingRequests.value.filter(({ id }) => id !== userId);
    sentRequests.value = sentRequests.value.filter(({ id }) => id !== userId);
    if (!blockedUsers.value.some(({ id }) => id === userId)) blockedUsers.value = [user, ...blockedUsers.value];
  };

  const declineFriendRequest = async (senderId: FriendUserIdInput) => {
    await $trpc.friend.declineFriendRequest.mutate(senderId);
    pendingRequests.value = pendingRequests.value.filter(({ id }) => id !== senderId);
  };

  const deleteFriend = async (friendId: FriendUserIdInput) => {
    await $trpc.friend.deleteFriend.mutate(friendId);
    friends.value = friends.value.filter(({ id }) => id !== friendId);
  };

  const sendFriendRequest = async (receiverId: FriendUserIdInput) => {
    const receiver = await $trpc.friend.sendFriendRequest.mutate(receiverId);
    if (!sentRequests.value.some(({ id }) => id === receiverId)) sentRequests.value = [receiver, ...sentRequests.value];
  };

  const unblockUser = async (blockedUserId: FriendUserIdInput) => {
    await $trpc.friend.unblockUser.mutate(blockedUserId);
    blockedUsers.value = blockedUsers.value.filter(({ id }) => id !== blockedUserId);
  };

  const storeAcceptFriendRequest = (receiverUser: User) => {
    sentRequests.value = sentRequests.value.filter(({ id }) => id !== receiverUser.id);
    if (!friends.value.some(({ id }) => id === receiverUser.id)) friends.value = [receiverUser, ...friends.value];
  };

  const storeCreatePendingRequest = (senderUser: User) => {
    if (!pendingRequests.value.some(({ id }) => id === senderUser.id))
      pendingRequests.value = [senderUser, ...pendingRequests.value];
  };

  const storeDeclineFriendRequest = (declinerId: string) => {
    sentRequests.value = sentRequests.value.filter(({ id }) => id !== declinerId);
  };

  const storeDeleteFriend = (deleterId: string) => {
    friends.value = friends.value.filter(({ id }) => id !== deleterId);
  };

  return {
    acceptFriendRequest,
    blockedUsers,
    blockUser,
    declineFriendRequest,
    deleteFriend,
    friends,
    pendingRequests,
    sendFriendRequest,
    sentRequests,
    storeAcceptFriendRequest,
    storeCreatePendingRequest,
    storeDeclineFriendRequest,
    storeDeleteFriend,
    unblockUser,
  };
});
