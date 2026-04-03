import type { User } from "@esposter/db-schema";

export const useFriendStore = defineStore("message/friend", () => {
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

  return {
    acceptFriendRequest,
    declineFriendRequest,
    deleteFriend,
    friends,
    pendingRequests,
    sendFriendRequest,
    sentRequests,
  };
});
