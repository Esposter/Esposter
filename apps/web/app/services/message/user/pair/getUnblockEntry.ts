import type { Entry } from "#src/models/shared/overlay/Entry";

import { blockTable } from "#src/services/message/user/pair/constants";
import { getBlockRowKey } from "#src/services/message/user/pair/getBlockRowKey";
import { getHeldRowEntry } from "#src/services/shared/overlay/getHeldRowEntry";

// The block leaves the screen at once, as a tombstone the server's version of it confirms
export const getUnblockEntry = (userId: string, blockedId: string, deletedAt: Date): Entry =>
  getHeldRowEntry(blockTable, getBlockRowKey(userId, blockedId), (block) => ({ ...block, deletedAt }));
