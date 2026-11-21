import { createTable } from "#src/services/shared/overlay/createTable";
import { blocksInSocial, friendRequestsInSocial, friendsInSocial } from "@esposter/db-schema";

// The pair tables the overlay holds, one slot each. A friendship and its request are keyed by the pair's natural id, which is
// Their primary key, so the header names the row by the key the pair entries touch with no mapping of its own
export const friendTable = createTable(friendsInSocial);
export const friendRequestTable = createTable(friendRequestsInSocial);
export const blockTable = createTable(blocksInSocial);
// The pair's tables a write's header can name a row of, in the order the pair writes name them
export const pairTables: [typeof friendTable, typeof friendRequestTable, typeof blockTable] = [
  friendTable,
  friendRequestTable,
  blockTable,
];
