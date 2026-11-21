import type { UserInAuth } from "@esposter/db-schema";

import { blocksInSocial, getLiveRowWhere } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

// A block runs from its blocker to the user it blocks, and a removal keeps it as a tombstone, so only a live one matches.
// Either side may be left out to match every live block a user is on that side of
export const getLiveBlockWhere = ({
  blockedId,
  blockerId,
}: {
  blockedId?: UserInAuth["id"];
  blockerId?: UserInAuth["id"];
}) =>
  and(
    blockerId === undefined ? undefined : eq(blocksInSocial.blockerId, blockerId),
    blockedId === undefined ? undefined : eq(blocksInSocial.blockedId, blockedId),
    getLiveRowWhere(blocksInSocial),
  );
