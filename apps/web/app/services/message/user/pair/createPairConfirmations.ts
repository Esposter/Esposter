import type { Confirmation } from "#src/models/shared/overlay/Confirmation";
import type { RowVersion } from "@esposter/db-schema";

import { blockTable, friendRequestTable, friendTable } from "#src/services/message/user/pair/constants";
import { getFriendRowKey } from "#src/services/message/user/pair/getFriendRowKey";
import { createConfirmation } from "#src/services/shared/overlay/createConfirmation";
import { createHeaderConfirmations } from "#src/services/shared/overlay/createHeaderConfirmations";

// The rows a write's answer named, as the confirmations its entry waits for. A block is keyed by its own columns, which
// The header names. A friendship and a request are keyed by the pair's natural id, which the header's two users build.
// A row a pair table does not hold names no row the pair entries show, so it confirms none
export const createPairConfirmations = (rowVersions: RowVersion[]): Confirmation[] => [
  ...createHeaderConfirmations(blockTable, rowVersions),
  ...rowVersions.flatMap(({ key: { receiverId, senderId }, table, version }) => {
    if (senderId === undefined || receiverId === undefined) return [];
    if (table === friendTable.name)
      return [createConfirmation(friendTable, getFriendRowKey(senderId, receiverId), version)];
    if (table === friendRequestTable.name)
      return [createConfirmation(friendRequestTable, getFriendRowKey(senderId, receiverId), version)];
    return [];
  }),
];
