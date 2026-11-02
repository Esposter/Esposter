import type { SnapshotPush } from "@/models/shared/SnapshotPush";
import type { FriendRequestInSocialWithRelations, PublicUser } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { createOperationData } from "@/services/shared/createOperationData";
import { mergeSnapshot } from "@/services/shared/mergeSnapshot";
import { useFriendStore } from "@/store/message/user/friend";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useFriendRequestStore = defineStore("message/user/friendRequest", () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  const { checkIsPending: checkIsSendFriendRequestPending, executeMutation: executeSendFriendRequestMutation } =
    useMutation();
  const { executeMutation: executeAcceptFriendRequestMutation } = useMutation();
  const { executeMutation: executeDeclineFriendRequestMutation } = useMutation();
  const { executeQuery: executeReadFriendRequestsQuery } = useMutation();
  const friendStore = useFriendStore();
  const { storeCreateFriend, storeDeleteFriend } = friendStore;
  const friendRequests = ref<FriendRequestInSocialWithRelations[]>([]);
  const userId = computed(() => session.value.data?.user.id ?? "");
  const receivedFriendRequests = computed(() =>
    friendRequests.value.filter((friendRequest) => friendRequest.receiverId === userId.value),
  );
  const sentFriendRequests = computed(() =>
    friendRequests.value.filter((friendRequest) => friendRequest.senderId === userId.value),
  );
  // The writes that land while the friend requests read is in flight, kept until its answer is merged with them
  let readingPushes: SnapshotPush<FriendRequestInSocialWithRelations>[] | undefined;
  const recordReadingPush = (push: SnapshotPush<FriendRequestInSocialWithRelations>) => {
    readingPushes?.push(push);
  };
  const { createFriendRequest: baseStoreCreateFriendRequest } = createOperationData(
    friendRequests,
    ["id"],
    DatabaseEntityType.FriendRequest,
  );
  const storeCreateFriendRequest = (friendRequest: FriendRequestInSocialWithRelations) => {
    recordReadingPush({ item: friendRequest, type: "set" });
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
    friendRequests.value.filter(({ receiverId, senderId }) => [receiverId, senderId].includes(targetUserId));
  const storeDeleteFriendRequestsByUser = (targetUserId: PublicUser["id"]) => {
    recordReadingPush({
      checkIsRemoved: ({ receiverId, senderId }) => [receiverId, senderId].includes(targetUserId),
      type: "remove",
    });
    friendRequests.value = friendRequests.value.filter(
      ({ receiverId, senderId }) => ![receiverId, senderId].includes(targetUserId),
    );
  };
  const storeAcceptFriendRequest = (friendUser: PublicUser) => {
    storeDeleteFriendRequestsByUser(friendUser.id);
    storeCreateFriend(friendUser);
  };
  // The read's answer is merged with the requests a push added or removed while it was in flight, so a response taken
  // Before the push does not put back a request the push already resolved
  const readFriendRequests = async (read: () => Promise<FriendRequestInSocialWithRelations[]>) => {
    const pushes: SnapshotPush<FriendRequestInSocialWithRelations>[] = [];
    readingPushes = pushes;
    await executeReadFriendRequestsQuery(read, {
      key: "friendRequests",
      onSuccess: (newFriendRequests) => {
        friendRequests.value = mergeSnapshot(newFriendRequests, pushes);
      },
    });
    if (readingPushes === pushes) readingPushes = undefined;
  };
  // Non-optimistic: the row carries the sender's user the client can't faithfully fabricate, and a
  // Temp-id placeholder would race the echo's server-id row into a transient duplicate.
  const sendFriendRequest = async (receiverId: PublicUser["id"]) => {
    await executeSendFriendRequestMutation(() => $trpc.friendRequest.sendFriendRequest.mutate(receiverId), {
      key: receiverId,
      // The onSendFriendRequest echo covers the caller for a newly created request, but the already-exists
      // Conflict path returns the existing row WITHOUT emitting, so this write is the only one on that path
      onSuccess: (friendRequest) => {
        storeCreateFriendRequest(friendRequest);
      },
    });
  };
  const acceptFriendRequest = async (sender: PublicUser) => {
    await executeAcceptFriendRequestMutation(() => $trpc.friendRequest.acceptFriendRequest.mutate(sender.id), {
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
  const declineFriendRequest = async (senderId: PublicUser["id"]) => {
    await executeDeclineFriendRequestMutation(() => $trpc.friendRequest.declineFriendRequest.mutate(senderId), {
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
    sentFriendRequests,
    storeAcceptFriendRequest,
    storeCreateFriendRequest,
    storeDeleteFriendRequestsByUser,
  };
});
