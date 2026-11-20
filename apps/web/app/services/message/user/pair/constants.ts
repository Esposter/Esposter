import { blocksInSocial, friendRequestsInSocial, friendsInSocial } from "@esposter/db-schema";
import { createTable } from "#src/services/shared/overlay/createTable";

// The pair tables the overlay holds, one slot each. A pair's friendship and its request share one key
export const friendTable = createTable(friendsInSocial);
export const friendRequestTable = createTable(friendRequestsInSocial);
export const blockTable = createTable(blocksInSocial);
