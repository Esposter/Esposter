import { getLiveRowWhere, roomMemberPermissionsInMessage } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

// The member's live override row in the room. The read and the compare-and-set write both scope by it, so a write can
// Never reach another room's or another member's row
export const getMemberPermissionOverrideRowWhere = (roomId: string, userId: string) =>
  and(
    eq(roomMemberPermissionsInMessage.roomId, roomId),
    eq(roomMemberPermissionsInMessage.userId, userId),
    getLiveRowWhere(roomMemberPermissionsInMessage),
  );
