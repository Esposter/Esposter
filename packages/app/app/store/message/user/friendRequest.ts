import type { FriendUserIdInput } from "#shared/models/db/friend/FriendUserIdInput";
import type { User } from "@esposter/db-schema";

export const useFriendRequestStore = defineStore("message/user/friendRequest", () => {
  const { $trpc } = useNuxtApp();
  const pendingRequests = ref<User[]>([]);
  const sentRequests = ref<User[]>([]);

  const acceptFriendRequest = async (senderId: FriendUserIdInput) => {
    await $trpc.friendRequest.acceptFriendRequest.mutate(senderId);
    const sender = pendingRequests.value.find(({ id }) => id === senderId);
    pendingRequests.value = pendingRequests.value.filter(({ id }) => id !== senderId);
    const friendStore = useFriendStore();
    if (sender) friendStore.friends = [sender, ...friendStore.friends];
  };

  const declineFriendRequest = async (senderId: FriendUserIdInput) => {
    await $trpc.friendRequest.declineFriendRequest.mutate(senderId);
    pendingRequests.value = pendingRequests.value.filter(({ id }) => id !== senderId);
  };

  const sendFriendRequest = async (receiverId: FriendUserIdInput) => {
    const receiver = await $trpc.friendRequest.sendFriendRequest.mutate(receiverId);
    if (!sentRequests.value.some(({ id }) => id === receiverId)) sentRequests.value = [receiver, ...sentRequests.value];
  };

  const storeAcceptFriendRequest = (receiverUser: User) => {
    sentRequests.value = sentRequests.value.filter(({ id }) => id !== receiverUser.id);
    const friendStore = useFriendStore();
    if (!friendStore.friends.some(({ id }) => id === receiverUser.id))
      friendStore.friends = [receiverUser, ...friendStore.friends];
  };

  const storeCreatePendingRequest = (senderUser: User) => {
    if (!pendingRequests.value.some(({ id }) => id === senderUser.id))
      pendingRequests.value = [senderUser, ...pendingRequests.value];
  };

  const storeDeclineFriendRequest = (declinerId: string) => {
    sentRequests.value = sentRequests.value.filter(({ id }) => id !== declinerId);
  };

  return {
    acceptFriendRequest,
    declineFriendRequest,
    pendingRequests,
    sendFriendRequest,
    sentRequests,
    storeAcceptFriendRequest,
    storeCreatePendingRequest,
    storeDeclineFriendRequest,
  };
});
