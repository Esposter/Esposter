import type { FriendUserIdInput } from "#shared/models/db/friend/FriendUserIdInput";
import type { User } from "@esposter/db-schema";

import { useFriendStore } from "@/store/message/user/friend";

export const useFriendRequestStore = defineStore("message/user/friendRequest", () => {
  const { $trpc } = useNuxtApp();
  const friendStore = useFriendStore();
  const { addFriend } = friendStore;
  const friendRequests = ref<User[]>([]);
  const sentFriendRequests = ref<User[]>([]);

  const acceptFriendRequest = async (senderId: FriendUserIdInput) => {
    await $trpc.friendRequest.acceptFriendRequest.mutate(senderId);
    const sender = friendRequests.value.find(({ id }) => id === senderId);
    friendRequests.value = friendRequests.value.filter(({ id }) => id !== senderId);
    if (sender) addFriend(sender);
  };

  const declineFriendRequest = async (senderId: FriendUserIdInput) => {
    await $trpc.friendRequest.declineFriendRequest.mutate(senderId);
    friendRequests.value = friendRequests.value.filter(({ id }) => id !== senderId);
  };

  const sendFriendRequest = async (receiverId: FriendUserIdInput) => {
    const receiver = await $trpc.friendRequest.sendFriendRequest.mutate(receiverId);
    if (!sentFriendRequests.value.some(({ id }) => id === receiverId))
      sentFriendRequests.value = [receiver, ...sentFriendRequests.value];
  };

  // Called via subscription when the receiver accepted our sent request
  const storeAcceptFriendRequest = (receiverUser: User) => {
    sentFriendRequests.value = sentFriendRequests.value.filter(({ id }) => id !== receiverUser.id);
    addFriend(receiverUser);
  };

  // Called via subscription when a new request arrives from a sender
  const storeCreateFriendRequest = (senderUser: User) => {
    if (!friendRequests.value.some(({ id }) => id === senderUser.id))
      friendRequests.value = [senderUser, ...friendRequests.value];
  };

  // Called via subscription when the receiver declined our sent request
  const storeDeclineFriendRequest = (declinerId: string) => {
    sentFriendRequests.value = sentFriendRequests.value.filter(({ id }) => id !== declinerId);
  };

  return {
    acceptFriendRequest,
    declineFriendRequest,
    friendRequests,
    sendFriendRequest,
    sentFriendRequests,
    storeAcceptFriendRequest,
    storeCreateFriendRequest,
    storeDeclineFriendRequest,
  };
});
