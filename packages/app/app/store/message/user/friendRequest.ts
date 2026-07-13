import type { FriendRequestWithRelations, User } from "@esposter/db-schema";

import { useMutation } from "@/composables/shared/useMutation";
import { authClient } from "@/services/auth/authClient";
import { createOperationData } from "@/services/shared/createOperationData";
import { useFriendStore } from "@/store/message/user/friend";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useFriendRequestStore = defineStore("message/user/friendRequest", () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  const executeMutation = useMutation();
  const friendStore = useFriendStore();
  const { storeCreateFriend, storeDeleteFriend } = friendStore;
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

  const sendFriendRequest = async (receiverId: string) => {
    // Server-generated request row — non-optimistic, applied in onSuccess (subscription echo is idempotent)
    await executeMutation(() => $trpc.friendRequest.sendFriendRequest.mutate(receiverId), {
      onSuccess: (friendRequest) => {
        storeCreateFriendRequest(friendRequest);
      },
    });
  };
  const acceptFriendRequest = async (sender: User) => {
    const previousFriendRequests = [...friendRequests.value];
    await executeMutation(() => $trpc.friendRequest.acceptFriendRequest.mutate(sender.id), {
      applyOptimistic: () => {
        storeAcceptFriendRequest(sender);
        return () => {
          friendRequests.value = previousFriendRequests;
          storeDeleteFriend(sender.id);
        };
      },
    });
  };
  const declineFriendRequest = async (senderId: string) => {
    const previousFriendRequests = [...friendRequests.value];
    await executeMutation(() => $trpc.friendRequest.declineFriendRequest.mutate(senderId), {
      applyOptimistic: () => {
        storeDeclineFriendRequest(senderId);
        return () => {
          friendRequests.value = previousFriendRequests;
        };
      },
    });
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
