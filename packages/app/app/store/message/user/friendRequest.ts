import type { FriendRequestWithRelations, User } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { createOperationData } from "@/services/shared/createOperationData";
import { useFriendStore } from "@/store/message/user/friend";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useFriendRequestStore = defineStore("message/user/friendRequest", () => {
  const session = authClient.useSession();
  const friendStore = useFriendStore();
  const { storeCreateFriend } = friendStore;
  const friendRequests = ref<FriendRequestWithRelations[]>([]);
  const userId = computed(() => session.value.data?.user.id ?? "");
  const receivedFriendRequests = computed(() =>
    friendRequests.value.filter((friendRequest) => friendRequest.receiverId === userId.value),
  );
  const sentFriendRequests = computed(() =>
    friendRequests.value.filter((friendRequest) => friendRequest.senderId === userId.value),
  );
  const { createFriendRequest: baseStoreCreateFriendRequest } = createOperationData(
    friendRequests,
    ["id"],
    DatabaseEntityType.FriendRequest,
  );

  const storeCreateFriendRequest = (friendRequest: FriendRequestWithRelations) => {
    if (!friendRequests.value.some(({ id }) => id === friendRequest.id)) baseStoreCreateFriendRequest(friendRequest);
  };

  const storeAcceptFriendRequest = (friendUser: User) => {
    friendRequests.value = friendRequests.value.filter(
      (friendRequest) =>
        !(
          [friendRequest.receiverId, friendRequest.senderId].includes(userId.value) &&
          [friendRequest.receiverId, friendRequest.senderId].includes(friendUser.id)
        ),
    );
    storeCreateFriend(friendUser);
  };
  const storeDeclineFriendRequest = (friendUserId: string) => {
    friendRequests.value = friendRequests.value.filter(
      (friendRequest) =>
        !(
          [friendRequest.receiverId, friendRequest.senderId].includes(userId.value) &&
          [friendRequest.receiverId, friendRequest.senderId].includes(friendUserId)
        ),
    );
  };
  const storeDeleteFriendRequestsByUser = (userId: string) => {
    friendRequests.value = friendRequests.value.filter(
      (friendRequest) => friendRequest.senderId !== userId && friendRequest.receiverId !== userId,
    );
  };

  return {
    friendRequests,
    receivedFriendRequests,
    sentFriendRequests,
    storeAcceptFriendRequest,
    storeCreateFriendRequest,
    storeDeclineFriendRequest,
    storeDeleteFriendRequestsByUser,
  };
});
