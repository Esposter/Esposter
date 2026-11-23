import type { FriendInSocialWithRelations, PublicUser } from "@esposter/db-schema";

import { friendTable, pairTables } from "#src/services/message/user/pair/constants";
import { getUnfriendEntry } from "#src/services/message/user/pair/getUnfriendEntry";
import { collectRowVersions } from "#src/services/realtime/collectRowVersions";
import { createArrival } from "#src/services/shared/overlay/createArrival";
import { createHeaderConfirmations } from "#src/services/shared/overlay/createHeaderConfirmations";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useUserStore } from "#src/store/message/user/index";
import { useOverlayStore } from "#src/store/overlay";

export const useFriendStore = defineStore("message/user/friend", () => {
  const { $trpc } = useNuxtApp();
  const userId = useSessionUserId();
  const overlayStore = useOverlayStore();
  const { view, writeOptimistic } = overlayStore;
  const userStore = useUserStore();
  const { storeUsers } = userStore;
  const friendships = view(friendTable);
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
    writeOptimistic(
      async () => {
        const { result, rowVersions } = await collectRowVersions(() => $trpc.friend.deleteFriend.mutate(friendId));
        return {
          arrivals: [createArrival(friendTable, result)],
          confirmed: createHeaderConfirmations(pairTables, rowVersions),
        };
      },
      { entry: getUnfriendEntry(userId.value, friendId, new Date()), onError: createErrorAlert },
    );
  };
  // The read's rows are the friendships with their tombstones, each with both of its users, which the user map takes
  const readFriendRows = useOverlayRead(
    friendTable,
    ({ receiver, sender, ...friendship }: FriendInSocialWithRelations) => {
      storeUsers([receiver, sender]);
      return friendship;
    },
  );
  // A failed read is held as its message and drawn by the list in place of its empty state, so no failure reads as no
  // Friends
  const friendsError = ref("");
  const readFriends = (read: () => Promise<FriendInSocialWithRelations[]>) =>
    readFriendRows(read, {
      onError: (error) => {
        friendsError.value = error.message;
      },
      onSuccess: () => {
        friendsError.value = "";
      },
    });

  return { checkIsFriend, deleteFriend, friends, friendsError, readFriends };
});
