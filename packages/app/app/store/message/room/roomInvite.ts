import type { RevokeInviteInput } from "#shared/models/db/room/RevokeInviteInput";
import type { InviteInMessageWithCreator } from "@esposter/db-schema";

import { useMutation } from "@/composables/shared/useMutation";
import { inviteCreateHooks } from "@/services/message/room/invite/inviteCreateHooks";
import { useInviteStore } from "@/store/message/room/invite";

// The room's whole set, which only the settings panel reads. Kept apart from the member's own link rather than
// Folded into it: that map answers "what may I hand out", one row per room, and this list answers "what is out
// There", which is a different question behind a different gate
export const useRoomInviteStore = defineStore("message/room/roomInvite", () => {
  const { $trpc } = useNuxtApp();
  const inviteStore = useInviteStore();
  const { executeMutation } = useMutation();
  // Keyed by room and read against a named key: the panel names the room it manages, so a read for the room the
  // Reader just left is filed under that room instead of over the list on screen
  const { getSlice, getSliceOperationData } = useCursorPaginationDataMap<InviteInMessageWithCreator>();

  const revokeInvite = async (input: RevokeInviteInput) => {
    const { items } = getSlice(input.roomId);
    await executeMutation(() => $trpc.room.revokeInvite.mutate(input), {
      // The one row this write removes, read as the write is sent: revokes of different links do not queue
      // Against each other, so restoring a copy of the list would resurrect one revoked beside this
      applyOptimistic: () => {
        const revokedInvite = items.value.find(({ id }) => id === input.id);
        items.value = items.value.filter(({ id }) => id !== input.id);
        // The reader's own link lives in the other store, and revoking it here has to reach that too — the
        // Invite dialog would otherwise go on offering a token this panel just killed
        const ownInvite = inviteStore.invites.get(input.roomId);
        if (ownInvite?.id === input.id) inviteStore.invites.set(input.roomId, undefined);
        return () => {
          if (revokedInvite) items.value = [revokedInvite, ...items.value];
          if (ownInvite?.id === input.id) inviteStore.invites.set(input.roomId, ownInvite);
        };
      },
      key: input.id,
    });
  };
  // A link minted from the dialog belongs in this list too, and one invite per member per room means the create
  // Replaced whatever that member held — so the row it replaced leaves with it
  inviteCreateHooks.register((roomId, invite) => {
    const { isLoaded, items } = getSlice(roomId);
    // A list nobody has read yet is left alone: its first read carries the new row anyway
    if (!isLoaded.value) return;

    items.value = [invite, ...items.value.filter(({ userId }) => userId !== invite.userId)];
  });

  return { getSlice, getSliceOperationData, revokeInvite };
});
