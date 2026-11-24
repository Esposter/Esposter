import type { Entry } from "#src/models/shared/overlay/Entry";

import { getResolvedDisplayName } from "#shared/services/room/getResolvedDisplayName";
import { getMemberRowKey } from "#src/services/message/member/getMemberRowKey";
import { memberTable } from "#src/services/message/member/memberTable";
import { getHeldRowEntry } from "#src/services/shared/overlay/getHeldRowEntry";

// The name a saved display name shows the moment it is saved: the typed name, or the account's own name for a
// Blank one. This is the name the server resolves and answers with, so the row shows what the server will hold
export const getRenameMemberEntry = (roomId: string, userId: string, displayName: string, accountName: string): Entry =>
  getHeldRowEntry(memberTable, getMemberRowKey(userId, roomId), (member) => ({
    ...member,
    displayName: getResolvedDisplayName(displayName, accountName),
  }));
