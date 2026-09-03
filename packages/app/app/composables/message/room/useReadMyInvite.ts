import type { InviteInMessage, RoomInMessage } from "@esposter/db-schema";

import { checkIsInviteUsable } from "#shared/services/room/invite/checkIsInviteUsable";
import { useInviteStore } from "@/store/message/room/invite";

// Every surface that shows a member's own link reads through here, so the store is seeded the same way from all of
// Them — the settings row renders a link without ever mounting the manager that creates one
export const useReadMyInvite = (roomId: RoomInMessage["id"], onSuccess?: (invite?: InviteInMessage) => void) => {
  const { $trpc } = useNuxtApp();
  const inviteStore = useInviteStore();
  const { invites } = storeToRefs(inviteStore);
  const { seedInvite, setInvite } = inviteStore;
  return useQuery(() => $trpc.room.readMyInvite.query({ roomId }), {
    onSuccess: (newInvite) => {
      const invite = newInvite ?? undefined;
      const storedInvite = invites.value.get(roomId);
      // A read that finds nothing beats a stored link that has since lapsed — the server deletes an expired or
      // Exhausted row lazily, so the map would otherwise go on offering a token nobody can join with. A stored
      // Link that is still usable stays: it is a create that raced ahead of this read, and it is the live one
      if (!invite && storedInvite && !checkIsInviteUsable(storedInvite)) setInvite(roomId, undefined);
      else seedInvite(roomId, invite);
      onSuccess?.(invite);
    },
  });
};
