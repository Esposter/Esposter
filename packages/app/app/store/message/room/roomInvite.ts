import type { RevokeInviteInput } from "#shared/models/db/room/RevokeInviteInput";
import type { InviteInMessageWithCreator } from "@esposter/db-schema";

import { useMutation } from "@/composables/shared/useMutation";
import { useInviteStore } from "@/store/message/room/invite";

// The room's whole set, which only the settings panel reads. Kept apart from the member's own link rather than
// Folded into it: that map answers "what may I hand out", one row per room, and this list answers "what is out
// There", which is a different question with a different gate
export const useRoomInviteStore = defineStore("message/room/roomInvite", () => {
  const { $trpc } = useNuxtApp();
  const inviteStore = useInviteStore();
  const { executeMutation } = useMutation();
  const { hasMore, items, readItems, readMoreItems } = useCursorPaginationData<InviteInMessageWithCreator>();

  const revokeInvite = async (input: RevokeInviteInput) => {
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

  return { hasMore, items, readItems, readMoreItems, revokeInvite };
});
