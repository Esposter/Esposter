import type { Context } from "#server/trpc/context";
import type { MemberPermissionOverride } from "#shared/models/db/role/MemberPermissionOverride";
import type { UpsertMemberPermissionOverrideInput } from "#shared/models/db/role/UpsertMemberPermissionOverrideInput";
import type { SQL } from "drizzle-orm";

import { mergeMemberPermissionOverride } from "#server/services/room/rbac/mergeMemberPermissionOverride";
import { roomMemberPermissionsInMessage } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

const MAX_MEMBER_PERMISSION_OVERRIDE_ATTEMPTS = 3;

// The bitfields are read and merged in JS, since D1 stores them as text and SQL cannot OR or AND them. The write is then
// Compare-and-set on the bits it was merged from: a concurrent override that got there first makes this one lose, and it
// Reads the row again and merges onto that, a bounded number of times. A row with neither field set is the member's roles
// Again, so it is removed rather than kept as an empty entry. Returns the state left behind, both zero when there is no row
export const setMemberPermissionOverride = async (
  db: Context["db"],
  input: UpsertMemberPermissionOverrideInput,
  attempt = 1,
): Promise<MemberPermissionOverride> => {
  const { roomId, userId } = input;
  const {
    allow: allowColumn,
    deny: denyColumn,
    roomId: roomIdColumn,
    userId: userIdColumn,
  } = roomMemberPermissionsInMessage;
  const isMemberRow = and(eq(roomIdColumn, roomId), eq(userIdColumn, userId));
  const [current] = await db
    .select({ allow: allowColumn, deny: denyColumn })
    .from(roomMemberPermissionsInMessage)
    .where(isMemberRow);
  const override = mergeMemberPermissionOverride(current ?? { allow: 0n, deny: 0n }, input);
  const isWritten = await writeMemberPermissionOverride(db, { current, isMemberRow, override, roomId, userId });
  if (isWritten) return override;
  if (attempt >= MAX_MEMBER_PERMISSION_OVERRIDE_ATTEMPTS)
    throw new TRPCError({ code: "CONFLICT", message: "The member's permissions changed while this was written" });
  return setMemberPermissionOverride(db, input, attempt + 1);
};

// Whether the write landed: an insert needs the row still absent, an update and a delete need it still holding the
// Bits the merge read. Anything else means another write got there first
const writeMemberPermissionOverride = async (
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
