import type { FriendRequestWithRelations, User } from "@esposter/db-schema";

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
  const { createFriendRequest: storeCreateFriendRequest } = createOperationData(
    friendRequests,
    ["id"],
    DatabaseEntityType.FriendRequest,
  );
  // Single source of truth for "has the app user already asked this user" — the counterpart to the friend
  // Store's checkIsFriend, and asked by the same surfaces
  const checkHasSentFriendRequest = (targetUserId: User["id"]) =>
    sentFriendRequests.value.some(({ receiverId }) => receiverId === targetUserId);
  // Accepting, declining and blocking all resolve the same thing: the pending requests between the app user and
  // One other party. The list only ever holds requests the app user is a party to — the read filters on it and
  // The subscription only yields those — so naming the other party identifies the pair on its own, and the
  // Removal never has to wait on a session that has not resolved yet
  const getFriendRequestsByUser = (targetUserId: User["id"]) =>
    friendRequests.value.filter(({ receiverId, senderId }) => [receiverId, senderId].includes(targetUserId));
  const storeDeleteFriendRequestsByUser = (targetUserId: User["id"]) => {
    friendRequests.value = friendRequests.value.filter(
      ({ receiverId, senderId }) => ![receiverId, senderId].includes(targetUserId),
    );
  };
  const storeAcceptFriendRequest = (friendUser: User) => {
    storeDeleteFriendRequestsByUser(friendUser.id);
    storeCreateFriend(friendUser);
  };
  const storeDeclineFriendRequest = (friendUserId: User["id"]) => {
    storeDeleteFriendRequestsByUser(friendUserId);
  };
  // Non-optimistic: the row carries the sender/receiver user graph the client can't faithfully fabricate, and a
  // Temp-id placeholder would race the echo's server-id row into a transient duplicate.
  const sendFriendRequest = async (receiverId: User["id"]) => {
    await executeSendFriendRequestMutation(() => $trpc.friendRequest.sendFriendRequest.mutate(receiverId), {
      key: receiverId,
      // The onSendFriendRequest echo covers the caller for a newly created request, but the already-exists
      // Conflict path returns the existing row WITHOUT emitting, so this write is the only one on that path
      onSuccess: (friendRequest) => {
        storeCreateFriendRequest(friendRequest);
      },
    });
  };
  const acceptFriendRequest = async (sender: User) => {
    await executeAcceptFriendRequestMutation(() => $trpc.friendRequest.acceptFriendRequest.mutate(sender.id), {
      // Only the requests this write resolves — accepts and declines are keyed per party and never queue
      // Against each other
      applyOptimistic: () => {
        const resolvedFriendRequests = getFriendRequestsByUser(sender.id);
        storeAcceptFriendRequest(sender);
        return () => {
          storeDeleteFriend(sender.id);
          for (const resolvedFriendRequest of resolvedFriendRequests) storeCreateFriendRequest(resolvedFriendRequest);
        };
      },
      key: sender.id,
    });
  };
  const declineFriendRequest = async (senderId: User["id"]) => {
    await executeDeclineFriendRequestMutation(() => $trpc.friendRequest.declineFriendRequest.mutate(senderId), {
      // Only the requests this write resolves — see `acceptFriendRequest`
      applyOptimistic: () => {
        const resolvedFriendRequests = getFriendRequestsByUser(senderId);
        storeDeclineFriendRequest(senderId);
        return () => {
          for (const resolvedFriendRequest of resolvedFriendRequests) storeCreateFriendRequest(resolvedFriendRequest);
        };
      },
      key: senderId,
    });
  };

  return {
    acceptFriendRequest,
    checkHasSentFriendRequest,
    declineFriendRequest,
    friendRequests,
    getFriendRequestsByUser,
    receivedFriendRequests,
    sendFriendRequest,
    sentFriendRequests,
    storeAcceptFriendRequest,
    storeCreateFriendRequest,
    storeDeclineFriendRequest,
    storeDeleteFriendRequestsByUser,
  };
});
