import type { User } from "@esposter/db-schema";

export const useFriendStore = defineStore("message/user/friend", () => {
  const { $trpc } = useNuxtApp();
  const friends = ref<User[]>([]);
  const pendingRequests = ref<User[]>([]);
  const sentRequests = ref<User[]>([]);

  const acceptFriendRequest = async (senderId: string) => {
    await $trpc.friend.acceptFriendRequest.mutate(senderId);
    const sender = pendingRequests.value.find(({ id }) => id === senderId);
    pendingRequests.value = pendingRequests.value.filter(({ id }) => id !== senderId);
    if (sender) friends.value = [sender, ...friends.value];
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

  const storeAcceptFriendRequest = (receiverUser: User) => {
    const existing = sentRequests.value.find(({ id }) => id === receiverUser.id);
    sentRequests.value = sentRequests.value.filter(({ id }) => id !== receiverUser.id);
    if (existing) friends.value = [existing, ...friends.value];
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
  };
});
