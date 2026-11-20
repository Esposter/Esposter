import type { FriendRequestInSocialWithRelations, PublicUser } from "@esposter/db-schema";

import { authClient } from "#src/services/auth/authClient";
import { friendRequestTable } from "#src/services/message/user/pair/constants";
import { createPairConfirmations } from "#src/services/message/user/pair/createPairConfirmations";
import { getAcceptFriendRequestEntry } from "#src/services/message/user/pair/getAcceptFriendRequestEntry";
import { getDeclineFriendRequestEntry } from "#src/services/message/user/pair/getDeclineFriendRequestEntry";
import { collectRowVersions } from "#src/services/realtime/collectRowVersions";
import { createArrival } from "#src/services/shared/overlay/createArrival";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useUserStore } from "#src/store/message/user/index";
import { useOverlayStore } from "#src/store/overlay";
import { withFinalizerAsync } from "@esposter/shared";

export const useFriendRequestStore = defineStore("message/user/friendRequest", () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  const userId = computed(() => session.value.data?.user.id ?? "");
  const { executeQuery } = useMutation();
  const overlayStore = useOverlayStore();
  const { arrive, view, writeAwaited, writeOptimistic } = overlayStore;
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
  // Own receiver's entry from this set, which is added before the write and removed once it settles
  const sendingReceiverIds = ref(new Set<PublicUser["id"]>());
  const checkIsSendFriendRequestPending = (receiverId: PublicUser["id"]) => sendingReceiverIds.value.has(receiverId);
  // Single source of truth for "has the app user already asked this user" — the counterpart to the friend
  // Store's checkIsFriend, and asked by the same surfaces
  const checkHasSentFriendRequest = (targetUserId: PublicUser["id"]) =>
    friendRequests.value.some(({ receiverId, senderId }) => senderId === userId.value && receiverId === targetUserId);
  // Answered requests come back as tombstones, which the arrival keeps, so an older copy of a request cannot bring it back
  const readFriendRequests = (read: () => Promise<FriendRequestInSocialWithRelations[]>) =>
    executeQuery(read, {
      key: "friendRequests",
      onSuccess: (friendRequestRows) => {
        for (const { sender, ...friendRequest } of friendRequestRows) {
          storeUser(sender);
          arrive(friendRequestTable, friendRequest);
        }
      },
    });
  const sendFriendRequest = async (receiverId: PublicUser["id"]) => {
    sendingReceiverIds.value.add(receiverId);
    await withFinalizerAsync(
      () =>
        writeAwaited(
          async () => {
            const { sender, ...friendRequest } = await $trpc.friendRequest.sendFriendRequest.mutate(receiverId);
            storeUser(sender);
            return [createArrival(friendRequestTable, friendRequest)];
          },
          { onError: createErrorAlert },
        ),
      () => {
        sendingReceiverIds.value.delete(receiverId);
      },
    );
  };
  const acceptFriendRequest = (sender: PublicUser) => {
    writeOptimistic(
      async () => {
        const { result: senderUser, rowVersions } = await collectRowVersions(() =>
          $trpc.friendRequest.acceptFriendRequest.mutate(sender.id),
        );
        storeUser(senderUser);
        return { arrivals: [], confirmed: createPairConfirmations(rowVersions) };
      },
      { entry: getAcceptFriendRequestEntry(userId.value, sender.id, new Date()), onError: createErrorAlert },
    );
  };
  const declineFriendRequest = (senderId: PublicUser["id"]) => {
    writeOptimistic(
      async () => {
        const { rowVersions } = await collectRowVersions(() =>
          $trpc.friendRequest.declineFriendRequest.mutate(senderId),
        );
        return { arrivals: [], confirmed: createPairConfirmations(rowVersions) };
      },
      { entry: getDeclineFriendRequestEntry(userId.value, senderId, new Date()), onError: createErrorAlert },
    );
  };

  return {
    acceptFriendRequest,
    checkHasSentFriendRequest,
    checkIsSendFriendRequestPending,
    declineFriendRequest,
    readFriendRequests,
    receivedFriendRequests,
    sendFriendRequest,
  };
});
