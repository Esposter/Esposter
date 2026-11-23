import type { Entry } from "#src/models/shared/overlay/Entry";

import { participantTable } from "#src/services/message/room/call/constants";
import { getHeldRowEntry } from "#src/services/shared/overlay/getHeldRowEntry";

// The local participant leaves the call at once, as a tombstone the leave's answer confirms. The deletion time is the
// Write's, Taken when it is issued, so each recomputation of the view names the same instant
export const getLeaveCallEntry = (participantId: string, deletedAt: Date): Entry =>
  getHeldRowEntry(participantTable, [participantId], (row) => ({ ...row, deletedAt }));
