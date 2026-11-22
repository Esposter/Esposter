import type { Context } from "#server/trpc/context";
import type { MemberPermissionOverride } from "#shared/models/db/role/MemberPermissionOverride";
import type { RoomMemberPermissionInMessage } from "@esposter/db-schema";

import { getMemberPermissionOverrideRowWhere } from "#server/services/room/rbac/getMemberPermissionOverrideRowWhere";
import { roomMemberPermissionsInMessage } from "@esposter/db-schema";
import { and, eq, isNotNull } from "drizzle-orm";

// Writes one merged override, compare-and-set on the bits it was merged from. It returns the rows the write changed, the
// Tombstone included, or undefined when another write got there first, which is the caller's cue to read again. A write
// That changes nothing and finds no live row returns no rows. A removal tombstones the row, and a write that finds only a
// Tombstone revives it at a higher version, so the row keeps its version count
export const writeMemberPermissionOverride = async (
  db: Context["db"],
  {
    current,
    override,
    roomId,
    userId,
  }: {
    current?: MemberPermissionOverride | undefined;
    override: MemberPermissionOverride;
    roomId: string;
    userId: string;
  },
): Promise<RoomMemberPermissionInMessage[] | undefined> => {
  const {
    allow: allowColumn,
    deletedAt: deletedAtColumn,
    deny: denyColumn,
    roomId: roomIdColumn,
    userId: userIdColumn,
  } = roomMemberPermissionsInMessage;
  const isMemberRow = getMemberPermissionOverrideRowWhere(roomId, userId);
  const isUnchanged = current
    ? and(isMemberRow, eq(allowColumn, current.allow), eq(denyColumn, current.deny))
    : isMemberRow;
  if (!(override.allow | override.deny)) {
    if (!current) return [];

    const removed = await db
      .update(roomMemberPermissionsInMessage)
      .set({ deletedAt: new Date() })
      .where(isUnchanged)
      .returning();
    return removed.length > 0 ? removed : undefined;
  } else if (!current) {
    const written = await db
      .insert(roomMemberPermissionsInMessage)
      .values({ ...override, roomId, userId })
      .onConflictDoUpdate({
        set: { ...override, deletedAt: null },
        // A live row is another write's answer, so the revival is only for a tombstone
        setWhere: isNotNull(deletedAtColumn),
        target: [userIdColumn, roomIdColumn],
      })
      .returning();
    return written.length > 0 ? written : undefined;
  }

  const updatedRows = await db.update(roomMemberPermissionsInMessage).set(override).where(isUnchanged).returning();
  return updatedRows.length > 0 ? updatedRows : undefined;
};
