import type { InviteInMessage, RoomInMessage } from "@esposter/db-schema";

import { useInviteStore } from "#src/store/message/room/invite";

// The member's own link, as the invite manager reads it. The read's answer arrives on the overlay, which keeps whichever
// Version of the link is newer, so a create that raced ahead of this read is not undone by it
export const useReadMyInvite = (roomId: RoomInMessage["id"], onSuccess?: (invite?: InviteInMessage) => void) => {
  const inviteStore = useInviteStore();
  const { readStoredInvite } = inviteStore;
  return useQuery(() => readStoredInvite(roomId), { onSuccess: (invite) => onSuccess?.(invite) });
};
