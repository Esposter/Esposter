import type { InviteInMessage, RoomInMessage } from "@esposter/db-schema";

import { useInviteStore } from "@/store/message/room/invite";

// Every surface that shows a member's own link reads through here, so the store is seeded the same way from all of
// Them — the settings row renders a link without ever mounting the manager that creates one
export const useReadMyInvite = (roomId: RoomInMessage["id"], onSuccess?: (invite?: InviteInMessage) => void) => {
  const { $trpc } = useNuxtApp();
  const inviteStore = useInviteStore();
  const { seedInvite } = inviteStore;
  return useQuery(() => $trpc.room.readMyInvite.query({ roomId }), {
    onSuccess: (newInvite) => {
      const invite = newInvite ?? undefined;
      seedInvite(roomId, invite);
      onSuccess?.(invite);
    },
  });
};
