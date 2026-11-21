import type { RowKey } from "#src/models/shared/overlay/RowKey";

import { getFriendRowKey } from "#src/services/message/user/pair/getFriendRowKey";
import { createTable } from "#src/services/shared/overlay/createTable";
import { blocksInSocial, friendRequestsInSocial, friendsInSocial } from "@esposter/db-schema";

// A friendship and its request are keyed by the pair's natural id, which the header's two users build. A scope that names
// No pair names no row
const getPairKeyOfScope = ({ receiverId, senderId }: Record<string, string>): RowKey | undefined =>
  senderId === undefined || receiverId === undefined ? undefined : getFriendRowKey(senderId, receiverId);

// The pair tables the overlay holds, one slot each. A pair's friendship and its request share one key
export const friendTable = createTable(friendsInSocial, getPairKeyOfScope);
export const friendRequestTable = createTable(friendRequestsInSocial, getPairKeyOfScope);
export const blockTable = createTable(blocksInSocial);
// The pair's tables a write's header can name a row of, in the order the pair writes name them
export const pairTables: [typeof friendTable, typeof friendRequestTable, typeof blockTable] = [
  friendTable,
  friendRequestTable,
  blockTable,
];
