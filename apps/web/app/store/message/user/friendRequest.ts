import type { FriendRequestInSocialWithRelations, PublicUser } from "@esposter/db-schema";

import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { friendRequestTable, pairTables } from "#src/services/message/user/pair/constants";
import { getAcceptFriendRequestEntry } from "#src/services/message/user/pair/getAcceptFriendRequestEntry";
import { getDeclineFriendRequestEntry } from "#src/services/message/user/pair/getDeclineFriendRequestEntry";
import { collectRowVersions } from "#src/services/realtime/collectRowVersions";
import { createArrival } from "#src/services/shared/overlay/createArrival";
import { createHeaderConfirmations } from "#src/services/shared/overlay/createHeaderConfirmations";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useUserStore } from "#src/store/message/user/index";
import { useOverlayStore } from "#src/store/overlay";
import { withFinalizerAsync } from "@esposter/shared";

export const useFriendRequestStore = defineStore("message/user/friendRequest", () => {
  const { $trpc } = useNuxtApp();
  const userId = useSessionUserId();
  const overlayStore = useOverlayStore();
  const { view, writeAwaited, writeOptimistic } = overlayStore;
  const userStore = useUserStore();
  const { storeUser } = userStore;
  const friendRequests = view(friendRequestTable);
  // The list only holds the requests the app user received, each with its sender's row. A request whose sender is not
  // Held yet shows nothing
  const receivedFriendRequests = computed(() =>
    friendRequests.value.flatMap((friendRequest) => {
      const sender =
        friendRequest.receiverId === userId.value ? userStore.userMap.get(friendRequest.senderId) : undefined;
      return sender ? [{ ...friendRequest, sender }] : [];
    }),
  );
  // A send is awaited, since its row is the server's, so no entry shows it while it is in flight. The button reads its
  // Own receiver's pending state from this set, which is added before the write and removed once it settles
  const sendingReceiverIds = ref(new Set<PublicUser["id"]>());
  const checkIsSendFriendRequestPending = (receiverId: PublicUser["id"]) => sendingReceiverIds.value.has(receiverId);
  // Single source of truth for "has the app user already asked this user" — the counterpart to the friend
  // Store's checkIsFriend, and asked by the same surfaces
  const checkHasSentFriendRequest = (targetUserId: PublicUser["id"]) =>
    friendRequests.value.some(({ receiverId, senderId }) => senderId === userId.value && receiverId === targetUserId);
  // Answered requests come back as tombstones, which the arrival keeps, so an older copy of a request cannot bring it back
  const readFriendRequestRows = useOverlayRead(
    friendRequestTable,
    ({ sender, ...friendRequest }: FriendRequestInSocialWithRelations) => {
      storeUser(sender);
      return friendRequest;
    },
  );
  // A failed read is held as its message, so the list draws the failure rather than showing no requests
  const friendRequestsError = ref("");
  const readFriendRequests = (read: () => Promise<FriendRequestInSocialWithRelations[]>) =>
    readFriendRequestRows(read, {
      onError: (error) => {
        friendRequestsError.value = error.message;
      },
      onSuccess: () => {
        friendRequestsError.value = "";
      },
    });
  const sendFriendRequest = async (receiverId: PublicUser["id"]) => {
    // A call while a send to this receiver is out sends nothing, so the set's removal ends the one send in flight
    if (sendingReceiverIds.value.has(receiverId)) return;

    sendingReceiverIds.value.add(receiverId);
    await withFinalizerAsync(
      () =>
        writeAwaited(
          async () => {
            const { sender, ...friendRequest } = await $trpc.friendRequest.sendFriendRequest.mutate(receiverId);
            storeUser(sender);
            return [createArrival(friendRequestTable, friendRequest)];
          },
          { awaitedBecause: AwaitedReason.ServerDecidedOutcome, onError: createErrorAlert },
        ),
      () => {
        sendingReceiverIds.value.delete(receiverId);
      },
    );
  };
  const acceptFriendRequest = (senderId: PublicUser["id"]) => {
    writeOptimistic(
      async () => {
        const { result: senderUser, rowVersions } = await collectRowVersions(() =>
          $trpc.friendRequest.acceptFriendRequest.mutate(senderId),
        );
        storeUser(senderUser);
        return { arrivals: [], confirmed: createHeaderConfirmations(pairTables, rowVersions) };
      },
      { entry: getAcceptFriendRequestEntry(userId.value, senderId, new Date()), onError: createErrorAlert },
    );
  };
  const declineFriendRequest = (senderId: PublicUser["id"]) => {
    writeOptimistic(
      async () => {
        const { rowVersions } = await collectRowVersions(() =>
          $trpc.friendRequest.declineFriendRequest.mutate(senderId),
        );
        return { arrivals: [], confirmed: createHeaderConfirmations(pairTables, rowVersions) };
      },
      { entry: getDeclineFriendRequestEntry(userId.value, senderId, new Date()), onError: createErrorAlert },
    );
  };

  return {
    acceptFriendRequest,
    checkHasSentFriendRequest,
    checkIsSendFriendRequestPending,
    declineFriendRequest,
    friendRequestsError,
    readFriendRequests,
    receivedFriendRequests,
    sendFriendRequest,
  };
});
