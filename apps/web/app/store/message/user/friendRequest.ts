import type { FriendRequestInSocialWithRelations, PublicUser } from "@esposter/db-schema";

import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { authClient } from "#src/services/auth/authClient";
import { createOperationData } from "#src/services/shared/createOperationData";
import { useFriendStore } from "#src/store/message/user/friend";
import { DatabaseEntityType } from "@esposter/db-schema";

// A request is with a party when that party is either end of it, so the read and the removal name the pair one way
const checkIsWithUser = (friendRequest: FriendRequestInSocialWithRelations, targetUserId: PublicUser["id"]) =>
  [friendRequest.receiverId, friendRequest.senderId].includes(targetUserId);

export const useFriendRequestStore = defineStore("message/user/friendRequest", () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  const { checkIsPending: checkIsSendFriendRequestPending, executeMutation: executeSendFriendRequestMutation } =
    useMutation();
  const friendStore = useFriendStore();
  const { executeUserPairMutation, storeCreateFriend, storeDeleteFriend } = friendStore;
  const friendRequests = ref<FriendRequestInSocialWithRelations[]>([]);
  const userId = computed(() => session.value.data?.user.id ?? "");
  // The read returns answered requests as tombstones, which are no request still pending on either side
  const pendingFriendRequests = computed(() => friendRequests.value.filter(({ deletedAt }) => deletedAt === null));
  const receivedFriendRequests = computed(() =>
    pendingFriendRequests.value.filter((friendRequest) => friendRequest.receiverId === userId.value),
  );
  const sentFriendRequests = computed(() =>
    pendingFriendRequests.value.filter((friendRequest) => friendRequest.senderId === userId.value),
  );
  const friendRequestsReadKey = "friendRequests";
  const { readWithReplayedPushes, recordReadingPush } = useReadingPushes<FriendRequestInSocialWithRelations>();
  const { createFriendRequest: baseStoreCreateFriendRequest } = createOperationData(
    friendRequests,
    ["id"],
    DatabaseEntityType.FriendRequest,
  );
  const storeCreateFriendRequest = (friendRequest: FriendRequestInSocialWithRelations) => {
    recordReadingPush(friendRequestsReadKey, { item: friendRequest, type: "set" });
    baseStoreCreateFriendRequest(friendRequest);
  };
  // Single source of truth for "has the app user already asked this user" — the counterpart to the friend
  // Store's checkIsFriend, and asked by the same surfaces
  const checkHasSentFriendRequest = (targetUserId: PublicUser["id"]) =>
    sentFriendRequests.value.some(({ receiverId }) => receiverId === targetUserId);
  // Accepting, declining and blocking all resolve the same thing: the pending requests between the app user and
  // One other party. The list only ever holds requests the app user is a party to — the read filters on it and
  // The subscription only yields those — so naming the other party identifies the pair on its own, and the
  // Removal never has to wait on a session that has not resolved yet
  const getFriendRequestsByUser = (targetUserId: PublicUser["id"]) =>
    friendRequests.value.filter((friendRequest) => checkIsWithUser(friendRequest, targetUserId));
  const storeDeleteFriendRequestsByUser = (targetUserId: PublicUser["id"]) => {
    recordReadingPush(friendRequestsReadKey, {
      checkIsRemoved: (friendRequest) => checkIsWithUser(friendRequest, targetUserId),
      type: "remove",
    });
    friendRequests.value = friendRequests.value.filter(
      (friendRequest) => !checkIsWithUser(friendRequest, targetUserId),
    );
  };
  const storeAcceptFriendRequest = (friendUser: PublicUser) => {
    storeDeleteFriendRequestsByUser(friendUser.id);
    storeCreateFriend(friendUser);
  };
  const readFriendRequests = (read: () => Promise<FriendRequestInSocialWithRelations[]>) =>
    readWithReplayedPushes(friendRequestsReadKey, read, (newFriendRequests) => {
      friendRequests.value = newFriendRequests;
    });
  // Awaited because the row is the server's: it carries the sender's user, which the client cannot faithfully fabricate,
  // And a temp-id placeholder would race the echo's server-id row into a transient duplicate.
  const sendFriendRequest = async (receiverId: PublicUser["id"]) => {
    await executeSendFriendRequestMutation(() => $trpc.friendRequest.sendFriendRequest.mutate(receiverId), {
      awaitedBecause: AwaitedReason.ServerIssuedValue,
      key: receiverId,
      // No socket event carries a newly created request to the caller, and the already-exists conflict path returns
      // The existing row WITHOUT emitting, so this write is the caller's only one
      onSuccess: (friendRequest) => {
        storeCreateFriendRequest(friendRequest);
      },
    });
  };
  const acceptFriendRequest = (sender: PublicUser) => {
    executeUserPairMutation(() => $trpc.friendRequest.acceptFriendRequest.mutate(sender.id), {
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
  const declineFriendRequest = (senderId: PublicUser["id"]) => {
    executeUserPairMutation(() => $trpc.friendRequest.declineFriendRequest.mutate(senderId), {
      applyOptimistic: () => {
        const resolvedFriendRequests = getFriendRequestsByUser(senderId);
        storeDeleteFriendRequestsByUser(senderId);
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
    checkIsSendFriendRequestPending,
    declineFriendRequest,
    friendRequests,
    getFriendRequestsByUser,
    readFriendRequests,
    receivedFriendRequests,
    sendFriendRequest,
    storeAcceptFriendRequest,
    storeCreateFriendRequest,
    storeDeleteFriendRequestsByUser,
  };
});
