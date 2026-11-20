import type { Entry } from "#src/models/shared/overlay/Entry";
import type { InviteInMessage } from "@esposter/db-schema";

import { inviteTable } from "#src/services/message/room/overlay/constants";

// An entry that sets the named fields of an invite the overlay holds. An invite it does not hold is left as it is, so the
// Write it belongs to changes nothing on screen
export const getInvitePatchEntry =
  (id: InviteInMessage["id"], patch: Partial<InviteInMessage>): Entry =>
  (view) => {
    const invite = view.get(inviteTable, [id]);
    if (invite) view.set(inviteTable, [id], { ...invite, ...patch });
  };
