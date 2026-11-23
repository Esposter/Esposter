import type { Entry } from "#src/models/shared/overlay/Entry";
import type { InviteInMessage } from "@esposter/db-schema";

import { inviteTable } from "#src/services/message/room/overlay/constants";
import { getHeldRowEntry } from "#src/services/shared/overlay/getHeldRowEntry";

// An entry that sets the named fields of an invite the overlay holds. An invite it does not hold is left as it is, so
// The Write it belongs to changes nothing on screen
export const getInvitePatchEntry = (id: InviteInMessage["id"], patch: Partial<InviteInMessage>): Entry =>
  getHeldRowEntry(inviteTable, [id], (invite) => ({ ...invite, ...patch }));
