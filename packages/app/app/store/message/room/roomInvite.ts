import type { RevokeInviteInput } from "#shared/models/db/room/RevokeInviteInput";
import type { InviteInMessageWithCreator } from "@esposter/db-schema";

import { inviteCreateHooks } from "@/services/message/room/invite/inviteCreateHooks";
import { useInviteStore } from "@/store/message/room/invite";

// The room's whole set, behind ManageRoom — apart from `useInviteStore`, which holds the reader's own link
export const useRoomInviteStore = defineStore("message/room/roomInvite", () => {
  const { $trpc } = useNuxtApp();
  const inviteStore = useInviteStore();
  const { setInvite } = inviteStore;
  const { executeMutation } = useMutation();
  // Keyed by room: a read for the room the reader just left is filed under it rather than over the list on screen
  const { getSlice, getSliceOperationData } = useCursorPaginationDataMap<InviteInMessageWithCreator>();

  const revokeInvite = async (input: RevokeInviteInput) => {
    const { items } = getSlice(input.roomId);
    await executeMutation(() => $trpc.room.revokeInvite.mutate(input), {
      // The one row this write removes, read as the write is sent — revokes of different links do not queue
      // Against each other
      applyOptimistic: () => {
        const revokedInvite = items.value.find(({ id }) => id === input.id);
        items.value = items.value.filter(({ id }) => id !== input.id);
        // The reader's own link lives in the other store, and revoking it here has to reach that too — the
        // Invite dialog would otherwise go on offering a token this panel just killed
        const myInvite = inviteStore.invites.get(input.roomId);
        if (myInvite?.id === input.id) setInvite(input.roomId, undefined);
        return () => {
          if (revokedInvite) items.value = [revokedInvite, ...items.value];
          if (myInvite?.id === input.id) setInvite(input.roomId, myInvite);
        };
      },
      key: input.id,
    });
  };
  // One invite per member per room, so a link minted from the dialog replaces whatever that member held here
  inviteCreateHooks.register((roomId, invite) => {
    const { isLoaded, items } = getSlice(roomId);
    // A list nobody has read yet is left alone: its first read carries the new row anyway
    if (!isLoaded.value) return;

    items.value = [invite, ...items.value.filter(({ userId }) => userId !== invite.userId)];
  });

  return { getSlice, getSliceOperationData, revokeInvite };
});
