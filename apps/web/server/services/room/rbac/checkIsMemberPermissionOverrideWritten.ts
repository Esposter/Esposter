import type { Context } from "#server/trpc/context";
import type { MemberPermissionOverride } from "#shared/models/db/role/MemberPermissionOverride";
import type { SQL } from "drizzle-orm";

import { roomMemberPermissionsInMessage } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

// Whether the write landed: an insert needs the row still absent, an update and a delete need it still holding the
// Bits the merge read. Anything else means another write got there first
export const checkIsMemberPermissionOverrideWritten = async (
  db: Context["db"],
  {
    current,
    isMemberRow,
    override,
    roomId,
    userId,
  }: {
    current?: MemberPermissionOverride;
    isMemberRow?: SQL;
    override: MemberPermissionOverride;
    roomId: string;
    userId: string;
  },
): Promise<boolean> => {
  const { allow: allowColumn, deny: denyColumn, userId: userIdColumn } = roomMemberPermissionsInMessage;
  const isUnchanged = current
    ? and(isMemberRow, eq(allowColumn, current.allow), eq(denyColumn, current.deny))
    : isMemberRow;
  if (!(override.allow | override.deny)) {
    if (!current) return true;
    return (
      (await db.delete(roomMemberPermissionsInMessage).where(isUnchanged).returning({ userId: userIdColumn })).length >
      0
    );
  } else if (!current)
    return (
      (
        await db
          .insert(roomMemberPermissionsInMessage)
          .values({ ...override, roomId, userId })
          .onConflictDoNothing()
          .returning({ userId: userIdColumn })
      ).length > 0
    );
  return (
    (
      await db
        .update(roomMemberPermissionsInMessage)
        .set(override)
        .where(isUnchanged)
        .returning({ userId: userIdColumn })
    ).length > 0
  );
};
