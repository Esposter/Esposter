import type { FriendInSocial } from "@esposter/db-schema";

import { friendsInSocial, getLiveRowWhere } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

// A friendship is named by its id, and a removal keeps it as a tombstone, so only a live one matches
export const getLiveFriendshipWhere = (friendshipId: FriendInSocial["id"]) =>
  and(eq(friendsInSocial.id, friendshipId), getLiveRowWhere(friendsInSocial));
