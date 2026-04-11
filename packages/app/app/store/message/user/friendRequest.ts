import type { FriendUserIdInput } from "#shared/models/db/friend/FriendUserIdInput";
import type { FriendRequestWithRelations, User } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { createOperationData } from "@/services/shared/createOperationData";
import { useFriendStore } from "@/store/message/user/friend";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useFriendRequestStore = defineStore("message/user/friendRequest", () => {
  const { $trpc } = useNuxtApp();
  const session = authClient.useSession();
  const friendStore = useFriendStore();
  const { storeCreateFriend } = friendStore;
  const friendRequests = ref<FriendRequestWithRelations[]>([]);
  const currentUserId = computed(() => session.value.data?.user.id ?? "");
  const receivedFriendRequests = computed(() =>
    friendRequests.value.filter((friendRequest) => friendRequest.receiverId === currentUserId.value),
  );
  const sentFriendRequests = computed(() =>
    friendRequests.value.filter((friendRequest) => friendRequest.senderId === currentUserId.value),
  );
  const { createFriendRequest: baseStoreCreateFriendRequest } = createOperationData(
    friendRequests,
    ["id"],
    DatabaseEntityType.FriendRequest,
  );

  const storeCreateFriendRequest = (friendRequest: FriendRequestWithRelations) => {
    if (!friendRequests.value.some(({ id }) => id === friendRequest.id)) baseStoreCreateFriendRequest(friendRequest);
  };

  const acceptFriendRequest = async (senderId: FriendUserIdInput) => {
    const senderUser = await $trpc.friendRequest.acceptFriendRequest.mutate(senderId);
    friendRequests.value = friendRequests.value.filter(
      (friendRequest) => !(friendRequest.senderId === senderId && friendRequest.receiverId === currentUserId.value),
    );
    storeCreateFriend(senderUser);
  };

  const declineFriendRequest = async (senderId: FriendUserIdInput) => {
    await $trpc.friendRequest.declineFriendRequest.mutate(senderId);
    friendRequests.value = friendRequests.value.filter(
      (friendRequest) => !(friendRequest.senderId === senderId && friendRequest.receiverId === currentUserId.value),
    );
  };

  const sendFriendRequest = async (receiverId: FriendUserIdInput) => {
    const friendRequest = await $trpc.friendRequest.sendFriendRequest.mutate(receiverId);
    storeCreateFriendRequest(friendRequest);
  };
  const storeAcceptFriendRequest = (receiverUser: User) => {
    friendRequests.value = friendRequests.value.filter(
      (friendRequest) =>
        !(friendRequest.senderId === currentUserId.value && friendRequest.receiverId === receiverUser.id),
    );
    storeCreateFriend(receiverUser);
  };
  const storeDeclineFriendRequest = (declinerId: string) => {
    friendRequests.value = friendRequests.value.filter(
      (friendRequest) => !(friendRequest.senderId === currentUserId.value && friendRequest.receiverId === declinerId),
    );
  };
  const storeDeleteFriendRequestsByUser = (userId: string) => {
    friendRequests.value = friendRequests.value.filter(
      (friendRequest) => friendRequest.senderId !== userId && friendRequest.receiverId !== userId,
    );
  };

  return {
    acceptFriendRequest,
    declineFriendRequest,
    friendRequests,
    receivedFriendRequests,
    sendFriendRequest,
    sentFriendRequests,
    storeAcceptFriendRequest,
    storeCreateFriendRequest,
    storeDeclineFriendRequest,
    storeDeleteFriendRequestsByUser,
  };
});
