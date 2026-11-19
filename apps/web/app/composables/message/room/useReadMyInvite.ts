import type { InviteInMessage, RoomInMessage } from "@esposter/db-schema";

import { checkIsInviteUsable } from "#shared/services/room/invite/checkIsInviteUsable";
import { useInviteStore } from "#src/store/message/room/invite";

// The member's own link, as the invite manager reads it. The map is shared with the create path, so each read is
// Reconciled against it here
export const useReadMyInvite = (roomId: RoomInMessage["id"], onSuccess?: (invite?: InviteInMessage) => void) => {
  const { $trpc } = useNuxtApp();
  const inviteStore = useInviteStore();
  const { invites } = storeToRefs(inviteStore);
  const { seedInvite, setInvite } = inviteStore;
  return useQuery(() => $trpc.invite.readMyInvite.query({ roomId }), {
    onSuccess: (invite) => {
      const storedInvite = invites.value.get(roomId);
      // A read beats a stored link that has since lapsed, whether it finds nothing or a live one — the server deletes
      // An expired or exhausted row lazily, so the map would otherwise go on offering a token nobody can join with. A
      // Stored link that is still usable stays: it is a create that raced ahead of this read, and it is the live one
      if (storedInvite && !checkIsInviteUsable(storedInvite)) setInvite(roomId, invite);
      else seedInvite(roomId, invite);
      onSuccess?.(invite);
    },
  });
};
