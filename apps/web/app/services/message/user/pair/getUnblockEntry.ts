import type { Entry } from "#src/models/shared/overlay/Entry";

import { blockTable } from "#src/services/message/user/pair/constants";
import { getBlockRowKey } from "#src/services/message/user/pair/getBlockRowKey";

// The block leaves the screen at once, as a tombstone the server's version of it confirms
export const getUnblockEntry =
  (userId: string, blockedId: string, deletedAt: Date): Entry =>
  (view) => {
    const key = getBlockRowKey(userId, blockedId);
    const block = view.get(blockTable, key);
    if (block) view.set(blockTable, key, { ...block, deletedAt });
  };
