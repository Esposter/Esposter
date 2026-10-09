import type { Context } from "#server/trpc/context";
import type { MemberPermissionOverride } from "#shared/models/db/role/MemberPermissionOverride";

import { roomMemberPermissionsInMessage } from "@esposter/db-schema";
import { and, eq, sql } from "drizzle-orm";

interface SetMemberPermissionOverrideOptions {
  allow: bigint;
  deny: bigint;
  inherit: bigint;
  roomId: string;
  userId: string;
}

// The three bitfields move a bit between states, so the write clears every bit it names from both fields before it
// Sets the ones it allows or denies. Passing a bit into the opposite field therefore moves it rather than leaving it
// Set in both, which the table's CHECK would refuse. A row with neither field set is the member's roles again, so it
// Is removed rather than kept as an empty entry. Returns the state left behind, both zero when there is no row
export const setMemberPermissionOverride = (
  db: Context["db"],
  { allow, deny, inherit, roomId, userId }: SetMemberPermissionOverrideOptions,
): Promise<MemberPermissionOverride> => {
  const {
    allow: allowColumn,
    deny: denyColumn,
    roomId: roomIdColumn,
    userId: userIdColumn,
  } = roomMemberPermissionsInMessage;
  const isMemberRow = and(eq(roomIdColumn, roomId), eq(userIdColumn, userId));
  const clearedBits = sql`(${String(allow | deny | inherit)}::bigint)`;
  return db.transaction(async (tx) => {
    if (allow | deny)
      await tx
        .insert(roomMemberPermissionsInMessage)
        .values({ allow, deny, roomId, userId })
        .onConflictDoUpdate({
          set: {
            allow: sql`((${allowColumn} & ~${clearedBits}) | ${String(allow)}::bigint)`,
            deny: sql`((${denyColumn} & ~${clearedBits}) | ${String(deny)}::bigint)`,
          },
          target: [userIdColumn, roomIdColumn],
        });
    else
      await tx
        .update(roomMemberPermissionsInMessage)
        .set({ allow: sql`(${allowColumn} & ~${clearedBits})`, deny: sql`(${denyColumn} & ~${clearedBits})` })
        .where(isMemberRow);
    await tx.delete(roomMemberPermissionsInMessage).where(and(isMemberRow, eq(allowColumn, 0n), eq(denyColumn, 0n)));
    const [override] = await tx
      .select({ allow: allowColumn, deny: denyColumn })
      .from(roomMemberPermissionsInMessage)
      .where(isMemberRow);
    return override ?? { allow: 0n, deny: 0n };
  });
};
