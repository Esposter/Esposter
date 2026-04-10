import type { User } from "@esposter/db-schema";

export const useFriendStore = defineStore("message/user/friend", () => {
  const { $trpc } = useNuxtApp();
  const blockedUsers = ref<User[]>([]);
  const friends = ref<User[]>([]);
  const pendingRequests = ref<User[]>([]);
  const sentRequests = ref<User[]>([]);

  const acceptFriendRequest = async (senderId: string) => {
    await $trpc.friend.acceptFriendRequest.mutate(senderId);
    const sender = pendingRequests.value.find(({ id }) => id === senderId);
    pendingRequests.value = pendingRequests.value.filter(({ id }) => id !== senderId);
    if (sender) friends.value = [sender, ...friends.value];
  };

  const blockUser = async (user: User) => {
    await $trpc.friend.blockUser.mutate(user.id);
    friends.value = friends.value.filter(({ id }) => id !== user.id);
    pendingRequests.value = pendingRequests.value.filter(({ id }) => id !== user.id);
    sentRequests.value = sentRequests.value.filter(({ id }) => id !== user.id);
    if (!blockedUsers.value.some(({ id }) => id === user.id)) blockedUsers.value = [user, ...blockedUsers.value];
  };

  const declineFriendRequest = async (senderId: string) => {
    await $trpc.friend.declineFriendRequest.mutate(senderId);
    pendingRequests.value = pendingRequests.value.filter(({ id }) => id !== senderId);
  };

  const deleteFriend = async (friendId: string) => {
    await $trpc.friend.deleteFriend.mutate(friendId);
    friends.value = friends.value.filter(({ id }) => id !== friendId);
  };

  const sendFriendRequest = async (receiver: User) => {
    await $trpc.friend.sendFriendRequest.mutate(receiver.id);
    if (!sentRequests.value.some(({ id }) => id === receiver.id))
      sentRequests.value = [receiver, ...sentRequests.value];
  };

  const unblockUser = async (blockedUserId: string) => {
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
    blockUser,
    blockedUsers,
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
