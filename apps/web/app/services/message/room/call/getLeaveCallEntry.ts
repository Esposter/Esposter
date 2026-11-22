import type { Entry } from "#src/models/shared/overlay/Entry";

import { participantTable } from "#src/services/message/room/call/constants";
import { getRemovalEntry } from "#src/services/shared/overlay/getRemovalEntry";

// The local participant leaves the call at once, as a tombstone the leave's answer confirms. The deletion time is the write's,
// Taken when it is issued, so each recomputation of the view names the same instant
export const getLeaveCallEntry = (participantId: string, deletedAt: Date): Entry =>
  getRemovalEntry(participantTable, [participantId], deletedAt);
