import type { Entry } from "#src/models/shared/overlay/Entry";

import { getResolvedDisplayName } from "#shared/services/room/getResolvedDisplayName";
import { getMemberRowKey } from "#src/services/message/member/getMemberRowKey";
import { memberTable } from "#src/services/message/member/memberTable";

// The name a saved display name shows the moment it is saved: the typed name, or the account's own name for a blank one.
// This is the name the server resolves and answers with, so the row shows what the server will hold
export const getRenameMemberEntry =
  (roomId: string, userId: string, displayName: string, accountName: string): Entry =>
  (view) => {
    const key = getMemberRowKey(userId, roomId);
    const member = view.get(memberTable, key);
    if (member)
      view.set(memberTable, key, { ...member, displayName: getResolvedDisplayName(displayName, accountName) });
  };
