import type { FriendUserIdInput } from "#shared/models/db/friend/FriendUserIdInput";
import type { User } from "@esposter/db-schema";

import { createOperationData } from "@/services/shared/createOperationData";
import { useFriendStore } from "@/store/message/user/friend";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useFriendRequestStore = defineStore("message/user/friendRequest", () => {
  const { $trpc } = useNuxtApp();
  const friendStore = useFriendStore();
  const { createFriend } = friendStore;
  const friendRequests = ref<User[]>([]);
  const sentFriendRequests = ref<User[]>([]);
  const { createFriendRequest: storeCreateFriendRequest, deleteFriendRequest } = createOperationData(
    friendRequests,
    ["id"],
    DatabaseEntityType.FriendRequest,
  );

  const acceptFriendRequest = async (senderId: FriendUserIdInput) => {
    await $trpc.friendRequest.acceptFriendRequest.mutate(senderId);
    const sender = friendRequests.value.find(({ id }) => id === senderId);
    storeDeleteFriendRequest(senderId);
    if (sender) createFriend(sender);
  };

  const declineFriendRequest = async (senderId: FriendUserIdInput) => {
    await $trpc.friendRequest.declineFriendRequest.mutate(senderId);
    storeDeleteFriendRequest(senderId);
  };

  const sendFriendRequest = async (receiverId: FriendUserIdInput) => {
    const receiver = await $trpc.friendRequest.sendFriendRequest.mutate(receiverId);
    if (!sentFriendRequests.value.some(({ id }) => id === receiverId))
      sentFriendRequests.value = [receiver, ...sentFriendRequests.value];
  };

  // Called via subscription when the receiver accepted our sent request
  const storeAcceptFriendRequest = (receiverUser: User) => {
    storeDeleteSentFriendRequest(receiverUser.id);
    createFriend(receiverUser);
  };

  // Called via subscription when a new request arrives from a sender
  const createFriendRequest = (senderUser: User) => {
    if (!friendRequests.value.some(({ id }) => id === senderUser.id)) storeCreateFriendRequest(senderUser, true);
  };

  const storeDeleteFriendRequest = (senderId: string) => {
    deleteFriendRequest({ id: senderId });
  };

  const storeDeleteSentFriendRequest = (receiverId: string) => {
    sentFriendRequests.value = sentFriendRequests.value.filter(({ id }) => id !== receiverId);
  };

  return {
    acceptFriendRequest,
    createFriendRequest,
    declineFriendRequest,
    friendRequests,
    sendFriendRequest,
    sentFriendRequests,
    storeAcceptFriendRequest,
    storeDeleteFriendRequest,
    storeDeleteSentFriendRequest,
  };
});
