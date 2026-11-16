/* oxlint-disable no-await-in-loop -- Retry: a concurrent override that got there first makes this one lose, so each attempt reads the row that beat it */
import type { Context } from "#server/trpc/context";
import type { MemberPermissionOverride } from "#shared/models/db/role/MemberPermissionOverride";
import type { UpsertMemberPermissionOverrideInput } from "#shared/models/db/role/UpsertMemberPermissionOverrideInput";

import { checkIsMemberPermissionOverrideWritten } from "#server/services/room/rbac/checkIsMemberPermissionOverrideWritten";
import { mergeMemberPermissionOverride } from "#shared/services/room/rbac/mergeMemberPermissionOverride";
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
): Promise<MemberPermissionOverride> => {
  const { roomId, userId } = input;
  const {
    allow: allowColumn,
    deny: denyColumn,
    roomId: roomIdColumn,
    userId: userIdColumn,
  } = roomMemberPermissionsInMessage;
  const isMemberRow = and(eq(roomIdColumn, roomId), eq(userIdColumn, userId));
  for (let attempt = 0; attempt < MAX_MEMBER_PERMISSION_OVERRIDE_ATTEMPTS; attempt++) {
    const [current] = await db
      .select({ allow: allowColumn, deny: denyColumn })
      .from(roomMemberPermissionsInMessage)
      .where(isMemberRow);
    const override = mergeMemberPermissionOverride(current ?? { allow: 0n, deny: 0n }, input);
    const isWritten = await checkIsMemberPermissionOverrideWritten(db, {
      current,
      isMemberRow,
      override,
      roomId,
      userId,
    });
    if (isWritten) return override;
  }

  throw new TRPCError({ code: "CONFLICT", message: "The member's permissions changed while this was written" });
};
