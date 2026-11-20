import type { Confirmation } from "#src/models/shared/overlay/Confirmation";
import type { RowVersion } from "@esposter/db-schema";

import { createConfirmation } from "#src/services/shared/overlay/createConfirmation";
import { blockTable, friendRequestTable, friendTable } from "#src/services/message/user/pair/constants";
import { getBlockRowKey } from "#src/services/message/user/pair/getBlockRowKey";
import { getFriendRowKey } from "#src/services/message/user/pair/getFriendRowKey";

// The rows a write's answer named, as the confirmations its entry waits for. A row a pair table does not hold names no
// Row the pair entries show, so it confirms none
export const createPairConfirmations = (rowVersions: RowVersion[]): Confirmation[] =>
  rowVersions.flatMap(({ key, table, version }) => {
    const { blockedId, blockerId, receiverId, senderId } = key;
    if (table === blockTable.name && blockerId !== undefined && blockedId !== undefined)
      return [createConfirmation(blockTable, getBlockRowKey(blockerId, blockedId), version)];
    if (table === friendTable.name && senderId !== undefined && receiverId !== undefined)
      return [createConfirmation(friendTable, getFriendRowKey(senderId, receiverId), version)];
    if (table === friendRequestTable.name && senderId !== undefined && receiverId !== undefined)
      return [createConfirmation(friendRequestTable, getFriendRowKey(senderId, receiverId), version)];
    return [];
  });
