import type { FriendRequestWithRelations, User } from "@esposter/db-schema";

import { useMutation } from "@/composables/shared/useMutation";
import { authClient } from "@/services/auth/authClient";
import { createOperationData } from "@/services/shared/createOperationData";
import { useFriendStore } from "@/store/message/user/friend";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useFriendRequestStore = defineStore("message/user/friendRequest", () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  const { executeMutation: executeSendFriendRequestMutation } = useMutation();
  const { executeMutation: executeAcceptFriendRequestMutation } = useMutation();
  const { executeMutation: executeDeclineFriendRequestMutation } = useMutation();
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
  // CreateFriendRequest already dedups by id, so a repeated echo delivery is idempotent without a manual guard
  const { createFriendRequest: storeCreateFriendRequest } = createOperationData(
    friendRequests,
    ["id"],
    DatabaseEntityType.FriendRequest,
  );

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
  const storeDeleteFriendRequestsByUser = (targetUserId: string) => {
    friendRequests.value = friendRequests.value.filter(
      (friendRequest) => friendRequest.senderId !== targetUserId && friendRequest.receiverId !== targetUserId,
    );
  };

  // Non-optimistic: the row carries the sender/receiver user graph the client can't faithfully fabricate, and a
  // Temp-id placeholder would race the echo's server-id row into a transient duplicate.
  const sendFriendRequest = async (receiverId: string) => {
    await executeSendFriendRequestMutation(() => $trpc.friendRequest.sendFriendRequest.mutate(receiverId), {
      // The onSendFriendRequest echo covers the caller for a newly created request, but the already-exists
      // Conflict path returns the existing row WITHOUT emitting — so this write is the only one on that path.
      // It is idempotent: storeCreateFriendRequest dedups by id.
      onSuccess: (friendRequest) => {
        storeCreateFriendRequest(friendRequest);
      },
    });
  };
  const acceptFriendRequest = async (sender: User) => {
    const previousFriendRequests = [...friendRequests.value];
    await executeAcceptFriendRequestMutation(() => $trpc.friendRequest.acceptFriendRequest.mutate(sender.id), {
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
    await executeDeclineFriendRequestMutation(() => $trpc.friendRequest.declineFriendRequest.mutate(senderId), {
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
