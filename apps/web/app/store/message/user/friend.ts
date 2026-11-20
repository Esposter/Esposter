import type { FriendInSocialWithRelations, PublicUser } from "@esposter/db-schema";

import { authClient } from "#src/services/auth/authClient";
import { friendTable } from "#src/services/message/user/pair/constants";
import { createPairConfirmations } from "#src/services/message/user/pair/createPairConfirmations";
import { getUnfriendEntry } from "#src/services/message/user/pair/getUnfriendEntry";
import { collectRowVersions } from "#src/services/realtime/collectRowVersions";
import { createArrival } from "#src/services/shared/overlay/createArrival";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useOverlayStore } from "#src/store/overlay";
import { useUserStore } from "#src/store/message/user/index";

export const useFriendStore = defineStore("message/user/friend", () => {
  const { $trpc } = useNuxtApp();
  const session = authClient.useSession();
  const userId = computed(() => session.value.data?.user.id ?? "");
  const { executeQuery } = useMutation();
  const overlayStore = useOverlayStore();
  const userStore = useUserStore();
  const { storeUsers } = userStore;
  const friendships = overlayStore.view(friendTable);
  // A friendship names its other party by the id the other side holds, and the friend's row is the user row the read
  // Stored with it, so a friendship whose user is not held yet shows nothing
  const friends = computed(() =>
    friendships.value.flatMap(({ receiverId, senderId }) => {
      const friend = userStore.userMap.get(senderId === userId.value ? receiverId : senderId);
      return friend ? [friend] : [];
    }),
  );
  // Single source of truth for "is this user already a friend" — every surface offering the add-friend
  // Affordance asks it, and each one deriving its own predicate is how the profile card and the search
  // Results end up disagreeing about the same pair
  const checkIsFriend = (targetUserId: PublicUser["id"]) => friends.value.some(({ id }) => id === targetUserId);
  const deleteFriend = (friendId: PublicUser["id"]) => {
    overlayStore.writeOptimistic(
      async () => {
        const { result, rowVersions } = await collectRowVersions(() => $trpc.friend.deleteFriend.mutate(friendId));
        return { arrivals: [createArrival(friendTable, result)], confirmed: createPairConfirmations(rowVersions) };
      },
      { entry: getUnfriendEntry(userId.value, friendId, new Date()), onError: createErrorAlert },
    );
  };
  // The read's rows are the friendships with their tombstones, each with both of its users, which the user map takes
  const readFriends = (read: () => Promise<FriendInSocialWithRelations[]>) =>
    executeQuery(read, {
      key: "friends",
      onSuccess: (friendshipRows) => {
        for (const { receiver, sender, ...friendship } of friendshipRows) {
          storeUsers([receiver, sender]);
          overlayStore.arrive(friendTable, friendship);
        }
      },
    });

  return { checkIsFriend, deleteFriend, friends, readFriends };
});
